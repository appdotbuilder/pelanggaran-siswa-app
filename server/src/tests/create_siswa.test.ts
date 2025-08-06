
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { siswaTable, kelasTable } from '../db/schema';
import { type CreateSiswaInput } from '../schema';
import { createSiswa } from '../handlers/create_siswa';
import { eq } from 'drizzle-orm';

describe('createSiswa', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a siswa', async () => {
    // Create prerequisite kelas
    const kelasResult = await db.insert(kelasTable)
      .values({
        nomor: 1,
        rombel: '7',
        nama_kelas: '7A'
      })
      .returning()
      .execute();

    const testInput: CreateSiswaInput = {
      nomor: 1,
      nama_siswa: 'Ahmad Siswa',
      nisn: '1234567890',
      kelas_id: kelasResult[0].id
    };

    const result = await createSiswa(testInput);

    // Basic field validation
    expect(result.nomor).toEqual(1);
    expect(result.nama_siswa).toEqual('Ahmad Siswa');
    expect(result.nisn).toEqual('1234567890');
    expect(result.kelas_id).toEqual(kelasResult[0].id);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeNull();
  });

  it('should save siswa to database', async () => {
    // Create prerequisite kelas
    const kelasResult = await db.insert(kelasTable)
      .values({
        nomor: 2,
        rombel: '8',
        nama_kelas: '8B'
      })
      .returning()
      .execute();

    const testInput: CreateSiswaInput = {
      nomor: 5,
      nama_siswa: 'Siti Siswa',
      nisn: '0987654321',
      kelas_id: kelasResult[0].id
    };

    const result = await createSiswa(testInput);

    // Query to verify data was saved
    const savedSiswa = await db.select()
      .from(siswaTable)
      .where(eq(siswaTable.id, result.id))
      .execute();

    expect(savedSiswa).toHaveLength(1);
    expect(savedSiswa[0].nomor).toEqual(5);
    expect(savedSiswa[0].nama_siswa).toEqual('Siti Siswa');
    expect(savedSiswa[0].nisn).toEqual('0987654321');
    expect(savedSiswa[0].kelas_id).toEqual(kelasResult[0].id);
    expect(savedSiswa[0].created_at).toBeInstanceOf(Date);
    expect(savedSiswa[0].updated_at).toBeNull();
  });

  it('should throw error when kelas_id does not exist', async () => {
    const testInput: CreateSiswaInput = {
      nomor: 1,
      nama_siswa: 'Test Siswa',
      nisn: '1111111111',
      kelas_id: 999 // Non-existent kelas_id
    };

    await expect(createSiswa(testInput)).rejects.toThrow(/kelas with id 999 does not exist/i);
  });

  it('should create multiple siswa in same kelas', async () => {
    // Create prerequisite kelas
    const kelasResult = await db.insert(kelasTable)
      .values({
        nomor: 3,
        rombel: '9',
        nama_kelas: '9C'
      })
      .returning()
      .execute();

    const testInput1: CreateSiswaInput = {
      nomor: 10,
      nama_siswa: 'Siswa Pertama',
      nisn: '1111111111',
      kelas_id: kelasResult[0].id
    };

    const testInput2: CreateSiswaInput = {
      nomor: 11,
      nama_siswa: 'Siswa Kedua',
      nisn: '2222222222',
      kelas_id: kelasResult[0].id
    };

    const result1 = await createSiswa(testInput1);
    const result2 = await createSiswa(testInput2);

    expect(result1.kelas_id).toEqual(kelasResult[0].id);
    expect(result2.kelas_id).toEqual(kelasResult[0].id);
    expect(result1.id).not.toEqual(result2.id);

    // Verify both siswa are in database
    const allSiswa = await db.select()
      .from(siswaTable)
      .where(eq(siswaTable.kelas_id, kelasResult[0].id))
      .execute();

    expect(allSiswa).toHaveLength(2);
  });
});
