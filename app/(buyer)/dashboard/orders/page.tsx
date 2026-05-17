'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { Tabs } from '@/components/ui/Tabs';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { fetchOrders } from '@/lib/api';

const navItems = [
  { href: '/dashboard/orders', label: 'My Orders' },
  { href: '/settings/profile', label: 'Profile Settings' },
  { href: '/settings/wallet', label: 'Wallet' },
];

export default function BuyerOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrders('purchase');
        setOrders(data.map((o: any) => ({
          ...o,
          id: o.order_id.toString(),
          gigId: o.gig_id.toString(),
          buyerId: o.buyer_id.toString(),
          sellerId: o.seller_id.toString(),
          seller: { name: o.seller_username }
        })));
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    if (session) loadOrders();
  }, [session]);

  const active = orders.filter((o) =>
    ['pending', 'in_progress', 'delivered'].includes(o.status)
  );
  const history = orders.filter((o) =>
    ['completed', 'cancelled'].includes(o.status)
  );

  function OrderList({ list }: { list: any[] }) {
    if (loading) return <p className="text-sm text-slate-400 py-8 text-center">Loading...</p>;
    if (list.length === 0) {
      return <p className="text-sm text-slate-400 py-8 text-center">No orders yet.</p>;
    }
    return (
      <div className="flex flex-col gap-3">
        {list.map((order) => (
          <Link
            key={order.id}
            href={`/dashboard/orders/${order.id}`}
            className="flex gap-4 bg-white border border-slate-200 p-4 hover:border-[#3b5fa0] group"
          >
            <div className="relative w-16 h-12 flex-shrink-0 bg-slate-100">
              {order.gig_image && (
                <Image
                  src={order.gig_image}
                  alt={order.gig_title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-medium text-slate-800 truncate group-hover:text-[#3b5fa0]">
                  {order.gig_title || 'Service Removed'}
                </h3>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                by {order.seller?.name} · {formatDate(order.created_at)} · {formatCurrency(order.total_price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <DashboardLayout title="Buyer" navItems={navItems}>
      <h1 className="text-xl font-bold text-slate-800 mb-6">My Orders</h1>
      <Tabs
        tabs={[
          { id: 'active', label: `Active (${active.length})` },
          { id: 'history', label: `History (${history.length})` },
        ]}
      >
        {(tab) => tab === 'active' ? <OrderList list={active} /> : <OrderList list={history} />}
      </Tabs>
    </DashboardLayout>
  );
}
