'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { Button } from '@/components/ui/Button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { fetchOrders, updateOrderStatus as apiUpdateOrderStatus } from '@/lib/api';

const navItems = [
  { href: '/seller/gigs', label: 'My Gigs' },
  { href: '/seller/orders', label: 'Incoming Orders' },
  { href: '/settings/wallet', label: 'Wallet' },
];

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await fetchOrders('sale');
      setOrders(data.map((o: any) => ({
        ...o,
        id: o.order_id.toString(),
        gigId: o.gig_id.toString(),
        buyerId: o.buyer_id.toString(),
        createdAt: o.created_at,
        totalPrice: parseFloat(o.total_price),
        gigTitle: o.gig_title,
        gigImage: o.gig_image,
        buyerName: o.buyer_name
      })));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleUpdateStatus(id: string, status: string) {
    try {
      await apiUpdateOrderStatus(id, status);
      loadOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  return (
    <DashboardLayout title="Seller" navItems={navItems}>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Incoming Orders</h1>

      {loading ? (
        <p className="text-slate-400 text-sm py-16 text-center">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-slate-400 text-sm py-16 text-center">No orders yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-slate-200 p-4 flex gap-4">
              <div className="relative w-16 h-12 flex-shrink-0 bg-slate-100">
                {order.gigImage && (
                  <Image
                    src={order.gigImage}
                    alt={order.gigTitle}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-slate-800 truncate">{order.gigTitle}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      from {order.buyerName} · {formatDate(order.createdAt)} · {formatCurrency(order.totalPrice)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <OrderStatusBadge status={order.status} />
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                      >
                        Start Work
                      </Button>
                    )}
                    {order.status === 'in_progress' && (
                      <Link href={`/seller/orders/${order.id}`}>
                        <Button size="sm" variant="primary">Deliver</Button>
                      </Link>
                    )}
                    <Link href={`/seller/orders/${order.id}`} className="text-xs text-[#3b5fa0] hover:underline">
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
