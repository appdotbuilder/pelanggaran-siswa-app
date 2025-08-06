
import { db } from '../db';
import { siswaTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteSiswa(id: number): Promise<void> {
  try {
    await db.delete(siswaTable)
      .where(eq(siswaTable.id, id))
      .execute();
  } catch (error) {
    console.error('Student deletion failed:', error);
    throw error;
  }
}
