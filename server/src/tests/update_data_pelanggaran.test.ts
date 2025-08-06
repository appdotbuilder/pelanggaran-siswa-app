
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dataPelanggaranTable } from '../db/schema';
import { type CreateDataPelanggaranInput, type UpdateDataPelanggaranInput } from '../schema';
import { updateDataPelanggaran } from '../handlers/update_data_pelanggaran';
import { eq } from 'drizzle-orm';

// Helper to create test data
const createTestDataPelanggaran = async (): Promise<number> => {
  const testInput: CreateDataPelanggaranInput = {
    kategori: 'Kelakuan',
    jenis_pelanggaran: 'Test Violation',
    poin: 5
  };

  const result = await db.insert(dataPelanggaranTable)
    .values(testInput)
    .returning()
    .execute();

  return result[0].id;
};

describe('updateDataPelanggaran', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update violation data with all fields', async () => {
    const id = await createTestDataPelanggaran();

    const updateInput: UpdateDataPelanggaranInput = {
      id,
      kategori: 'Kerapian',
      jenis_pelanggaran: 'Updated Violation',
      poin: 10
    };

    const result = await updateDataPelanggaran(updateInput);

    expect(result.id).toEqual(id);
    expect(result.kategori).toEqual('Kerapian');
    expect(result.jenis_pelanggaran).toEqual('Updated Violation');
    expect(result.poin).toEqual(10);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update violation data with partial fields', async () => {
    const id = await createTestDataPelanggaran();

    const updateInput: UpdateDataPelanggaranInput = {
      id,
      jenis_pelanggaran: 'Partially Updated Violation'
    };

    const result = await updateDataPelanggaran(updateInput);

    expect(result.id).toEqual(id);
    expect(result.kategori).toEqual('Kelakuan'); // Should remain unchanged
    expect(result.jenis_pelanggaran).toEqual('Partially Updated Violation');
    expect(result.poin).toEqual(5); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated data to database', async () => {
    const id = await createTestDataPelanggaran();

    const updateInput: UpdateDataPelanggaranInput = {
      id,
      kategori: 'Kerajinan & Pembiasaan',
      poin: 15
    };

    await updateDataPelanggaran(updateInput);

    const saved = await db.select()
      .from(dataPelanggaranTable)
      .where(eq(dataPelanggaranTable.id, id))
      .execute();

    expect(saved).toHaveLength(1);
    expect(saved[0].kategori).toEqual('Kerajinan & Pembiasaan');
    expect(saved[0].jenis_pelanggaran).toEqual('Test Violation'); // Should remain unchanged
    expect(saved[0].poin).toEqual(15);
    expect(saved[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when violation data not found', async () => {
    const updateInput: UpdateDataPelanggaranInput = {
      id: 999,
      jenis_pelanggaran: 'Non-existent Violation'
    };

    expect(updateDataPelanggaran(updateInput))
      .rejects.toThrow(/not found/i);
  });

  it('should update only poin field', async () => {
    const id = await createTestDataPelanggaran();

    const updateInput: UpdateDataPelanggaranInput = {
      id,
      poin: 25
    };

    const result = await updateDataPelanggaran(updateInput);

    expect(result.id).toEqual(id);
    expect(result.kategori).toEqual('Kelakuan'); // Should remain unchanged
    expect(result.jenis_pelanggaran).toEqual('Test Violation'); // Should remain unchanged
    expect(result.poin).toEqual(25);
    expect(result.updated_at).toBeInstanceOf(Date);
  });
});
