
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { siswaTable, kelasTable } from '../db/schema';
import { type CreateKelasInput, type CreateSiswaInput } from '../schema';
import { deleteSiswa } from '../handlers/delete_siswa';
import { eq } from 'drizzle-orm';

// Test data
const testKelasInput: CreateKelasInput = {
  nomor: 1,
  rombel: '7',
  nama_kelas: '7A'
};

const testSiswaInput: CreateSiswaInput = {
  nomor: 1,
  nama_siswa: 'Test Student',
  nisn: '1234567890',
  kelas_id: 1 // Will be updated with actual created kelas ID
};

describe('deleteSiswa', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a student from database', async () => {
    // Create prerequisite kelas first
    const [kelas] = await db.insert(kelasTable)
      .values(testKelasInput)
      .returning()
      .execute();

    // Create student with valid kelas_id
    const [siswa] = await db.insert(siswaTable)
      .values({
        ...testSiswaInput,
        kelas_id: kelas.id
      })
      .returning()
      .execute();

    // Delete the student
    await deleteSiswa(siswa.id);

    // Verify student is deleted
    const students = await db.select()
      .from(siswaTable)
      .where(eq(siswaTable.id, siswa.id))
      .execute();

    expect(students).toHaveLength(0);
  });

  it('should handle deletion of non-existent student', async () => {
    // Try to delete non-existent student (ID 999) - should not throw
    await deleteSiswa(999);

    // Verify no students exist in empty database
    const allStudents = await db.select()
      .from(siswaTable)
      .execute();

    expect(allStudents).toHaveLength(0);
  });

  it('should delete only the specified student', async () => {
    // Create prerequisite kelas first
    const [kelas] = await db.insert(kelasTable)
      .values(testKelasInput)
      .returning()
      .execute();

    // Create multiple students
    const [siswa1] = await db.insert(siswaTable)
      .values({
        ...testSiswaInput,
        kelas_id: kelas.id,
        nama_siswa: 'Student One',
        nisn: '1111111111'
      })
      .returning()
      .execute();

    const [siswa2] = await db.insert(siswaTable)
      .values({
        ...testSiswaInput,
        kelas_id: kelas.id,
        nama_siswa: 'Student Two',
        nisn: '2222222222'
      })
      .returning()
      .execute();

    // Delete only the first student
    await deleteSiswa(siswa1.id);

    // Verify only first student is deleted
    const remainingStudents = await db.select()
      .from(siswaTable)
      .execute();

    expect(remainingStudents).toHaveLength(1);
    expect(remainingStudents[0].id).toEqual(siswa2.id);
    expect(remainingStudents[0].nama_siswa).toEqual('Student Two');
  });
});
