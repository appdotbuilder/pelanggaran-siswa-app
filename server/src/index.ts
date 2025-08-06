
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
    createUserInputSchema,
    updateUserInputSchema,
    createKelasInputSchema,
    updateKelasInputSchema,
    createGuruInputSchema,
    updateGuruInputSchema,
    createSiswaInputSchema,
    updateSiswaInputSchema,
    createDataPelanggaranInputSchema,
    updateDataPelanggaranInputSchema,
    createPelanggaranSiswaInputSchema,
    updatePelanggaranSiswaInputSchema,
    updatePengaturanInstansiInputSchema,
    dashboardFilterSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { getUsers } from './handlers/get_users';
import { updateUser } from './handlers/update_user';
import { deleteUser } from './handlers/delete_user';
import { createKelas } from './handlers/create_kelas';
import { getKelas } from './handlers/get_kelas';
import { updateKelas } from './handlers/update_kelas';
import { deleteKelas } from './handlers/delete_kelas';
import { createGuru } from './handlers/create_guru';
import { getGuru } from './handlers/get_guru';
import { updateGuru } from './handlers/update_guru';
import { deleteGuru } from './handlers/delete_guru';
import { createSiswa } from './handlers/create_siswa';
import { getSiswa } from './handlers/get_siswa';
import { updateSiswa } from './handlers/update_siswa';
import { deleteSiswa } from './handlers/delete_siswa';
import { createDataPelanggaran } from './handlers/create_data_pelanggaran';
import { getDataPelanggaran } from './handlers/get_data_pelanggaran';
import { updateDataPelanggaran } from './handlers/update_data_pelanggaran';
import { deleteDataPelanggaran } from './handlers/delete_data_pelanggaran';
import { createPelanggaranSiswa } from './handlers/create_pelanggaran_siswa';
import { getPelanggaranSiswa } from './handlers/get_pelanggaran_siswa';
import { updatePelanggaranSiswa } from './handlers/update_pelanggaran_siswa';
import { deletePelanggaranSiswa } from './handlers/delete_pelanggaran_siswa';
import { getPengaturanInstansi } from './handlers/get_pengaturan_instansi';
import { updatePengaturanInstansi } from './handlers/update_pengaturan_instansi';
import { getDashboardSummary } from './handlers/get_dashboard_summary';
import { searchSiswa } from './handlers/search_siswa';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User management
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),
  getUsers: publicProcedure
    .query(() => getUsers()),
  updateUser: publicProcedure
    .input(updateUserInputSchema)
    .mutation(({ input }) => updateUser(input)),
  deleteUser: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteUser(input.id)),

  // Class management
  createKelas: publicProcedure
    .input(createKelasInputSchema)
    .mutation(({ input }) => createKelas(input)),
  getKelas: publicProcedure
    .query(() => getKelas()),
  updateKelas: publicProcedure
    .input(updateKelasInputSchema)
    .mutation(({ input }) => updateKelas(input)),
  deleteKelas: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteKelas(input.id)),

  // Teacher management
  createGuru: publicProcedure
    .input(createGuruInputSchema)
    .mutation(({ input }) => createGuru(input)),
  getGuru: publicProcedure
    .query(() => getGuru()),
  updateGuru: publicProcedure
    .input(updateGuruInputSchema)
    .mutation(({ input }) => updateGuru(input)),
  deleteGuru: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteGuru(input.id)),

  // Student management
  createSiswa: publicProcedure
    .input(createSiswaInputSchema)
    .mutation(({ input }) => createSiswa(input)),
  getSiswa: publicProcedure
    .query(() => getSiswa()),
  updateSiswa: publicProcedure
    .input(updateSiswaInputSchema)
    .mutation(({ input }) => updateSiswa(input)),
  deleteSiswa: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteSiswa(input.id)),
  searchSiswa: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input }) => searchSiswa(input.query)),

  // Violation type management
  createDataPelanggaran: publicProcedure
    .input(createDataPelanggaranInputSchema)
    .mutation(({ input }) => createDataPelanggaran(input)),
  getDataPelanggaran: publicProcedure
    .query(() => getDataPelanggaran()),
  updateDataPelanggaran: publicProcedure
    .input(updateDataPelanggaranInputSchema)
    .mutation(({ input }) => updateDataPelanggaran(input)),
  deleteDataPelanggaran: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteDataPelanggaran(input.id)),

  // Student violation management
  createPelanggaranSiswa: publicProcedure
    .input(createPelanggaranSiswaInputSchema)
    .mutation(({ input }) => createPelanggaranSiswa(input)),
  getPelanggaranSiswa: publicProcedure
    .query(() => getPelanggaranSiswa()),
  updatePelanggaranSiswa: publicProcedure
    .input(updatePelanggaranSiswaInputSchema)
    .mutation(({ input }) => updatePelanggaranSiswa(input)),
  deletePelanggaranSiswa: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deletePelanggaranSiswa(input.id)),

  // Institution settings
  getPengaturanInstansi: publicProcedure
    .query(() => getPengaturanInstansi()),
  updatePengaturanInstansi: publicProcedure
    .input(updatePengaturanInstansiInputSchema)
    .mutation(({ input }) => updatePengaturanInstansi(input)),

  // Dashboard
  getDashboardSummary: publicProcedure
    .input(dashboardFilterSchema)
    .query(({ input }) => getDashboardSummary(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
