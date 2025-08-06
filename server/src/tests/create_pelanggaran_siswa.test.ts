
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pelanggaranSiswaTable, siswaTable, kelasTable, dataPelanggaranTable, guruTable } from '../db/schema';
import { type CreatePelanggaranSiswaInput } from '../schema';
import { createPelanggaranSiswa } from '../handlers/create_pelanggaran_siswa';
import { eq } from 'drizzle-orm';

describe('createPelanggaranSiswa', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let kelasId: number;
  let siswaId: number;
  let dataPelanggaranId: number;
  let guruId: number;

  beforeEach(async () => {
    // Create prerequisite data for foreign key relationships
    
    // Create class first
    const kelasResult = await db.insert(kelasTable)
      .values({
        nomor: 1,
        rombel: '7',
        nama_kelas: '7A'
      })
      .returning()
      .execute();
    kelasId = kelasResult[0].id;

    // Create student
    const siswaResult = await db.insert(siswaTable)
      .values({
        nomor: 1,
        nama_siswa: 'Test Student',
        nisn: '1234567890',
        kelas_id: kelasId
      })
      .returning()
      .execute();
    siswaId = siswaResult[0].id;

    // Create violation type
    const dataPelanggaranResult = await db.insert(dataPelanggaranTable)
      .values({
        kategori: 'Kelakuan',
        jenis_pelanggaran: 'Terlambat',
        poin: 10
      })
      .returning()
      .execute();
    dataPelanggaranId = dataPelanggaranResult[0].id;

    // Create teacher
    const guruResult = await db.insert(guruTable)
      .values({
        nomor: 1,
        nama_guru: 'Test Teacher',
        nip: '1234567890'
      })
      .returning()
      .execute();
    guruId = guruResult[0].id;
  });

  const testInput = (): CreatePelanggaranSiswaInput => ({
    tanggal: new Date('2024-01-15'),
    siswa_id: siswaId,
    data_pelanggaran_id: dataPelanggaranId,
    guru_id: guruId,
    bukti_file: 'evidence.jpg'
  });

  it('should create a student violation record', async () => {
    const result = await createPelanggaranSiswa(testInput());

    // Basic field validation
    expect(result.id).toBeDefined();
    expect(result.tanggal).toEqual(new Date('2024-01-15'));
    expect(result.siswa_id).toEqual(siswaId);
    expect(result.data_pelanggaran_id).toEqual(dataPelanggaranId);
    expect(result.guru_id).toEqual(guruId);
    expect(result.bukti_file).toEqual('evidence.jpg');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeNull();
  });

  it('should save violation record to database', async () => {
    const result = await createPelanggaranSiswa(testInput());

    const violations = await db.select()
      .from(pelanggaranSiswaTable)
      .where(eq(pelanggaranSiswaTable.id, result.id))
      .execute();

    expect(violations).toHaveLength(1);
    const violation = violations[0];
    expect(violation.tanggal).toEqual('2024-01-15');
    expect(violation.siswa_id).toEqual(siswaId);
    expect(violation.data_pelanggaran_id).toEqual(dataPelanggaranId);
    expect(violation.guru_id).toEqual(guruId);
    expect(violation.bukti_file).toEqual('evidence.jpg');
    expect(violation.created_at).toBeInstanceOf(Date);
  });

  it('should handle null bukti_file', async () => {
    const input = testInput();
    input.bukti_file = null;

    const result = await createPelanggaranSiswa(input);

    expect(result.bukti_file).toBeNull();

    const violations = await db.select()
      .from(pelanggaranSiswaTable)
      .where(eq(pelanggaranSiswaTable.id, result.id))
      .execute();

    expect(violations[0].bukti_file).toBeNull();
  });

  it('should handle undefined bukti_file', async () => {
    const input = testInput();
    delete (input as any).bukti_file;

    const result = await createPelanggaranSiswa(input);

    expect(result.bukti_file).toBeNull();
  });

  it('should throw error for non-existent student', async () => {
    const input = testInput();
    input.siswa_id = 99999;

    await expect(createPelanggaranSiswa(input))
      .rejects
      .toThrow(/student with id 99999 not found/i);
  });

  it('should throw error for non-existent violation type', async () => {
    const input = testInput();
    input.data_pelanggaran_id = 99999;

    await expect(createPelanggaranSiswa(input))
      .rejects
      .toThrow(/violation type with id 99999 not found/i);
  });

  it('should throw error for non-existent teacher', async () => {
    const input = testInput();
    input.guru_id = 99999;

    await expect(createPelanggaranSiswa(input))
      .rejects
      .toThrow(/teacher with id 99999 not found/i);
  });
});
