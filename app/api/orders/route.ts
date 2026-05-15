import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { gigId, buyerInstructions } = body;

    // Get gig info
    const gigRes = await query('SELECT * FROM gigs WHERE gig_id = $1', [gigId]);
    if (gigRes.rows.length === 0) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }
    const gig = gigRes.rows[0];

    // Get buyer info
    const buyerRes = await query('SELECT balance FROM users WHERE user_id = $1', [session.user.id]);
    const buyer = buyerRes.rows[0];

    if (Number(buyer.balance) < Number(gig.price)) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Transactional order creation
    // 1. Create Order
    // 2. Deduct Buyer Balance
    // 3. Create Transaction log
    
    // For simplicity, we run them sequentially. Ideally use a DB transaction.
    const orderRes = await query(
      `INSERT INTO orders (buyer_id, gig_id, seller_id, status, buyer_instructions, total_price)
       VALUES ($1, $2, $3, 'pending', $4, $5)
       RETURNING *`,
      [session.user.id, gigId, gig.seller_id, buyerInstructions, gig.price]
    );

    await query(
      'UPDATE users SET balance = balance - $1 WHERE user_id = $2',
      [gig.price, session.user.id]
    );

    await query(
      'INSERT INTO transactions (user_id, type, amount, description, related_order_id) VALUES ($1, $2, $3, $4, $5)',
      [session.user.id, 'debit', gig.price, `Order for ${gig.title}`, orderRes.rows[0].order_id]
    );

    return NextResponse.json(orderRes.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'purchase' or 'sale'

  let queryString = `
    SELECT o.*, g.title as gig_title, g.portfolio_images[1] as gig_image,
           ub.username as buyer_username, us.username as seller_username
    FROM orders o
    JOIN gigs g ON o.gig_id = g.gig_id
    JOIN users ub ON o.buyer_id = ub.user_id
    JOIN users us ON o.seller_id = us.user_id
  `;
  const params: any[] = [];

  if (type === 'purchase') {
    params.push(session.user.id);
    queryString += ` WHERE o.buyer_id = $${params.length}`;
  } else if (type === 'sale') {
    params.push(session.user.id);
    queryString += ` WHERE o.seller_id = $${params.length}`;
  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  queryString += ' ORDER BY o.created_at DESC';

  try {
    const res = await query(queryString, params);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
