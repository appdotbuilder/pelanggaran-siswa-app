
import { db } from '../db';
import { guruTable } from '../db/schema';
import { type UpdateGuruInput, type Guru } from '../schema';
import { eq } from 'drizzle-orm';

export const updateGuru = async (input: UpdateGuruInput): Promise<Guru> => {
  try {
    // Check if guru exists first
    const existingGuru = await db.select()
      .from(guruTable)
      .where(eq(guruTable.id, input.id))
      .execute();

    if (existingGuru.length === 0) {
      throw new Error(`Guru with id ${input.id} not found`);
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.nomor !== undefined) {
      updateData.nomor = input.nomor;
    }
    if (input.nama_guru !== undefined) {
      updateData.nama_guru = input.nama_guru;
    }
    if (input.nip !== undefined) {
      updateData.nip = input.nip;
    }

    // Update guru record
    const result = await db.update(guruTable)
      .set(updateData)
      .where(eq(guruTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Guru update failed:', error);
    throw error;
  }
};
