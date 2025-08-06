
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { siswaTable, kelasTable } from '../db/schema';
import { type UpdateSiswaInput, type CreateSiswaInput } from '../schema';
import { updateSiswa } from '../handlers/update_siswa';
import { eq } from 'drizzle-orm';

// Test data
const testKelas = {
  nomor: 1,
  rombel: '7' as const,
  nama_kelas: 'VII-A'
};

const testKelas2 = {
  nomor: 2,
  rombel: '8' as const,
  nama_kelas: 'VIII-B'
};

const testSiswa: CreateSiswaInput = {
  nomor: 123,
  nama_siswa: 'John Doe',
  nisn: '1234567890',
  kelas_id: 1 // Will be replaced with actual kelas ID
};

describe('updateSiswa', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update siswa with all fields', async () => {
    // Create test kelas
    const kelasResult = await db.insert(kelasTable)
      .values(testKelas)
      .returning()
      .execute();
    
    const kelasResult2 = await db.insert(kelasTable)
      .values(testKelas2)
      .returning()
      .execute();

    // Create test siswa
    const siswaResult = await db.insert(siswaTable)
      .values({
        ...testSiswa,
        kelas_id: kelasResult[0].id
      })
      .returning()
      .execute();

    const updateInput: UpdateSiswaInput = {
      id: siswaResult[0].id,
      nomor: 456,
      nama_siswa: 'Jane Smith',
      nisn: '0987654321',
      kelas_id: kelasResult2[0].id
    };

    const result = await updateSiswa(updateInput);

    expect(result.id).toEqual(siswaResult[0].id);
    expect(result.nomor).toEqual(456);
    expect(result.nama_siswa).toEqual('Jane Smith');
    expect(result.nisn).toEqual('0987654321');
    expect(result.kelas_id).toEqual(kelasResult2[0].id);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at).toEqual(siswaResult[0].created_at);
  });

  it('should update siswa with partial fields', async () => {
    // Create test kelas
    const kelasResult = await db.insert(kelasTable)
      .values(testKelas)
      .returning()
      .execute();

    // Create test siswa
    const siswaResult = await db.insert(siswaTable)
      .values({
        ...testSiswa,
        kelas_id: kelasResult[0].id
      })
      .returning()
      .execute();

    const updateInput: UpdateSiswaInput = {
      id: siswaResult[0].id,
      nama_siswa: 'Updated Name'
    };

    const result = await updateSiswa(updateInput);

    expect(result.id).toEqual(siswaResult[0].id);
    expect(result.nomor).toEqual(testSiswa.nomor); // Unchanged
    expect(result.nama_siswa).toEqual('Updated Name');
    expect(result.nisn).toEqual(testSiswa.nisn); // Unchanged
    expect(result.kelas_id).toEqual(kelasResult[0].id); // Unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated siswa to database', async () => {
    // Create test kelas
    const kelasResult = await db.insert(kelasTable)
      .values(testKelas)
      .returning()
      .execute();

    // Create test siswa
    const siswaResult = await db.insert(siswaTable)
      .values({
        ...testSiswa,
        kelas_id: kelasResult[0].id
      })
      .returning()
      .execute();

    const updateInput: UpdateSiswaInput = {
      id: siswaResult[0].id,
      nama_siswa: 'Database Test'
    };

    await updateSiswa(updateInput);

    // Verify in database
    const siswaInDB = await db.select()
      .from(siswaTable)
      .where(eq(siswaTable.id, siswaResult[0].id))
      .execute();

    expect(siswaInDB).toHaveLength(1);
    expect(siswaInDB[0].nama_siswa).toEqual('Database Test');
    expect(siswaInDB[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when siswa not found', async () => {
    const updateInput: UpdateSiswaInput = {
      id: 9999,
      nama_siswa: 'Non-existent'
    };

    expect(updateSiswa(updateInput)).rejects.toThrow(/siswa not found/i);
  });

  it('should throw error when kelas not found', async () => {
    // Create test kelas
    const kelasResult = await db.insert(kelasTable)
      .values(testKelas)
      .returning()
      .execute();

    // Create test siswa
    const siswaResult = await db.insert(siswaTable)
      .values({
        ...testSiswa,
        kelas_id: kelasResult[0].id
      })
      .returning()
      .execute();

    const updateInput: UpdateSiswaInput = {
      id: siswaResult[0].id,
      kelas_id: 9999 // Non-existent kelas
    };

    expect(updateSiswa(updateInput)).rejects.toThrow(/kelas not found/i);
  });
});
