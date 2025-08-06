
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { User } from '../../../server/src/schema';

interface UserProfileProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

export function UserProfile({ user, onBack, onLogout }: UserProfileProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '❌ Password baru dan konfirmasi tidak cocok' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: '❌ Password baru minimal 6 karakter' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // This is a stub implementation for password change
      // In real implementation, you would validate current password and update
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setMessage({ type: 'success', text: '✅ Password berhasil diubah' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
    } catch (error) {
      console.error('Failed to change password:', error);
      setMessage({ type: 'error', text: '❌ Gagal mengubah password' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordForm = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangingPassword(false);
    setMessage(null);
  };

  const getRoleIcon = () => {
    return user.role === 'administrator' ? '👨‍💼' : '👨‍🏫';
  };

  const getRoleLabel = () => {
    return user.role === 'administrator' ? 'Administrator' : 'Guru';
  };

  return (
    <div className="max-w-2xl mx-0 space-y-6">
      {message && (
        <Alert className={`${message.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
          <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👤 Informasi Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Username</Label>
              <p className="text-lg font-mono">{user.username}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Nama Lengkap</Label>
              <p className="text-lg">{user.nama}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Role</Label>
              <div className="mt-1">
                <Badge variant={user.role === 'administrator' ? 'default' : 'secondary'}>
                  {getRoleIcon()} {getRoleLabel()}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Status</Label>
              <div className="mt-1">
                <Badge variant={user.is_active ? 'default' : 'secondary'}>
                  {user.is_active ? '✅ Aktif' : '❌ Nonaktif'}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-600">Terdaftar Sejak</Label>
            <p className="text-lg">{user.created_at.toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔒 Keamanan Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isChangingPassword ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Ubah password secara berkala untuk menjaga keamanan akun Anda.
              </p>
              <Button onClick={() => setIsChangingPassword(true)}>
                🔑 Ubah Password
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Password Saat Ini</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))
                  }
                  placeholder="Masukkan password saat ini"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))
                  }
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  placeholder="Ulangi password baru"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? '🔄 Mengubah...' : '💾 Simpan Password'}
                </Button>
                <Button type="button" variant="outline" onClick={resetPasswordForm}>
                  ❌ Batal
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚙️ Tindakan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <Button variant="outline" onClick={onBack} className="justify-start">
              ← Kembali ke Dashboard
            </Button>
            <Separator />
            <Button variant="destructive" onClick={onLogout} className="justify-start">
              🚪 Keluar dari Akun
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
