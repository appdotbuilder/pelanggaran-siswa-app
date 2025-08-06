
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { getUsers } from '../handlers/get_users';

// Test user data
const testUsers: CreateUserInput[] = [
  {
    username: 'admin1',
    password: 'password123',
    nama: 'Administrator One',
    role: 'administrator',
    is_active: true
  },
  {
    username: 'guru1',
    password: 'password456',
    nama: 'Guru One',
    role: 'guru',
    is_active: true
  },
  {
    username: 'guru2',
    password: 'password789',
    nama: 'Guru Two',
    role: 'guru',
    is_active: false
  }
];

describe('getUsers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no users exist', async () => {
    const result = await getUsers();
    
    expect(result).toEqual([]);
  });

  it('should return all users', async () => {
    // Create test users
    await db.insert(usersTable)
      .values(testUsers.map(user => ({
        ...user,
        password_hash: `hashed_${user.password}`
      })))
      .execute();

    const result = await getUsers();

    expect(result).toHaveLength(3);
    
    // Verify first user
    expect(result[0].username).toEqual('admin1');
    expect(result[0].nama).toEqual('Administrator One');
    expect(result[0].role).toEqual('administrator');
    expect(result[0].is_active).toEqual(true);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    
    // Verify second user
    expect(result[1].username).toEqual('guru1');
    expect(result[1].nama).toEqual('Guru One');
    expect(result[1].role).toEqual('guru');
    expect(result[1].is_active).toEqual(true);
    
    // Verify third user (inactive)
    expect(result[2].username).toEqual('guru2');
    expect(result[2].nama).toEqual('Guru Two');
    expect(result[2].role).toEqual('guru');
    expect(result[2].is_active).toEqual(false);
  });

  it('should include all user fields', async () => {
    // Create single test user
    await db.insert(usersTable)
      .values({
        username: 'test_user',
        password_hash: 'hashed_password',
        nama: 'Test User',
        role: 'guru',
        is_active: true
      })
      .execute();

    const result = await getUsers();

    expect(result).toHaveLength(1);
    
    const user = result[0];
    expect(user.id).toBeDefined();
    expect(user.username).toEqual('test_user');
    expect(user.password_hash).toEqual('hashed_password');
    expect(user.nama).toEqual('Test User');
    expect(user.role).toEqual('guru');
    expect(user.is_active).toEqual(true);
    expect(user.created_at).toBeInstanceOf(Date);
    expect(user.updated_at).toBeNull();
  });

  it('should return users in database order', async () => {
    // Create users in specific order
    const orderedUsers = [
      { username: 'user_a', nama: 'User A' },
      { username: 'user_b', nama: 'User B' },
      { username: 'user_c', nama: 'User C' }
    ];

    for (const user of orderedUsers) {
      await db.insert(usersTable)
        .values({
          username: user.username,
          password_hash: 'hashed_password',
          nama: user.nama,
          role: 'guru',
          is_active: true
        })
        .execute();
    }

    const result = await getUsers();

    expect(result).toHaveLength(3);
    expect(result[0].username).toEqual('user_a');
    expect(result[1].username).toEqual('user_b');
    expect(result[2].username).toEqual('user_c');
  });
});
