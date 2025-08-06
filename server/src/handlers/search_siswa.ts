
import { db } from '../db';
import { siswaTable, kelasTable } from '../db/schema';
import { type Siswa } from '../schema';
import { or, ilike, eq } from 'drizzle-orm';

export async function searchSiswa(query: string): Promise<Siswa[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = `%${query.trim()}%`;

    // Search students by name or NISN with class information
    const results = await db.select({
      id: siswaTable.id,
      nomor: siswaTable.nomor,
      nama_siswa: siswaTable.nama_siswa,
      nisn: siswaTable.nisn,
      kelas_id: siswaTable.kelas_id,
      created_at: siswaTable.created_at,
      updated_at: siswaTable.updated_at
    })
    .from(siswaTable)
    .innerJoin(kelasTable, eq(siswaTable.kelas_id, kelasTable.id))
    .where(
      or(
        ilike(siswaTable.nama_siswa, searchTerm),
        ilike(siswaTable.nisn, searchTerm)
      )
    )
    .orderBy(siswaTable.nama_siswa)
    .execute();

    return results;
  } catch (error) {
    console.error('Student search failed:', error);
    throw error;
  }
}
