import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const q = searchParams.get('q');
  const sellerId = searchParams.get('sellerId');

  let queryString = `
    SELECT g.*, u.username, u.name as seller_name, u.avatar_url as seller_avatar
    FROM gigs g
    JOIN users u ON g.seller_id = u.user_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (!sellerId) {
    queryString += ` AND g.is_active = true`;
  }

  if (category) {
    params.push(category);
    queryString += ` AND g.category = $${params.length}`;
  }

  if (q) {
    params.push(`%${q}%`);
    queryString += ` AND (g.title ILIKE $${params.length} OR g.description ILIKE $${params.length})`;
  }

  if (sellerId) {
    params.push(sellerId);
    queryString += ` AND g.seller_id = $${params.length}`;
  }

  queryString += ' ORDER BY g.created_at DESC';

  try {
    const res = await query(queryString, params);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Error fetching gigs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, category, price, deliveryDays, tags, portfolioImages } = body;

    const res = await query(
      `INSERT INTO gigs (seller_id, title, description, category, price, delivery_days, tags, portfolio_images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [session.user.id, title, description, category, price, deliveryDays, tags || [], portfolioImages || []]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating gig:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
