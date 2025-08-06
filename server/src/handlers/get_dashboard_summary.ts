
import { db } from '../db';
import { pelanggaranSiswaTable, dataPelanggaranTable, siswaTable, kelasTable } from '../db/schema';
import { type DashboardFilter, type RangkumanPelanggaran, type PelanggaranPerKelas } from '../schema';
import { eq, and, gte, lte, count, sum, type SQL } from 'drizzle-orm';

export async function getDashboardSummary(filter: DashboardFilter): Promise<{
    rangkumanPelanggaran: RangkumanPelanggaran[];
    pelanggaranPerKelas: PelanggaranPerKelas[];
}> {
    try {
        // Build base conditions for filtering
        const baseConditions: SQL<unknown>[] = [];

        if (filter.tanggal_awal) {
            const dateString = filter.tanggal_awal.toISOString().split('T')[0];
            baseConditions.push(gte(pelanggaranSiswaTable.tanggal, dateString));
        }

        if (filter.tanggal_akhir) {
            const dateString = filter.tanggal_akhir.toISOString().split('T')[0];
            baseConditions.push(lte(pelanggaranSiswaTable.tanggal, dateString));
        }

        if (filter.guru_id) {
            baseConditions.push(eq(pelanggaranSiswaTable.guru_id, filter.guru_id));
        }

        if (filter.kategori) {
            baseConditions.push(eq(dataPelanggaranTable.kategori, filter.kategori));
        }

        // Query for rangkuman pelanggaran (violations by category)
        let rangkumanResults;

        if (filter.kelas_id) {
            // Include siswa join for kelas filter
            const rangkumanConditions = [...baseConditions, eq(siswaTable.kelas_id, filter.kelas_id)];
            
            if (rangkumanConditions.length > 0) {
                rangkumanResults = await db.select({
                    kategori: dataPelanggaranTable.kategori,
                    total_pelanggaran: count(pelanggaranSiswaTable.id),
                    total_poin: sum(dataPelanggaranTable.poin)
                })
                .from(pelanggaranSiswaTable)
                .innerJoin(dataPelanggaranTable, eq(pelanggaranSiswaTable.data_pelanggaran_id, dataPelanggaranTable.id))
                .innerJoin(siswaTable, eq(pelanggaranSiswaTable.siswa_id, siswaTable.id))
                .where(rangkumanConditions.length === 1 ? rangkumanConditions[0] : and(...rangkumanConditions))
                .groupBy(dataPelanggaranTable.kategori)
                .execute();
            } else {
                rangkumanResults = await db.select({
                    kategori: dataPelanggaranTable.kategori,
                    total_pelanggaran: count(pelanggaranSiswaTable.id),
                    total_poin: sum(dataPelanggaranTable.poin)
                })
                .from(pelanggaranSiswaTable)
                .innerJoin(dataPelanggaranTable, eq(pelanggaranSiswaTable.data_pelanggaran_id, dataPelanggaranTable.id))
                .innerJoin(siswaTable, eq(pelanggaranSiswaTable.siswa_id, siswaTable.id))
                .groupBy(dataPelanggaranTable.kategori)
                .execute();
            }
        } else {
            // No kelas filter - simpler query
            if (baseConditions.length > 0) {
                rangkumanResults = await db.select({
                    kategori: dataPelanggaranTable.kategori,
                    total_pelanggaran: count(pelanggaranSiswaTable.id),
                    total_poin: sum(dataPelanggaranTable.poin)
                })
                .from(pelanggaranSiswaTable)
                .innerJoin(dataPelanggaranTable, eq(pelanggaranSiswaTable.data_pelanggaran_id, dataPelanggaranTable.id))
                .where(baseConditions.length === 1 ? baseConditions[0] : and(...baseConditions))
                .groupBy(dataPelanggaranTable.kategori)
                .execute();
            } else {
                rangkumanResults = await db.select({
                    kategori: dataPelanggaranTable.kategori,
                    total_pelanggaran: count(pelanggaranSiswaTable.id),
                    total_poin: sum(dataPelanggaranTable.poin)
                })
                .from(pelanggaranSiswaTable)
                .innerJoin(dataPelanggaranTable, eq(pelanggaranSiswaTable.data_pelanggaran_id, dataPelanggaranTable.id))
                .groupBy(dataPelanggaranTable.kategori)
                .execute();
            }
        }

        // Query for pelanggaran per kelas
        const kelasConditions: SQL<unknown>[] = [...baseConditions];

        if (filter.kelas_id) {
            kelasConditions.push(eq(kelasTable.id, filter.kelas_id));
        }

        let kelasResults;

        if (kelasConditions.length > 0) {
            kelasResults = await db.select({
                kelas_id: kelasTable.id,
                nama_kelas: kelasTable.nama_kelas,
                rombel: kelasTable.rombel,
                total_pelanggaran: count(pelanggaranSiswaTable.id),
                total_poin: sum(dataPelanggaranTable.poin)
            })
            .from(pelanggaranSiswaTable)
            .innerJoin(siswaTable, eq(pelanggaranSiswaTable.siswa_id, siswaTable.id))
            .innerJoin(kelasTable, eq(siswaTable.kelas_id, kelasTable.id))
            .innerJoin(dataPelanggaranTable, eq(pelanggaranSiswaTable.data_pelanggaran_id, dataPelanggaranTable.id))
            .where(kelasConditions.length === 1 ? kelasConditions[0] : and(...kelasConditions))
            .groupBy(kelasTable.id, kelasTable.nama_kelas, kelasTable.rombel)
            .execute();
        } else {
            kelasResults = await db.select({
                kelas_id: kelasTable.id,
                nama_kelas: kelasTable.nama_kelas,
                rombel: kelasTable.rombel,
                total_pelanggaran: count(pelanggaranSiswaTable.id),
                total_poin: sum(dataPelanggaranTable.poin)
            })
            .from(pelanggaranSiswaTable)
            .innerJoin(siswaTable, eq(pelanggaranSiswaTable.siswa_id, siswaTable.id))
            .innerJoin(kelasTable, eq(siswaTable.kelas_id, kelasTable.id))
            .innerJoin(dataPelanggaranTable, eq(pelanggaranSiswaTable.data_pelanggaran_id, dataPelanggaranTable.id))
            .groupBy(kelasTable.id, kelasTable.nama_kelas, kelasTable.rombel)
            .execute();
        }

        // Transform results and handle numeric conversions
        const rangkumanPelanggaran: RangkumanPelanggaran[] = rangkumanResults.map(result => ({
            kategori: result.kategori,
            total_pelanggaran: result.total_pelanggaran || 0,
            total_poin: result.total_poin ? parseInt(result.total_poin.toString()) : 0
        }));

        const pelanggaranPerKelas: PelanggaranPerKelas[] = kelasResults.map(result => ({
            kelas_id: result.kelas_id,
            nama_kelas: result.nama_kelas,
            rombel: result.rombel,
            total_pelanggaran: result.total_pelanggaran || 0,
            total_poin: result.total_poin ? parseInt(result.total_poin.toString()) : 0
        }));

        return {
            rangkumanPelanggaran,
            pelanggaranPerKelas
        };
    } catch (error) {
        console.error('Dashboard summary retrieval failed:', error);
        throw error;
    }
}
