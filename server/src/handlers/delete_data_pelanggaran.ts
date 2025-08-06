
import { db } from '../db';
import { dataPelanggaranTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteDataPelanggaran(id: number): Promise<void> {
  try {
    // Delete violation type record
    await db.delete(dataPelanggaranTable)
      .where(eq(dataPelanggaranTable.id, id))
      .execute();
  } catch (error) {
    console.error('Data pelanggaran deletion failed:', error);
    throw error;
  }
}
