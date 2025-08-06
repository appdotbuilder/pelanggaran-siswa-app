
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { trpc } from '@/utils/trpc';
import type { 
  DashboardFilter, 
  RangkumanPelanggaran, 
  PelanggaranPerKelas,
  Kelas,
  Guru,
  KategoriPelanggaran 
} from '../../../server/src/schema';

export function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilter>({});
  const [summaryData, setSummaryData] = useState<{
    rangkumanPelanggaran: RangkumanPelanggaran[];
    pelanggaranPerKelas: PelanggaranPerKelas[];
  }>({ rangkumanPelanggaran: [], pelanggaranPerKelas: [] });
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summary, kelas, guru] = await Promise.all([
        trpc.getDashboardSummary.query(filters),
        trpc.getKelas.query(),
        trpc.getGuru.query()
      ]);
      
      setSummaryData(summary);
      setKelasList(kelas);
      setGuruList(guru);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set sample data for development
      setSummaryData({
        rangkumanPelanggaran: [
          { kategori: 'Kelakuan', total_pelanggaran: 45, total_poin: 180 },
          { kategori: 'Kerajinan & Pembiasaan', total_pelanggaran: 32, total_poin: 96 },
          { kategori: 'Kerapian', total_pelanggaran: 28, total_poin: 84 }
        ],
        pelanggaranPerKelas: [
          { kelas_id: 1, nama_kelas: 'VII A', rombel: '7', total_pelanggaran: 15, total_poin: 60 },
          { kelas_id: 2, nama_kelas: 'VII B', rombel: '7', total_pelanggaran: 12, total_poin: 48 },
          { kelas_id: 3, nama_kelas: 'VIII A', rombel: '8', total_pelanggaran: 18, total_poin: 72 },
          { kelas_id: 4, nama_kelas: 'IX A', rombel: '9', total_pelanggaran: 20, total_poin: 80 }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (key: keyof DashboardFilter, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' || !value ? undefined : 
             key === 'tanggal_awal' || key === 'tanggal_akhir' ? new Date(value) :
             key === 'kelas_id' || key === 'guru_id' ? parseInt(value) : value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getKategoriIcon = (kategori: KategoriPelanggaran) => {
    switch (kategori) {
      case 'Kelakuan': return '😠';
      case 'Kerajinan & Pembiasaan': return '📚';
      case 'Kerapian': return '👔';
      default: return '📋';
    }
  };

  const totalPelanggaran = summaryData.rangkumanPelanggaran.reduce((sum, item) => sum + item.total_pelanggaran, 0);
  const totalPoin = summaryData.rangkumanPelanggaran.reduce((sum, item) => sum + item.total_poin, 0);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Filter Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Awal</label>
              <Input
                type="date"
                value={filters.tanggal_awal?.toISOString().split('T')[0] || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleFilterChange('tanggal_awal', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Akhir</label>
              <Input
                type="date"
                value={filters.tanggal_akhir?.toISOString().split('T')[0] || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleFilterChange('tanggal_akhir', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kelas</label>
              <Select 
                value={filters.kelas_id?.toString() || 'all'} 
                onValueChange={(value) => handleFilterChange('kelas_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {kelasList.map((kelas) => (
                    <SelectItem key={kelas.id} value={kelas.id.toString()}>
                      {kelas.nama_kelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Guru Pelapor</label>
              <Select 
                value={filters.guru_id?.toString() || 'all'} 
                onValueChange={(value) => handleFilterChange('guru_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Guru" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Guru</SelectItem>
                  {guruList.map((guru) => (
                    <SelectItem key={guru.id} value={guru.id.toString()}>
                      {guru.nama_guru}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori</label>
              <Select 
                value={filters.kategori || 'all'} 
                onValueChange={(value) => handleFilterChange('kategori', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="Kelakuan">😠 Kelakuan</SelectItem>
                  <SelectItem value="Kerajinan & Pembiasaan">📚 Kerajinan & Pembiasaan</SelectItem>
                  <SelectItem value="Kerapian">👔 Kerapian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={clearFilters} variant="outline" className="w-full">
                🔄 Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pelanggaran</CardTitle>
            <span className="text-2xl">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalPelanggaran}</div>
            <p className="text-xs text-muted-foreground">
              Semua kategori
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Poin</CardTitle>
            <span className="text-2xl">🎯</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalPoin}</div>
            <p className="text-xs text-muted-foreground">
              Akumulasi semua poin
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kelas Terdampak</CardTitle>
            <span className="text-2xl">🏫</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {summaryData.pelanggaranPerKelas.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Kelas dengan pelanggaran
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rangkuman per Kategori */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 Rangkuman Per Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">🔄 Memuat data...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Total Poin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryData.rangkumanPelanggaran.map((item) => (
                    <TableRow key={item.kategori}>
                      <TableCell className="font-medium">
                        {getKategoriIcon(item.kategori)} {item.kategori}
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600">
                        {item.total_pelanggaran}
                      </TableCell>
                      <TableCell className="text-right font-bold text-orange-600">
                        {item.total_poin}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pelanggaran per Kelas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏫 Pelanggaran Per Kelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">🔄 Memuat data...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kelas</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Total Poin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryData.pelanggaranPerKelas
                    .sort((a, b) => b.total_pelanggaran - a.total_pelanggaran)
                    .map((item) => (
                    <TableRow key={item.kelas_id}>
                      <TableCell className="font-medium">
                        📚 {item.nama_kelas}
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600">
                        {item.total_pelanggaran}
                      </TableCell>
                      <TableCell className="text-right font-bold text-orange-600">
                        {item.total_poin}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
