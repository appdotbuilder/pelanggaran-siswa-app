
import { db } from '../db';
import { kelasTable } from '../db/schema';
import { type CreateKelasInput, type Kelas } from '../schema';

export const createKelas = async (input: CreateKelasInput): Promise<Kelas> => {
  try {
    // Insert kelas record
    const result = await db.insert(kelasTable)
      .values({
        nomor: input.nomor,
        rombel: input.rombel,
        nama_kelas: input.nama_kelas
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Kelas creation failed:', error);
    throw error;
  }
};
