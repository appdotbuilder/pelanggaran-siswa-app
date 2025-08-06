
import { db } from '../db';
import { siswaTable } from '../db/schema';
import { type Siswa } from '../schema';

export const getSiswa = async (): Promise<Siswa[]> => {
  try {
    const results = await db.select()
      .from(siswaTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch students:', error);
    throw error;
  }
};
