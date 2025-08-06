
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { kelasTable, siswaTable } from '../db/schema';
import { type CreateKelasInput } from '../schema';
import { deleteKelas } from '../handlers/delete_kelas';
import { eq } from 'drizzle-orm';

// Test data
const testKelas: CreateKelasInput = {
  nomor: 1,
  rombel: '7',
  nama_kelas: 'VII-A'
};

describe('deleteKelas', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a kelas', async () => {
    // Create test kelas
    const [created] = await db.insert(kelasTable)
      .values(testKelas)
      .returning()
      .execute();

    // Delete the kelas
    await deleteKelas(created.id);

    // Verify kelas is deleted
    const kelas = await db.select()
      .from(kelasTable)
      .where(eq(kelasTable.id, created.id))
      .execute();

    expect(kelas).toHaveLength(0);
  });

  it('should cascade delete related siswa records', async () => {
    // Create test kelas
    const [created] = await db.insert(kelasTable)
      .values(testKelas)
      .returning()
      .execute();

    // Create test siswa in the kelas
    await db.insert(siswaTable)
      .values({
        nomor: 1,
        nama_siswa: 'Test Student',
        nisn: '123456789',
        kelas_id: created.id
      })
      .execute();

    // Delete the kelas
    await deleteKelas(created.id);

    // Verify kelas is deleted
    const kelas = await db.select()
      .from(kelasTable)
      .where(eq(kelasTable.id, created.id))
      .execute();

    expect(kelas).toHaveLength(0);

    // Verify related siswa records are also deleted (cascade)
    const siswa = await db.select()
      .from(siswaTable)
      .where(eq(siswaTable.kelas_id, created.id))
      .execute();

    expect(siswa).toHaveLength(0);
  });

  it('should handle non-existent kelas ID gracefully', async () => {
    const nonExistentId = 999999;

    // Should not throw error even if kelas doesn't exist
    await expect(deleteKelas(nonExistentId)).resolves.toBeUndefined();

    // Verify no kelas records were affected
    const allKelas = await db.select().from(kelasTable).execute();
    expect(allKelas).toHaveLength(0);
  });
});
