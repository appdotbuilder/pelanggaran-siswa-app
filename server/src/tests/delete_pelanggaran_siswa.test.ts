
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { 
  kelasTable, 
  siswaTable, 
  guruTable, 
  dataPelanggaranTable, 
  pelanggaranSiswaTable 
} from '../db/schema';
import { deletePelanggaranSiswa } from '../handlers/delete_pelanggaran_siswa';
import { eq } from 'drizzle-orm';

describe('deletePelanggaranSiswa', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a pelanggaran siswa record', async () => {
    // Create prerequisite data
    const kelas = await db.insert(kelasTable)
      .values({
        nomor: 1,
        rombel: '7',
        nama_kelas: '7A'
      })
      .returning()
      .execute();

    const siswa = await db.insert(siswaTable)
      .values({
        nomor: 1,
        nama_siswa: 'Test Student',
        nisn: '1234567890',
        kelas_id: kelas[0].id
      })
      .returning()
      .execute();

    const guru = await db.insert(guruTable)
      .values({
        nomor: 1,
        nama_guru: 'Test Teacher',
        nip: '123456789'
      })
      .returning()
      .execute();

    const dataPelanggaran = await db.insert(dataPelanggaranTable)
      .values({
        kategori: 'Kelakuan',
        jenis_pelanggaran: 'Terlambat',
        poin: 10
      })
      .returning()
      .execute();

    // Create pelanggaran siswa record
    const pelanggaranSiswa = await db.insert(pelanggaranSiswaTable)
      .values({
        tanggal: '2024-01-15',
        siswa_id: siswa[0].id,
        data_pelanggaran_id: dataPelanggaran[0].id,
        guru_id: guru[0].id,
        bukti_file: null
      })
      .returning()
      .execute();

    // Delete the record
    await deletePelanggaranSiswa(pelanggaranSiswa[0].id);

    // Verify record is deleted
    const deletedRecords = await db.select()
      .from(pelanggaranSiswaTable)
      .where(eq(pelanggaranSiswaTable.id, pelanggaranSiswa[0].id))
      .execute();

    expect(deletedRecords).toHaveLength(0);
  });

  it('should not throw error when deleting non-existent record', async () => {
    const nonExistentId = 999999;

    // Should not throw error
    await expect(deletePelanggaranSiswa(nonExistentId)).resolves.toBeUndefined();
  });

  it('should handle deletion of record with evidence file', async () => {
    // Create prerequisite data
    const kelas = await db.insert(kelasTable)
      .values({
        nomor: 2,
        rombel: '8',
        nama_kelas: '8B'
      })
      .returning()
      .execute();

    const siswa = await db.insert(siswaTable)
      .values({
        nomor: 2,
        nama_siswa: 'Test Student 2',
        nisn: '9876543210',
        kelas_id: kelas[0].id
      })
      .returning()
      .execute();

    const guru = await db.insert(guruTable)
      .values({
        nomor: 2,
        nama_guru: 'Test Teacher 2',
        nip: '987654321'
      })
      .returning()
      .execute();

    const dataPelanggaran = await db.insert(dataPelanggaranTable)
      .values({
        kategori: 'Kerapian',
        jenis_pelanggaran: 'Seragam tidak rapi',
        poin: 5
      })
      .returning()
      .execute();

    // Create pelanggaran siswa record with evidence file
    const pelanggaranSiswa = await db.insert(pelanggaranSiswaTable)
      .values({
        tanggal: '2024-01-16',
        siswa_id: siswa[0].id,
        data_pelanggaran_id: dataPelanggaran[0].id,
        guru_id: guru[0].id,
        bukti_file: 'evidence.jpg'
      })
      .returning()
      .execute();

    // Delete the record
    await deletePelanggaranSiswa(pelanggaranSiswa[0].id);

    // Verify record is deleted
    const deletedRecords = await db.select()
      .from(pelanggaranSiswaTable)
      .where(eq(pelanggaranSiswaTable.id, pelanggaranSiswa[0].id))
      .execute();

    expect(deletedRecords).toHaveLength(0);
  });

  it('should not affect other pelanggaran siswa records', async () => {
    // Create prerequisite data
    const kelas = await db.insert(kelasTable)
      .values({
        nomor: 3,
        rombel: '9',
        nama_kelas: '9C'
      })
      .returning()
      .execute();

    const siswa = await db.insert(siswaTable)
      .values({
        nomor: 3,
        nama_siswa: 'Test Student 3',
        nisn: '1122334455',
        kelas_id: kelas[0].id
      })
      .returning()
      .execute();

    const guru = await db.insert(guruTable)
      .values({
        nomor: 3,
        nama_guru: 'Test Teacher 3',
        nip: '112233445'
      })
      .returning()
      .execute();

    const dataPelanggaran = await db.insert(dataPelanggaranTable)
      .values({
        kategori: 'Kerajinan & Pembiasaan',
        jenis_pelanggaran: 'Tidak mengerjakan tugas',
        poin: 15
      })
      .returning()
      .execute();

    // Create multiple pelanggaran siswa records
    const pelanggaranSiswa1 = await db.insert(pelanggaranSiswaTable)
      .values({
        tanggal: '2024-01-17',
        siswa_id: siswa[0].id,
        data_pelanggaran_id: dataPelanggaran[0].id,
        guru_id: guru[0].id
      })
      .returning()
      .execute();

    const pelanggaranSiswa2 = await db.insert(pelanggaranSiswaTable)
      .values({
        tanggal: '2024-01-18',
        siswa_id: siswa[0].id,
        data_pelanggaran_id: dataPelanggaran[0].id,
        guru_id: guru[0].id
      })
      .returning()
      .execute();

    // Delete only the first record
    await deletePelanggaranSiswa(pelanggaranSiswa1[0].id);

    // Verify first record is deleted
    const deletedRecords = await db.select()
      .from(pelanggaranSiswaTable)
      .where(eq(pelanggaranSiswaTable.id, pelanggaranSiswa1[0].id))
      .execute();

    expect(deletedRecords).toHaveLength(0);

    // Verify second record still exists
    const remainingRecords = await db.select()
      .from(pelanggaranSiswaTable)
      .where(eq(pelanggaranSiswaTable.id, pelanggaranSiswa2[0].id))
      .execute();

    expect(remainingRecords).toHaveLength(1);
    expect(remainingRecords[0].id).toEqual(pelanggaranSiswa2[0].id);
  });
});
