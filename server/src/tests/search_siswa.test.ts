
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { siswaTable, kelasTable } from '../db/schema';
import { searchSiswa } from '../handlers/search_siswa';

// Test data setup
const testKelas = {
  nomor: 1,
  rombel: '7' as const,
  nama_kelas: 'VII A'
};

const testSiswa1 = {
  nomor: 1,
  nama_siswa: 'Ahmad Budi',
  nisn: '1234567890',
  kelas_id: 0 // Will be set after kelas creation
};

const testSiswa2 = {
  nomor: 2,
  nama_siswa: 'Siti Aminah',
  nisn: '9876543210',
  kelas_id: 0 // Will be set after kelas creation
};

const testSiswa3 = {
  nomor: 3,
  nama_siswa: 'Budi Rahman',
  nisn: '5555555555',
  kelas_id: 0 // Will be set after kelas creation
};

describe('searchSiswa', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array for empty query', async () => {
    const result = await searchSiswa('');
    expect(result).toHaveLength(0);
  });

  it('should return empty array for whitespace query', async () => {
    const result = await searchSiswa('   ');
    expect(result).toHaveLength(0);
  });

  it('should search students by name', async () => {
    // Create test kelas
    const kelasResult = await db.insert(kelasTable)
      .values(testKelas)
      .returning()
      .execute();
    const kelasId = kelasResult[0].id;

    // Create test students
    await db.insert(siswaTable)
      .values([
        { ...testSiswa1, kelas_id: kelasId },
        { ...testSiswa2, kelas_id: kelasId },
        { ...testSiswa3, kelas_id: kelasId }
      ])
      .execute();

    // Search by partial name
    const results = await searchSiswa('Budi');

    expect(results).toHaveLength(2);
    expect(results[0].nama_siswa).toMatch(/Budi/i);
    expect(results[1].nama_siswa).toMatch(/Budi/i);
    
    // Check all required fields are present
    results.forEach(siswa => {
      expect(siswa.id).toBeDefined();
      expect(siswa.nomor).toBeDefined();
      expect(siswa.nama_siswa).toBeDefined();
      expect(siswa.nisn).toBeDefined();
      expect(siswa.kelas_id).toEqual(kelasId);
      expect(siswa.created_at).toBeInstanceOf(Date);
    });
  });

  it('should search students by NISN', async () => {
    // Create test kelas
    const kelasResult = await db.insert(kelasTable)
      .values(testKelas)
      .returning()
      .execute();
    const kelasId = kelasResult[0].id;

    // Create test students
    await db.insert(siswaTable)
      .values([
        { ...testSiswa1, kelas_id: kelasId },
        { ...testSiswa2, kelas_id: kelasId }
      ])
      .execute();

    // Search by partial NISN
    const results = await searchSiswa('1234');

    expect(results).toHaveLength(1);
    expect(results[0].nisn).toEqual('1234567890');
    expect(results[0].nama_siswa).toEqual('Ahmad Budi');
  });

  it('should search case insensitively', async () => {
    // Create test kelas
    const kelasResult = await db.insert(kelasTable)
      .values(testKelas)
      .returning()
      .execute();
    const kelasId = kelasResult[0].id;

    // Create test student
    await db.insert(siswaTable)
      .values({ ...testSiswa1, kelas_id: kelasId })
      .execute();

    // Search with different cases
    const results1 = await searchSiswa('ahmad');
    const results2 = await searchSiswa('AHMAD');
    const results3 = await searchSiswa('Ahmad');

    expect(results1).toHaveLength(1);
    expect(results2).toHaveLength(1);
    expect(results3).toHaveLength(1);
    
    expect(results1[0].nama_siswa).toEqual('Ahmad Budi');
    expect(results2[0].nama_siswa).toEqual('Ahmad Budi');
    expect(results3[0].nama_siswa).toEqual('Ahmad Budi');
  });

  it('should return results ordered by name', async () => {
    // Create test kelas
    const kelasResult = await db.insert(kelasTable)
      .values(testKelas)
      .returning()
      .execute();
    const kelasId = kelasResult[0].id;

    // Create test students
    await db.insert(siswaTable)
      .values([
        { ...testSiswa2, kelas_id: kelasId }, // Siti Aminah
        { ...testSiswa1, kelas_id: kelasId }, // Ahmad Budi
        { ...testSiswa3, kelas_id: kelasId }  // Budi Rahman
      ])
      .execute();

    // Search for all students (using common letter 'a')
    const results = await searchSiswa('a');

    expect(results).toHaveLength(3);
    // Should be ordered alphabetically
    expect(results[0].nama_siswa).toEqual('Ahmad Budi');
    expect(results[1].nama_siswa).toEqual('Budi Rahman');
    expect(results[2].nama_siswa).toEqual('Siti Aminah');
  });

  it('should return empty array when no matches found', async () => {
    // Create test kelas
    const kelasResult = await db.insert(kelasTable)
      .values(testKelas)
      .returning()
      .execute();
    const kelasId = kelasResult[0].id;

    // Create test student
    await db.insert(siswaTable)
      .values({ ...testSiswa1, kelas_id: kelasId })
      .execute();

    const results = await searchSiswa('xyz');
    expect(results).toHaveLength(0);
  });

  it('should match partial strings in the middle of names', async () => {
    // Create test kelas
    const kelasResult = await db.insert(kelasTable)
      .values(testKelas)
      .returning()
      .execute();
    const kelasId = kelasResult[0].id;

    // Create test student
    await db.insert(siswaTable)
      .values({ ...testSiswa1, kelas_id: kelasId })
      .execute();

    // Search by middle part of name
    const results = await searchSiswa('hma');

    expect(results).toHaveLength(1);
    expect(results[0].nama_siswa).toEqual('Ahmad Budi');
  });
});
