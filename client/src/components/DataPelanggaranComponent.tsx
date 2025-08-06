
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import type { DataPelanggaran, CreateDataPelanggaranInput, UpdateDataPelanggaranInput, KategoriPelanggaran } from '../../../server/src/schema';

interface DataPelanggaranComponentProps {
  canEdit: boolean;
}

export function DataPelanggaranComponent({ canEdit }: DataPelanggaranComponentProps) {
  const [pelanggaranList, setPelanggaranList] = useState<DataPelanggaran[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPelanggaran, setEditingPelanggaran] = useState<DataPelanggaran | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<CreateDataPelanggaranInput>({
    kategori: 'Kelakuan',
    jenis_pelanggaran: '',
    poin: 1
  });

  const loadDataPelanggaran = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await trpc.getDataPelanggaran.query();
      setPelanggaranList(data);
    } catch (error) {
      console.error('Failed to load data pelanggaran:', error);
      // Set initial violation data for demonstration
      setPelanggaranList([
        // Kelakuan
        { id: 1, kategori: 'Kelakuan', jenis_pelanggaran: 'Berkelahi dengan teman', poin: 5, created_at: new Date(), updated_at: null },
        { id: 2, kategori: 'Kelakuan', jenis_pelanggaran: 'Berkata kasar/tidak sopan', poin: 3, created_at: new Date(), updated_at: null },
        { id: 3, kategori: 'Kelakuan', jenis_pelanggaran: 'Mengganggu ketertiban kelas', poin: 2, created_at: new Date(), updated_at: null },
        { id: 4, kategori: 'Kelakuan', jenis_pelanggaran: 'Tidak menghormati guru', poin: 4, created_at: new Date(), updated_at: null },
        { id: 5, kategori: 'Kelakuan', jenis_pelanggaran: 'Membawa barang terlarang', poin: 5, created_at: new Date(), updated_at: null },
        
        // Kerajinan & Pembiasaan
        { id: 6, kategori: 'Kerajinan & Pembiasaan', jenis_pelanggaran: 'Tidak mengerjakan tugas', poin: 2, created_at: new Date(), updated_at: null },
        { id: 7, kategori: 'Kerajinan & Pembiasaan', jenis_pelanggaran: 'Terlambat masuk kelas', poin: 1, created_at: new Date(), updated_at: null },
        { id: 8, kategori: 'Kerajinan & Pembiasaan', jenis_pelanggaran: 'Tidak membawa buku pelajaran', poin: 1, created_at: new Date(), updated_at: null },
        { id: 9, kategori: 'Kerajinan & Pembiasaan', jenis_pelanggaran: 'Tidak mengikuti upacara', poin: 2, created_at: new Date(), updated_at: null },
        { id: 10, kategori: 'Kerajinan & Pembiasaan', jenis_pelanggaran: 'Membolos/tidak masuk tanpa izin', poin: 3, created_at: new Date(), updated_at: null },
        
        // Kerapian
        { id: 11, kategori: 'Kerapian', jenis_pelanggaran: 'Seragam tidak lengkap', poin: 1, created_at: new Date(), updated_at: null },
        { id: 12, kategori: 'Kerapian', jenis_pelanggaran: 'Rambut tidak rapi', poin: 1, created_at: new Date(), updated_at: null },
        { id: 13, kategori: 'Kerapian', jenis_pelanggaran: 'Sepatu tidak sesuai', poin: 1, created_at: new Date(), updated_at: null },
        { id: 14, kategori: 'Kerapian', jenis_pelanggaran: 'Kuku panjang/tidak bersih', poin: 1, created_at: new Date(), updated_at: null },
        { id: 15, kategori: 'Kerapian', jenis_pelanggaran: 'Aksesoris berlebihan', poin: 1, created_at: new Date(), updated_at: null }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDataPelanggaran();
  }, [loadDataPelanggaran]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (editingPelanggaran) {
        const updateData: UpdateDataPelanggaranInput = {
          id: editingPelanggaran.id,
          ...formData
        };
        await trpc.updateDataPelanggaran.mutate(updateData);
        setMessage({ type: 'success', text: '✅ Data pelanggaran berhasil diperbarui' });
      } else {
        await trpc.createDataPelanggaran.mutate(formData);
        setMessage({ type: 'success', text: '✅ Data pelanggaran berhasil ditambahkan' });
      }
      
      await loadDataPelanggaran();
      resetForm();
    } catch (error) {
      console.error('Failed to save data pelanggaran:', error);
      setMessage({ type: 'error', text: '❌ Gagal menyimpan data pelanggaran' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (pelanggaran: DataPelanggaran) => {
    setEditingPelanggaran(pelanggaran);
    setFormData({
      kategori: pelanggaran.kategori,
      jenis_pelanggaran: pelanggaran.jenis_pelanggaran,
      poin: pelanggaran.poin
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await trpc.deleteDataPelanggaran.mutate({ id });
      setMessage({ type: 'success', text: '✅ Data pelanggaran berhasil dihapus' });
      await loadDataPelanggaran();
    } catch (error) {
      console.error('Failed to delete data pelanggaran:', error);
      setMessage({ type: 'error', text: '❌ Gagal menghapus data pelanggaran' });
    }
  };

  const resetForm = () => {
    setFormData({
      kategori: 'Kelakuan',
      jenis_pelanggaran: '',
      poin: 1
    });
    setEditingPelanggaran(null);
    setShowForm(false);
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

  const getPoinBadge = (poin: number) => {
    if (poin >= 5) return 'destructive';
    if (poin >= 3) return 'default';
    return 'secondary';
  };

  const groupedData = pelanggaranList.reduce((acc, item) => {
    if (!acc[item.kategori]) {
      acc[item.kategori] = [];
    }
    acc[item.kategori].push(item);
    return acc;
  }, {} as Record<KategoriPelanggaran, DataPelanggaran[]>);

  return (
    <div className="space-y-4">
      {message && (
        <Alert className={`${message.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
          <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">⚠️ Data Pelanggaran</h3>
        {canEdit && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                ➕ Tambah Pelanggaran
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPelanggaran ? '✏️ Edit Data Pelanggaran' : '➕ Tambah Data Pelanggaran'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select 
                    value={formData.kategori || 'Kelakuan'} 
                    onValueChange={(value: KategoriPelanggaran) => 
                      setFormData(prev => ({ ...prev, kategori: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kelakuan">😠 Kelakuan</SelectItem>
                      <SelectItem value="Kerajinan & Pembiasaan">📚 Kerajinan & Pembiasaan</SelectItem>
                      <SelectItem value="Kerapian">👔 Kerapian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jenis_pelanggaran">Jenis Pelanggaran</Label>
                  <Input
                    id="jenis_pelanggaran"
                    type="text"
                    value={formData.jenis_pelanggaran}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData(prev => ({ ...prev, jenis_pelanggaran: e.target.value }))
                    }
                    placeholder="Deskripsi pelanggaran"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="poin">Poin</Label>
                  <Input
                    id="poin"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.poin}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData(prev => ({ ...prev, poin: parseInt(e.target.value) || 1 }))
                    }
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? '🔄' : '💾'} {editingPelanggaran ? 'Update' : 'Simpan'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    ❌ Batal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-4">🔄 Memuat data...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedData).map(([kategori, items]) => (
            <div key={kategori} className="space-y-2">
              <h4 className="text-md font-semibold flex items-center gap-2">
                {getKategoriIcon(kategori as KategoriPelanggaran)} {kategori}
                <Badge variant="secondary">{items.length} jenis</Badge>
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Jenis Pelanggaran</TableHead>
                    <TableHead>Poin</TableHead>
                    <TableHead>Dibuat</TableHead>
                    {canEdit && <TableHead>Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((pelanggaran, index) => (
                    <TableRow key={pelanggaran.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {pelanggaran.jenis_pelanggaran}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPoinBadge(pelanggaran.poin)}>
                          {pelanggaran.poin} poin
                        </Badge>
                      </TableCell>
                      <TableCell>{pelanggaran.created_at.toLocaleDateString()}</TableCell>
                      {canEdit && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(pelanggaran)}
                            >
                              ✏️ Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  🗑️ Hapus
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus pelanggaran "{pelanggaran.jenis_pelanggaran}"? 
                                    Tindakan ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>❌ Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(pelanggaran.id)}>
                                    🗑️ Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
