'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Gig, Order, Transaction, User, Review, Message, OrderStatus } from '@/lib/types';
import { mockGigs } from '@/lib/mock/gigs';
import { mockOrders } from '@/lib/mock/orders';
import { mockTransactions } from '@/lib/mock/transactions';
import { mockUsers } from '@/lib/mock/users';
import { mockReviews } from '@/lib/mock/reviews';
import { mockMessages } from '@/lib/mock/messages';

interface AppContextValue {
  gigs: Gig[];
  orders: Order[];
  transactions: Transaction[];
  users: User[];
  reviews: Review[];
  messages: Message[];

  // Gig actions
  addGig: (gig: Gig) => void;
  updateGig: (id: string, updates: Partial<Gig>) => void;
  deleteGig: (id: string) => void;

  // Order actions
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus, deliveryFiles?: string[]) => void;

  // Transaction actions
  addTransaction: (txn: Transaction) => void;
  updateUserBalance: (userId: string, delta: number) => void;

  // Review actions
  addReview: (review: Review) => void;

  // Message actions
  addMessage: (message: Message) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [gigs, setGigs] = useState<Gig[]>(mockGigs);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const addGig = useCallback((gig: Gig) => {
    setGigs((prev) => [...prev, gig]);
  }, []);

  const updateGig = useCallback((id: string, updates: Partial<Gig>) => {
    setGigs((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  }, []);

  const deleteGig = useCallback((id: string) => {
    setGigs((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [...prev, order]);
  }, []);

  const updateOrderStatus = useCallback(
    (id: string, status: OrderStatus, deliveryFiles?: string[]) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status,
                updatedAt: new Date().toISOString(),
                ...(deliveryFiles ? { deliveryFiles } : {}),
              }
            : o
        )
      );
    },
    []
  );

  const addTransaction = useCallback((txn: Transaction) => {
    setTransactions((prev) => [txn, ...prev]);
  }, []);

  const updateUserBalance = useCallback((userId: string, delta: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, balance: u.balance + delta } : u))
    );
  }, []);

  const addReview = useCallback((review: Review) => {
    setReviews((prev) => [...prev, review]);
    // Update gig rating
    setGigs((prev) =>
      prev.map((g) => {
        if (g.id !== review.gigId) return g;
        const gigReviews = [...reviews.filter((r) => r.gigId === g.id), review];
        const avg = gigReviews.reduce((s, r) => s + r.rating, 0) / gigReviews.length;
        return { ...g, rating: Math.round(avg * 10) / 10, reviewCount: gigReviews.length };
      })
    );
  }, [reviews]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        gigs,
        orders,
        transactions,
        users,
        reviews,
        messages,
        addGig,
        updateGig,
        deleteGig,
        addOrder,
        updateOrderStatus,
        addTransaction,
        updateUserBalance,
        addReview,
        addMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
