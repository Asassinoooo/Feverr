import { Review } from '@/lib/types';

export const mockReviews: Review[] = [
  {
    id: 'review-1',
    orderId: 'order-1',
    gigId: 'gig-1',
    buyerId: 'user-1',
    sellerId: 'user-2',
    rating: 5,
    comment:
      'Sari sangat profesional dan responsif. Logo yang dihasilkan melebihi ekspektasi saya. Proses revisi cepat dan hasilnya sangat memuaskan. Sangat direkomendasikan!',
    createdAt: '2024-03-07T10:00:00Z',
  },
  {
    id: 'review-2',
    orderId: 'order-3',
    gigId: 'gig-4',
    buyerId: 'user-1',
    sellerId: 'user-3',
    rating: 4,
    comment:
      'Landing page-nya bagus dan sesuai brief. Ada beberapa detail kecil yang perlu diperbaiki tapi Andi sigap merespons. Performa website juga sangat baik di Lighthouse.',
    createdAt: '2024-03-05T14:30:00Z',
  },
  {
    id: 'review-3',
    orderId: 'order-1',
    gigId: 'gig-1',
    buyerId: 'user-3',
    sellerId: 'user-2',
    rating: 5,
    comment:
      'Hasil ilustrasi luar biasa! Karakter maskotnya persis seperti yang saya bayangkan. Komunikasi lancar dan pengerjaan tepat waktu.',
    createdAt: '2024-02-15T09:00:00Z',
  },
];

export function getReviewsByGig(gigId: string): Review[] {
  return mockReviews.filter((r) => r.gigId === gigId);
}

export function getReviewsBySeller(sellerId: string): Review[] {
  return mockReviews.filter((r) => r.sellerId === sellerId);
}

export function getReviewByOrder(orderId: string): Review | undefined {
  return mockReviews.find((r) => r.orderId === orderId);
}
