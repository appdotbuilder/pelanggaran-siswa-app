
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { deleteUser } from '../handlers/delete_user';
import { eq } from 'drizzle-orm';

// Test user input
const testUserInput: CreateUserInput = {
  username: 'testuser',
  password: 'password123',
  nama: 'Test User',
  role: 'guru',
  is_active: true
};

describe('deleteUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a user by id', async () => {
    // Create a user first
    const createResult = await db.insert(usersTable)
      .values({
        username: testUserInput.username,
        password_hash: 'hashed_password',
        nama: testUserInput.nama,
        role: testUserInput.role,
        is_active: testUserInput.is_active
      })
      .returning()
      .execute();

    const userId = createResult[0].id;

    // Delete the user
    await deleteUser(userId);

    // Verify user is deleted
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    expect(users).toHaveLength(0);
  });

  it('should not throw error when deleting non-existent user', async () => {
    // Delete a user that doesn't exist - should complete without throwing
    let errorThrown = false;
    try {
      await deleteUser(999);
    } catch (error) {
      errorThrown = true;
    }
    
    expect(errorThrown).toBe(false);
  });

  it('should remove user from database completely', async () => {
    // Create multiple users
    await db.insert(usersTable)
      .values([
        {
          username: 'user1',
          password_hash: 'hash1',
          nama: 'User One',
          role: 'guru',
          is_active: true
        },
        {
          username: 'user2',
          password_hash: 'hash2',
          nama: 'User Two',
          role: 'administrator',
          is_active: true
        }
      ])
      .execute();

    // Get all users
    const allUsers = await db.select().from(usersTable).execute();
    expect(allUsers).toHaveLength(2);

    // Delete first user
    await deleteUser(allUsers[0].id);

    // Verify only one user remains
    const remainingUsers = await db.select().from(usersTable).execute();
    expect(remainingUsers).toHaveLength(1);
    expect(remainingUsers[0].username).toEqual('user2');
  });
});
