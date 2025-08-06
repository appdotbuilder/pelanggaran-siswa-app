
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { kelasTable } from '../db/schema';
import { type CreateKelasInput } from '../schema';
import { getKelas } from '../handlers/get_kelas';

// Test data
const testKelas1: CreateKelasInput = {
  nomor: 1,
  rombel: '7',
  nama_kelas: '7A'
};

const testKelas2: CreateKelasInput = {
  nomor: 2,
  rombel: '8',
  nama_kelas: '8B'
};

describe('getKelas', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no kelas exist', async () => {
    const result = await getKelas();

    expect(result).toEqual([]);
  });

  it('should return all kelas from database', async () => {
    // Create test kelas
    await db.insert(kelasTable)
      .values([testKelas1, testKelas2])
      .execute();

    const result = await getKelas();

    expect(result).toHaveLength(2);
    
    // Verify first kelas
    const kelas1 = result.find(k => k.nomor === 1);
    expect(kelas1).toBeDefined();
    expect(kelas1!.rombel).toEqual('7');
    expect(kelas1!.nama_kelas).toEqual('7A');
    expect(kelas1!.id).toBeDefined();
    expect(kelas1!.created_at).toBeInstanceOf(Date);
    expect(kelas1!.updated_at).toBeNull();

    // Verify second kelas
    const kelas2 = result.find(k => k.nomor === 2);
    expect(kelas2).toBeDefined();
    expect(kelas2!.rombel).toEqual('8');
    expect(kelas2!.nama_kelas).toEqual('8B');
    expect(kelas2!.id).toBeDefined();
    expect(kelas2!.created_at).toBeInstanceOf(Date);
    expect(kelas2!.updated_at).toBeNull();
  });

  it('should return kelas with all required fields', async () => {
    // Create a single test kelas
    await db.insert(kelasTable)
      .values(testKelas1)
      .execute();

    const result = await getKelas();

    expect(result).toHaveLength(1);
    const kelas = result[0];

    // Verify all required fields are present
    expect(kelas.id).toBeDefined();
    expect(typeof kelas.id).toBe('number');
    expect(kelas.nomor).toEqual(1);
    expect(typeof kelas.nomor).toBe('number');
    expect(kelas.rombel).toEqual('7');
    expect(kelas.nama_kelas).toEqual('7A');
    expect(kelas.created_at).toBeInstanceOf(Date);
    expect(kelas.updated_at).toBeNull();
  });

  it('should handle multiple kelas with different rombel values', async () => {
    // Create kelas for all rombel types
    const kelasGrade7: CreateKelasInput = {
      nomor: 1,
      rombel: '7',
      nama_kelas: 'VII-1'
    };

    const kelasGrade8: CreateKelasInput = {
      nomor: 2,
      rombel: '8',
      nama_kelas: 'VIII-1'
    };

    const kelasGrade9: CreateKelasInput = {
      nomor: 3,
      rombel: '9',
      nama_kelas: 'IX-1'
    };

    await db.insert(kelasTable)
      .values([kelasGrade7, kelasGrade8, kelasGrade9])
      .execute();

    const result = await getKelas();

    expect(result).toHaveLength(3);

    // Verify each rombel type is present
    const grade7 = result.find(k => k.rombel === '7');
    const grade8 = result.find(k => k.rombel === '8');
    const grade9 = result.find(k => k.rombel === '9');

    expect(grade7).toBeDefined();
    expect(grade7!.nama_kelas).toEqual('VII-1');
    expect(grade8).toBeDefined();
    expect(grade8!.nama_kelas).toEqual('VIII-1');
    expect(grade9).toBeDefined();
    expect(grade9!.nama_kelas).toEqual('IX-1');
  });
});
