'use client';

import { use, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { ChatBox } from '@/components/order/ChatBox';
import { Button } from '@/components/ui/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { fetchOrder, fetchMessages, sendMessage as apiSendMessage, updateOrderStatus as apiUpdateOrderStatus } from '@/lib/api';

const navItems = [
  { href: '/seller/gigs', label: 'Gig Saya' },
  { href: '/seller/orders', label: 'Pesanan Masuk' },
  { href: '/settings/wallet', label: 'Dompet' },
];

export default function SellerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filename, setFilename] = useState('');

  const userId = (session?.user as any)?.id;

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

  async function handleUpdateStatus(status: string, files?: string[]) {
    try {
      await apiUpdateOrderStatus(id, status, files);
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  function handleDeliver() {
    const files = filename.trim() ? [filename.trim()] : ['delivery-file.zip'];
    handleUpdateStatus('delivered', files);
  }

  if (loading) return <div className="p-8 text-slate-400">Memuat...</div>;
  if (!order) notFound();

  return (
    <DashboardLayout title="Penjual" navItems={navItems}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/seller/orders" className="text-sm text-[#3b5fa0] hover:underline">← Kembali</Link>
        <h1 className="text-xl font-bold text-slate-800">Detail Pesanan</h1>
      </div>

      {/* Order Info */}
      <div className="bg-white border border-slate-200 p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{order.gig_title}</h3>
            <p className="text-xs text-slate-400 mt-1">dari {order.buyer_name}</p>
            <p className="text-xs text-slate-400">Dipesan: {formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-slate-800">{formatCurrency(order.totalPrice)}</div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
        {order.buyerInstructions && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-1">Instruksi Pembeli:</p>
            <p className="text-sm text-slate-600">{order.buyerInstructions}</p>
          </div>
        )}
      </div>

      {/* Status Actions */}
      <div className="bg-white border border-slate-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Aksi Status</h3>
        {order.status === 'pending' && (
          <Button variant="primary" onClick={() => handleUpdateStatus('in_progress')}>
            Mulai Kerjakan
          </Button>
        )}
        {order.status === 'in_progress' && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm text-slate-600 block mb-1.5">Nama File yang Diserahkan</label>
              <input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="hasil-kerja.zip"
                className="border border-slate-300 px-3 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-[#3b5fa0]"
              />
            </div>
            <Button variant="primary" onClick={handleDeliver}>
              Tandai Terkirim
            </Button>
          </div>
        )}
        {order.status === 'delivered' && (
          <div className="text-sm text-slate-500">
            Menunggu konfirmasi dari pembeli.
            {order.deliveryFiles.length > 0 && (
              <div className="mt-2">
                File terkirim: {order.deliveryFiles.join(', ')}
              </div>
            )}
          </div>
        )}
        {order.status === 'completed' && (
          <div className="text-sm text-green-600 font-medium">Pesanan selesai ✓</div>
        )}
      </div>

      {/* Chat */}
      <ChatBox
        messages={messages}
        currentUserId={userId}
        onSend={handleSendMessage}
      />
    </DashboardLayout>
  );
}
