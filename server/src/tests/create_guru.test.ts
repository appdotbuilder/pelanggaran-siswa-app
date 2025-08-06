
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { guruTable } from '../db/schema';
import { type CreateGuruInput } from '../schema';
import { createGuru } from '../handlers/create_guru';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateGuruInput = {
  nomor: 1,
  nama_guru: 'Budi Santoso',
  nip: '123456789012345678'
};

describe('createGuru', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a guru', async () => {
    const result = await createGuru(testInput);

    // Basic field validation
    expect(result.nomor).toEqual(1);
    expect(result.nama_guru).toEqual('Budi Santoso');
    expect(result.nip).toEqual('123456789012345678');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeNull();
  });

  it('should save guru to database', async () => {
    const result = await createGuru(testInput);

    // Query using proper drizzle syntax
    const gurus = await db.select()
      .from(guruTable)
      .where(eq(guruTable.id, result.id))
      .execute();

    expect(gurus).toHaveLength(1);
    expect(gurus[0].nomor).toEqual(1);
    expect(gurus[0].nama_guru).toEqual('Budi Santoso');
    expect(gurus[0].nip).toEqual('123456789012345678');
    expect(gurus[0].created_at).toBeInstanceOf(Date);
    expect(gurus[0].updated_at).toBeNull();
  });

  it('should create multiple gurus with different data', async () => {
    const firstGuru = await createGuru(testInput);
    
    const secondInput: CreateGuruInput = {
      nomor: 2,
      nama_guru: 'Siti Nurjannah',
      nip: '987654321098765432'
    };
    
    const secondGuru = await createGuru(secondInput);

    expect(firstGuru.id).not.toEqual(secondGuru.id);
    expect(firstGuru.nama_guru).toEqual('Budi Santoso');
    expect(secondGuru.nama_guru).toEqual('Siti Nurjannah');
    expect(firstGuru.nip).toEqual('123456789012345678');
    expect(secondGuru.nip).toEqual('987654321098765432');

    // Verify both exist in database
    const allGurus = await db.select()
      .from(guruTable)
      .execute();

    expect(allGurus).toHaveLength(2);
  });
});
