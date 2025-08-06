
import { db } from '../db';
import { dataPelanggaranTable } from '../db/schema';
import { type UpdateDataPelanggaranInput, type DataPelanggaran } from '../schema';
import { eq } from 'drizzle-orm';

export const updateDataPelanggaran = async (input: UpdateDataPelanggaranInput): Promise<DataPelanggaran> => {
  try {
    // Check if the record exists first
    const existing = await db.select()
      .from(dataPelanggaranTable)
      .where(eq(dataPelanggaranTable.id, input.id))
      .execute();

    if (existing.length === 0) {
      throw new Error('Data pelanggaran not found');
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.kategori !== undefined) {
      updateData.kategori = input.kategori;
    }

    if (input.jenis_pelanggaran !== undefined) {
      updateData.jenis_pelanggaran = input.jenis_pelanggaran;
    }

    if (input.poin !== undefined) {
      updateData.poin = input.poin;
    }

    // Update the record
    const result = await db.update(dataPelanggaranTable)
      .set(updateData)
      .where(eq(dataPelanggaranTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Data pelanggaran update failed:', error);
    throw error;
  }
};
