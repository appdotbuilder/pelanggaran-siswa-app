
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import type { Siswa, CreateSiswaInput, UpdateSiswaInput, Kelas } from '../../../server/src/schema';

interface DataSiswaProps {
  canEdit: boolean;
}

export function DataSiswa({ canEdit }: DataSiswaProps) {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<CreateSiswaInput>({
    nomor: 0,
    nama_siswa: '',
    nisn: '',
    kelas_id: 0
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [siswa, kelas] = await Promise.all([
        trpc.getSiswa.query(),
        trpc.getKelas.query()
      ]);
      setSiswaList(siswa);
      setKelasList(kelas);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Set sample data for development
      setSiswaList([
        { id: 1, nomor: 1, nama_siswa: 'Ahmad Rizki', nisn: '2023001001', kelas_id: 1, created_at: new Date(), updated_at: null },
        { id: 2, nomor: 2, nama_siswa: 'Sari Dewi', nisn: '2023001002', kelas_id: 1, created_at: new Date(), updated_at: null },
        { id: 3, nomor: 3, nama_siswa: 'Budi Pratama', nisn: '2023001003', kelas_id: 2, created_at: new Date(), updated_at: null }
      ]);
      setKelasList([
        { id: 1, nomor: 1, rombel: '7', nama_kelas: 'VII A', created_at: new Date(), updated_at: null },
        { id: 2, nomor: 2, rombel: '7', nama_kelas: 'VII B', created_at: new Date(), updated_at: null }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (editingSiswa) {
        const updateData: UpdateSiswaInput = {
          id: editingSiswa.id,
          ...formData
        };
        await trpc.updateSiswa.mutate(updateData);
        setMessage({ type: 'success', text: '✅ Data siswa berhasil diperbarui' });
      } else {
        await trpc.createSiswa.mutate(formData);
        setMessage({ type: 'success', text: '✅ Siswa berhasil ditambahkan' });
      }
      
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Failed to save siswa:', error);
      setMessage({ type: 'error', text: '❌ Gagal menyimpan data siswa' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (siswa: Siswa) => {
    setEditingSiswa(siswa);
    setFormData({
      nomor: siswa.nomor,
      nama_siswa: siswa.nama_siswa,
      nisn: siswa.nisn,
      kelas_id: siswa.kelas_id
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await trpc.deleteSiswa.mutate({ id });
      setMessage({ type: 'success', text: '✅ Data siswa berhasil dihapus' });
      await loadData();
    } catch (error) {
      console.error('Failed to delete siswa:', error);
      setMessage({ type: 'error', text: '❌ Gagal menghapus data siswa' });
    }
  };

  const resetForm = () => {
    setFormData({
      nomor: 0,
      nama_siswa: '',
      nisn: '',
      kelas_id: 0
    });
    setEditingSiswa(null);
    setShowForm(false);
    setMessage(null);
  };

  const getKelasName = (kelasId: number) => {
    const kelas = kelasList.find(k => k.id === kelasId);
    return kelas ? kelas.nama_kelas : 'Tidak ditemukan';
  };

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
        <h3 className="text-lg font-semibold">👨‍🎓 Data Siswa</h3>
        {canEdit && (
          <div className="space-x-2">
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  ➕ Tambah Siswa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingSiswa ? '✏️ Edit Data Siswa' : '➕ Tambah Siswa Baru'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomor">Nomor Urut</Label>
                    <Input
                      id="nomor"
                      type="number"
                      min="1"
                      value={formData.nomor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData(prev => ({ ...prev, nomor: parseInt(e.target.value) || 0 }))
                      }
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nama_siswa">Nama Siswa</Label>
                    <Input
                      id="nama_siswa"
                      type="text"
                      value={formData.nama_siswa}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData(prev => ({ ...prev, nama_siswa: e.target.value }))
                      }
                      placeholder="Nama lengkap siswa"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nisn">NISN</Label>
                    <Input
                      id="nisn"
                      type="text"
                      value={formData.nisn}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData(prev => ({ ...prev, nisn: e.target.value }))
                      }
                      placeholder="Nomor Induk Siswa Nasional"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Kelas</Label>
                    <Select 
                      value={formData.kelas_id.toString() || ''} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, kelas_id: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kelas" />
                      </SelectTrigger>
                      <SelectContent>
                        {kelasList.map((kelas) => (
                          <SelectItem key={kelas.id} value={kelas.id.toString()}>
                            {kelas.nama_kelas}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? '🔄' : '💾'} {editingSiswa ? 'Update' : 'Simpan'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      ❌ Batal
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              📤 Impor
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-4">🔄 Memuat data...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Nomor</TableHead>
              <TableHead>Nama Siswa</TableHead>
              <TableHead>NISN</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Dibuat</TableHead>
              {canEdit && <TableHead>Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {siswaList.map((siswa, index) => (
              <TableRow key={siswa.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{siswa.nomor}</TableCell>
                <TableCell className="font-medium">👨‍🎓 {siswa.nama_siswa}</TableCell>
                <TableCell className="font-mono text-sm">{siswa.nisn}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {getKelasName(siswa.kelas_id)}
                  </span>
                </TableCell>
                <TableCell>{siswa.created_at.toLocaleDateString()}</TableCell>
                {canEdit && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(siswa)}
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
                              Apakah Anda yakin ingin menghapus data siswa "{siswa.nama_siswa}"? 
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>❌ Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(siswa.id)}>
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
      )}
    </div>
  );
}
