
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { siswaTable, kelasTable } from '../db/schema';
import { getSiswa } from '../handlers/get_siswa';

describe('getSiswa', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no students exist', async () => {
    const result = await getSiswa();
    expect(result).toEqual([]);
  });

  it('should return all students', async () => {
    // Create a class first (required for foreign key)
    const kelasResult = await db.insert(kelasTable)
      .values({
        nomor: 1,
        rombel: '7',
        nama_kelas: 'VII A'
      })
      .returning()
      .execute();

    const kelasId = kelasResult[0].id;

    // Create test students
    await db.insert(siswaTable)
      .values([
        {
          nomor: 1,
          nama_siswa: 'Ahmad Rizki',
          nisn: '1234567890',
          kelas_id: kelasId
        },
        {
          nomor: 2,
          nama_siswa: 'Siti Fatimah',
          nisn: '0987654321',
          kelas_id: kelasId
        }
      ])
      .execute();

    const result = await getSiswa();

    expect(result).toHaveLength(2);
    
    // Check first student
    expect(result[0].nomor).toEqual(1);
    expect(result[0].nama_siswa).toEqual('Ahmad Rizki');
    expect(result[0].nisn).toEqual('1234567890');
    expect(result[0].kelas_id).toEqual(kelasId);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    
    // Check second student
    expect(result[1].nomor).toEqual(2);
    expect(result[1].nama_siswa).toEqual('Siti Fatimah');
    expect(result[1].nisn).toEqual('0987654321');
    expect(result[1].kelas_id).toEqual(kelasId);
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);
  });

  it('should return students from multiple classes', async () => {
    // Create multiple classes
    const kelasResults = await db.insert(kelasTable)
      .values([
        {
          nomor: 1,
          rombel: '7',
          nama_kelas: 'VII A'
        },
        {
          nomor: 2,
          rombel: '8',
          nama_kelas: 'VIII B'
        }
      ])
      .returning()
      .execute();

    const kelas1Id = kelasResults[0].id;
    const kelas2Id = kelasResults[1].id;

    // Create students in different classes
    await db.insert(siswaTable)
      .values([
        {
          nomor: 1,
          nama_siswa: 'Student Class 1',
          nisn: '1111111111',
          kelas_id: kelas1Id
        },
        {
          nomor: 2,
          nama_siswa: 'Student Class 2',
          nisn: '2222222222',
          kelas_id: kelas2Id
        }
      ])
      .execute();

    const result = await getSiswa();

    expect(result).toHaveLength(2);
    
    // Verify students from different classes are returned
    const studentClassIds = result.map(s => s.kelas_id);
    expect(studentClassIds).toContain(kelas1Id);
    expect(studentClassIds).toContain(kelas2Id);
  });
});
