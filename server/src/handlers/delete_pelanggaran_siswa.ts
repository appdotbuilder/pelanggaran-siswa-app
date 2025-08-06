
import { db } from '../db';
import { pelanggaranSiswaTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deletePelanggaranSiswa(id: number): Promise<void> {
  try {
    await db.delete(pelanggaranSiswaTable)
      .where(eq(pelanggaranSiswaTable.id, id))
      .execute();
  } catch (error) {
    console.error('Failed to delete pelanggaran siswa:', error);
    throw error;
  }
}
