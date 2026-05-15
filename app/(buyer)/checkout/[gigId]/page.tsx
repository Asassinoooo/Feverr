'use client';

import { use, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/lib/context/AppContext';
import { formatCurrency } from '@/lib/utils';
import { Order, Transaction } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';

export default function CheckoutPage({ params }: { params: Promise<{ gigId: string }> }) {
  const { gigId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const { gigs, users, addOrder, addTransaction, updateUserBalance } = useApp();

  const gig = gigs.find((g) => g.id === gigId);
  const seller = users.find((u) => u.id === gig?.sellerId);
  const userId = (session?.user as any)?.id;
  const currentUser = users.find((u) => u.id === userId);
  const balance = currentUser?.balance ?? 0;

  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!gig) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-slate-400">
        Gig tidak ditemukan.
      </div>
    );
  }

  const canAfford = balance >= gig.price;

  function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!canAfford || loading || !gig) return;
    setLoading(true);

    const orderId = `order-${Date.now()}`;
    const now = new Date().toISOString();

    const order: Order = {
      id: orderId,
      gigId: gig.id,
      buyerId: userId,
      sellerId: gig.sellerId,
      status: 'pending',
      buyerInstructions: instructions,
      deliveryFiles: [],
      totalPrice: gig.price,
      createdAt: now,
      updatedAt: now,
    };

    const txn: Transaction = {
      id: `txn-${Date.now()}`,
      userId,
      type: 'debit',
      amount: gig.price,
      description: `Pembayaran order: ${gig.title}`,
      relatedOrderId: orderId,
      createdAt: now,
    };

    addOrder(order);
    addTransaction(txn);
    updateUserBalance(userId, -gig.price);
    setDone(true);

    setTimeout(() => router.push('/dashboard/orders'), 1500);
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
          <p className="text-xs text-slate-400 mb-3">oleh {seller?.name}</p>
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
