import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await query(
      'SELECT user_id, username, email, name, bio, avatar_url, role, balance, average_rating, created_at FROM users WHERE user_id = $1',
      [session.user.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, bio, avatarUrl } = body;

    const res = await query(
      `UPDATE users
       SET name = $1, bio = $2, avatar_url = $3
       WHERE user_id = $4
       RETURNING user_id, username, email, name, bio, avatar_url, role, balance, average_rating, created_at`,
      [name, bio, avatarUrl, session.user.id]
    );

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
