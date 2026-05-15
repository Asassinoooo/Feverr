import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await query(
          'SELECT * FROM users WHERE email = $1',
          [credentials.email]
        );

        const user = res.rows[0];

        if (!user) return null;

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!isPasswordCorrect) return null;

        // --- JigsawCoin Integration ---
        const jigsawApi = process.env.JIGSAWCOIN_API;
        const jigsawUrl = 'https://jigsaw-coin-api.vercel.app/api/v1';

        let globalUserId = user.global_user_id;

        if (!globalUserId) {
          try {
            // Try login to JigsawCoin
            const jLoginRes = await fetch(`${jigsawUrl}/user/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-api-key': jigsawApi! },
              body: JSON.stringify({ email: user.email, password: credentials.password })
            });

            if (jLoginRes.ok) {
              const jData = await jLoginRes.json();
              globalUserId = jData.payload.global_user_id;
            } else if (jLoginRes.status === 401) {
              // Wrong password in JigsawCoin? Register/Reset? 
              // For simplicity, if not 401, we try register if not found.
            }

            if (!globalUserId) {
              // Try register to JigsawCoin
              const jRegRes = await fetch(`${jigsawUrl}/user/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': jigsawApi! },
                body: JSON.stringify({ email: user.email, password: credentials.password })
              });
              
              if (jRegRes.ok || jRegRes.status === 409) {
                // If 409, it means already registered globally, lookup id
                const jLookupRes = await fetch(`${jigsawUrl}/user/lookup/${encodeURIComponent(user.email)}`, {
                  headers: { 'x-api-key': jigsawApi! }
                });
                if (jLookupRes.ok) {
                  const jData = await jLookupRes.json();
                  globalUserId = jData.payload.global_user_id;
                }
              }
            }

            if (globalUserId) {
              await query('UPDATE users SET global_user_id = $1 WHERE user_id = $2', [globalUserId, user.user_id]);
            }
          } catch (err) {
            console.error('JigsawCoin Sync Error:', err);
          }
        }

        return {
          id: user.user_id.toString(),
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
          globalUserId: globalUserId
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.globalUserId = (user as any).globalUserId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
        (session.user as any).globalUserId = token.globalUserId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});
