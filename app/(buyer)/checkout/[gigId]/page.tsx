'use client';

import { use, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { fetchGig, fetchMe, createOrder } from '@/lib/api';

export default function CheckoutPage({ params }: { params: Promise<{ gigId: string }> }) {
  const { gigId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();

  const [gig, setGig] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [gigData, userData] = await Promise.all([
          fetchGig(gigId),
          fetchMe()
        ]);
        setGig({
          ...gigData,
          id: gigData.gig_id.toString(),
          sellerId: gigData.seller_id.toString(),
          portfolioImages: gigData.portfolio_images || [],
          deliveryDays: gigData.delivery_days
        });
        setBalance(Number(userData.balance));
      } catch (err) {
        console.error('Error loading checkout data:', err);
        setError('Gagal memuat data checkout.');
      } finally {
        setPageLoading(false);
      }
    };
    loadData();
  }, [gigId]);

  if (pageLoading) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-400">Memuat...</div>;
  }

  if (error || !gig) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-red-500">
        {error || 'Gig tidak ditemukan.'}
      </div>
    );
  }

  const canAfford = balance >= Number(gig.price);

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!canAfford || loading) return;
    setLoading(true);
    setError('');

    try {
      await createOrder({
        gigId: gig.id,
        buyerInstructions: instructions
      });
      setDone(true);
      setTimeout(() => router.push('/dashboard/orders'), 1500);
    } catch (err: any) {
      setError(err.message || 'Gagal membuat pesanan.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Pesanan Berhasil!</h2>
        <p className="text-slate-500 text-sm">Mengarahkan ke halaman pesanan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-xl font-bold text-slate-800 mb-6">Konfirmasi Pesanan</h1>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="bg-white border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Ringkasan</h2>
          {gig.portfolioImages[0] && (
            <div className="relative aspect-video bg-slate-100 mb-4">
              <Image
                src={gig.portfolioImages[0]}
                alt={gig.title}
                fill
                className="object-cover"
                sizes="400px"
              />
            </div>
          )}
          <h3 className="text-sm font-medium text-slate-800 mb-1">{gig.title}</h3>
          <p className="text-xs text-slate-400 mb-3">oleh {gig.seller_name}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Total</span>
            <span className="font-bold text-slate-800">{formatCurrency(gig.price)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-slate-500">Pengiriman</span>
            <span className="text-slate-600">{gig.deliveryDays} hari</span>
          </div>
        </div>

        {/* Form */}
        <div>
          <form onSubmit={handleOrder} className="flex flex-col gap-5">
            <div className="bg-white border border-slate-200 p-4">
              <div className="text-xs text-slate-500 mb-1">Saldo Anda</div>
              <div className={`text-xl font-bold ${canAfford ? 'text-slate-800' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </div>
              {!canAfford && (
                <p className="text-xs text-red-500 mt-1">
                  Saldo tidak cukup. Silakan top up di{' '}
                  <a href="/settings/wallet" className="underline">Dompet</a>.
                </p>
              )}
            </div>

            <Textarea
              label="Instruksi untuk Penjual"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Jelaskan kebutuhan Anda secara detail..."
              rows={5}
              required
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!canAfford || loading}
            >
              {loading ? 'Memproses...' : 'Konfirmasi Pesanan'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
