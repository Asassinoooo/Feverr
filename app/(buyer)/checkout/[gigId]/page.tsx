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
        setError('Your balance is insufficient to make this purchase.');
      } finally {
        setPageLoading(false);
      }
    };
    loadData();
  }, [gigId]);

  if (pageLoading) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-400">Loading...</div>;
  }

  if (error || !gig) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-red-500">
        {error || 'Gig not found.'}
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
      setError(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Order placed successfully!</h2>
        <p className="text-slate-500 text-sm">Redirecting to orders page...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-xl font-bold text-slate-800 mb-6">Confirm Purchase</h1>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="bg-white border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Service Details</h2>
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
          <div className="text-slate-500 text-xs mt-1">by {gig.seller_name}</div>
          <div className="flex items-center justify-between text-sm mt-4">
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-bold text-slate-800">{formatCurrency(gig.price)}</div>
              <div className="text-xs text-slate-400 mt-1">{gig.deliveryDays} Days Delivery</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div>
          <form onSubmit={handleOrder} className="flex flex-col gap-5">
            <div className="bg-white border border-slate-200 p-4">
              <div className="text-xs text-slate-500 mb-1">Your Wallet Balance</div>
              <div className={`text-xl font-bold ${canAfford ? 'text-slate-800' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </div>
              {!canAfford && (
                <p className="text-xs text-red-500 mt-1">
                  Insufficient balance. Please top up your {' '}
                  <a href="/settings/wallet" className="underline">Wallet</a>.
                </p>
              )}
            </div>

            <Textarea
              label="Instructions for Seller"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Describe your detailed requirements, files to be submitted, format, etc..."
              rows={5}
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 p-3 text-sm text-red-600 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!canAfford || loading}
            >
              {loading ? 'Processing Transaction...' : 'Pay Now'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
