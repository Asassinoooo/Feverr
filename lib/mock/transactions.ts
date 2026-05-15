import { Transaction } from '@/lib/types';

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    userId: 'user-1',
    type: 'debit',
    amount: 250000,
    description: 'Pembayaran order: Desain Logo Profesional',
    relatedOrderId: 'order-1',
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'txn-2',
    userId: 'user-1',
    type: 'debit',
    amount: 150000,
    description: 'Pembayaran order: Penulisan Artikel SEO',
    relatedOrderId: 'order-2',
    createdAt: '2024-03-10T09:00:00Z',
  },
  {
    id: 'txn-3',
    userId: 'user-1',
    type: 'credit',
    amount: 1000000,
    description: 'Top up saldo',
    createdAt: '2024-02-28T08:00:00Z',
  },
  {
    id: 'txn-4',
    userId: 'user-1',
    type: 'debit',
    amount: 750000,
    description: 'Pembayaran order: Landing Page Next.js',
    relatedOrderId: 'order-3',
    createdAt: '2024-02-20T11:00:00Z',
  },
  {
    id: 'txn-5',
    userId: 'user-2',
    type: 'credit',
    amount: 212500,
    description: 'Pendapatan order: Desain Logo Profesional (setelah fee 15%)',
    relatedOrderId: 'order-1',
    createdAt: '2024-03-07T10:00:00Z',
  },
  {
    id: 'txn-6',
    userId: 'user-2',
    type: 'credit',
    amount: 500000,
    description: 'Top up saldo',
    createdAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'txn-7',
    userId: 'user-3',
    type: 'credit',
    amount: 637500,
    description: 'Pendapatan order: Landing Page Next.js (setelah fee 15%)',
    relatedOrderId: 'order-3',
    createdAt: '2024-03-05T14:00:00Z',
  },
  {
    id: 'txn-8',
    userId: 'user-3',
    type: 'debit',
    amount: 300000,
    description: 'Pembayaran order: Ilustrasi Digital Custom',
    relatedOrderId: 'order-4',
    createdAt: '2024-03-12T08:00:00Z',
  },
];

export function getTransactionsByUser(userId: string): Transaction[] {
  return mockTransactions
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
