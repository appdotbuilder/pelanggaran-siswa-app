
import { db } from '../db';
import { kelasTable } from '../db/schema';
import { type UpdateKelasInput, type Kelas } from '../schema';
import { eq } from 'drizzle-orm';

export const updateKelas = async (input: UpdateKelasInput): Promise<Kelas> => {
  try {
    // Check if the kelas exists
    const existing = await db.select()
      .from(kelasTable)
      .where(eq(kelasTable.id, input.id))
      .execute();

    if (existing.length === 0) {
      throw new Error(`Kelas with id ${input.id} not found`);
    }

    // Prepare update data - only include fields that are provided
    const updateData: Partial<typeof kelasTable.$inferInsert> = {};
    
    if (input.nomor !== undefined) {
      updateData.nomor = input.nomor;
    }
    
    if (input.rombel !== undefined) {
      updateData.rombel = input.rombel;
    }
    
    if (input.nama_kelas !== undefined) {
      updateData.nama_kelas = input.nama_kelas;
    }

    // Set updated_at timestamp
    updateData.updated_at = new Date();

    // Update the kelas record
    const result = await db.update(kelasTable)
      .set(updateData)
      .where(eq(kelasTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Kelas update failed:', error);
    throw error;
  }
};
