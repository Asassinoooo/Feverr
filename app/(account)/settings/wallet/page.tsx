'use client';

import { useSession } from 'next-auth/react';
import { useApp } from '@/lib/context/AppContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Transaction } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const navItems = [
  { href: '/dashboard/orders', label: 'Pesanan Saya' },
  { href: '/settings/profile', label: 'Pengaturan Profil' },
  { href: '/settings/wallet', label: 'Dompet' },
];

export default function WalletPage() {
  const { data: session } = useSession();
  const { users, transactions, addTransaction, updateUserBalance } = useApp();
  const userId = (session?.user as any)?.id;

  const currentUser = users.find((u) => u.id === userId);
  const balance = currentUser?.balance ?? 0;
  const myTransactions = transactions
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  function handleTopUp() {
    const amount = 100000;
    const txn: Transaction = {
      id: `txn-${Date.now()}`,
      userId,
      type: 'credit',
      amount,
      description: 'Top up saldo',
      createdAt: new Date().toISOString(),
    };
    addTransaction(txn);
    updateUserBalance(userId, amount);
  }

  return (
    <DashboardLayout title="Akun" navItems={navItems}>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Dompet</h1>

      {/* Balance Card */}
      <div className="bg-[#3b5fa0] text-white p-6 mb-6 max-w-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-200 mb-2">
          Saldo Anda
        </div>
        <div className="text-3xl font-bold mb-4">{formatCurrency(balance)}</div>
        <Button
          onClick={handleTopUp}
          className="bg-white text-[#3b5fa0] hover:bg-slate-100 text-sm font-medium px-4 py-2"
        >
          + Top Up Rp100.000
        </Button>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Riwayat Transaksi</h2>
        {myTransactions.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada transaksi.</p>
        ) : (
          <div className="border border-slate-200 bg-white divide-y divide-slate-100">
            {myTransactions.map((txn) => (
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
