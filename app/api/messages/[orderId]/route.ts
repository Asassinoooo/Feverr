import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await query(`
      SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.user_id
      WHERE m.order_id = $1
      ORDER BY m.created_at ASC
    `, [orderId]);

    return NextResponse.json(res.rows.map((row: any) => ({
      ...row,
      id: row.message_id.toString(),
      senderId: row.sender_id.toString(),
      createdAt: row.created_at
    })));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    }

    const res = await query(
      'INSERT INTO messages (order_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
      [orderId, userId, content]
    );

    const msg = res.rows[0];
    return NextResponse.json({
      ...msg,
      id: msg.message_id.toString(),
      senderId: msg.sender_id.toString(),
      createdAt: msg.created_at
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
