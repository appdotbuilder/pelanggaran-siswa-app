
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput, type UpdateUserInput } from '../schema';
import { updateUser } from '../handlers/update_user';
import { eq } from 'drizzle-orm';

// Helper function to create a test user
const createTestUser = async (): Promise<number> => {
  const testUserData: CreateUserInput = {
    username: 'testuser',
    password: 'password123',
    nama: 'Test User',
    role: 'administrator',
    is_active: true
  };

  const hashedPassword = await Bun.password.hash(testUserData.password);
  
  const result = await db.insert(usersTable)
    .values({
      username: testUserData.username,
      password_hash: hashedPassword,
      nama: testUserData.nama,
      role: testUserData.role,
      is_active: testUserData.is_active
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('updateUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update user username', async () => {
    const userId = await createTestUser();
    
    const updateInput: UpdateUserInput = {
      id: userId,
      username: 'updated_username'
    };

    const result = await updateUser(updateInput);

    expect(result.id).toEqual(userId);
    expect(result.username).toEqual('updated_username');
    expect(result.nama).toEqual('Test User'); // Should remain unchanged
    expect(result.role).toEqual('administrator'); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update user password and hash it', async () => {
    const userId = await createTestUser();
    
    const updateInput: UpdateUserInput = {
      id: userId,
      password: 'newpassword456'
    };

    const result = await updateUser(updateInput);

    expect(result.id).toEqual(userId);
    expect(result.password_hash).not.toEqual('newpassword456'); // Should be hashed
    expect(result.password_hash.length).toBeGreaterThan(0);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify password is correctly hashed
    const isValidPassword = await Bun.password.verify('newpassword456', result.password_hash);
    expect(isValidPassword).toBe(true);
  });

  it('should update multiple user fields', async () => {
    const userId = await createTestUser();
    
    const updateInput: UpdateUserInput = {
      id: userId,
      username: 'multi_update_user',
      nama: 'Updated Name',
      role: 'guru',
      is_active: false
    };

    const result = await updateUser(updateInput);

    expect(result.id).toEqual(userId);
    expect(result.username).toEqual('multi_update_user');
    expect(result.nama).toEqual('Updated Name');
    expect(result.role).toEqual('guru');
    expect(result.is_active).toEqual(false);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated user to database', async () => {
    const userId = await createTestUser();
    
    const updateInput: UpdateUserInput = {
      id: userId,
      nama: 'Database Updated Name',
      role: 'guru'
    };

    await updateUser(updateInput);

    // Verify the update was saved to database
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].nama).toEqual('Database Updated Name');
    expect(users[0].role).toEqual('guru');
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent user', async () => {
    const updateInput: UpdateUserInput = {
      id: 99999, // Non-existent ID
      username: 'nonexistent'
    };

    expect(() => updateUser(updateInput)).toThrow(/User with id 99999 not found/);
  });

  it('should only update provided fields', async () => {
    const userId = await createTestUser();
    
    // Get original user data
    const originalUser = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    const updateInput: UpdateUserInput = {
      id: userId,
      nama: 'Only Name Updated'
    };

    const result = await updateUser(updateInput);

    // Should update only the nama field
    expect(result.nama).toEqual('Only Name Updated');
    // Other fields should remain unchanged
    expect(result.username).toEqual(originalUser[0].username);
    expect(result.role).toEqual(originalUser[0].role);
    expect(result.is_active).toEqual(originalUser[0].is_active);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at).not.toEqual(originalUser[0].updated_at);
  });
});
