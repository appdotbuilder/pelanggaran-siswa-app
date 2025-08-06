
import { z } from 'zod';

// User schemas
export const userRoleEnum = z.enum(['administrator', 'guru']);
export type UserRole = z.infer<typeof userRoleEnum>;

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  password_hash: z.string(),
  nama: z.string(),
  role: userRoleEnum,
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable()
});

export type User = z.infer<typeof userSchema>;

export const createUserInputSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  nama: z.string(),
  role: userRoleEnum,
  is_active: z.boolean().default(true)
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const updateUserInputSchema = z.object({
  id: z.number(),
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
  nama: z.string().optional(),
  role: userRoleEnum.optional(),
  is_active: z.boolean().optional()
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

// Class schemas
export const rombelEnum = z.enum(['7', '8', '9']);
export type Rombel = z.infer<typeof rombelEnum>;

export const kelasSchema = z.object({
  id: z.number(),
  nomor: z.number(),
  rombel: rombelEnum,
  nama_kelas: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable()
});

export type Kelas = z.infer<typeof kelasSchema>;

export const createKelasInputSchema = z.object({
  nomor: z.number().int().positive(),
  rombel: rombelEnum,
  nama_kelas: z.string()
});

export type CreateKelasInput = z.infer<typeof createKelasInputSchema>;

export const updateKelasInputSchema = z.object({
  id: z.number(),
  nomor: z.number().int().positive().optional(),
  rombel: rombelEnum.optional(),
  nama_kelas: z.string().optional()
});

export type UpdateKelasInput = z.infer<typeof updateKelasInputSchema>;

// Teacher schemas
export const guruSchema = z.object({
  id: z.number(),
  nomor: z.number(),
  nama_guru: z.string(),
  nip: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable()
});

export type Guru = z.infer<typeof guruSchema>;

export const createGuruInputSchema = z.object({
  nomor: z.number().int().positive(),
  nama_guru: z.string(),
  nip: z.string()
});

export type CreateGuruInput = z.infer<typeof createGuruInputSchema>;

export const updateGuruInputSchema = z.object({
  id: z.number(),
  nomor: z.number().int().positive().optional(),
  nama_guru: z.string().optional(),
  nip: z.string().optional()
});

export type UpdateGuruInput = z.infer<typeof updateGuruInputSchema>;

// Student schemas
export const siswaSchema = z.object({
  id: z.number(),
  nomor: z.number(),
  nama_siswa: z.string(),
  nisn: z.string(),
  kelas_id: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable()
});

export type Siswa = z.infer<typeof siswaSchema>;

export const createSiswaInputSchema = z.object({
  nomor: z.number().int().positive(),
  nama_siswa: z.string(),
  nisn: z.string(),
  kelas_id: z.number()
});

export type CreateSiswaInput = z.infer<typeof createSiswaInputSchema>;

export const updateSiswaInputSchema = z.object({
  id: z.number(),
  nomor: z.number().int().positive().optional(),
  nama_siswa: z.string().optional(),
  nisn: z.string().optional(),
  kelas_id: z.number().optional()
});

export type UpdateSiswaInput = z.infer<typeof updateSiswaInputSchema>;

// Violation category schemas
export const kategoriPelanggaranEnum = z.enum(['Kelakuan', 'Kerajinan & Pembiasaan', 'Kerapian']);
export type KategoriPelanggaran = z.infer<typeof kategoriPelanggaranEnum>;

export const dataPelanggaranSchema = z.object({
  id: z.number(),
  kategori: kategoriPelanggaranEnum,
  jenis_pelanggaran: z.string(),
  poin: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable()
});

export type DataPelanggaran = z.infer<typeof dataPelanggaranSchema>;

export const createDataPelanggaranInputSchema = z.object({
  kategori: kategoriPelanggaranEnum,
  jenis_pelanggaran: z.string(),
  poin: z.number().int().positive()
});

export type CreateDataPelanggaranInput = z.infer<typeof createDataPelanggaranInputSchema>;

export const updateDataPelanggaranInputSchema = z.object({
  id: z.number(),
  kategori: kategoriPelanggaranEnum.optional(),
  jenis_pelanggaran: z.string().optional(),
  poin: z.number().int().positive().optional()
});

export type UpdateDataPelanggaranInput = z.infer<typeof updateDataPelanggaranInputSchema>;

// Violation record schemas
export const pelanggaranSiswaSchema = z.object({
  id: z.number(),
  tanggal: z.coerce.date(),
  siswa_id: z.number(),
  data_pelanggaran_id: z.number(),
  guru_id: z.number(),
  bukti_file: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable()
});

export type PelanggaranSiswa = z.infer<typeof pelanggaranSiswaSchema>;

export const createPelanggaranSiswaInputSchema = z.object({
  tanggal: z.coerce.date(),
  siswa_id: z.number(),
  data_pelanggaran_id: z.number(),
  guru_id: z.number(),
  bukti_file: z.string().nullable().optional()
});

export type CreatePelanggaranSiswaInput = z.infer<typeof createPelanggaranSiswaInputSchema>;

export const updatePelanggaranSiswaInputSchema = z.object({
  id: z.number(),
  tanggal: z.coerce.date().optional(),
  siswa_id: z.number().optional(),
  data_pelanggaran_id: z.number().optional(),
  guru_id: z.number().optional(),
  bukti_file: z.string().nullable().optional()
});

export type UpdatePelanggaranSiswaInput = z.infer<typeof updatePelanggaranSiswaInputSchema>;

// Institution settings schema
export const pengaturanInstansiSchema = z.object({
  id: z.number(),
  nama_instansi: z.string(),
  alamat: z.string(),
  nama_kepala_sekolah: z.string(),
  website: z.string().nullable(),
  email: z.string().email().nullable(),
  logo_sekolah: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable()
});

export type PengaturanInstansi = z.infer<typeof pengaturanInstansiSchema>;

export const updatePengaturanInstansiInputSchema = z.object({
  nama_instansi: z.string().optional(),
  alamat: z.string().optional(),
  nama_kepala_sekolah: z.string().optional(),
  website: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  logo_sekolah: z.string().nullable().optional()
});

export type UpdatePengaturanInstansiInput = z.infer<typeof updatePengaturanInstansiInputSchema>;

// Dashboard filter schema
export const dashboardFilterSchema = z.object({
  tanggal_awal: z.coerce.date().optional(),
  tanggal_akhir: z.coerce.date().optional(),
  kelas_id: z.number().optional(),
  guru_id: z.number().optional(),
  kategori: kategoriPelanggaranEnum.optional()
});

export type DashboardFilter = z.infer<typeof dashboardFilterSchema>;

// Dashboard summary schemas
export const rangkumanPelanggaranSchema = z.object({
  kategori: kategoriPelanggaranEnum,
  total_pelanggaran: z.number().int(),
  total_poin: z.number().int()
});

export type RangkumanPelanggaran = z.infer<typeof rangkumanPelanggaranSchema>;

export const pelanggaranPerKelasSchema = z.object({
  kelas_id: z.number(),
  nama_kelas: z.string(),
  rombel: rombelEnum,
  total_pelanggaran: z.number().int(),
  total_poin: z.number().int()
});

export type PelanggaranPerKelas = z.infer<typeof pelanggaranPerKelasSchema>;
