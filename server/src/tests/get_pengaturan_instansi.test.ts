
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pengaturanInstansiTable } from '../db/schema';
import { getPengaturanInstansi } from '../handlers/get_pengaturan_instansi';

describe('getPengaturanInstansi', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when no institution settings exist', async () => {
    const result = await getPengaturanInstansi();
    expect(result).toBeNull();
  });

  it('should return institution settings when record exists', async () => {
    // Create test institution settings
    const testSettings = {
      nama_instansi: 'SMP Negeri 1 Test',
      alamat: 'Jalan Test No. 123, Test City',
      nama_kepala_sekolah: 'Dr. Test Kepala Sekolah',
      website: 'https://smptest.sch.id',
      email: 'info@smptest.sch.id',
      logo_sekolah: '/uploads/logo-test.png'
    };

    await db.insert(pengaturanInstansiTable)
      .values(testSettings)
      .execute();

    const result = await getPengaturanInstansi();

    expect(result).not.toBeNull();
    expect(result!.nama_instansi).toEqual('SMP Negeri 1 Test');
    expect(result!.alamat).toEqual('Jalan Test No. 123, Test City');
    expect(result!.nama_kepala_sekolah).toEqual('Dr. Test Kepala Sekolah');
    expect(result!.website).toEqual('https://smptest.sch.id');
    expect(result!.email).toEqual('info@smptest.sch.id');
    expect(result!.logo_sekolah).toEqual('/uploads/logo-test.png');
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeNull();
  });

  it('should return institution settings with null optional fields', async () => {
    // Create test institution settings with only required fields
    const testSettings = {
      nama_instansi: 'SMP Test Minimal',
      alamat: 'Alamat Test',
      nama_kepala_sekolah: 'Kepala Sekolah Test',
      website: null,
      email: null,
      logo_sekolah: null
    };

    await db.insert(pengaturanInstansiTable)
      .values(testSettings)
      .execute();

    const result = await getPengaturanInstansi();

    expect(result).not.toBeNull();
    expect(result!.nama_instansi).toEqual('SMP Test Minimal');
    expect(result!.alamat).toEqual('Alamat Test');
    expect(result!.nama_kepala_sekolah).toEqual('Kepala Sekolah Test');
    expect(result!.website).toBeNull();
    expect(result!.email).toBeNull();
    expect(result!.logo_sekolah).toBeNull();
  });

  it('should return only the first record when multiple exist', async () => {
    // Insert first record
    await db.insert(pengaturanInstansiTable)
      .values({
        nama_instansi: 'First School',
        alamat: 'First Address',
        nama_kepala_sekolah: 'First Principal'
      })
      .execute();

    // Insert second record
    await db.insert(pengaturanInstansiTable)
      .values({
        nama_instansi: 'Second School',
        alamat: 'Second Address',
        nama_kepala_sekolah: 'Second Principal'
      })
      .execute();

    const result = await getPengaturanInstansi();

    expect(result).not.toBeNull();
    expect(result!.nama_instansi).toEqual('First School');
    expect(result!.alamat).toEqual('First Address');
    expect(result!.nama_kepala_sekolah).toEqual('First Principal');
  });
});
