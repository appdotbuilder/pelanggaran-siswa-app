
import { db } from '../db';
import { siswaTable, kelasTable } from '../db/schema';
import { type UpdateSiswaInput, type Siswa } from '../schema';
import { eq } from 'drizzle-orm';

export const updateSiswa = async (input: UpdateSiswaInput): Promise<Siswa> => {
  try {
    // Check if siswa exists
    const existingSiswa = await db.select()
      .from(siswaTable)
      .where(eq(siswaTable.id, input.id))
      .execute();

    if (existingSiswa.length === 0) {
      throw new Error('Siswa not found');
    }

    // Check if kelas exists if kelas_id is being updated
    if (input.kelas_id !== undefined) {
      const existingKelas = await db.select()
        .from(kelasTable)
        .where(eq(kelasTable.id, input.kelas_id))
        .execute();

      if (existingKelas.length === 0) {
        throw new Error('Kelas not found');
      }
    }

    // Update siswa record
    const result = await db.update(siswaTable)
      .set({
        ...(input.nomor !== undefined && { nomor: input.nomor }),
        ...(input.nama_siswa !== undefined && { nama_siswa: input.nama_siswa }),
        ...(input.nisn !== undefined && { nisn: input.nisn }),
        ...(input.kelas_id !== undefined && { kelas_id: input.kelas_id }),
        updated_at: new Date()
      })
      .where(eq(siswaTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Siswa update failed:', error);
    throw error;
  }
};
