
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput, createUserInputSchema } from '../schema';
import { createUser } from '../handlers/create_user';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateUserInput = {
  username: 'testuser',
  password: 'testpassword123',
  nama: 'Test User',
  role: 'administrator',
  is_active: true
};

describe('createUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a user', async () => {
    const result = await createUser(testInput);

    // Basic field validation
    expect(result.username).toEqual('testuser');
    expect(result.nama).toEqual('Test User');
    expect(result.role).toEqual('administrator');
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeNull();
    
    // Password should be hashed, not plain text
    expect(result.password_hash).toBeDefined();
    expect(result.password_hash).not.toEqual('testpassword123');
    expect(result.password_hash.length).toBeGreaterThan(0);
  });

  it('should save user to database', async () => {
    const result = await createUser(testInput);

    // Query using proper drizzle syntax
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].username).toEqual('testuser');
    expect(users[0].nama).toEqual('Test User');
    expect(users[0].role).toEqual('administrator');
    expect(users[0].is_active).toEqual(true);
    expect(users[0].password_hash).toBeDefined();
    expect(users[0].created_at).toBeInstanceOf(Date);
  });

  it('should hash password correctly', async () => {
    const result = await createUser(testInput);

    // Verify password is hashed using Bun's password verification
    const isValidPassword = await Bun.password.verify(
      testInput.password,
      result.password_hash
    );

    expect(isValidPassword).toBe(true);
  });

  it('should create user with guru role', async () => {
    const guruInput: CreateUserInput = {
      username: 'testguru',
      password: 'gurupassword123',
      nama: 'Test Guru',
      role: 'guru',
      is_active: true
    };

    const result = await createUser(guruInput);

    expect(result.role).toEqual('guru');
    expect(result.username).toEqual('testguru');
    expect(result.nama).toEqual('Test Guru');
  });

  it('should create inactive user when is_active is false', async () => {
    const inactiveInput: CreateUserInput = {
      username: 'inactiveuser',
      password: 'password123',
      nama: 'Inactive User',
      role: 'administrator',
      is_active: false
    };

    const result = await createUser(inactiveInput);

    expect(result.is_active).toEqual(false);
    expect(result.username).toEqual('inactiveuser');
  });

  it('should apply default is_active value when not provided', async () => {
    // Parse input through Zod schema to apply defaults
    const inputWithDefault = createUserInputSchema.parse({
      username: 'defaultuser',
      password: 'password123',
      nama: 'Default User',
      role: 'administrator'
      // is_active not provided - should default to true via Zod
    });

    const result = await createUser(inputWithDefault);

    expect(result.is_active).toEqual(true);
  });

  it('should throw error for duplicate username', async () => {
    // Create first user
    await createUser(testInput);

    // Try to create another user with same username
    await expect(createUser(testInput)).rejects.toThrow(/duplicate key value/i);
  });
});
