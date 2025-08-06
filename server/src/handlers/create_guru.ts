
import { db } from '../db';
import { guruTable } from '../db/schema';
import { type CreateGuruInput, type Guru } from '../schema';

export const createGuru = async (input: CreateGuruInput): Promise<Guru> => {
  try {
    // Insert guru record
    const result = await db.insert(guruTable)
      .values({
        nomor: input.nomor,
        nama_guru: input.nama_guru,
        nip: input.nip
      })
      .returning()
      .execute();

    const guru = result[0];
    return guru;
  } catch (error) {
    console.error('Guru creation failed:', error);
    throw error;
  }
};
