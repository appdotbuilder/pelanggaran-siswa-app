
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { guruTable, pelanggaranSiswaTable, kelasTable, siswaTable, dataPelanggaranTable } from '../db/schema';
import { type CreateGuruInput } from '../schema';
import { deleteGuru } from '../handlers/delete_guru';
import { eq } from 'drizzle-orm';

const testGuruInput: CreateGuruInput = {
  nomor: 1,
  nama_guru: 'Test Guru',
  nip: '123456789'
};

describe('deleteGuru', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a guru', async () => {
    // Create guru first
    const result = await db.insert(guruTable)
      .values(testGuruInput)
      .returning()
      .execute();

    const guruId = result[0].id;

    // Delete the guru
    await deleteGuru(guruId);

    // Verify guru is deleted
    const gurus = await db.select()
      .from(guruTable)
      .where(eq(guruTable.id, guruId))
      .execute();

    expect(gurus).toHaveLength(0);
  });

  it('should not throw error when deleting non-existent guru', async () => {
    // Try to delete guru that doesn't exist - should complete without error
    await deleteGuru(999);
    
    // If we reach this line, the function didn't throw
    expect(true).toBe(true);
  });

  it('should cascade delete related pelanggaran siswa records', async () => {
    // Create prerequisites
    const kelas = await db.insert(kelasTable)
      .values({
        nomor: 1,
        rombel: '7',
        nama_kelas: 'VII-1'
      })
      .returning()
      .execute();

    const siswa = await db.insert(siswaTable)
      .values({
        nomor: 1,
        nama_siswa: 'Test Siswa',
        nisn: '1234567890',
        kelas_id: kelas[0].id
      })
      .returning()
      .execute();

    const guru = await db.insert(guruTable)
      .values(testGuruInput)
      .returning()
      .execute();

    const dataPelanggaran = await db.insert(dataPelanggaranTable)
      .values({
        kategori: 'Kelakuan',
        jenis_pelanggaran: 'Test Violation',
        poin: 10
      })
      .returning()
      .execute();

    // Create pelanggaran siswa with this guru
    await db.insert(pelanggaranSiswaTable)
      .values({
        tanggal: new Date().toISOString().split('T')[0],
        siswa_id: siswa[0].id,
        data_pelanggaran_id: dataPelanggaran[0].id,
        guru_id: guru[0].id
      })
      .execute();

    // Delete guru
    await deleteGuru(guru[0].id);

    // Verify guru is deleted
    const gurus = await db.select()
      .from(guruTable)
      .where(eq(guruTable.id, guru[0].id))
      .execute();

    expect(gurus).toHaveLength(0);

    // Verify related pelanggaran siswa records are also deleted (cascade)
    const pelanggaranRecords = await db.select()
      .from(pelanggaranSiswaTable)
      .where(eq(pelanggaranSiswaTable.guru_id, guru[0].id))
      .execute();

    expect(pelanggaranRecords).toHaveLength(0);
  });
});
