
import { db } from '../db';
import { dataPelanggaranTable } from '../db/schema';
import { type DataPelanggaran } from '../schema';

export const getDataPelanggaran = async (): Promise<DataPelanggaran[]> => {
  try {
    // Fetch all violation types from database
    const results = await db.select()
      .from(dataPelanggaranTable)
      .execute();

    // Return results - no numeric conversion needed as poin is integer
    return results;
  } catch (error) {
    console.error('Failed to fetch data pelanggaran:', error);
    throw error;
  }
};
