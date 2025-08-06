
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { kelasTable } from '../db/schema';
import { type CreateKelasInput } from '../schema';
import { createKelas } from '../handlers/create_kelas';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateKelasInput = {
  nomor: 1,
  rombel: '7',
  nama_kelas: 'VII A'
};

describe('createKelas', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a kelas', async () => {
    const result = await createKelas(testInput);

    // Basic field validation
    expect(result.nomor).toEqual(1);
    expect(result.rombel).toEqual('7');
    expect(result.nama_kelas).toEqual('VII A');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeNull();
  });

  it('should save kelas to database', async () => {
    const result = await createKelas(testInput);

    // Query using proper drizzle syntax
    const kelasRecords = await db.select()
      .from(kelasTable)
      .where(eq(kelasTable.id, result.id))
      .execute();

    expect(kelasRecords).toHaveLength(1);
    expect(kelasRecords[0].nomor).toEqual(1);
    expect(kelasRecords[0].rombel).toEqual('7');
    expect(kelasRecords[0].nama_kelas).toEqual('VII A');
    expect(kelasRecords[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple kelas with different data', async () => {
    const input1: CreateKelasInput = {
      nomor: 2,
      rombel: '8',
      nama_kelas: 'VIII B'
    };

    const input2: CreateKelasInput = {
      nomor: 3,
      rombel: '9',
      nama_kelas: 'IX C'
    };

    const result1 = await createKelas(input1);
    const result2 = await createKelas(input2);

    expect(result1.nomor).toEqual(2);
    expect(result1.rombel).toEqual('8');
    expect(result1.nama_kelas).toEqual('VIII B');

    expect(result2.nomor).toEqual(3);
    expect(result2.rombel).toEqual('9');
    expect(result2.nama_kelas).toEqual('IX C');

    // Verify both records are in database
    const allKelas = await db.select()
      .from(kelasTable)
      .execute();

    expect(allKelas).toHaveLength(2);
  });
});
