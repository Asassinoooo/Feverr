'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Gig } from '@/lib/types';
import { useApp } from '@/lib/context/AppContext';
import { GIG_CATEGORIES } from '@/lib/mock/gigs';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface GigFormProps {
  existingGig?: Gig;
}

export function GigForm({ existingGig }: GigFormProps) {
  const { data: session } = useSession();
  const { addGig, updateGig } = useApp();
  const router = useRouter();
  const userId = (session?.user as any)?.id;

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const price = Number(form.price);
    const deliveryDays = Number(form.deliveryDays);

    if (existingGig) {
      updateGig(existingGig.id, { ...form, price, deliveryDays, tags });
    } else {
      const newGig: Gig = {
        id: `gig-${Date.now()}`,
        sellerId: userId,
        title: form.title,
        description: form.description,
        category: form.category,
        tags,
        price,
        deliveryDays,
        portfolioImages: [
          `https://picsum.photos/seed/${Date.now()}/800/500`,
        ],
        isActive: form.isActive,
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      };
      addGig(newGig);
    }

    router.push('/seller/gigs');
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

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary">
          {existingGig ? 'Simpan Perubahan' : 'Buat Gig'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}
