
import { db } from '../db';
import { siswaTable, kelasTable } from '../db/schema';
import { type CreateSiswaInput, type Siswa } from '../schema';
import { eq } from 'drizzle-orm';

export const createSiswa = async (input: CreateSiswaInput): Promise<Siswa> => {
  try {
    // Verify that the referenced kelas exists
    const existingKelas = await db.select()
      .from(kelasTable)
      .where(eq(kelasTable.id, input.kelas_id))
      .execute();

    if (existingKelas.length === 0) {
      throw new Error(`Kelas with ID ${input.kelas_id} does not exist`);
    }

    // Insert siswa record
    const result = await db.insert(siswaTable)
      .values({
        nomor: input.nomor,
        nama_siswa: input.nama_siswa,
        nisn: input.nisn,
        kelas_id: input.kelas_id
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Siswa creation failed:', error);
    throw error;
  }
};
