
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataKelas } from '@/components/DataKelas';
import { DataGuru } from '@/components/DataGuru';
import { DataSiswa } from '@/components/DataSiswa';
import { DataPelanggaranComponent } from '@/components/DataPelanggaranComponent';
import type { User } from '../../../server/src/schema';

interface DataMasterProps {
  currentUser: User;
}

export function DataMaster({ currentUser }: DataMasterProps) {
  const [activeTab, setActiveTab] = useState('kelas');

  const canEdit = currentUser.role === 'administrator';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 Data Master
          </CardTitle>
          {!canEdit && (
            <p className="text-sm text-amber-600">
              ⚠️ Anda hanya memiliki akses baca untuk data master
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="kelas" className="flex items-center gap-2">
                🏫 Data Kelas
              </TabsTrigger>
              <TabsTrigger value="guru" className="flex items-center gap-2">
                👨‍🏫 Data Guru
              </TabsTrigger>
              <TabsTrigger value="siswa" className="flex items-center gap-2">
                👨‍🎓 Data Siswa
              </TabsTrigger>
              <TabsTrigger value="pelanggaran" className="flex items-center gap-2">
                ⚠️ Data Pelanggaran
              </TabsTrigger>
            </TabsList>

            <TabsContent value="kelas">
              <DataKelas canEdit={canEdit} />
            </TabsContent>

            <TabsContent value="guru">
              <DataGuru canEdit={canEdit} />
            </TabsContent>

            <TabsContent value="siswa">
              <DataSiswa canEdit={canEdit} />
            </TabsContent>

            <TabsContent value="pelanggaran">
              <DataPelanggaranComponent canEdit={canEdit} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
