import { User } from '@/lib/types';

// Passwords are "password123" hashed (mock — we compare plaintext in dev)
export const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'budi_buyer',
    email: 'budi@example.com',
    passwordHash: 'password123',
    name: 'Budi Santoso',
    bio: 'Saya seorang pengusaha yang sering membutuhkan jasa desain dan penulisan untuk bisnis saya.',
    avatarUrl: 'https://picsum.photos/seed/budi/200/200',
    role: 'buyer',
    balance: 500000,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'user-2',
    username: 'sari_designer',
    email: 'sari@example.com',
    passwordHash: 'password123',
    name: 'Sari Dewi',
    bio: 'Desainer grafis dengan pengalaman 5 tahun. Spesialisasi di branding, logo, dan ilustrasi digital.',
    avatarUrl: 'https://picsum.photos/seed/sari/200/200',
    role: 'seller',
    balance: 1250000,
    createdAt: '2023-08-20T10:30:00Z',
  },
  {
    id: 'user-3',
    username: 'andi_dev',
    email: 'andi@example.com',
    passwordHash: 'password123',
    name: 'Andi Pratama',
    bio: 'Full-stack developer dan penulis konten teknologi. Saya membantu startup membangun produk digital.',
    avatarUrl: 'https://picsum.photos/seed/andi/200/200',
    role: 'both',
    balance: 875000,
    createdAt: '2023-11-05T14:00:00Z',
  },
];

export function getUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return mockUsers.find((u) => u.email === email);
}

export function getUserByUsername(username: string): User | undefined {
  return mockUsers.find((u) => u.username === username);
}
