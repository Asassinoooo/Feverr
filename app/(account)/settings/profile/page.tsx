'use client';

import { useState, useEffect } from 'react';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { fetchMe, updateProfile } from '@/lib/api';

const navItems = [
  { href: '/dashboard/orders', label: 'Pesanan Saya' },
  { href: '/settings/profile', label: 'Pengaturan Profil' },
  { href: '/settings/wallet', label: 'Dompet' },
];

export default function ProfileSettingsPage() {
  const [form, setForm] = useState({
    name: '',
    bio: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchMe();
        setForm({
          name: data.name || '',
          bio: data.bio || '',
          avatarUrl: data.avatar_url || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-slate-400">Memuat...</div>;

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

          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Profil'}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
