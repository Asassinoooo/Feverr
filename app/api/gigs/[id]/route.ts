import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await query(
      `SELECT g.*, u.username, u.name as seller_name, u.avatar_url as seller_avatar, u.bio as seller_bio
       FROM gigs g
       JOIN users u ON g.seller_id = u.user_id
       WHERE g.gig_id = $1`,
      [id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Error fetching gig:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
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
    const { title, description, category, price, deliveryDays, tags, portfolioImages, isActive } = body;

    // Check ownership
    const checkRes = await query('SELECT seller_id FROM gigs WHERE gig_id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }
    if (checkRes.rows[0].seller_id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const res = await query(
      `UPDATE gigs
       SET title = $1, description = $2, category = $3, price = $4, delivery_days = $5, tags = $6, portfolio_images = $7, is_active = $8
       WHERE gig_id = $9
       RETURNING *`,
      [title, description, category, price, deliveryDays, tags, portfolioImages, isActive, id]
    );

    // Invalidasi cache Redis supaya perubahan langsung terlihat di search
    if (redis) {
      await redis.del('gigs:all');
      await redis.del(`gigs:category:${res.rows[0].category}`);
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Error updating gig:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check ownership
    const checkRes = await query('SELECT seller_id, category FROM gigs WHERE gig_id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }
    if (checkRes.rows[0].seller_id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const gigCategory = checkRes.rows[0].category;
    await query('DELETE FROM gigs WHERE gig_id = $1', [id]);

    // Invalidasi cache Redis supaya gig yang dihapus tidak muncul lagi di search
    if (redis) {
      await redis.del('gigs:all');
      await redis.del(`gigs:category:${gigCategory}`);
    }

    return NextResponse.json({ message: 'Gig deleted' });
  } catch (error) {
    console.error('Error deleting gig:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
