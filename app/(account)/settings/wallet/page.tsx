'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { fetchMe, fetchTransactions, topUp } from '@/lib/api';

const navItems = [
  { href: '/dashboard/orders', label: 'My Orders' },
  { href: '/settings/profile', label: 'Profile Settings' },
  { href: '/settings/wallet', label: 'Wallet' },
];

export default function WalletPage() {
  const { data: session } = useSession();
  const [rupiahBalance, setRupiahBalance] = useState(0);
  const [jigsawBalance, setJigsawBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [swapAmount, setSwapAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState('');

  const globalUserId = (session?.user as any)?.globalUserId;

  const [swapDirection, setSwapDirection] = useState<'jgc_to_idr' | 'idr_to_jgc'>('jgc_to_idr');

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Wallet Info (Rupiah + JGC from Server-side)
      const infoRes = await fetch('/api/wallet/info');
      if (infoRes.ok) {
        const info = await infoRes.json();
        setRupiahBalance(info.rupiahBalance);
        setJigsawBalance(info.jigsawBalance);
      }

      // 2. Fetch Feverr Transactions
      const txns = await fetchTransactions();
      setTransactions(txns.map((t: any) => ({
        ...t,
        id: t.transaction_id.toString(),
        createdAt: t.created_at
      })));
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) loadData();
  }, [session, globalUserId]);

  async function handleSwap(e: React.FormEvent) {
    e.preventDefault();
    if (!swapAmount || swapping) return;
    
    setSwapping(true);
    setError('');
    try {
      const res = await fetch('/api/wallet/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: swapAmount,
          direction: swapDirection
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to perform swap');
      
      setSwapAmount('');
      await loadData();
      
      const message = swapDirection === 'jgc_to_idr' 
        ? `Successfully swapped ${data.swapped} JGC to ${formatCurrency(data.received)}`
        : `Successfully swapped ${formatCurrency(data.swapped)} to ${data.received} JGC`;
        
      alert(message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSwapping(false);
    }
  }

  return (
    <DashboardLayout title="Account" navItems={navItems}>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Wallet & Balance</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Rupiah Balance (Main) */}
        <div className="bg-white border border-slate-200 p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Rupiah Balance (Feverr)
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-4">
            {formatCurrency(rupiahBalance)}
          </div>
          <p className="text-xs text-slate-500 italic">
            This balance is used for all service transactions on Feverr.
          </p>
        </div>

        {/* JigsawCoin Balance */}
        <div className="bg-slate-50 border border-slate-200 p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#3b5fa0] mb-2">
            JigsawCoin Balance (External)
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-2">
            {jigsawBalance.toLocaleString()} JGC
          </div>
          <p className="text-xs text-slate-400">
            JGC is obtained from external services. Swap to Rupiah to shop.
          </p>
        </div>
      </div>

      {/* Swap Section */}
      <div className="bg-white border border-[#3b5fa0]/20 p-6 mb-8 max-w-xl border-l-4 border-l-[#3b5fa0]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            🔄 Swap Balance
          </h2>
          <div className="flex bg-slate-100 p-1 rounded-md">
            <button
              onClick={() => { setSwapDirection('jgc_to_idr'); setSwapAmount(''); setError(''); }}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded ${swapDirection === 'jgc_to_idr' ? 'bg-white text-[#3b5fa0] shadow-sm' : 'text-slate-400'}`}
            >
              JGC → IDR
            </button>
            <button
              onClick={() => { setSwapDirection('idr_to_jgc'); setSwapAmount(''); setError(''); }}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded ${swapDirection === 'idr_to_jgc' ? 'bg-white text-[#3b5fa0] shadow-sm' : 'text-slate-400'}`}
            >
              IDR → JGC
            </button>
          </div>
        </div>

        <form onSubmit={handleSwap} className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">
                {swapDirection === 'jgc_to_idr' ? 'JGC Amount' : 'Rupiah Amount'}
              </label>
              <input
                type="number"
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
                placeholder="0"
                className="w-full border border-slate-200 px-3 py-2 text-sm focus:outline-[#3b5fa0]"
                min={swapDirection === 'jgc_to_idr' ? '0.01' : '10'}
                step={swapDirection === 'jgc_to_idr' ? '0.01' : '10'}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">
                Estimated Received
              </label>
              <div className="w-full bg-slate-50 border border-slate-100 px-3 py-2 text-sm text-slate-500 font-medium">
                {swapDirection === 'jgc_to_idr' 
                  ? (swapAmount ? formatCurrency(Math.round(parseFloat(swapAmount) * 1000)) : 'Rp0')
                  : (swapAmount ? (parseFloat(swapAmount) / 1000).toFixed(2) + ' JGC' : '0.00 JGC')
                }
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            disabled={swapping || !swapAmount}
            className="w-full"
          >
            {swapping ? 'Processing Swap...' : (
              swapDirection === 'jgc_to_idr' ? 'Swap to Rupiah' : 'Swap to JigsawCoin'
            )}
          </Button>
          <p className="text-[10px] text-center text-slate-400 uppercase tracking-tight">
            Fixed Rate: 1 JigsawCoin = Rp1,000
          </p>
        </form>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Rupiah Transaction History</h2>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-slate-400">No transactions yet.</p>
        ) : (
          <div className="border border-slate-200 bg-white divide-y divide-slate-100">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm text-slate-700">{txn.description}</p>
                  <p className="text-xs text-slate-400">{formatDate(txn.createdAt)}</p>
                </div>
                <div
                  className={`text-sm font-semibold ${
                    txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
