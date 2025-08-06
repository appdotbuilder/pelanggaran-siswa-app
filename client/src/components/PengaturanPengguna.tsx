
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
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/utils/trpc';
import type { User, CreateUserInput, UpdateUserInput, UserRole } from '../../../server/src/schema';

interface PengaturanPenggunaProps {
  currentUser: User;
}

export function PengaturanPengguna({ currentUser }: PengaturanPenggunaProps) {
  const [userList, setUserList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<CreateUserInput>({
    username: '',
    password: '',
    nama: '',
    role: 'guru',
    is_active: true
  });

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await trpc.getUsers.query();
      setUserList(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      // Set sample data for development
      setUserList([
        { 
          id: 1, 
          username: 'admin', 
          password_hash: 'hash', 
          nama: 'Administrator', 
          role: 'administrator', 
          is_active: true,
          created_at: new Date(), 
          updated_at: null 
        },
        { 
          id: 2, 
          username: 'guru1', 
          password_hash: 'hash', 
          nama: 'Budi Santoso', 
          role: 'guru', 
          is_active: true,
          created_at: new Date(), 
          updated_at: null 
        },
        { 
          id: 3, 
          username: 'guru2', 
          password_hash: 'hash', 
          nama: 'Siti Aminah', 
          role: 'guru', 
          is_active: true,
          created_at: new Date(), 
          updated_at: null 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (editingUser) {
        const updateData: UpdateUserInput = {
          id: editingUser.id,
          username: formData.username,
          nama: formData.nama,
          role: formData.role,
          is_active: formData.is_active,
          ...(formData.password && { password: formData.password })
        };
        await trpc.updateUser.mutate(updateData);
        setMessage({ type: 'success', text: '✅ Data pengguna berhasil diperbarui' });
      } else {
        await trpc.createUser.mutate(formData);
        setMessage({ type: 'success', text: '✅ Pengguna berhasil ditambahkan' });
      }
      
      await loadUsers();
      resetForm();
    } catch (error) {
      console.error('Failed to save user:', error);
      setMessage({ type: 'error', text: '❌ Gagal menyimpan data pengguna' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't populate password for security
      nama: user.nama,
      role: user.role,
      is_active: user.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (id === currentUser.id) {
      setMessage({ type: 'error', text: '❌ Tidak dapat menghapus akun sendiri' });
      return;
    }

    try {
      await trpc.deleteUser.mutate({ id });
      setMessage({ type: 'success', text: '✅ Pengguna berhasil dihapus' });
      await loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      setMessage({ type: 'error', text: '❌ Gagal menghapus pengguna' });
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      nama: '',
      role: 'guru',
      is_active: true
    });
    setEditingUser(null);
    setShowForm(false);
    setMessage(null);
  };

  const getRoleIcon = (role: UserRole) => {
    return role === 'administrator' ? '👨‍💼' : '👨‍🏫';
  };

  const getRoleBadge = (role: UserRole) => {
    return role === 'administrator' ? 'default' : 'secondary';
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
        <h3 className="text-lg font-semibold">👥 Data Pengguna</h3>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              ➕ Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? '✏️ Edit Pengguna' : '➕ Tambah Pengguna Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData(prev => ({ ...prev, username: e.target.value }))
                  }
                  placeholder="Username untuk login"
                  minLength={3}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password {editingUser && '(kosongkan jika tidak diubah)'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData(prev => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                  required={!editingUser}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  type="text"
                  value={formData.nama}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData(prev => ({ ...prev, nama: e.target.value }))
                  }
                  placeholder="Nama lengkap pengguna"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select 
                  value={formData.role || 'guru'} 
                  onValueChange={(value: UserRole) => 
                    setFormData(prev => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrator">👨‍💼 Administrator</SelectItem>
                    <SelectItem value="guru">👨‍🏫 Guru</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, is_active: checked }))
                  }
                />
                <Label htmlFor="is_active">Aktif</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? '🔄' : '💾'} {editingUser ? 'Update' : 'Simpan'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  ❌ Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-4">🔄 Memuat data...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userList.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium font-mono">{user.username}</TableCell>
                <TableCell className="font-medium">
                  {getRoleIcon(user.role)} {user.nama}
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadge(user.role)}>
                    {user.role === 'administrator' ? 'Administrator' : 'Guru'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? 'default' : 'secondary'}>
                    {user.is_active ? '✅ Aktif' : '❌ Nonaktif'}
                  </Badge>
                </TableCell>
                <TableCell>{user.created_at.toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      ✏️ Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          disabled={user.id === currentUser.id}
                        >
                          🗑️ Hapus
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus pengguna "{user.nama}"? 
                            Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>❌ Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(user.id)}>
                            🗑️ Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
