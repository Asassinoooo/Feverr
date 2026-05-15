import { Order } from '@/lib/types';

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    gigId: 'gig-1',
    buyerId: 'user-1',
    sellerId: 'user-2',
    status: 'completed',
    buyerInstructions:
      'Tolong buat logo untuk usaha kafe saya bernama "Kopi Nusantara". Konsepnya natural dan hangat, warna cokelat dan hijau. Target pasar anak muda.',
    deliveryFiles: ['logo-kopi-nusantara-final.zip'],
    totalPrice: 250000,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-06T15:30:00Z',
  },
  {
    id: 'order-2',
    gigId: 'gig-3',
    buyerId: 'user-1',
    sellerId: 'user-3',
    status: 'in_progress',
    buyerInstructions:
      'Butuh artikel tentang "10 Tips Memulai Bisnis Online di 2024". Target pembaca: pemula. Gunakan kata kunci: bisnis online, cara memulai bisnis, peluang usaha.',
    deliveryFiles: [],
    totalPrice: 150000,
    createdAt: '2024-03-10T09:00:00Z',
    updatedAt: '2024-03-10T09:00:00Z',
  },
  {
    id: 'order-3',
    gigId: 'gig-4',
    buyerId: 'user-1',
    sellerId: 'user-3',
    status: 'delivered',
    buyerInstructions:
      'Landing page untuk produk software HR saya. Warna biru korporat. Perlu ada section: hero, fitur, harga, testimonial, dan CTA.',
    deliveryFiles: ['landing-page-source.zip', 'deployment-guide.pdf'],
    totalPrice: 750000,
    createdAt: '2024-02-20T11:00:00Z',
    updatedAt: '2024-03-01T14:00:00Z',
  },
  {
    id: 'order-4',
    gigId: 'gig-6',
    buyerId: 'user-3',
    sellerId: 'user-2',
    status: 'pending',
    buyerInstructions:
      'Ilustrasi karakter maskot untuk aplikasi saya. Karakter robot yang ramah dan lucu. Warna biru dan putih.',
    deliveryFiles: [],
    totalPrice: 300000,
    createdAt: '2024-03-12T08:00:00Z',
    updatedAt: '2024-03-12T08:00:00Z',
  },
];

export function getOrderById(id: string): Order | undefined {
  return mockOrders.find((o) => o.id === id);
}

export function getOrdersByBuyer(buyerId: string): Order[] {
  return mockOrders.filter((o) => o.buyerId === buyerId);
}

export function getOrdersBySeller(sellerId: string): Order[] {
  return mockOrders.filter((o) => o.sellerId === sellerId);
}
