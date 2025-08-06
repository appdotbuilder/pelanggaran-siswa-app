
import { db } from '../db';
import { kelasTable } from '../db/schema';
import { type Kelas } from '../schema';

export const getKelas = async (): Promise<Kelas[]> => {
  try {
    const results = await db.select()
      .from(kelasTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get kelas:', error);
    throw error;
  }
};
