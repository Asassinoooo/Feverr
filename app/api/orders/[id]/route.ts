import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await query(
      `SELECT o.*, g.title as gig_title, g.description as gig_description,
              ub.username as buyer_username, us.username as seller_username
       FROM orders o
       JOIN gigs g ON o.gig_id = g.gig_id
       JOIN users ub ON o.buyer_id = ub.user_id
       JOIN users us ON o.seller_id = us.user_id
       WHERE o.order_id = $1`,
      [id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = res.rows[0];
    if (order.buyer_id.toString() !== session.user.id && order.seller_id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status, deliveryFiles } = body;

    const checkRes = await query('SELECT * FROM orders WHERE order_id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    const order = checkRes.rows[0];

    // Authorization checks
    if (status === 'in_progress' || status === 'delivered') {
      if (order.seller_id.toString() !== session.user.id) {
        return NextResponse.json({ error: 'Only seller can update to in_progress or delivered' }, { status: 403 });
      }
    } else if (status === 'completed') {
      if (order.buyer_id.toString() !== session.user.id) {
        return NextResponse.json({ error: 'Only buyer can update to completed' }, { status: 403 });
      }
      
      // If completed, transfer balance to seller
      await query('UPDATE users SET balance = balance + $1 WHERE user_id = $2', [order.total_price, order.seller_id]);
      await query(
        'INSERT INTO transactions (user_id, type, amount, description, related_order_id) VALUES ($1, $2, $3, $4, $5)',
        [order.seller_id, 'credit', order.total_price, `Payment for order #${order.order_id}`, order.order_id]
      );
    }

    const res = await query(
      `UPDATE orders
       SET status = $1, delivery_files = COALESCE($2, delivery_files), updated_at = CURRENT_TIMESTAMP
       WHERE order_id = $3
       RETURNING *`,
      [status, deliveryFiles, id]
    );

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
