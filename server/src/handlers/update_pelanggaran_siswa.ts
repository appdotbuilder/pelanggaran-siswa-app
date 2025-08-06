
import { db } from '../db';
import { pelanggaranSiswaTable, siswaTable, dataPelanggaranTable, guruTable } from '../db/schema';
import { type UpdatePelanggaranSiswaInput, type PelanggaranSiswa } from '../schema';
import { eq } from 'drizzle-orm';

export const updatePelanggaranSiswa = async (input: UpdatePelanggaranSiswaInput): Promise<PelanggaranSiswa> => {
  try {
    // Verify the violation record exists
    const existing = await db.select()
      .from(pelanggaranSiswaTable)
      .where(eq(pelanggaranSiswaTable.id, input.id))
      .execute();

    if (existing.length === 0) {
      throw new Error(`Student violation with id ${input.id} not found`);
    }

    // Validate foreign keys if they're being updated
    if (input.siswa_id !== undefined) {
      const siswa = await db.select()
        .from(siswaTable)
        .where(eq(siswaTable.id, input.siswa_id))
        .execute();
      
      if (siswa.length === 0) {
        throw new Error(`Student with id ${input.siswa_id} not found`);
      }
    }

    if (input.data_pelanggaran_id !== undefined) {
      const dataPelanggaran = await db.select()
        .from(dataPelanggaranTable)
        .where(eq(dataPelanggaranTable.id, input.data_pelanggaran_id))
        .execute();
      
      if (dataPelanggaran.length === 0) {
        throw new Error(`Violation data with id ${input.data_pelanggaran_id} not found`);
      }
    }

    if (input.guru_id !== undefined) {
      const guru = await db.select()
        .from(guruTable)
        .where(eq(guruTable.id, input.guru_id))
        .execute();
      
      if (guru.length === 0) {
        throw new Error(`Teacher with id ${input.guru_id} not found`);
      }
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.tanggal !== undefined) {
      updateData.tanggal = input.tanggal.toISOString().split('T')[0]; // Convert Date to YYYY-MM-DD string
    }
    if (input.siswa_id !== undefined) {
      updateData.siswa_id = input.siswa_id;
    }
    if (input.data_pelanggaran_id !== undefined) {
      updateData.data_pelanggaran_id = input.data_pelanggaran_id;
    }
    if (input.guru_id !== undefined) {
      updateData.guru_id = input.guru_id;
    }
    if (input.bukti_file !== undefined) {
      updateData.bukti_file = input.bukti_file;
    }

    // Update the violation record
    const result = await db.update(pelanggaranSiswaTable)
      .set(updateData)
      .where(eq(pelanggaranSiswaTable.id, input.id))
      .returning()
      .execute();

    // Convert tanggal string back to Date object for return
    const violation = result[0];
    return {
      ...violation,
      tanggal: new Date(violation.tanggal)
    };
  } catch (error) {
    console.error('Student violation update failed:', error);
    throw error;
  }
};
