
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { kelasTable, siswaTable, guruTable, dataPelanggaranTable, pelanggaranSiswaTable } from '../db/schema';
import { getPelanggaranSiswa } from '../handlers/get_pelanggaran_siswa';
import { type CreateKelasInput, type CreateSiswaInput, type CreateGuruInput, type CreateDataPelanggaranInput } from '../schema';

// Test data
const testKelas: CreateKelasInput = {
  nomor: 1,
  rombel: '7',
  nama_kelas: '7A'
};

const testGuru: CreateGuruInput = {
  nomor: 1,
  nama_guru: 'Pak Budi',
  nip: '123456789'
};

const testDataPelanggaran: CreateDataPelanggaranInput = {
  kategori: 'Kelakuan',
  jenis_pelanggaran: 'Terlambat masuk kelas',
  poin: 10
};

describe('getPelanggaranSiswa', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no violations exist', async () => {
    const result = await getPelanggaranSiswa();
    expect(result).toEqual([]);
  });

  it('should return all student violations', async () => {
    // Create prerequisite data
    const [kelas] = await db.insert(kelasTable)
      .values(testKelas)
      .returning()
      .execute();

    const testSiswa: CreateSiswaInput = {
      nomor: 1,
      nama_siswa: 'John Doe',
      nisn: '1234567890',
      kelas_id: kelas.id
    };

    const [siswa] = await db.insert(siswaTable)
      .values(testSiswa)
      .returning()
      .execute();

    const [guru] = await db.insert(guruTable)
      .values(testGuru)
      .returning()
      .execute();

    const [dataPelanggaran] = await db.insert(dataPelanggaranTable)
      .values(testDataPelanggaran)
      .returning()
      .execute();

    // Create violation record - use string format for date column
    const testPelanggaranSiswa = {
      tanggal: '2024-01-15', // Use string format for date column
      siswa_id: siswa.id,
      data_pelanggaran_id: dataPelanggaran.id,
      guru_id: guru.id,
      bukti_file: 'evidence.jpg'
    };

    const [pelanggaranSiswa] = await db.insert(pelanggaranSiswaTable)
      .values(testPelanggaranSiswa)
      .returning()
      .execute();

    const result = await getPelanggaranSiswa();

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(pelanggaranSiswa.id);
    expect(result[0].tanggal).toEqual(new Date('2024-01-15'));
    expect(result[0].siswa_id).toEqual(siswa.id);
    expect(result[0].data_pelanggaran_id).toEqual(dataPelanggaran.id);
    expect(result[0].guru_id).toEqual(guru.id);
    expect(result[0].bukti_file).toEqual('evidence.jpg');
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeNull();
  });

  it('should return multiple violations correctly', async () => {
    // Create prerequisite data
    const [kelas] = await db.insert(kelasTable)
      .values(testKelas)
      .returning()
      .execute();

    const testSiswa1: CreateSiswaInput = {
      nomor: 1,
      nama_siswa: 'John Doe',
      nisn: '1234567890',
      kelas_id: kelas.id
    };

    const testSiswa2: CreateSiswaInput = {
      nomor: 2,
      nama_siswa: 'Jane Smith',
      nisn: '0987654321',
      kelas_id: kelas.id
    };

    const [siswa1] = await db.insert(siswaTable)
      .values(testSiswa1)
      .returning()
      .execute();

    const [siswa2] = await db.insert(siswaTable)
      .values(testSiswa2)
      .returning()
      .execute();

    const [guru] = await db.insert(guruTable)
      .values(testGuru)
      .returning()
      .execute();

    const [dataPelanggaran] = await db.insert(dataPelanggaranTable)
      .values(testDataPelanggaran)
      .returning()
      .execute();

    // Create multiple violation records - use string format for date columns
    const violations = [
      {
        tanggal: '2024-01-15', // Use string format for date column
        siswa_id: siswa1.id,
        data_pelanggaran_id: dataPelanggaran.id,
        guru_id: guru.id,
        bukti_file: 'evidence1.jpg'
      },
      {
        tanggal: '2024-01-16', // Use string format for date column
        siswa_id: siswa2.id,
        data_pelanggaran_id: dataPelanggaran.id,
        guru_id: guru.id,
        bukti_file: null
      }
    ];

    await db.insert(pelanggaranSiswaTable)
      .values(violations)
      .execute();

    const result = await getPelanggaranSiswa();

    expect(result).toHaveLength(2);
    
    // Sort by siswa_id for consistent testing
    result.sort((a, b) => a.siswa_id - b.siswa_id);

    expect(result[0].siswa_id).toEqual(siswa1.id);
    expect(result[0].tanggal).toEqual(new Date('2024-01-15'));
    expect(result[0].bukti_file).toEqual('evidence1.jpg');

    expect(result[1].siswa_id).toEqual(siswa2.id);
    expect(result[1].tanggal).toEqual(new Date('2024-01-16'));
    expect(result[1].bukti_file).toBeNull();
  });
});
