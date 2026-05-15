import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const GET = auth(async (req) => {
  const { searchParams } = new URL(req.url);
  const gigId = searchParams.get('gigId');
  const orderId = searchParams.get('orderId');

  try {
    let q = 'SELECT * FROM reviews WHERE 1=1';
    const params = [];

    if (gigId) {
      params.push(gigId);
      q += ` AND gig_id = $${params.length}`;
    }
    if (orderId) {
      params.push(orderId);
      q += ` AND order_id = $${params.length}`;
    }

    const res = await query(q, params);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const POST = auth(async (req) => {
  const userId = req.auth?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId, gigId, sellerId, rating, comment } = await req.json();

    if (!orderId || !gigId || !sellerId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use a transaction to create review and complete order
    // But since lib/db only has simple query, I'll do it sequentially
    
    // 1. Create review
    const reviewRes = await query(
      'INSERT INTO reviews (order_id, gig_id, buyer_id, seller_id, rating, comment) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [orderId, gigId, userId, sellerId, rating, comment]
    );

    // 2. Update order status to completed
    await query(
      "UPDATE orders SET status = 'completed' WHERE order_id = $1",
      [orderId]
    );

    // 3. Update seller balance (simple logic for now)
    const orderRes = await query('SELECT total_price FROM orders WHERE order_id = $1', [orderId]);
    const totalPrice = orderRes.rows[0].total_price;
    
    await query(
      'UPDATE users SET balance = balance + $1 WHERE user_id = $2',
      [totalPrice, sellerId]
    );

    // 4. Create transaction record for seller
    await query(
      "INSERT INTO transactions (user_id, type, amount, description, related_order_id) VALUES ($1, 'credit', $2, $3, $4)",
      [sellerId, totalPrice, `Earnings from order #${orderId}`, orderId]
    );

    // 5. Update gig rating (average)
    await query(`
      UPDATE gigs 
      SET average_rating = (SELECT AVG(rating) FROM reviews WHERE gig_id = $1),
          review_count = (SELECT COUNT(*) FROM reviews WHERE gig_id = $1)
      WHERE gig_id = $1
    `, [gigId]);

    return NextResponse.json(reviewRes.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
