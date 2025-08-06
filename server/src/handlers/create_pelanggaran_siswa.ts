
import { db } from '../db';
import { pelanggaranSiswaTable, siswaTable, dataPelanggaranTable, guruTable } from '../db/schema';
import { type CreatePelanggaranSiswaInput, type PelanggaranSiswa } from '../schema';
import { eq } from 'drizzle-orm';

export const createPelanggaranSiswa = async (input: CreatePelanggaranSiswaInput): Promise<PelanggaranSiswa> => {
  try {
    // Verify foreign key references exist to prevent constraint violations
    const siswa = await db.select()
      .from(siswaTable)
      .where(eq(siswaTable.id, input.siswa_id))
      .execute();
    
    if (siswa.length === 0) {
      throw new Error(`Student with ID ${input.siswa_id} not found`);
    }

    const dataPelanggaran = await db.select()
      .from(dataPelanggaranTable)
      .where(eq(dataPelanggaranTable.id, input.data_pelanggaran_id))
      .execute();
    
    if (dataPelanggaran.length === 0) {
      throw new Error(`Violation type with ID ${input.data_pelanggaran_id} not found`);
    }

    const guru = await db.select()
      .from(guruTable)
      .where(eq(guruTable.id, input.guru_id))
      .execute();
    
    if (guru.length === 0) {
      throw new Error(`Teacher with ID ${input.guru_id} not found`);
    }

    // Convert Date to string for the date column
    const tanggalString = input.tanggal.toISOString().split('T')[0];

    // Insert violation record
    const result = await db.insert(pelanggaranSiswaTable)
      .values({
        tanggal: tanggalString,
        siswa_id: input.siswa_id,
        data_pelanggaran_id: input.data_pelanggaran_id,
        guru_id: input.guru_id,
        bukti_file: input.bukti_file || null
      })
      .returning()
      .execute();

    // Convert string back to Date for return value
    const record = result[0];
    return {
      ...record,
      tanggal: new Date(record.tanggal)
    };
  } catch (error) {
    console.error('Student violation creation failed:', error);
    throw error;
  }
};
