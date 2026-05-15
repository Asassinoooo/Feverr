import { Message } from '@/lib/types';

export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    orderId: 'order-2',
    senderId: 'user-1',
    content: 'Halo Andi, saya sudah mengirimkan brief lewat instruksi order. Kalau ada pertanyaan silakan tanya ya.',
    createdAt: '2024-03-10T09:30:00Z',
  },
  {
    id: 'msg-2',
    orderId: 'order-2',
    senderId: 'user-3',
    content: 'Halo Budi! Sudah saya baca. Boleh saya tanya, apakah ada referensi artikel serupa yang Anda suka?',
    createdAt: '2024-03-10T10:15:00Z',
  },
  {
    id: 'msg-3',
    orderId: 'order-2',
    senderId: 'user-1',
    content: 'Ada, seperti artikel di majalah SWA atau Forbes Indonesia. Gaya penulisannya profesional tapi tetap mudah dipahami.',
    createdAt: '2024-03-10T10:45:00Z',
  },
  {
    id: 'msg-4',
    orderId: 'order-2',
    senderId: 'user-3',
    content: 'Siap, saya akan mulai mengerjakan hari ini. Target selesai dalam 2 hari. Nanti saya kabari jika sudah ada draft pertama.',
    createdAt: '2024-03-10T11:00:00Z',
  },
  {
    id: 'msg-5',
    orderId: 'order-3',
    senderId: 'user-3',
    content: 'Landing page sudah selesai! Saya akan kirim file source code dan link preview sekarang.',
    createdAt: '2024-03-01T13:00:00Z',
  },
  {
    id: 'msg-6',
    orderId: 'order-3',
    senderId: 'user-1',
    content: 'Wah keren sekali! Desainnya persis seperti yang saya minta. Terima kasih Andi!',
    createdAt: '2024-03-01T15:30:00Z',
  },
];

export function getMessagesByOrder(orderId: string): Message[] {
  return mockMessages
    .filter((m) => m.orderId === orderId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
