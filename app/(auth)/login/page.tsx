'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError('Invalid email or password.');
      return;
    }

    // Redirect based on role — fetch session
    router.push('/dashboard/orders');
    router.refresh();
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Sign in to Feverr</h1>
          <p className="text-sm text-slate-500 mt-1">Don't have an account?{' '}
            <Link href="/register" className="text-[#3b5fa0] hover:underline">Sign Up</Link>
          </p>
        </div>

        {/* Quick login hint */}
        <div className="bg-[#f1f5f9] border border-slate-200 p-3 mb-6 text-xs text-slate-500">
          <p className="font-medium text-slate-600 mb-1">Demo accounts:</p>
          <p>Buyer: budi@example.com</p>
          <p>Seller: sari@example.com</p>
          <p>Both: andi@example.com</p>
          <p className="mt-1">Password: <code>password123</code></p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={loading}>
            {loading ? 'Processing...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
