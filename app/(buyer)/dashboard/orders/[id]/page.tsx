'use client';

import { use, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { ChatBox } from '@/components/order/ChatBox';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { OrderStatus } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { fetchOrder, fetchMessages, sendMessage as apiSendMessage, fetchReviews, createReview as apiCreateReview } from '@/lib/api';

const STEPS: OrderStatus[] = ['pending', 'in_progress', 'delivered', 'completed'];

const navItems = [
  { href: '/dashboard/orders', label: 'My Orders' },
  { href: '/settings/profile', label: 'Profile Settings' },
  { href: '/settings/wallet', label: 'Wallet' },
];

export default function BuyerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const userId = (session?.user as any)?.id;

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const loadData = async () => {
    try {
      const orderData = await fetchOrder(id);
      setOrder({
        ...orderData,
        id: orderData.order_id.toString(),
        totalPrice: parseFloat(orderData.total_price),
        createdAt: orderData.created_at,
        deliveryFiles: orderData.delivery_files || [],
        buyerInstructions: orderData.buyer_instructions
      });

      const messagesData = await fetchMessages(id);
      setMessages(messagesData.map((m: any) => ({
        ...m,
        id: m.message_id.toString(),
        senderId: m.sender_id.toString(),
        createdAt: m.created_at
      })));

      const reviewsData = await fetchReviews({ orderId: id });
      if (reviewsData.length > 0) {
        setExistingReview(reviewsData[0]);
      }
    } catch (error) {
      console.error('Error loading order detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleSendMessage(content: string) {
    try {
      await apiSendMessage(id, content);
      loadData();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (existingReview || reviewSubmitted || loading) return;
    
    setLoading(true);
    try {
      await apiCreateReview({
        orderId: id,
        gigId: order.gig_id,
        sellerId: order.seller_id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSubmitted(true);
      loadData();
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>;
  if (!order) return <div className="p-8 text-slate-400 text-sm">Order not found.</div>;

  const currentStepIndex = STEPS.indexOf(order.status as OrderStatus);

  return (
    <DashboardLayout title="Buyer" navItems={navItems}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/orders" className="text-sm text-[#3b5fa0] hover:underline">← Back</Link>
        <h1 className="text-xl font-bold text-slate-800">Order Details</h1>
      </div>

      {/* Status Timeline */}
      <div className="bg-white border border-slate-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Order Status</h2>
        <div className="flex items-center">
          {STEPS.map((step, i) => {
            const done = i <= currentStepIndex;
            const labels: Record<string, string> = {
              pending: 'Pending',
              in_progress: 'In Progress',
              delivered: 'Delivered',
              completed: 'Completed',
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
            <h3 className="text-sm font-semibold text-slate-800">{order.gig_title}</h3>
            <p className="text-xs text-slate-400 mt-1">by {order.seller_name}</p>
            <p className="text-xs text-slate-400">Ordered: {formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-slate-800">{formatCurrency(order.totalPrice)}</div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
        {order.buyerInstructions && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-1">Your Instructions:</p>
            <p className="text-sm text-slate-600">{order.buyerInstructions}</p>
          </div>
        )}
      </div>

      {/* Delivered files */}
      {order.status === 'delivered' && order.deliveryFiles.length > 0 && (
        <div className="bg-white border border-slate-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Delivered Files</h3>
          {order.deliveryFiles.map((f: string) => (
            <div key={f} className="flex items-center gap-2 py-2 border-b border-slate-100 last:border-b-0">
              <span className="text-slate-400">📎</span>
              <span className="text-sm text-slate-700 flex-1">{f}</span>
              <button className="text-xs text-[#3b5fa0] hover:underline">Download</button>
            </div>
          ))}
        </div>
      )}

      {/* Review Form */}
      {(order.status === 'delivered' || order.status === 'completed') && !existingReview && !reviewSubmitted && (
        <div className="bg-white border border-slate-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Order Actions</h3>
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
              label="Comment"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Tell us about your experience working with this seller..."
              rows={3}
              required
            />
            <Button type="submit" variant="primary" size="md" disabled={loading}>
              {loading ? 'Processing...' : 'Submit Review & Complete'}
            </Button>
          </form>
        </div>
      )}
      {(reviewSubmitted || (existingReview && order.status !== 'delivered')) && (
        <div className="bg-green-50 border border-green-200 p-4 mb-6 text-sm text-green-700">
          Thank you for submitting a review!
        </div>
      )}

      {/* Chat */}
      <ChatBox
        messages={messages}
        currentUserId={userId}
        onSend={handleSendMessage}
      />
    </DashboardLayout>
  );
}
