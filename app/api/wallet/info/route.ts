import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const JIGSAW_API_KEY = process.env.JIGSAWCOIN_API;
const JIGSAW_URL = 'https://jigsaw-coin-api.vercel.app/api/v1';

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Get Feverr Balance
    const userRes = await query('SELECT balance, global_user_id FROM users WHERE user_id = $1', [session.user.id]);
    const user = userRes.rows[0];
    
    let jigsawBalance = 0;

    // 2. Get JigsawCoin Balance (Server-side to avoid CORS)
    if (user.global_user_id) {
      try {
        const balRes = await fetch(`${JIGSAW_URL}/wallet/balance/${user.global_user_id}`, {
          headers: { 'x-api-key': JIGSAW_API_KEY! }
        });
        if (balRes.ok) {
          const balData = await balRes.json();
          jigsawBalance = parseFloat(balData.payload.balance);
        }
      } catch (err) {
        console.error('Error fetching JigsawCoin balance from server:', err);
      }
    }

    return NextResponse.json({
      rupiahBalance: parseFloat(user.balance),
      jigsawBalance: jigsawBalance,
      globalUserId: user.global_user_id
    });
  } catch (error) {
    console.error('Wallet Info Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
