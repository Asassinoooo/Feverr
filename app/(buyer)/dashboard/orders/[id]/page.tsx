'use client';

import { use, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { ChatBox } from '@/components/order/ChatBox';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Message, Review, OrderStatus } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const STEPS: OrderStatus[] = ['pending', 'in_progress', 'delivered', 'completed'];

const navItems = [
  { href: '/dashboard/orders', label: 'Pesanan Saya' },
  { href: '/settings/profile', label: 'Pengaturan Profil' },
  { href: '/settings/wallet', label: 'Dompet' },
];

export default function BuyerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const { orders, gigs, users, messages, reviews, addMessage, addReview, updateOrderStatus } = useApp();

  const order = orders.find((o) => o.id === id);
  const gig = gigs.find((g) => g.id === order?.gigId);
  const seller = users.find((u) => u.id === order?.sellerId);
  const orderMessages = messages.filter((m) => m.orderId === id);
  const existingReview = reviews.find((r) => r.orderId === id);

  const userId = (session?.user as any)?.id;

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!order) {
    return <div className="p-8 text-slate-400 text-sm">Pesanan tidak ditemukan.</div>;
  }

  const currentStepIndex = STEPS.indexOf(order.status as OrderStatus);

  function handleSendMessage(content: string) {
    const msg: Message = {
      id: `msg-${Date.now()}`,
      orderId: id,
      senderId: userId,
      content,
      createdAt: new Date().toISOString(),
    };
    addMessage(msg);
  }

  function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (existingReview || reviewSubmitted) return;
    const review: Review = {
      id: `review-${Date.now()}`,
      orderId: id,
      gigId: order!.gigId,
      buyerId: userId,
      sellerId: order!.sellerId,
      rating: reviewRating as 1 | 2 | 3 | 4 | 5,
      comment: reviewComment,
      createdAt: new Date().toISOString(),
    };
    addReview(review);
    updateOrderStatus(id, 'completed');
    setReviewSubmitted(true);
  }

  return (
    <DashboardLayout title="Pembeli" navItems={navItems}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/orders" className="text-sm text-[#3b5fa0] hover:underline">← Kembali</Link>
        <h1 className="text-xl font-bold text-slate-800">Detail Pesanan</h1>
      </div>

      {/* Status Timeline */}
      <div className="bg-white border border-slate-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Status Pesanan</h2>
        <div className="flex items-center">
          {STEPS.map((step, i) => {
            const done = i <= currentStepIndex;
            const labels: Record<string, string> = {
              pending: 'Menunggu',
              in_progress: 'Dikerjakan',
              delivered: 'Terkirim',
              completed: 'Selesai',
            };
            return (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      done ? 'bg-[#3b5fa0] text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs text-slate-500 mt-1 text-center">{labels[step]}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 -mt-4 ${done && i < currentStepIndex ? 'bg-[#3b5fa0]' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white border border-slate-200 p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{gig?.title}</h3>
            <p className="text-xs text-slate-400 mt-1">oleh {seller?.name}</p>
            <p className="text-xs text-slate-400">Dipesan: {formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-slate-800">{formatCurrency(order.totalPrice)}</div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
        {order.buyerInstructions && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-1">Instruksi Anda:</p>
            <p className="text-sm text-slate-600">{order.buyerInstructions}</p>
          </div>
        )}
      </div>

      {/* Delivered files */}
      {order.status === 'delivered' && order.deliveryFiles.length > 0 && (
        <div className="bg-white border border-slate-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">File Dikirim</h3>
          {order.deliveryFiles.map((f) => (
            <div key={f} className="flex items-center gap-2 py-2 border-b border-slate-100 last:border-b-0">
              <span className="text-slate-400">📎</span>
              <span className="text-sm text-slate-700 flex-1">{f}</span>
              <button className="text-xs text-[#3b5fa0] hover:underline">Unduh</button>
            </div>
          ))}
        </div>
      )}

      {/* Review Form */}
      {(order.status === 'delivered' || order.status === 'completed') && !existingReview && !reviewSubmitted && (
        <div className="bg-white border border-slate-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Beri Ulasan</h3>
          <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-slate-600 block mb-2">Rating</label>
              <StarRating
                rating={reviewRating}
                size="lg"
                interactive
                onChange={(r) => setReviewRating(r)}
              />
            </div>
            <Textarea
              label="Komentar"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Bagikan pengalaman Anda..."
              rows={3}
              required
            />
            <Button type="submit" variant="primary" size="md">
              Kirim Ulasan & Selesaikan
            </Button>
          </form>
        </div>
      )}

      {(reviewSubmitted || (existingReview && order.status !== 'delivered')) && (
        <div className="bg-green-50 border border-green-200 p-4 mb-6 text-sm text-green-700">
          Terima kasih telah memberikan ulasan!
        </div>
      )}

      {/* Chat */}
      <ChatBox
        messages={orderMessages}
        users={users}
        currentUserId={userId}
        onSend={handleSendMessage}
      />
    </DashboardLayout>
  );
}
