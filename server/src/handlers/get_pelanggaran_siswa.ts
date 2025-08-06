
import { db } from '../db';
import { pelanggaranSiswaTable, siswaTable, dataPelanggaranTable, guruTable, kelasTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type PelanggaranSiswa } from '../schema';

export async function getPelanggaranSiswa(): Promise<PelanggaranSiswa[]> {
  try {
    const results = await db.select()
      .from(pelanggaranSiswaTable)
      .innerJoin(siswaTable, eq(pelanggaranSiswaTable.siswa_id, siswaTable.id))
      .innerJoin(dataPelanggaranTable, eq(pelanggaranSiswaTable.data_pelanggaran_id, dataPelanggaranTable.id))
      .innerJoin(guruTable, eq(pelanggaranSiswaTable.guru_id, guruTable.id))
      .innerJoin(kelasTable, eq(siswaTable.kelas_id, kelasTable.id))
      .execute();

    return results.map(result => ({
      id: result.pelanggaran_siswa.id,
      tanggal: new Date(result.pelanggaran_siswa.tanggal), // Convert date string to Date object
      siswa_id: result.pelanggaran_siswa.siswa_id,
      data_pelanggaran_id: result.pelanggaran_siswa.data_pelanggaran_id,
      guru_id: result.pelanggaran_siswa.guru_id,
      bukti_file: result.pelanggaran_siswa.bukti_file,
      created_at: result.pelanggaran_siswa.created_at,
      updated_at: result.pelanggaran_siswa.updated_at
    }));
  } catch (error) {
    console.error('Failed to get pelanggaran siswa:', error);
    throw error;
  }
}
