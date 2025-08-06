
import { db } from '../db';
import { pengaturanInstansiTable } from '../db/schema';
import { type PengaturanInstansi } from '../schema';

export const getPengaturanInstansi = async (): Promise<PengaturanInstansi | null> => {
  try {
    // Fetch the first (and should be only) institution settings record
    const result = await db.select()
      .from(pengaturanInstansiTable)
      .limit(1)
      .execute();

    // Return null if no record exists, otherwise return the first record
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Failed to fetch institution settings:', error);
    throw error;
  }
};
