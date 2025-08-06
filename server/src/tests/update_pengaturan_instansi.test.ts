
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pengaturanInstansiTable } from '../db/schema';
import { type UpdatePengaturanInstansiInput } from '../schema';
import { updatePengaturanInstansi } from '../handlers/update_pengaturan_instansi';
import { eq } from 'drizzle-orm';

const testInput: UpdatePengaturanInstansiInput = {
  nama_instansi: 'SMP Negeri 1 Jakarta',
  alamat: 'Jl. Merdeka No. 123, Jakarta',
  nama_kepala_sekolah: 'Dr. Ahmad Susilo, M.Pd',
  website: 'https://smpn1jakarta.sch.id',
  email: 'info@smpn1jakarta.sch.id',
  logo_sekolah: '/uploads/logo-sekolah.png'
};

describe('updatePengaturanInstansi', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create new settings when none exist', async () => {
    const result = await updatePengaturanInstansi(testInput);

    expect(result.nama_instansi).toEqual('SMP Negeri 1 Jakarta');
    expect(result.alamat).toEqual('Jl. Merdeka No. 123, Jakarta');
    expect(result.nama_kepala_sekolah).toEqual('Dr. Ahmad Susilo, M.Pd');
    expect(result.website).toEqual('https://smpn1jakarta.sch.id');
    expect(result.email).toEqual('info@smpn1jakarta.sch.id');
    expect(result.logo_sekolah).toEqual('/uploads/logo-sekolah.png');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeNull();
  });

  it('should update existing settings', async () => {
    // Create initial record
    await db.insert(pengaturanInstansiTable)
      .values({
        nama_instansi: 'Old School Name',
        alamat: 'Old Address',
        nama_kepala_sekolah: 'Old Principal',
        website: null,
        email: null,
        logo_sekolah: null
      })
      .execute();

    const updateData: UpdatePengaturanInstansiInput = {
      nama_instansi: 'Updated School Name',
      email: 'updated@school.edu'
    };

    const result = await updatePengaturanInstansi(updateData);

    expect(result.nama_instansi).toEqual('Updated School Name');
    expect(result.alamat).toEqual('Old Address'); // Should remain unchanged
    expect(result.nama_kepala_sekolah).toEqual('Old Principal'); // Should remain unchanged
    expect(result.email).toEqual('updated@school.edu');
    expect(result.website).toBeNull(); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save settings to database', async () => {
    const result = await updatePengaturanInstansi(testInput);

    const saved = await db.select()
      .from(pengaturanInstansiTable)
      .where(eq(pengaturanInstansiTable.id, result.id))
      .execute();

    expect(saved).toHaveLength(1);
    expect(saved[0].nama_instansi).toEqual('SMP Negeri 1 Jakarta');
    expect(saved[0].alamat).toEqual('Jl. Merdeka No. 123, Jakarta');
    expect(saved[0].nama_kepala_sekolah).toEqual('Dr. Ahmad Susilo, M.Pd');
    expect(saved[0].website).toEqual('https://smpn1jakarta.sch.id');
    expect(saved[0].email).toEqual('info@smpn1jakarta.sch.id');
    expect(saved[0].logo_sekolah).toEqual('/uploads/logo-sekolah.png');
  });

  it('should handle partial updates correctly', async () => {
    // Create initial record
    await db.insert(pengaturanInstansiTable)
      .values({
        nama_instansi: 'Initial School',
        alamat: 'Initial Address',
        nama_kepala_sekolah: 'Initial Principal',
        website: 'https://initial.com',
        email: 'initial@school.edu',
        logo_sekolah: '/initial-logo.png'
      })
      .execute();

    // Update only some fields
    const partialUpdate: UpdatePengaturanInstansiInput = {
      nama_instansi: 'Partially Updated School',
      website: null // Explicitly set to null
    };

    const result = await updatePengaturanInstansi(partialUpdate);

    expect(result.nama_instansi).toEqual('Partially Updated School');
    expect(result.alamat).toEqual('Initial Address'); // Unchanged
    expect(result.nama_kepala_sekolah).toEqual('Initial Principal'); // Unchanged
    expect(result.website).toBeNull(); // Updated to null
    expect(result.email).toEqual('initial@school.edu'); // Unchanged
    expect(result.logo_sekolah).toEqual('/initial-logo.png'); // Unchanged
  });

  it('should create with defaults when empty input provided', async () => {
    const emptyInput: UpdatePengaturanInstansiInput = {};
    
    const result = await updatePengaturanInstansi(emptyInput);

    expect(result.nama_instansi).toEqual('Default Institution');
    expect(result.alamat).toEqual('Default Address');
    expect(result.nama_kepala_sekolah).toEqual('Default Principal');
    expect(result.website).toBeNull();
    expect(result.email).toBeNull();
    expect(result.logo_sekolah).toBeNull();
  });
});
