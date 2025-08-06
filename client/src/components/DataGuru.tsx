
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import type { Guru, CreateGuruInput, UpdateGuruInput } from '../../../server/src/schema';

interface DataGuruProps {
  canEdit: boolean;
}

export function DataGuru({ canEdit }: DataGuruProps) {
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingGuru, setEditingGuru] = useState<Guru | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<CreateGuruInput>({
    nomor: 0,
    nama_guru: '',
    nip: ''
  });

  const loadGuru = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await trpc.getGuru.query();
      setGuruList(data);
    } catch (error) {
      console.error('Failed to load guru:', error);
      // Set sample data for development
      setGuruList([
        { id: 1, nomor: 1, nama_guru: 'Budi Santoso', nip: '196501011990031002', created_at: new Date(), updated_at: null },
        { id: 2, nomor: 2, nama_guru: 'Siti Aminah', nip: '197203151995122001', created_at: new Date(), updated_at: null },
        { id: 3, nomor: 3, nama_guru: 'Ahmad Rizki', nip: '198012252006041003', created_at: new Date(), updated_at: null }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGuru();
  }, [loadGuru]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (editingGuru) {
        const updateData: UpdateGuruInput = {
          id: editingGuru.id,
          ...formData
        };
        await trpc.updateGuru.mutate(updateData);
        setMessage({ type: 'success', text: '✅ Data guru berhasil diperbarui' });
      } else {
        await trpc.createGuru.mutate(formData);
        setMessage({ type: 'success', text: '✅ Guru berhasil ditambahkan' });
      }
      
      await loadGuru();
      resetForm();
    } catch (error) {
      console.error('Failed to save guru:', error);
      setMessage({ type: 'error', text: '❌ Gagal menyimpan data guru' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (guru: Guru) => {
    setEditingGuru(guru);
    setFormData({
      nomor: guru.nomor,
      nama_guru: guru.nama_guru,
      nip: guru.nip
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await trpc.deleteGuru.mutate({ id });
      setMessage({ type: 'success', text: '✅ Data guru berhasil dihapus' });
      await loadGuru();
    } catch (error) {
      console.error('Failed to delete guru:', error);
      setMessage({ type: 'error', text: '❌ Gagal menghapus data guru' });
    }
  };

  const resetForm = () => {
    setFormData({
      nomor: 0,
      nama_guru: '',
      nip: ''
    });
    setEditingGuru(null);
    setShowForm(false);
    setMessage(null);
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
        <h3 className="text-lg font-semibold">👨‍🏫 Data Guru</h3>
        {canEdit && (
          <div className="space-x-2">
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  ➕ Tambah Guru
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingGuru ? '✏️ Edit Data Guru' : '➕ Tambah Guru Baru'}
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
                    <Label htmlFor="nama_guru">Nama Guru</Label>
                    <Input
                      id="nama_guru"
                      type="text"
                      value={formData.nama_guru}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData(prev => ({ ...prev, nama_guru: e.target.value }))
                      }
                      placeholder="Nama lengkap guru"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nip">NIP</Label>
                    <Input
                      id="nip"
                      type="text"
                      value={formData.nip}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData(prev => ({ ...prev, nip: e.target.value }))
                      }
                      placeholder="Nomor Induk Pegawai"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? '🔄' : '💾'} {editingGuru ? 'Update' : 'Simpan'}
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
              <TableHead>Nama Guru</TableHead>
              <TableHead>NIP</TableHead>
              <TableHead>Dibuat</TableHead>
              {canEdit && <TableHead>Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {guruList.map((guru, index) => (
              <TableRow key={guru.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{guru.nomor}</TableCell>
                <TableCell className="font-medium">👨‍🏫 {guru.nama_guru}</TableCell>
                <TableCell className="font-mono text-sm">{guru.nip}</TableCell>
                <TableCell>{guru.created_at.toLocaleDateString()}</TableCell>
                {canEdit && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(guru)}
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
                              Apakah Anda yakin ingin menghapus data guru "{guru.nama_guru}"? 
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>❌ Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(guru.id)}>
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
