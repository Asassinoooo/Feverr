'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gig } from '@/lib/types';
import { GIG_CATEGORIES } from '@/lib/constants';

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
    portfolioImages: existingGig?.portfolioImages || [] as string[],
  });
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        portfolioImages: [...prev.portfolioImages, data.url],
      }));
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({ ...prev, images: 'Gagal mengunggah gambar' }));
    } finally {
      setUploading(false);
    }
  }

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
          portfolioImages: form.portfolioImages
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
          portfolioImages: form.portfolioImages.length > 0 
            ? form.portfolioImages 
            : [`https://picsum.photos/seed/${Date.now()}/800/500`]
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

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Gambar Portfolio</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {form.portfolioImages.map((img, idx) => (
            <div key={idx} className="relative w-24 h-24 border border-slate-200 rounded overflow-hidden group">
              <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, portfolioImages: prev.portfolioImages.filter((_, i) => i !== idx) }))}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
          <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-[#3b5fa0] hover:bg-slate-50 transition-colors">
            <span className="text-2xl text-slate-400">+</span>
            <span className="text-xs text-slate-500">{uploading ? 'Uploading...' : 'Tambah'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
        </div>
        {errors.images && <p className="text-xs text-red-500">{errors.images}</p>}
      </div>

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
