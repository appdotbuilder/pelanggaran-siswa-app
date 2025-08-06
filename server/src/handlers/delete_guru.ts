
import { db } from '../db';
import { guruTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteGuru = async (id: number): Promise<void> => {
  try {
    await db.delete(guruTable)
      .where(eq(guruTable.id, id))
      .execute();
  } catch (error) {
    console.error('Guru deletion failed:', error);
    throw error;
  }
};
