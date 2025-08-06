
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { guruTable } from '../db/schema';
import { type CreateGuruInput, type UpdateGuruInput } from '../schema';
import { updateGuru } from '../handlers/update_guru';
import { eq } from 'drizzle-orm';

// Test inputs
const testCreateInput: CreateGuruInput = {
  nomor: 1,
  nama_guru: 'Original Teacher',
  nip: '12345678901234567890'
};

const testUpdateInput: UpdateGuruInput = {
  id: 0, // Will be set after creating guru
  nomor: 2,
  nama_guru: 'Updated Teacher',
  nip: '09876543210987654321'
};

describe('updateGuru', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update guru with all fields', async () => {
    // Create guru first
    const createResult = await db.insert(guruTable)
      .values(testCreateInput)
      .returning()
      .execute();

    const createdGuru = createResult[0];
    testUpdateInput.id = createdGuru.id;

    // Update guru
    const result = await updateGuru(testUpdateInput);

    // Verify updated fields
    expect(result.id).toEqual(createdGuru.id);
    expect(result.nomor).toEqual(2);
    expect(result.nama_guru).toEqual('Updated Teacher');
    expect(result.nip).toEqual('09876543210987654321');
    expect(result.created_at).toEqual(createdGuru.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at).not.toEqual(createdGuru.updated_at);
  });

  it('should update guru with partial fields', async () => {
    // Create guru first
    const createResult = await db.insert(guruTable)
      .values(testCreateInput)
      .returning()
      .execute();

    const createdGuru = createResult[0];

    // Update only nama_guru
    const partialUpdate: UpdateGuruInput = {
      id: createdGuru.id,
      nama_guru: 'Partially Updated Teacher'
    };

    const result = await updateGuru(partialUpdate);

    // Verify only updated field changed
    expect(result.id).toEqual(createdGuru.id);
    expect(result.nomor).toEqual(testCreateInput.nomor); // Should remain unchanged
    expect(result.nama_guru).toEqual('Partially Updated Teacher');
    expect(result.nip).toEqual(testCreateInput.nip); // Should remain unchanged
    expect(result.created_at).toEqual(createdGuru.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at).not.toEqual(createdGuru.updated_at);
  });

  it('should save updated guru to database', async () => {
    // Create guru first
    const createResult = await db.insert(guruTable)
      .values(testCreateInput)
      .returning()
      .execute();

    const createdGuru = createResult[0];
    testUpdateInput.id = createdGuru.id;

    // Update guru
    await updateGuru(testUpdateInput);

    // Verify in database
    const updatedGuru = await db.select()
      .from(guruTable)
      .where(eq(guruTable.id, createdGuru.id))
      .execute();

    expect(updatedGuru).toHaveLength(1);
    expect(updatedGuru[0].nomor).toEqual(2);
    expect(updatedGuru[0].nama_guru).toEqual('Updated Teacher');
    expect(updatedGuru[0].nip).toEqual('09876543210987654321');
    expect(updatedGuru[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when guru does not exist', async () => {
    const nonExistentUpdate: UpdateGuruInput = {
      id: 999,
      nama_guru: 'Non-existent Teacher'
    };

    await expect(updateGuru(nonExistentUpdate)).rejects.toThrow(/Guru with id 999 not found/i);
  });

  it('should update only nip field', async () => {
    // Create guru first
    const createResult = await db.insert(guruTable)
      .values(testCreateInput)
      .returning()
      .execute();

    const createdGuru = createResult[0];

    // Update only nip
    const nipUpdate: UpdateGuruInput = {
      id: createdGuru.id,
      nip: '11111111111111111111'
    };

    const result = await updateGuru(nipUpdate);

    // Verify only nip changed
    expect(result.id).toEqual(createdGuru.id);
    expect(result.nomor).toEqual(testCreateInput.nomor); // Should remain unchanged
    expect(result.nama_guru).toEqual(testCreateInput.nama_guru); // Should remain unchanged
    expect(result.nip).toEqual('11111111111111111111');
    expect(result.created_at).toEqual(createdGuru.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
  });
});
