
import { db } from '../db';
import { dataPelanggaranTable } from '../db/schema';
import { type CreateDataPelanggaranInput, type DataPelanggaran } from '../schema';

export const createDataPelanggaran = async (input: CreateDataPelanggaranInput): Promise<DataPelanggaran> => {
  try {
    // Insert data pelanggaran record
    const result = await db.insert(dataPelanggaranTable)
      .values({
        kategori: input.kategori,
        jenis_pelanggaran: input.jenis_pelanggaran,
        poin: input.poin
      })
      .returning()
      .execute();

    const dataPelanggaran = result[0];
    return dataPelanggaran;
  } catch (error) {
    console.error('Data pelanggaran creation failed:', error);
    throw error;
  }
};
