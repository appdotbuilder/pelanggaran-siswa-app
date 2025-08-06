
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dataPelanggaranTable } from '../db/schema';
import { type CreateDataPelanggaranInput } from '../schema';
import { getDataPelanggaran } from '../handlers/get_data_pelanggaran';

// Test data for different violation categories
const testViolations: CreateDataPelanggaranInput[] = [
  {
    kategori: 'Kelakuan',
    jenis_pelanggaran: 'Berkelahi dengan teman',
    poin: 50
  },
  {
    kategori: 'Kerajinan & Pembiasaan',
    jenis_pelanggaran: 'Terlambat masuk kelas',
    poin: 10
  },
  {
    kategori: 'Kerapian',
    jenis_pelanggaran: 'Seragam tidak lengkap',
    poin: 15
  }
];

describe('getDataPelanggaran', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no violation types exist', async () => {
    const results = await getDataPelanggaran();

    expect(results).toEqual([]);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should return all violation types', async () => {
    // Insert test violation types
    await db.insert(dataPelanggaranTable)
      .values(testViolations)
      .execute();

    const results = await getDataPelanggaran();

    expect(results).toHaveLength(3);
    expect(Array.isArray(results)).toBe(true);
    
    // Verify all categories are included
    const categories = results.map(v => v.kategori);
    expect(categories).toContain('Kelakuan');
    expect(categories).toContain('Kerajinan & Pembiasaan');
    expect(categories).toContain('Kerapian');
  });

  it('should return violation types with correct structure', async () => {
    // Insert single test violation
    await db.insert(dataPelanggaranTable)
      .values([testViolations[0]])
      .execute();

    const results = await getDataPelanggaran();

    expect(results).toHaveLength(1);
    const violation = results[0];

    // Verify all required fields are present
    expect(violation.id).toBeDefined();
    expect(typeof violation.id).toBe('number');
    expect(violation.kategori).toEqual('Kelakuan');
    expect(violation.jenis_pelanggaran).toEqual('Berkelahi dengan teman');
    expect(violation.poin).toEqual(50);
    expect(typeof violation.poin).toBe('number');
    expect(violation.created_at).toBeInstanceOf(Date);
    expect(violation.updated_at).toBe(null);
  });

  it('should handle multiple violations of same category', async () => {
    // Insert multiple violations of same category
    const sameCategory = [
      {
        kategori: 'Kelakuan' as const,
        jenis_pelanggaran: 'Berkelahi dengan teman',
        poin: 50
      },
      {
        kategori: 'Kelakuan' as const,
        jenis_pelanggaran: 'Membully teman',
        poin: 75
      },
      {
        kategori: 'Kelakuan' as const,
        jenis_pelanggaran: 'Tidak sopan kepada guru',
        poin: 40
      }
    ];

    await db.insert(dataPelanggaranTable)
      .values(sameCategory)
      .execute();

    const results = await getDataPelanggaran();

    expect(results).toHaveLength(3);
    
    // All should be 'Kelakuan' category
    results.forEach(violation => {
      expect(violation.kategori).toEqual('Kelakuan');
      expect(typeof violation.poin).toBe('number');
      expect(violation.poin).toBeGreaterThan(0);
    });

    // Verify unique violation types
    const violationTypes = results.map(v => v.jenis_pelanggaran);
    expect(violationTypes).toContain('Berkelahi dengan teman');
    expect(violationTypes).toContain('Membully teman');
    expect(violationTypes).toContain('Tidak sopan kepada guru');
  });

  it('should return violations with different point values', async () => {
    // Create violations with various point values
    const diverseViolations = [
      {
        kategori: 'Kelakuan' as const,
        jenis_pelanggaran: 'Pelanggaran ringan',
        poin: 5
      },
      {
        kategori: 'Kerapian' as const,
        jenis_pelanggaran: 'Pelanggaran sedang',
        poin: 25
      },
      {
        kategori: 'Kerajinan & Pembiasaan' as const,
        jenis_pelanggaran: 'Pelanggaran berat',
        poin: 100
      }
    ];

    await db.insert(dataPelanggaranTable)
      .values(diverseViolations)
      .execute();

    const results = await getDataPelanggaran();

    expect(results).toHaveLength(3);

    // Check point values are preserved correctly
    const points = results.map(v => v.poin).sort((a, b) => a - b);
    expect(points).toEqual([5, 25, 100]);
    
    // Verify all are numbers
    results.forEach(violation => {
      expect(typeof violation.poin).toBe('number');
      expect(violation.poin).toBeGreaterThan(0);
    });
  });
});
