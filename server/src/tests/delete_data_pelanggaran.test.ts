
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dataPelanggaranTable } from '../db/schema';
import { type CreateDataPelanggaranInput } from '../schema';
import { deleteDataPelanggaran } from '../handlers/delete_data_pelanggaran';
import { eq } from 'drizzle-orm';

// Test input for creating violation type
const testInput: CreateDataPelanggaranInput = {
  kategori: 'Kelakuan',
  jenis_pelanggaran: 'Test Violation Type',
  poin: 10
};

describe('deleteDataPelanggaran', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a violation type', async () => {
    // Create test violation type first
    const insertResult = await db.insert(dataPelanggaranTable)
      .values({
        kategori: testInput.kategori,
        jenis_pelanggaran: testInput.jenis_pelanggaran,
        poin: testInput.poin
      })
      .returning()
      .execute();

    const createdViolationType = insertResult[0];

    // Delete the violation type
    await deleteDataPelanggaran(createdViolationType.id);

    // Verify deletion - should not find the record
    const deletedViolationTypes = await db.select()
      .from(dataPelanggaranTable)
      .where(eq(dataPelanggaranTable.id, createdViolationType.id))
      .execute();

    expect(deletedViolationTypes).toHaveLength(0);
  });

  it('should not throw error when deleting non-existent violation type', async () => {
    // Try to delete a violation type that doesn't exist
    const nonExistentId = 99999;
    
    // Should not throw an error
    await expect(deleteDataPelanggaran(nonExistentId)).resolves.toBeUndefined();
  });

  it('should delete only the specified violation type', async () => {
    // Create multiple violation types
    const insertResults = await db.insert(dataPelanggaranTable)
      .values([
        {
          kategori: 'Kelakuan',
          jenis_pelanggaran: 'First Violation',
          poin: 5
        },
        {
          kategori: 'Kerapian',
          jenis_pelanggaran: 'Second Violation',
          poin: 3
        }
      ])
      .returning()
      .execute();

    const firstViolationType = insertResults[0];
    const secondViolationType = insertResults[1];

    // Delete only the first violation type
    await deleteDataPelanggaran(firstViolationType.id);

    // Verify first violation type is deleted
    const firstCheck = await db.select()
      .from(dataPelanggaranTable)
      .where(eq(dataPelanggaranTable.id, firstViolationType.id))
      .execute();

    expect(firstCheck).toHaveLength(0);

    // Verify second violation type still exists
    const secondCheck = await db.select()
      .from(dataPelanggaranTable)
      .where(eq(dataPelanggaranTable.id, secondViolationType.id))
      .execute();

    expect(secondCheck).toHaveLength(1);
    expect(secondCheck[0].jenis_pelanggaran).toEqual('Second Violation');
  });
});
