
import { db } from '../db';
import { guruTable } from '../db/schema';
import { type Guru } from '../schema';

export const getGuru = async (): Promise<Guru[]> => {
  try {
    const results = await db.select()
      .from(guruTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch teachers:', error);
    throw error;
  }
};
