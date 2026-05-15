'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { UserRole } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'buyer' as UserRole,
  });
  const [error, setError] = useState('');

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.username || !form.email || !form.password) {
      setError('Semua kolom wajib diisi.');
      return;
    }
    // Mock: just redirect to login with a success message
    router.push('/login?registered=1');
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Buat akun Feverr</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-[#3b5fa0] hover:underline">
              Masuk
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nama Lengkap"
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Budi Santoso"
            required
          />
          <Input
            label="Username"
            type="text"
            value={form.username}
            onChange={(e) => handleChange('username', e.target.value)}
            placeholder="budi_s"
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="nama@email.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Min. 8 karakter"
            required
          />

          {/* Role Toggle */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Saya mendaftar sebagai
            </label>
            <div className="flex gap-0 border border-slate-300">
              {(['buyer', 'seller', 'both'] as UserRole[]).map((r) => {
                const labels: Record<UserRole, string> = {
                  buyer: 'Pembeli',
                  seller: 'Penjual',
                  both: 'Keduanya',
                };
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleChange('role', r)}
                    className={`flex-1 py-2 text-sm font-medium border-r last:border-r-0 border-slate-300 ${
                      form.role === r
                        ? 'bg-[#3b5fa0] text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {labels[r]}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
            Buat Akun
          </Button>
        </form>
      </div>
    </div>
  );
}
