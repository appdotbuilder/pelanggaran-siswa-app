
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { kelasTable } from '../db/schema';
import { type CreateKelasInput, type UpdateKelasInput } from '../schema';
import { updateKelas } from '../handlers/update_kelas';
import { eq } from 'drizzle-orm';

// Test data
const testKelas: CreateKelasInput = {
  nomor: 1,
  rombel: '7',
  nama_kelas: 'VII-A'
};

describe('updateKelas', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a kelas successfully', async () => {
    // Create a kelas first
    const created = await db.insert(kelasTable)
      .values(testKelas)
      .returning()
      .execute();

    const kelasId = created[0].id;

    // Update the kelas
    const updateInput: UpdateKelasInput = {
      id: kelasId,
      nomor: 2,
      rombel: '8',
      nama_kelas: 'VIII-B'
    };

    const result = await updateKelas(updateInput);

    // Verify the result
    expect(result.id).toEqual(kelasId);
    expect(result.nomor).toEqual(2);
    expect(result.rombel).toEqual('8');
    expect(result.nama_kelas).toEqual('VIII-B');
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    // Create a kelas first
    const created = await db.insert(kelasTable)
      .values(testKelas)
      .returning()
      .execute();

    const kelasId = created[0].id;
    const originalCreatedAt = created[0].created_at;

    // Update only the nama_kelas
    const updateInput: UpdateKelasInput = {
      id: kelasId,
      nama_kelas: 'VII-A Modified'
    };

    const result = await updateKelas(updateInput);

    // Verify only the nama_kelas was updated
    expect(result.id).toEqual(kelasId);
    expect(result.nomor).toEqual(1); // Should remain unchanged
    expect(result.rombel).toEqual('7'); // Should remain unchanged
    expect(result.nama_kelas).toEqual('VII-A Modified');
    expect(result.created_at).toEqual(originalCreatedAt); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should persist changes to database', async () => {
    // Create a kelas first
    const created = await db.insert(kelasTable)
      .values(testKelas)
      .returning()
      .execute();

    const kelasId = created[0].id;

    // Update the kelas
    const updateInput: UpdateKelasInput = {
      id: kelasId,
      nomor: 3,
      nama_kelas: 'VII-C Updated'
    };

    await updateKelas(updateInput);

    // Query the database to verify changes were persisted
    const updated = await db.select()
      .from(kelasTable)
      .where(eq(kelasTable.id, kelasId))
      .execute();

    expect(updated).toHaveLength(1);
    expect(updated[0].nomor).toEqual(3);
    expect(updated[0].rombel).toEqual('7'); // Should remain unchanged
    expect(updated[0].nama_kelas).toEqual('VII-C Updated');
    expect(updated[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when kelas does not exist', async () => {
    const updateInput: UpdateKelasInput = {
      id: 999, // Non-existent ID
      nama_kelas: 'Non-existent Class'
    };

    expect(updateKelas(updateInput)).rejects.toThrow(/kelas with id 999 not found/i);
  });

  it('should handle all field types correctly', async () => {
    // Create a kelas first
    const created = await db.insert(kelasTable)
      .values(testKelas)
      .returning()
      .execute();

    const kelasId = created[0].id;

    // Update all possible fields
    const updateInput: UpdateKelasInput = {
      id: kelasId,
      nomor: 9,
      rombel: '9',
      nama_kelas: 'IX-Excellent'
    };

    const result = await updateKelas(updateInput);

    // Verify all field types
    expect(typeof result.id).toBe('number');
    expect(typeof result.nomor).toBe('number');
    expect(['7', '8', '9']).toContain(result.rombel);
    expect(typeof result.nama_kelas).toBe('string');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });
});
