
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { guruTable } from '../db/schema';
import { type CreateGuruInput } from '../schema';
import { getGuru } from '../handlers/get_guru';

// Test guru data
const testGuru1: CreateGuruInput = {
  nomor: 1,
  nama_guru: 'Pak Ahmad',
  nip: '123456789012345'
};

const testGuru2: CreateGuruInput = {
  nomor: 2,
  nama_guru: 'Bu Sari',
  nip: '987654321098765'
};

describe('getGuru', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no teachers exist', async () => {
    const result = await getGuru();
    
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return all teachers', async () => {
    // Insert test teachers
    await db.insert(guruTable)
      .values([testGuru1, testGuru2])
      .execute();

    const result = await getGuru();

    expect(result).toHaveLength(2);
    
    // Check first teacher
    const guru1 = result.find(g => g.nama_guru === 'Pak Ahmad');
    expect(guru1).toBeDefined();
    expect(guru1?.nomor).toEqual(1);
    expect(guru1?.nama_guru).toEqual('Pak Ahmad');
    expect(guru1?.nip).toEqual('123456789012345');
    expect(guru1?.id).toBeDefined();
    expect(guru1?.created_at).toBeInstanceOf(Date);
    expect(guru1?.updated_at).toBeNull();

    // Check second teacher
    const guru2 = result.find(g => g.nama_guru === 'Bu Sari');
    expect(guru2).toBeDefined();
    expect(guru2?.nomor).toEqual(2);
    expect(guru2?.nama_guru).toEqual('Bu Sari');
    expect(guru2?.nip).toEqual('987654321098765');
    expect(guru2?.id).toBeDefined();
    expect(guru2?.created_at).toBeInstanceOf(Date);
    expect(guru2?.updated_at).toBeNull();
  });

  it('should return teachers in order they were inserted', async () => {
    // Insert teachers in specific order
    await db.insert(guruTable)
      .values(testGuru1)
      .execute();

    await db.insert(guruTable)
      .values(testGuru2)
      .execute();

    const result = await getGuru();

    expect(result).toHaveLength(2);
    expect(result[0].nama_guru).toEqual('Pak Ahmad');
    expect(result[1].nama_guru).toEqual('Bu Sari');
  });

  it('should return teachers with correct field types', async () => {
    await db.insert(guruTable)
      .values(testGuru1)
      .execute();

    const result = await getGuru();

    expect(result).toHaveLength(1);
    const guru = result[0];
    
    expect(typeof guru.id).toBe('number');
    expect(typeof guru.nomor).toBe('number');
    expect(typeof guru.nama_guru).toBe('string');
    expect(typeof guru.nip).toBe('string');
    expect(guru.created_at).toBeInstanceOf(Date);
    expect(guru.updated_at).toBeNull();
  });
});
