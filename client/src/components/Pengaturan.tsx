
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PengaturanInstansi } from '@/components/PengaturanInstansi';
import { PengaturanPengguna } from '@/components/PengaturanPengguna';
import type { User, PengaturanInstansi as PengaturanInstansiType } from '../../../server/src/schema';

interface PengaturanProps {
  currentUser: User;
  institutionSettings: PengaturanInstansiType | null;
  onSettingsUpdate: (settings: PengaturanInstansiType) => void;
}

export function Pengaturan({ currentUser, institutionSettings, onSettingsUpdate }: PengaturanProps) {
  const [activeTab, setActiveTab] = useState('instansi');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚙️ Pengaturan Aplikasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="instansi" className="flex items-center gap-2">
                🏢 Pengaturan Instansi
              </TabsTrigger>
              <TabsTrigger value="pengguna" className="flex items-center gap-2">
                👥 Pengaturan Pengguna
              </TabsTrigger>
            </TabsList>

            <TabsContent value="instansi">
              <PengaturanInstansi 
                institutionSettings={institutionSettings}
                onSettingsUpdate={onSettingsUpdate}
              />
            </TabsContent>

            <TabsContent value="pengguna">
              <PengaturanPengguna currentUser={currentUser} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
