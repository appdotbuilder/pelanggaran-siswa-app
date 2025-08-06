
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
import type { Kelas, CreateKelasInput, UpdateKelasInput } from '../../../server/src/schema';

interface DataKelasProps {
  canEdit: boolean;
}

export function DataKelas({ canEdit }: DataKelasProps) {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<CreateKelasInput>({
    nomor: 0,
    rombel: '7',
    nama_kelas: ''
  });

  const loadKelas = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await trpc.getKelas.query();
      setKelasList(data);
    } catch (error) {
      console.error('Failed to load kelas:', error);
      // Set sample data for development
      setKelasList([
        { id: 1, nomor: 1, rombel: '7', nama_kelas: 'VII A', created_at: new Date(), updated_at: null },
        { id: 2, nomor: 2, rombel: '7', nama_kelas: 'VII B', created_at: new Date(), updated_at: null },
        { id: 3, nomor: 3, rombel: '8', nama_kelas: 'VIII A', created_at: new Date(), updated_at: null },
        { id: 4, nomor: 4, rombel: '9', nama_kelas: 'IX A', created_at: new Date(), updated_at: null }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKelas();
  }, [loadKelas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (editingKelas) {
        const updateData: UpdateKelasInput = {
          id: editingKelas.id,
          ...formData
        };
        await trpc.updateKelas.mutate(updateData);
        setMessage({ type: 'success', text: '✅ Kelas berhasil diperbarui' });
      } else {
        await trpc.createKelas.mutate(formData);
        setMessage({ type: 'success', text: '✅ Kelas berhasil ditambahkan' });
      }
      
      await loadKelas();
      resetForm();
    } catch (error) {
      console.error('Failed to save kelas:', error);
      setMessage({ type: 'error', text: '❌ Gagal menyimpan kelas' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (kelas: Kelas) => {
    setEditingKelas(kelas);
    setFormData({
      nomor: kelas.nomor,
      rombel: kelas.rombel,
      nama_kelas: kelas.nama_kelas
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await trpc.deleteKelas.mutate({ id });
      setMessage({ type: 'success', text: '✅ Kelas berhasil dihapus' });
      await loadKelas();
    } catch (error) {
      console.error('Failed to delete kelas:', error);
      setMessage({ type: 'error', text: '❌ Gagal menghapus kelas' });
    }
  };

  const resetForm = () => {
    setFormData({
      nomor: 0,
      rombel: '7',
      nama_kelas: ''
    });
    setEditingKelas(null);
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
        <h3 className="text-lg font-semibold">🏫 Data Kelas</h3>
        {canEdit && (
          <div className="space-x-2">
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  ➕ Tambah Kelas
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingKelas ? '✏️ Edit Kelas' : '➕ Tambah Kelas Baru'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomor">Nomor Kelas</Label>
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
                    <Label>Rombel</Label>
                    <Select value={formData.rombel || '7'} onValueChange={(value: '7' | '8' | '9') => 
                      setFormData(prev => ({ ...prev, rombel: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 (Kelas 7)</SelectItem>
                        <SelectItem value="8">8 (Kelas 8)</SelectItem>
                        <SelectItem value="9">9 (Kelas 9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nama_kelas">Nama Kelas</Label>
                    <Input
                      id="nama_kelas"
                      type="text"
                      value={formData.nama_kelas}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData(prev => ({ ...prev, nama_kelas: e.target.value }))
                      }
                      placeholder="Contoh: VII A"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? '🔄' : '💾'} {editingKelas ? 'Update' : 'Simpan'}
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
              <TableHead>Rombel</TableHead>
              <TableHead>Nama Kelas</TableHead>
              <TableHead>Dibuat</TableHead>
              {canEdit && <TableHead>Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {kelasList.map((kelas, index) => (
              <TableRow key={kelas.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{kelas.nomor}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {kelas.rombel}
                  </span>
                </TableCell>
                <TableCell className="font-medium">🏫 {kelas.nama_kelas}</TableCell>
                <TableCell>{kelas.created_at.toLocaleDateString()}</TableCell>
                {canEdit && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(kelas)}
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
                              Apakah Anda yakin ingin menghapus kelas "{kelas.nama_kelas}"? 
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>❌ Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(kelas.id)}>
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
