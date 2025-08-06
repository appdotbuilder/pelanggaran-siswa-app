
import { db } from '../db';
import { pengaturanInstansiTable } from '../db/schema';
import { type UpdatePengaturanInstansiInput, type PengaturanInstansi } from '../schema';
import { eq } from 'drizzle-orm';

export const updatePengaturanInstansi = async (input: UpdatePengaturanInstansiInput): Promise<PengaturanInstansi> => {
  try {
    // Check if any settings record exists
    const existing = await db.select()
      .from(pengaturanInstansiTable)
      .limit(1)
      .execute();

    if (existing.length === 0) {
      // Create new record if none exists - all fields are required for creation
      const result = await db.insert(pengaturanInstansiTable)
        .values({
          nama_instansi: input.nama_instansi || 'Default Institution',
          alamat: input.alamat || 'Default Address',
          nama_kepala_sekolah: input.nama_kepala_sekolah || 'Default Principal',
          website: input.website || null,
          email: input.email || null,
          logo_sekolah: input.logo_sekolah || null
        })
        .returning()
        .execute();

      return result[0];
    } else {
      // Update existing record
      const result = await db.update(pengaturanInstansiTable)
        .set({
          ...input,
          updated_at: new Date()
        })
        .where(eq(pengaturanInstansiTable.id, existing[0].id))
        .returning()
        .execute();

      return result[0];
    }
  } catch (error) {
    console.error('Institution settings update failed:', error);
    throw error;
  }
};
