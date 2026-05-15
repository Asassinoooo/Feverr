'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gig } from '@/lib/types';
import { GIG_CATEGORIES } from '@/lib/mock/gigs';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createGig, updateGig } from '@/lib/api';

interface GigFormProps {
  existingGig?: Gig;
}

export function GigForm({ existingGig }: GigFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: existingGig?.title || '',
    category: existingGig?.category || GIG_CATEGORIES[0],
    description: existingGig?.description || '',
    price: existingGig?.price?.toString() || '',
    deliveryDays: existingGig?.deliveryDays?.toString() || '',
    tags: existingGig?.tags?.join(', ') || '',
    isActive: existingGig?.isActive ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Judul wajib diisi';
    if (!form.description.trim()) e.description = 'Deskripsi wajib diisi';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Harga harus angka positif';
    if (!form.deliveryDays || isNaN(Number(form.deliveryDays)) || Number(form.deliveryDays) <= 0) e.deliveryDays = 'Hari pengiriman harus angka positif';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || loading) return;

    setLoading(true);
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const price = Number(form.price);
    const deliveryDays = Number(form.deliveryDays);

    try {
      if (existingGig) {
        await updateGig(existingGig.id, { 
          title: form.title,
          category: form.category,
          description: form.description,
          price, 
          deliveryDays, 
          tags,
          isActive: form.isActive,
          portfolioImages: existingGig.portfolioImages // Keep existing
        });
      } else {
        await createGig({
          title: form.title,
          category: form.category,
          description: form.description,
          price,
          deliveryDays,
          tags,
          isActive: form.isActive,
          portfolioImages: [
            `https://picsum.photos/seed/${Date.now()}/800/500`,
          ]
        });
      }
      router.push('/seller/gigs');
      router.refresh();
    } catch (err) {
      console.error('Error saving gig:', err);
      setErrors({ global: 'Gagal menyimpan gig.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl">
      <Input
        label="Judul Gig"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Contoh: Desain Logo Profesional untuk Brand Anda"
        error={errors.title}
      />

      <Select
        label="Kategori"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        options={GIG_CATEGORIES.map((c) => ({ value: c, label: c }))}
      />

      <Textarea
        label="Deskripsi"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Jelaskan jasa Anda secara detail..."
        rows={6}
        error={errors.description}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Harga (Rp)"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="150000"
          min={1000}
          error={errors.price}
        />
        <Input
          label="Hari Pengiriman"
          type="number"
          value={form.deliveryDays}
          onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })}
          placeholder="5"
          min={1}
          error={errors.deliveryDays}
        />
      </div>

      <Input
        label="Tag (pisahkan dengan koma)"
        value={form.tags}
        onChange={(e) => setForm({ ...form, tags: e.target.value })}
        placeholder="logo, branding, desain grafis"
      />

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isActive"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          className="accent-[#3b5fa0]"
        />
        <label htmlFor="isActive" className="text-sm text-slate-700">
          Aktifkan gig ini
        </label>
      </div>

      {errors.global && <p className="text-sm text-red-500">{errors.global}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Menyimpan...' : (existingGig ? 'Simpan Perubahan' : 'Buat Gig')}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()} disabled={loading}>
          Batal
        </Button>
      </div>
    </form>
  );
}
