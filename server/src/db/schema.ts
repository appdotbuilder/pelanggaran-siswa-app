
import { serial, text, pgTable, timestamp, integer, boolean, pgEnum, date, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['administrator', 'guru']);
export const rombelEnum = pgEnum('rombel', ['7', '8', '9']);
export const kategoriPelanggaranEnum = pgEnum('kategori_pelanggaran', ['Kelakuan', 'Kerajinan & Pembiasaan', 'Kerapian']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
  nama: text('nama').notNull(),
  role: userRoleEnum('role').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
});

// Classes table
export const kelasTable = pgTable('kelas', {
  id: serial('id').primaryKey(),
  nomor: integer('nomor').notNull(),
  rombel: rombelEnum('rombel').notNull(),
  nama_kelas: text('nama_kelas').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
});

// Teachers table
export const guruTable = pgTable('guru', {
  id: serial('id').primaryKey(),
  nomor: integer('nomor').notNull(),
  nama_guru: text('nama_guru').notNull(),
  nip: varchar('nip', { length: 20 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
});

// Students table
export const siswaTable = pgTable('siswa', {
  id: serial('id').primaryKey(),
  nomor: integer('nomor').notNull(),
  nama_siswa: text('nama_siswa').notNull(),
  nisn: varchar('nisn', { length: 20 }).notNull(),
  kelas_id: integer('kelas_id').notNull().references(() => kelasTable.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
});

// Violation types table
export const dataPelanggaranTable = pgTable('data_pelanggaran', {
  id: serial('id').primaryKey(),
  kategori: kategoriPelanggaranEnum('kategori').notNull(),
  jenis_pelanggaran: text('jenis_pelanggaran').notNull(),
  poin: integer('poin').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
});

// Student violations table
export const pelanggaranSiswaTable = pgTable('pelanggaran_siswa', {
  id: serial('id').primaryKey(),
  tanggal: date('tanggal').notNull(),
  siswa_id: integer('siswa_id').notNull().references(() => siswaTable.id, { onDelete: 'cascade' }),
  data_pelanggaran_id: integer('data_pelanggaran_id').notNull().references(() => dataPelanggaranTable.id, { onDelete: 'cascade' }),
  guru_id: integer('guru_id').notNull().references(() => guruTable.id, { onDelete: 'cascade' }),
  bukti_file: text('bukti_file'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
});

// Institution settings table
export const pengaturanInstansiTable = pgTable('pengaturan_instansi', {
  id: serial('id').primaryKey(),
  nama_instansi: text('nama_instansi').notNull(),
  alamat: text('alamat').notNull(),
  nama_kepala_sekolah: text('nama_kepala_sekolah').notNull(),
  website: text('website'),
  email: text('email'),
  logo_sekolah: text('logo_sekolah'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  pelanggaranSiswa: many(pelanggaranSiswaTable)
}));

export const kelasRelations = relations(kelasTable, ({ many }) => ({
  siswa: many(siswaTable)
}));

export const guruRelations = relations(guruTable, ({ many }) => ({
  pelanggaranSiswa: many(pelanggaranSiswaTable)
}));

export const siswaRelations = relations(siswaTable, ({ one, many }) => ({
  kelas: one(kelasTable, {
    fields: [siswaTable.kelas_id],
    references: [kelasTable.id]
  }),
  pelanggaranSiswa: many(pelanggaranSiswaTable)
}));

export const dataPelanggaranRelations = relations(dataPelanggaranTable, ({ many }) => ({
  pelanggaranSiswa: many(pelanggaranSiswaTable)
}));

export const pelanggaranSiswaRelations = relations(pelanggaranSiswaTable, ({ one }) => ({
  siswa: one(siswaTable, {
    fields: [pelanggaranSiswaTable.siswa_id],
    references: [siswaTable.id]
  }),
  dataPelanggaran: one(dataPelanggaranTable, {
    fields: [pelanggaranSiswaTable.data_pelanggaran_id],
    references: [dataPelanggaranTable.id]
  }),
  guru: one(guruTable, {
    fields: [pelanggaranSiswaTable.guru_id],
    references: [guruTable.id]
  })
}));

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  kelas: kelasTable,
  guru: guruTable,
  siswa: siswaTable,
  dataPelanggaran: dataPelanggaranTable,
  pelanggaranSiswa: pelanggaranSiswaTable,
  pengaturanInstansi: pengaturanInstansiTable
};
