'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useApp } from '@/lib/context/AppContext';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const navItems = [
  { href: '/dashboard/orders', label: 'Pesanan Saya' },
  { href: '/settings/profile', label: 'Pengaturan Profil' },
  { href: '/settings/wallet', label: 'Dompet' },
];

export default function ProfileSettingsPage() {
  const { data: session } = useSession();
  const { users, updateUserBalance } = useApp();
  const userId = (session?.user as any)?.id;

  const currentUser = users.find((u) => u.id === userId);

  const [form, setForm] = useState({
    name: currentUser?.name || '',
    bio: currentUser?.bio || '',
    avatarUrl: currentUser?.avatarUrl || '',
  });
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In a real app, we'd update via API. Here we just show success state.
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <DashboardLayout title="Akun" navItems={navItems}>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Pengaturan Profil</h1>

      <div className="flex flex-col gap-6 max-w-lg">
        {/* Avatar Preview */}
        <div className="flex items-center gap-4">
          <Avatar src={form.avatarUrl || null} name={form.name || 'User'} size={64} />
          <div>
            <p className="text-sm font-medium text-slate-700">Foto Profil</p>
            <p className="text-xs text-slate-400">Masukkan URL gambar di bawah</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nama Lengkap"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Textarea
            label="Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Ceritakan tentang diri Anda..."
            rows={3}
          />
          <Input
            label="URL Avatar"
            type="url"
            value={form.avatarUrl}
            onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
            placeholder="https://example.com/avatar.jpg"
          />

          {saved && (
            <div className="bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              Profil berhasil disimpan!
            </div>
          )}

          <Button type="submit" variant="primary">Simpan Profil</Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
