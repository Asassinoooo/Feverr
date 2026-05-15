export type UserRole = 'buyer' | 'seller' | 'both';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  bio: string;
  avatarUrl: string;
  role: UserRole;
  balance: number;
  createdAt: string;
}

export interface Gig {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  deliveryDays: number;
  portfolioImages: string[];
  isActive: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  gigId: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  buyerInstructions: string;
  deliveryFiles: string[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  gigId: string;
  buyerId: string;
  sellerId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
}

export type TransactionType = 'credit' | 'debit';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  relatedOrderId?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  orderId: string;
  senderId: string;
  content: string;
  createdAt: string;
}
