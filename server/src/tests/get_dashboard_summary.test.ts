
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { kelasTable, guruTable, siswaTable, dataPelanggaranTable, pelanggaranSiswaTable } from '../db/schema';
import { getDashboardSummary } from '../handlers/get_dashboard_summary';
import { type DashboardFilter } from '../schema';

describe('getDashboardSummary', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty summary when no violations exist', async () => {
    const filter: DashboardFilter = {};
    const result = await getDashboardSummary(filter);

    expect(result.rangkumanPelanggaran).toHaveLength(0);
    expect(result.pelanggaranPerKelas).toHaveLength(0);
  });

  it('should return summary with violations by category and class', async () => {
    // Create test data
    const [kelas1] = await db.insert(kelasTable).values({
      nomor: 1,
      rombel: '7',
      nama_kelas: '7A'
    }).returning().execute();

    const [kelas2] = await db.insert(kelasTable).values({
      nomor: 2,
      rombel: '8',
      nama_kelas: '8A'
    }).returning().execute();

    const [guru] = await db.insert(guruTable).values({
      nomor: 1,
      nama_guru: 'Pak Guru',
      nip: '123456789'
    }).returning().execute();

    const [siswa1] = await db.insert(siswaTable).values({
      nomor: 1,
      nama_siswa: 'Siswa 1',
      nisn: '001',
      kelas_id: kelas1.id
    }).returning().execute();

    const [siswa2] = await db.insert(siswaTable).values({
      nomor: 2,
      nama_siswa: 'Siswa 2',
      nisn: '002',
      kelas_id: kelas2.id
    }).returning().execute();

    const [pelanggaran1] = await db.insert(dataPelanggaranTable).values({
      kategori: 'Kelakuan',
      jenis_pelanggaran: 'Terlambat',
      poin: 5
    }).returning().execute();

    const [pelanggaran2] = await db.insert(dataPelanggaranTable).values({
      kategori: 'Kerapian',
      jenis_pelanggaran: 'Tidak berseragam',
      poin: 10
    }).returning().execute();

    // Create violations - use string format for date column
    await db.insert(pelanggaranSiswaTable).values([
      {
        tanggal: '2024-01-15',
        siswa_id: siswa1.id,
        data_pelanggaran_id: pelanggaran1.id,
        guru_id: guru.id
      },
      {
        tanggal: '2024-01-16',
        siswa_id: siswa2.id,
        data_pelanggaran_id: pelanggaran2.id,
        guru_id: guru.id
      },
      {
        tanggal: '2024-01-17',
        siswa_id: siswa1.id,
        data_pelanggaran_id: pelanggaran1.id,
        guru_id: guru.id
      }
    ]).execute();

    const filter: DashboardFilter = {};
    const result = await getDashboardSummary(filter);

    // Verify rangkuman pelanggaran
    expect(result.rangkumanPelanggaran).toHaveLength(2);
    
    const kelakuanSummary = result.rangkumanPelanggaran.find(r => r.kategori === 'Kelakuan');
    expect(kelakuanSummary).toBeDefined();
    expect(kelakuanSummary!.total_pelanggaran).toBe(2);
    expect(kelakuanSummary!.total_poin).toBe(10);

    const kerapianSummary = result.rangkumanPelanggaran.find(r => r.kategori === 'Kerapian');
    expect(kerapianSummary).toBeDefined();
    expect(kerapianSummary!.total_pelanggaran).toBe(1);
    expect(kerapianSummary!.total_poin).toBe(10);

    // Verify pelanggaran per kelas
    expect(result.pelanggaranPerKelas).toHaveLength(2);
    
    const kelas1Summary = result.pelanggaranPerKelas.find(k => k.kelas_id === kelas1.id);
    expect(kelas1Summary).toBeDefined();
    expect(kelas1Summary!.nama_kelas).toBe('7A');
    expect(kelas1Summary!.rombel).toBe('7');
    expect(kelas1Summary!.total_pelanggaran).toBe(2);
    expect(kelas1Summary!.total_poin).toBe(10);

    const kelas2Summary = result.pelanggaranPerKelas.find(k => k.kelas_id === kelas2.id);
    expect(kelas2Summary).toBeDefined();
    expect(kelas2Summary!.nama_kelas).toBe('8A');
    expect(kelas2Summary!.rombel).toBe('8');
    expect(kelas2Summary!.total_pelanggaran).toBe(1);
    expect(kelas2Summary!.total_poin).toBe(10);
  });

  it('should filter by date range correctly', async () => {
    // Create test data
    const [kelas] = await db.insert(kelasTable).values({
      nomor: 1,
      rombel: '7',
      nama_kelas: '7A'
    }).returning().execute();

    const [guru] = await db.insert(guruTable).values({
      nomor: 1,
      nama_guru: 'Pak Guru',
      nip: '123456789'
    }).returning().execute();

    const [siswa] = await db.insert(siswaTable).values({
      nomor: 1,
      nama_siswa: 'Siswa 1',
      nisn: '001',
      kelas_id: kelas.id
    }).returning().execute();

    const [pelanggaran] = await db.insert(dataPelanggaranTable).values({
      kategori: 'Kelakuan',
      jenis_pelanggaran: 'Terlambat',
      poin: 5
    }).returning().execute();

    // Create violations with different dates - use string format
    await db.insert(pelanggaranSiswaTable).values([
      {
        tanggal: '2024-01-10',
        siswa_id: siswa.id,
        data_pelanggaran_id: pelanggaran.id,
        guru_id: guru.id
      },
      {
        tanggal: '2024-01-15',
        siswa_id: siswa.id,
        data_pelanggaran_id: pelanggaran.id,
        guru_id: guru.id
      },
      {
        tanggal: '2024-01-20',
        siswa_id: siswa.id,
        data_pelanggaran_id: pelanggaran.id,
        guru_id: guru.id
      }
    ]).execute();

    const filter: DashboardFilter = {
      tanggal_awal: new Date('2024-01-12'),
      tanggal_akhir: new Date('2024-01-18')
    };
    const result = await getDashboardSummary(filter);

    expect(result.rangkumanPelanggaran).toHaveLength(1);
    expect(result.rangkumanPelanggaran[0].total_pelanggaran).toBe(1);
    expect(result.rangkumanPelanggaran[0].total_poin).toBe(5);

    expect(result.pelanggaranPerKelas).toHaveLength(1);
    expect(result.pelanggaranPerKelas[0].total_pelanggaran).toBe(1);
    expect(result.pelanggaranPerKelas[0].total_poin).toBe(5);
  });

  it('should filter by specific class', async () => {
    // Create test data
    const [kelas1] = await db.insert(kelasTable).values({
      nomor: 1,
      rombel: '7',
      nama_kelas: '7A'
    }).returning().execute();

    const [kelas2] = await db.insert(kelasTable).values({
      nomor: 2,
      rombel: '8',
      nama_kelas: '8A'
    }).returning().execute();

    const [guru] = await db.insert(guruTable).values({
      nomor: 1,
      nama_guru: 'Pak Guru',
      nip: '123456789'
    }).returning().execute();

    const [siswa1] = await db.insert(siswaTable).values({
      nomor: 1,
      nama_siswa: 'Siswa 1',
      nisn: '001',
      kelas_id: kelas1.id
    }).returning().execute();

    const [siswa2] = await db.insert(siswaTable).values({
      nomor: 2,
      nama_siswa: 'Siswa 2',
      nisn: '002',
      kelas_id: kelas2.id
    }).returning().execute();

    const [pelanggaran] = await db.insert(dataPelanggaranTable).values({
      kategori: 'Kelakuan',
      jenis_pelanggaran: 'Terlambat',
      poin: 5
    }).returning().execute();

    // Create violations for both classes - use string format
    await db.insert(pelanggaranSiswaTable).values([
      {
        tanggal: '2024-01-15',
        siswa_id: siswa1.id,
        data_pelanggaran_id: pelanggaran.id,
        guru_id: guru.id
      },
      {
        tanggal: '2024-01-16',
        siswa_id: siswa2.id,
        data_pelanggaran_id: pelanggaran.id,
        guru_id: guru.id
      }
    ]).execute();

    const filter: DashboardFilter = {
      kelas_id: kelas1.id
    };
    const result = await getDashboardSummary(filter);

    expect(result.rangkumanPelanggaran).toHaveLength(1);
    expect(result.rangkumanPelanggaran[0].total_pelanggaran).toBe(1);

    expect(result.pelanggaranPerKelas).toHaveLength(1);
    expect(result.pelanggaranPerKelas[0].kelas_id).toBe(kelas1.id);
    expect(result.pelanggaranPerKelas[0].nama_kelas).toBe('7A');
    expect(result.pelanggaranPerKelas[0].total_pelanggaran).toBe(1);
  });

  it('should filter by violation category', async () => {
    // Create test data
    const [kelas] = await db.insert(kelasTable).values({
      nomor: 1,
      rombel: '7',
      nama_kelas: '7A'
    }).returning().execute();

    const [guru] = await db.insert(guruTable).values({
      nomor: 1,
      nama_guru: 'Pak Guru',
      nip: '123456789'
    }).returning().execute();

    const [siswa] = await db.insert(siswaTable).values({
      nomor: 1,
      nama_siswa: 'Siswa 1',
      nisn: '001',
      kelas_id: kelas.id
    }).returning().execute();

    const [pelanggaran1] = await db.insert(dataPelanggaranTable).values({
      kategori: 'Kelakuan',
      jenis_pelanggaran: 'Terlambat',
      poin: 5
    }).returning().execute();

    const [pelanggaran2] = await db.insert(dataPelanggaranTable).values({
      kategori: 'Kerapian',
      jenis_pelanggaran: 'Tidak berseragam',
      poin: 10
    }).returning().execute();

    // Create violations with different categories - use string format
    await db.insert(pelanggaranSiswaTable).values([
      {
        tanggal: '2024-01-15',
        siswa_id: siswa.id,
        data_pelanggaran_id: pelanggaran1.id,
        guru_id: guru.id
      },
      {
        tanggal: '2024-01-16',
        siswa_id: siswa.id,
        data_pelanggaran_id: pelanggaran2.id,
        guru_id: guru.id
      }
    ]).execute();

    const filter: DashboardFilter = {
      kategori: 'Kelakuan'
    };
    const result = await getDashboardSummary(filter);

    expect(result.rangkumanPelanggaran).toHaveLength(1);
    expect(result.rangkumanPelanggaran[0].kategori).toBe('Kelakuan');
    expect(result.rangkumanPelanggaran[0].total_pelanggaran).toBe(1);
    expect(result.rangkumanPelanggaran[0].total_poin).toBe(5);

    expect(result.pelanggaranPerKelas).toHaveLength(1);
    expect(result.pelanggaranPerKelas[0].total_pelanggaran).toBe(1);
    expect(result.pelanggaranPerKelas[0].total_poin).toBe(5);
  });

  it('should filter by teacher correctly', async () => {
    // Create test data
    const [kelas] = await db.insert(kelasTable).values({
      nomor: 1,
      rombel: '7',
      nama_kelas: '7A'
    }).returning().execute();

    const [guru1] = await db.insert(guruTable).values({
      nomor: 1,
      nama_guru: 'Pak Guru 1',
      nip: '111111111'
    }).returning().execute();

    const [guru2] = await db.insert(guruTable).values({
      nomor: 2,
      nama_guru: 'Pak Guru 2',
      nip: '222222222'
    }).returning().execute();

    const [siswa] = await db.insert(siswaTable).values({
      nomor: 1,
      nama_siswa: 'Siswa 1',
      nisn: '001',
      kelas_id: kelas.id
    }).returning().execute();

    const [pelanggaran] = await db.insert(dataPelanggaranTable).values({
      kategori: 'Kelakuan',
      jenis_pelanggaran: 'Terlambat',
      poin: 5
    }).returning().execute();

    // Create violations by different teachers - use string format
    await db.insert(pelanggaranSiswaTable).values([
      {
        tanggal: '2024-01-15',
        siswa_id: siswa.id,
        data_pelanggaran_id: pelanggaran.id,
        guru_id: guru1.id
      },
      {
        tanggal: '2024-01-16',
        siswa_id: siswa.id,
        data_pelanggaran_id: pelanggaran.id,
        guru_id: guru2.id
      }
    ]).execute();

    const filter: DashboardFilter = {
      guru_id: guru1.id
    };
    const result = await getDashboardSummary(filter);

    expect(result.rangkumanPelanggaran).toHaveLength(1);
    expect(result.rangkumanPelanggaran[0].total_pelanggaran).toBe(1);
    expect(result.rangkumanPelanggaran[0].total_poin).toBe(5);

    expect(result.pelanggaranPerKelas).toHaveLength(1);
    expect(result.pelanggaranPerKelas[0].total_pelanggaran).toBe(1);
    expect(result.pelanggaranPerKelas[0].total_poin).toBe(5);
  });
});
