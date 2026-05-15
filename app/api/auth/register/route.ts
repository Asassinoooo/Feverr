import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, name, role } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'User with this email or username already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const res = await query(
      `INSERT INTO users (username, email, password_hash, name, role, balance)
       VALUES ($1, $2, $3, $4, $5, 0)
       RETURNING user_id, username, email, name, role`,
      [username, email, passwordHash, name || username, role || 'buyer']
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
