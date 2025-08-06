
import { db } from '../db';
import { kelasTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteKelas(id: number): Promise<void> {
  try {
    await db.delete(kelasTable)
      .where(eq(kelasTable.id, id))
      .execute();
  } catch (error) {
    console.error('Kelas deletion failed:', error);
    throw error;
  }
}
