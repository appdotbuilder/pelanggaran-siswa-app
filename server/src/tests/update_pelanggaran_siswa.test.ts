
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { 
  pelanggaranSiswaTable, 
  kelasTable, 
  siswaTable, 
  dataPelanggaranTable, 
  guruTable 
} from '../db/schema';
import { type UpdatePelanggaranSiswaInput } from '../schema';
import { updatePelanggaranSiswa } from '../handlers/update_pelanggaran_siswa';
import { eq } from 'drizzle-orm';

describe('updatePelanggaranSiswa', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let kelasId: number;
  let siswaId: number;
  let dataPelanggaranId: number;
  let guruId: number;
  let pelanggaranId: number;

  beforeEach(async () => {
    // Create prerequisite data
    const kelas = await db.insert(kelasTable)
      .values({
        nomor: 1,
        rombel: '7',
        nama_kelas: 'Test Class'
      })
      .returning()
      .execute();
    kelasId = kelas[0].id;

    const siswa = await db.insert(siswaTable)
      .values({
        nomor: 1,
        nama_siswa: 'Test Student',
        nisn: '1234567890',
        kelas_id: kelasId
      })
      .returning()
      .execute();
    siswaId = siswa[0].id;

    const dataPelanggaran = await db.insert(dataPelanggaranTable)
      .values({
        kategori: 'Kelakuan',
        jenis_pelanggaran: 'Test Violation',
        poin: 10
      })
      .returning()
      .execute();
    dataPelanggaranId = dataPelanggaran[0].id;

    const guru = await db.insert(guruTable)
      .values({
        nomor: 1,
        nama_guru: 'Test Teacher',
        nip: '1234567890'
      })
      .returning()
      .execute();
    guruId = guru[0].id;

    // Create initial violation record with date string
    const pelanggaran = await db.insert(pelanggaranSiswaTable)
      .values({
        tanggal: '2024-01-15',
        siswa_id: siswaId,
        data_pelanggaran_id: dataPelanggaranId,
        guru_id: guruId,
        bukti_file: 'initial_file.jpg'
      })
      .returning()
      .execute();
    pelanggaranId = pelanggaran[0].id;
  });

  it('should update violation record with all fields', async () => {
    const updateInput: UpdatePelanggaranSiswaInput = {
      id: pelanggaranId,
      tanggal: new Date('2024-02-15'),
      siswa_id: siswaId,
      data_pelanggaran_id: dataPelanggaranId,
      guru_id: guruId,
      bukti_file: 'updated_file.jpg'
    };

    const result = await updatePelanggaranSiswa(updateInput);

    expect(result.id).toEqual(pelanggaranId);
    expect(result.tanggal).toEqual(new Date('2024-02-15'));
    expect(result.siswa_id).toEqual(siswaId);
    expect(result.data_pelanggaran_id).toEqual(dataPelanggaranId);
    expect(result.guru_id).toEqual(guruId);
    expect(result.bukti_file).toEqual('updated_file.jpg');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update violation record with partial fields', async () => {
    const updateInput: UpdatePelanggaranSiswaInput = {
      id: pelanggaranId,
      tanggal: new Date('2024-03-15'),
      bukti_file: 'partial_update.jpg'
    };

    const result = await updatePelanggaranSiswa(updateInput);

    expect(result.id).toEqual(pelanggaranId);
    expect(result.tanggal).toEqual(new Date('2024-03-15'));
    expect(result.bukti_file).toEqual('partial_update.jpg');
    expect(result.updated_at).toBeInstanceOf(Date);
    // Other fields should remain unchanged
    expect(result.siswa_id).toEqual(siswaId);
    expect(result.data_pelanggaran_id).toEqual(dataPelanggaranId);
    expect(result.guru_id).toEqual(guruId);
  });

  it('should set bukti_file to null', async () => {
    const updateInput: UpdatePelanggaranSiswaInput = {
      id: pelanggaranId,
      bukti_file: null
    };

    const result = await updatePelanggaranSiswa(updateInput);

    expect(result.bukti_file).toBeNull();
  });

  it('should save updated violation to database', async () => {
    const updateInput: UpdatePelanggaranSiswaInput = {
      id: pelanggaranId,
      tanggal: new Date('2024-04-15'),
      bukti_file: 'database_test.jpg'
    };

    await updatePelanggaranSiswa(updateInput);

    const violations = await db.select()
      .from(pelanggaranSiswaTable)
      .where(eq(pelanggaranSiswaTable.id, pelanggaranId))
      .execute();

    expect(violations).toHaveLength(1);
    expect(violations[0].tanggal).toEqual('2024-04-15'); // Database stores as string
    expect(violations[0].bukti_file).toEqual('database_test.jpg');
    expect(violations[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when violation record not found', async () => {
    const updateInput: UpdatePelanggaranSiswaInput = {
      id: 99999,
      tanggal: new Date('2024-01-15')
    };

    expect(updatePelanggaranSiswa(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should throw error when siswa_id does not exist', async () => {
    const updateInput: UpdatePelanggaranSiswaInput = {
      id: pelanggaranId,
      siswa_id: 99999
    };

    expect(updatePelanggaranSiswa(updateInput)).rejects.toThrow(/student.*not found/i);
  });

  it('should throw error when data_pelanggaran_id does not exist', async () => {
    const updateInput: UpdatePelanggaranSiswaInput = {
      id: pelanggaranId,
      data_pelanggaran_id: 99999
    };

    expect(updatePelanggaranSiswa(updateInput)).rejects.toThrow(/violation data.*not found/i);
  });

  it('should throw error when guru_id does not exist', async () => {
    const updateInput: UpdatePelanggaranSiswaInput = {
      id: pelanggaranId,
      guru_id: 99999
    };

    expect(updatePelanggaranSiswa(updateInput)).rejects.toThrow(/teacher.*not found/i);
  });
});
