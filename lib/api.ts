const API_URL = '/api';

export async function fetchGigs(params?: { category?: string; q?: string; sellerId?: string }) {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_URL}/gigs?${query}`);
  if (!res.ok) throw new Error('Failed to fetch gigs');
  return res.json();
}

export async function fetchGig(id: string) {
  const res = await fetch(`${API_URL}/gigs/${id}`);
  if (!res.ok) throw new Error('Failed to fetch gig');
  return res.json();
}

export async function createGig(data: any) {
  const res = await fetch(`${API_URL}/gigs`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to create gig');
  return res.json();
}

export async function updateGig(id: string, data: any) {
  const res = await fetch(`${API_URL}/gigs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to update gig');
  return res.json();
}

export async function deleteGig(id: string) {
  const res = await fetch(`${API_URL}/gigs/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete gig');
  return res.json();
}

export async function fetchOrders(type: 'purchase' | 'sale') {
  const res = await fetch(`${API_URL}/orders?type=${type}`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function fetchOrder(id: string) {
  const res = await fetch(`${API_URL}/orders/${id}`);
  if (!res.ok) throw new Error('Failed to fetch order');
  return res.json();
}

export async function createOrder(data: any) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create order');
  }
  return res.json();
}

export async function updateOrderStatus(id: string, status: string, deliveryFiles?: string[]) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, deliveryFiles }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function fetchMe() {
  const res = await fetch(`${API_URL}/users/me`);
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updateProfile(data: any) {
  const res = await fetch(`${API_URL}/users/me`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function fetchUserProfile(username: string) {
  const res = await fetch(`${API_URL}/users/profile/${username}`);
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

export async function fetchTransactions() {
  const res = await fetch(`${API_URL}/transactions`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function topUp(amount: number) {
  const res = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to top up');
  return res.json();
}
export async function fetchMessages(orderId: string) {
  const res = await fetch(`${API_URL}/messages/${orderId}`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function sendMessage(orderId: string, content: string) {
  const res = await fetch(`${API_URL}/messages/${orderId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function fetchReviews(params: { gigId?: string; orderId?: string }) {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_URL}/reviews?${query}`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function createReview(data: any) {
  const res = await fetch(`${API_URL}/reviews`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to create review');
  return res.json();
}
