
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import type { PengaturanInstansi, UpdatePengaturanInstansiInput } from '../../../server/src/schema';

interface PengaturanInstansiProps {
  institutionSettings: PengaturanInstansi | null;
  onSettingsUpdate: (settings: PengaturanInstansi) => void;
}

export function PengaturanInstansi({ institutionSettings, onSettingsUpdate }: PengaturanInstansiProps) {
  const [formData, setFormData] = useState<UpdatePengaturanInstansiInput>({
    nama_instansi: '',
    alamat: '',
    nama_kepala_sekolah: '',
    website: '',
    email: '',
    logo_sekolah: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (institutionSettings) {
      setFormData({
        nama_instansi: institutionSettings.nama_instansi,
        alamat: institutionSettings.alamat,
        nama_kepala_sekolah: institutionSettings.nama_kepala_sekolah,
        website: institutionSettings.website,
        email: institutionSettings.email,
        logo_sekolah: institutionSettings.logo_sekolah
      });
    }
  }, [institutionSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const updatedSettings = await trpc.updatePengaturanInstansi.mutate(formData);
      // Create complete settings object by merging existing data with updates
      const completeSettings: PengaturanInstansi = {
        ...updatedSettings,
        id: institutionSettings?.id || 1,
        created_at: institutionSettings?.created_at || new Date(),
        updated_at: new Date()
      };
      
      onSettingsUpdate(completeSettings);
      setMessage({ type: 'success', text: '✅ Pengaturan instansi berhasil diperbarui' });
    } catch (error) {
      console.error('Failed to update institution settings:', error);
      setMessage({ type: 'error', text: '❌ Gagal menyimpan pengaturan instansi' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setMessage({ type: 'error', text: 'Ukuran file maksimal 2MB' });
        return;
      }
      
      // In real implementation, you would upload the file and get the URL
      // For demonstration, we'll just use a URL
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, logo_sekolah: imageUrl }));
    }
  };

  const resetForm = () => {
    if (institutionSettings) {
      setFormData({
        nama_instansi: institutionSettings.nama_instansi,
        alamat: institutionSettings.alamat,
        nama_kepala_sekolah: institutionSettings.nama_kepala_sekolah,
        website: institutionSettings.website,
        email: institutionSettings.email,
        logo_sekolah: institutionSettings.logo_sekolah
      });
    }
    setMessage(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏢 Pengaturan Instansi
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
            <div className="space-y-2">
              <Label htmlFor="nama_instansi">🏫 Nama Instansi</Label>
              <Input
                id="nama_instansi"
                type="text"
                value={formData.nama_instansi || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData(prev => ({ ...prev, nama_instansi: e.target.value }))
                }
                placeholder="Nama lengkap sekolah"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama_kepala_sekolah">👨‍💼 Nama Kepala Sekolah</Label>
              <Input
                id="nama_kepala_sekolah"
                type="text"
                value={formData.nama_kepala_sekolah || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData(prev => ({ ...prev, nama_kepala_sekolah: e.target.value }))
                }
                placeholder="Nama lengkap kepala sekolah"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">📍 Alamat</Label>
            <Textarea
              id="alamat"
              value={formData.alamat || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData(prev => ({ ...prev, alamat: e.target.value }))
              }
              placeholder="Alamat lengkap sekolah"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="website">🌐 Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData(prev => ({ ...prev, website: e.target.value || null }))
                }
                placeholder="https://www.example.sch.id"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">📧 Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData(prev => ({ ...prev, email: e.target.value || null }))
                }
                placeholder="info@example.sch.id"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">🖼️ Logo Sekolah</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <p className="text-xs text-gray-500">
              Format: JPG, PNG, GIF. Maksimal 2MB
            </p>
            {formData.logo_sekolah && (
              <div className="mt-2">
                <img 
                  src={formData.logo_sekolah} 
                  alt="Preview logo" 
                  className="w-16 h-16 object-contain border rounded"
                />
                <p className="text-sm text-green-600 mt-1">
                  ✅ Logo berhasil dipilih
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '🔄 Menyimpan...' : '💾 Simpan Pengaturan'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              🔄 Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
