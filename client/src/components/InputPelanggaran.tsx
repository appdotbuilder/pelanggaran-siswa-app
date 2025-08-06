
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import type { 
  User, 
  CreatePelanggaranSiswaInput, 
  Siswa, 
  Guru, 
  DataPelanggaran,
  KategoriPelanggaran,
  Kelas
} from '../../../server/src/schema';

interface InputPelanggaranProps {
  currentUser: User;
}

export function InputPelanggaran({ currentUser }: InputPelanggaranProps) {
  const [formData, setFormData] = useState<CreatePelanggaranSiswaInput>({
    tanggal: new Date(),
    siswa_id: 0,
    data_pelanggaran_id: 0,
    guru_id: currentUser.id,
    bukti_file: null
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Siswa[]>([]);
  const [selectedSiswa, setSelectedSiswa] = useState<(Siswa & { kelas?: Kelas }) | null>(null);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [dataPelanggaran, setDataPelanggaran] = useState<DataPelanggaran[]>([]);
  const [filteredPelanggaran, setFilteredPelanggaran] = useState<DataPelanggaran[]>([]);
  const [selectedKategori, setSelectedKategori] = useState<KategoriPelanggaran | ''>('');
  const [selectedPelanggaran, setSelectedPelanggaran] = useState<DataPelanggaran | null>(null);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadInitialData = useCallback(async () => {
    try {
      const [guru, pelanggaran, kelas] = await Promise.all([
        trpc.getGuru.query(),
        trpc.getDataPelanggaran.query(),
        trpc.getKelas.query()
      ]);
      
      setGuruList(guru);
      setDataPelanggaran(pelanggaran);
      setKelasList(kelas);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      // Set sample data for development
      setGuruList([
        { id: 1, nomor: 1, nama_guru: 'Budi Santoso', nip: '123456789', created_at: new Date(), updated_at: null },
        { id: 2, nomor: 2, nama_guru: 'Siti Aminah', nip: '987654321', created_at: new Date(), updated_at: null }
      ]);
      setDataPelanggaran([
        { id: 1, kategori: 'Kelakuan', jenis_pelanggaran: 'Berkelahi', poin: 5, created_at: new Date(), updated_at: null },
        { id: 2, kategori: 'Kelakuan', jenis_pelanggaran: 'Berkata kasar', poin: 3, created_at: new Date(), updated_at: null },
        { id: 3, kategori: 'Kerajinan & Pembiasaan', jenis_pelanggaran: 'Tidak mengerjakan tugas', poin: 2, created_at: new Date(), updated_at: null },
        { id: 4, kategori: 'Kerapian', jenis_pelanggaran: 'Seragam tidak rapi', poin: 1, created_at: new Date(), updated_at: null }
      ]);
      setKelasList([
        { id: 1, nomor: 1, rombel: '7', nama_kelas: 'VII A', created_at: new Date(), updated_at: null },
        { id: 2, nomor: 2, rombel: '7', nama_kelas: 'VII B', created_at: new Date(), updated_at: null }
      ]);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await trpc.searchSiswa.query({ query });
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      // Sample search results for development
      setSearchResults([
        { id: 1, nomor: 1, nama_siswa: 'Ahmad Rizki', nisn: '2023001', kelas_id: 1, created_at: new Date(), updated_at: null },
        { id: 2, nomor: 2, nama_siswa: 'Sari Dewi', nisn: '2023002', kelas_id: 2, created_at: new Date(), updated_at: null }
      ].filter(siswa => 
        siswa.nama_siswa.toLowerCase().includes(query.toLowerCase()) ||
        siswa.nisn.includes(query)
      ));
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    if (selectedKategori) {
      setFilteredPelanggaran(dataPelanggaran.filter(p => p.kategori === selectedKategori));
    } else {
      setFilteredPelanggaran([]);
    }
    setSelectedPelanggaran(null);
    setFormData(prev => ({ ...prev, data_pelanggaran_id: 0 }));
  }, [selectedKategori, dataPelanggaran]);

  const handleSiswaSelect = (siswa: Siswa) => {
    const kelas = kelasList.find(k => k.id === siswa.kelas_id);
    setSelectedSiswa({ ...siswa, kelas });
    setFormData(prev => ({ ...prev, siswa_id: siswa.id }));
    setSearchQuery('');
    setSearchResults([]);
  };

  const handlePelanggaranSelect = (pelanggaranId: string) => {
    const pelanggaran = filteredPelanggaran.find(p => p.id === parseInt(pelanggaranId));
    setSelectedPelanggaran(pelanggaran || null);
    setFormData(prev => ({ ...prev, data_pelanggaran_id: parseInt(pelanggaranId) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setMessage({ type: 'error', text: 'Ukuran file maksimal 2MB' });
        return;
      }
      
      // In real implementation, you would upload the file and get the URL
      // For now, we'll just use the filename
      setFormData(prev => ({ ...prev, bukti_file: file.name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSiswa || !selectedPelanggaran) {
      setMessage({ type: 'error', text: 'Harap lengkapi semua data yang diperlukan' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await trpc.createPelanggaranSiswa.mutate(formData);
      setMessage({ type: 'success', text: '✅ Pelanggaran berhasil dicatat' });
      
      // Reset form
      setFormData({
        tanggal: new Date(),
        siswa_id: 0,
        data_pelanggaran_id: 0,
        guru_id: currentUser.id,
        bukti_file: null
      });
      setSelectedSiswa(null);
      setSelectedKategori('');
      setSelectedPelanggaran(null);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to create pelanggaran:', error);
      setMessage({ type: 'error', text: '❌ Gagal menyimpan pelanggaran' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tanggal: new Date(),
      siswa_id: 0,
      data_pelanggaran_id: 0,
      guru_id: currentUser.id,
      bukti_file: null
    });
    setSelectedSiswa(null);
    setSelectedKategori('');
    setSelectedPelanggaran(null);
    setSearchQuery('');
    setMessage(null);
  };

  const getKategoriIcon = (kategori: KategoriPelanggaran) => {
    switch (kategori) {
      case 'Kelakuan': return '😠';
      case 'Kerajinan & Pembiasaan': return '📚';
      case 'Kerapian': return '👔';
      default: return '📋';
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ✍️ Input Pelanggaran Siswa
        </CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert className={`mb-4 ${message.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
            <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tanggal */}
            <div className="space-y-2">
              <Label htmlFor="tanggal">📅 Tanggal Pelanggaran</Label>
              <Input
                id="tanggal"
                type="date"
                value={formData.tanggal.toISOString().split('T')[0]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData(prev => ({ ...prev, tanggal: new Date(e.target.value) }))
                }
                required
              />
            </div>

            {/* Guru Pencatat */}
            <div className="space-y-2">
              <Label>👨‍🏫 Guru Pencatat</Label>
              <Select 
                value={formData.guru_id.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, guru_id: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {guruList.map((guru) => (
                    <SelectItem key={guru.id} value={guru.id.toString()}>
                      {guru.nama_guru}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pencarian Siswa */}
          <div className="space-y-2">
            <Label htmlFor="search">🔍 Cari Siswa (Nama atau NISN)</Label>
            <Input
              id="search"
              type="text"
              placeholder="Ketik nama siswa atau NISN..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
            
            {isSearching && (
              <p className="text-sm text-gray-500">🔄 Mencari...</p>
            )}

            {searchResults.length > 0 && (
              <div className="border rounded-md bg-white shadow-sm max-h-48 overflow-y-auto">
                {searchResults.map((siswa) => {
                  const kelas = kelasList.find(k => k.id === siswa.kelas_id);
                  return (
                    <button
                      key={siswa.id}
                      type="button"
                      className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0"
                      onClick={() => handleSiswaSelect(siswa)}
                    >
                      <div className="font-medium">{siswa.nama_siswa}</div>
                      <div className="text-sm text-gray-500">
                        NISN: {siswa.nisn} • Kelas: {kelas?.nama_kelas || 'Tidak ditemukan'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedSiswa && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-green-800">
                      👤 {selectedSiswa.nama_siswa}
                    </div>
                    <div className="text-sm text-green-600">
                      NISN: {selectedSiswa.nisn} • Kelas: {selectedSiswa.kelas?.nama_kelas}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedSiswa(null);
                      setFormData(prev => ({ ...prev, siswa_id: 0 }));
                    }}
                  >
                    ❌
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Kategori Pelanggaran */}
          <div className="space-y-2">
            <Label>📋 Kategori Pelanggaran</Label>
            <Select value={selectedKategori} onValueChange={(value) => setSelectedKategori(value as KategoriPelanggaran)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori pelanggaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Kelakuan">😠 Kelakuan</SelectItem>
                <SelectItem value="Kerajinan & Pembiasaan">📚 Kerajinan & Pembiasaan</SelectItem>
                <SelectItem value="Kerapian">👔 Kerapian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jenis Pelanggaran */}
          {selectedKategori && (
            <div className="space-y-2">
              <Label>⚠️ Jenis Pelanggaran</Label>
              <Select 
                value={formData.data_pelanggaran_id.toString()} 
                onValueChange={handlePelanggaranSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis pelanggaran" />
                </SelectTrigger>
                <SelectContent>
                  {filteredPelanggaran.map((pelanggaran) => (
                    <SelectItem key={pelanggaran.id} value={pelanggaran.id.toString()}>
                      {pelanggaran.jenis_pelanggaran} 
                      <span className="ml-2 text-orange-600 font-bold">
                        ({pelanggaran.poin} poin)
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedPelanggaran && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-orange-800">
                        {getKategoriIcon(selectedPelanggaran.kategori)} {selectedPelanggaran.jenis_pelanggaran}
                      </div>
                      <div className="text-sm text-orange-600">
                        Kategori: {selectedPelanggaran.kategori}
                      </div>
                    </div>
                    <Badge variant="destructive" className="bg-orange-100 text-orange-800">
                      {selectedPelanggaran.poin} poin
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload Bukti */}
          <div className="space-y-2">
            <Label htmlFor="bukti">📎 Bukti Pelanggaran (Opsional)</Label>
            <Input
              id="bukti"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <p className="text-xs text-gray-500">
              Format: JPG, PNG, GIF. Maksimal 2MB
            </p>
            {formData.bukti_file && (
              <p className="text-sm text-green-600">
                ✅ File terpilih: {formData.bukti_file}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading || !selectedSiswa || !selectedPelanggaran}>
              {isLoading ? '🔄 Menyimpan...' : '💾 Simpan Pelanggaran'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              🔄 Reset Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
