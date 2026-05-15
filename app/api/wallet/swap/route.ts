import { query } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const JIGSAW_API_KEY = process.env.JIGSAWCOIN_API;
const JIGSAW_URL = 'https://jigsaw-coin-api.vercel.app/api/v1';
const EXCHANGE_RATE = 1000;

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { amount, direction = 'jgc_to_idr' } = await request.json();
    const value = parseFloat(amount);

    if (isNaN(value) || value <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const globalUserId = (session.user as any).globalUserId;
    if (!globalUserId) {
      return NextResponse.json({ error: 'JigsawCoin account not linked' }, { status: 400 });
    }

    if (direction === 'jgc_to_idr') {
      // --- Swap JGC to IDR ---
      const balRes = await fetch(`${JIGSAW_URL}/wallet/balance/${globalUserId}`, {
        headers: { 'x-api-key': JIGSAW_API_KEY! }
      });
      if (!balRes.ok) throw new Error('Failed to fetch JigsawCoin balance');
      const balData = await balRes.json();
      const currentJgc = parseFloat(balData.payload.balance);

      if (currentJgc < value) {
        return NextResponse.json({ error: 'Insufficient JigsawCoin balance' }, { status: 400 });
      }

      const deductRes = await fetch(`${JIGSAW_URL}/wallet/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': JIGSAW_API_KEY! },
        body: JSON.stringify({
          global_user_id: globalUserId,
          amount: -value,
          reference_id: `Swap to Feverr IDR (${value * EXCHANGE_RATE} IDR)`
        })
      });

      if (!deductRes.ok) {
        const errData = await deductRes.json();
        return NextResponse.json({ error: errData.message || 'Failed to deduct JigsawCoin' }, { status: 500 });
      }

      const rupiahAmount = Math.round(value * EXCHANGE_RATE);
      await query('UPDATE users SET balance = balance + $1 WHERE user_id = $2', [rupiahAmount, session.user.id]);
      const txnRes = await query(
        'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4) RETURNING *',
        [session.user.id, 'credit', rupiahAmount, `Swap from ${value.toFixed(2)} JGC`]
      );

      return NextResponse.json({
        success: true,
        swapped: value,
        received: rupiahAmount,
        transaction: txnRes.rows[0]
      });

    } else if (direction === 'idr_to_jgc') {
      // --- Swap IDR to JGC ---
      const rupiahToSwap = Math.round(value); 
      const jgcToReceive = parseFloat((rupiahToSwap / EXCHANGE_RATE).toFixed(2));

      const userRes = await query('SELECT balance FROM users WHERE user_id = $1', [session.user.id]);
      const currentRupiah = parseFloat(userRes.rows[0].balance);

      if (currentRupiah < rupiahToSwap) {
        return NextResponse.json({ error: 'Insufficient Rupiah balance' }, { status: 400 });
      }

      // 1. Add to JigsawCoin
      const addRes = await fetch(`${JIGSAW_URL}/wallet/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': JIGSAW_API_KEY! },
        body: JSON.stringify({
          global_user_id: globalUserId,
          amount: jgcToReceive,
          reference_id: `Swap from Feverr IDR (${rupiahToSwap} IDR)`
        })
      });

      if (!addRes.ok) {
        const errData = await addRes.json();
        return NextResponse.json({ error: errData.message || 'Failed to add JigsawCoin' }, { status: 500 });
      }

      // 2. Deduct from Feverr Rupiah
      await query('UPDATE users SET balance = balance - $1 WHERE user_id = $2', [rupiahToSwap, session.user.id]);
      const txnRes = await query(
        'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4) RETURNING *',
        [session.user.id, 'debit', rupiahToSwap, `Swap to ${jgcToReceive} JGC`]
      );

      return NextResponse.json({
        success: true,
        swapped: rupiahToSwap,
        received: jgcToReceive,
        transaction: txnRes.rows[0]
      });
    }

    return NextResponse.json({ error: 'Invalid direction' }, { status: 400 });
  } catch (error) {
    console.error('Swap Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
