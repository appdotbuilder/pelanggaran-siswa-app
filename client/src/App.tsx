
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dashboard } from '@/components/Dashboard';
import { InputPelanggaran } from '@/components/InputPelanggaran';
import { DataMaster } from '@/components/DataMaster';
import { Pengaturan } from '@/components/Pengaturan';
import { UserProfile } from '@/components/UserProfile';
import { LoginForm } from '@/components/LoginForm';
import { trpc } from '@/utils/trpc';
import type { User, PengaturanInstansi } from '../../server/src/schema';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [institutionSettings, setInstitutionSettings] = useState<PengaturanInstansi | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserProfile, setShowUserProfile] = useState(false);

  const loadInstitutionSettings = useCallback(async () => {
    try {
      const settings = await trpc.getPengaturanInstansi.query();
      setInstitutionSettings(settings);
    } catch (error) {
      console.error('Failed to load institution settings:', error);
      // Set default settings for initial display
      setInstitutionSettings({
        id: 1,
        nama_instansi: 'SMP Negeri 1 Jakarta',
        alamat: 'Jl. Pendidikan No. 123, Jakarta',
        nama_kepala_sekolah: 'Drs. Ahmad Suryadi, M.Pd',
        website: 'www.smpn1jakarta.sch.id',
        email: 'info@smpn1jakarta.sch.id',
        logo_sekolah: null,
        created_at: new Date(),
        updated_at: null
      });
    }
  }, []);

  useEffect(() => {
    loadInstitutionSettings();
  }, [loadInstitutionSettings]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLogin(true);
    setActiveTab('dashboard');
    setShowUserProfile(false);
  };

  // Demo login for development purposes
  const handleDemoLogin = (role: 'administrator' | 'guru') => {
    const demoUser: User = {
      id: role === 'administrator' ? 1 : 2,
      username: role === 'administrator' ? 'admin' : 'guru1',
      password_hash: 'demo_hash',
      nama: role === 'administrator' ? 'Administrator' : 'Budi Santoso',
      role: role,
      is_active: true,
      created_at: new Date(),
      updated_at: null
    };
    handleLogin(demoUser);
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {institutionSettings?.logo_sekolah && (
              <img 
                src={institutionSettings.logo_sekolah} 
                alt="Logo Sekolah" 
                className="w-16 h-16 mx-auto mb-4"
              />
            )}
            <CardTitle className="text-2xl font-bold text-gray-800">
              📚 Sistem Pencatatan Pelanggaran
            </CardTitle>
            <CardDescription>
              {institutionSettings?.nama_instansi || 'Sekolah Menengah Pertama'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginForm onLogin={handleLogin} />
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Demo Login:</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDemoLogin('administrator')}
                  className="flex-1"
                >
                  👨‍💼 Admin
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDemoLogin('guru')}
                  className="flex-1"
                >
                  👨‍🏫 Guru
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showUserProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowUserProfile(false)}
                >
                  ← Kembali
                </Button>
                <h1 className="text-xl font-semibold">👤 Profil Pengguna</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto p-4">
          <UserProfile 
            user={currentUser!} 
            onBack={() => setShowUserProfile(false)}
            onLogout={handleLogout}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {institutionSettings?.logo_sekolah && (
                <img 
                  src={institutionSettings.logo_sekolah} 
                  alt="Logo" 
                  className="w-8 h-8"
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  📚 Sistem Pencatatan Pelanggaran
                </h1>
                <p className="text-sm text-gray-600">
                  {institutionSettings?.nama_instansi}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                👋 Halo, {currentUser?.nama}
                <span className="ml-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {currentUser?.role === 'administrator' ? '👨‍💼 Admin' : '👨‍🏫 Guru'}
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserProfile(true)}
              >
                👤 Profil
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                🚪 Keluar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              📊 Dashboard
            </TabsTrigger>
            <TabsTrigger value="input" className="flex items-center gap-2">
              ✍️ Input Pelanggaran
            </TabsTrigger>
            <TabsTrigger value="master" className="flex items-center gap-2">
              📋 Data Master
            </TabsTrigger>
            {currentUser?.role === 'administrator' && (
              <TabsTrigger value="settings" className="flex items-center gap-2">
                ⚙️ Pengaturan
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="input">
            <InputPelanggaran currentUser={currentUser!} />
          </TabsContent>

          <TabsContent value="master">
            <DataMaster currentUser={currentUser!} />
          </TabsContent>

          {currentUser?.role === 'administrator' && (
            <TabsContent value="settings">
              <Pengaturan 
                currentUser={currentUser!} 
                institutionSettings={institutionSettings}
                onSettingsUpdate={setInstitutionSettings}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

export default App;
