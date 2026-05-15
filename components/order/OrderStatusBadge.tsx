import { OrderStatus } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }
> = {
  pending: { label: 'Menunggu', variant: 'warning' },
  in_progress: { label: 'Dikerjakan', variant: 'info' },
  delivered: { label: 'Terkirim', variant: 'success' },
  completed: { label: 'Selesai', variant: 'success' },
  cancelled: { label: 'Dibatalkan', variant: 'danger' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
