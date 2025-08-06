
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dataPelanggaranTable } from '../db/schema';
import { type CreateDataPelanggaranInput } from '../schema';
import { createDataPelanggaran } from '../handlers/create_data_pelanggaran';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateDataPelanggaranInput = {
  kategori: 'Kelakuan',
  jenis_pelanggaran: 'Tidak mengikuti upacara bendera',
  poin: 10
};

describe('createDataPelanggaran', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a data pelanggaran', async () => {
    const result = await createDataPelanggaran(testInput);

    // Basic field validation
    expect(result.kategori).toEqual('Kelakuan');
    expect(result.jenis_pelanggaran).toEqual('Tidak mengikuti upacara bendera');
    expect(result.poin).toEqual(10);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeNull();
  });

  it('should save data pelanggaran to database', async () => {
    const result = await createDataPelanggaran(testInput);

    // Query using proper drizzle syntax
    const dataPelanggaran = await db.select()
      .from(dataPelanggaranTable)
      .where(eq(dataPelanggaranTable.id, result.id))
      .execute();

    expect(dataPelanggaran).toHaveLength(1);
    expect(dataPelanggaran[0].kategori).toEqual('Kelakuan');
    expect(dataPelanggaran[0].jenis_pelanggaran).toEqual('Tidak mengikuti upacara bendera');
    expect(dataPelanggaran[0].poin).toEqual(10);
    expect(dataPelanggaran[0].created_at).toBeInstanceOf(Date);
    expect(dataPelanggaran[0].updated_at).toBeNull();
  });

  it('should create data pelanggaran with different categories', async () => {
    const kerajinianInput: CreateDataPelanggaranInput = {
      kategori: 'Kerajinan & Pembiasaan',
      jenis_pelanggaran: 'Terlambat masuk sekolah',
      poin: 5
    };

    const result = await createDataPelanggaran(kerajinianInput);

    expect(result.kategori).toEqual('Kerajinan & Pembiasaan');
    expect(result.jenis_pelanggaran).toEqual('Terlambat masuk sekolah');
    expect(result.poin).toEqual(5);
  });

  it('should create data pelanggaran with kerapian category', async () => {
    const kerapianInput: CreateDataPelanggaranInput = {
      kategori: 'Kerapian',
      jenis_pelanggaran: 'Seragam tidak rapi',
      poin: 3
    };

    const result = await createDataPelanggaran(kerapianInput);

    expect(result.kategori).toEqual('Kerapian');
    expect(result.jenis_pelanggaran).toEqual('Seragam tidak rapi');
    expect(result.poin).toEqual(3);
  });
});
