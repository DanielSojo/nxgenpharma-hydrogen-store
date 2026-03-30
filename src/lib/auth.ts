import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { loginCustomer, getCustomer } from '@/lib/shopify';
import { getShopifyEnvDebugInfo } from '@/lib/shopify/env';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Shopify',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        try {
          console.log(
            '[Auth] env debug:',
            JSON.stringify(
              {
                ...getShopifyEnvDebugInfo(),
                loginEmail: parsed.data.email.toLowerCase(),
              },
              null,
              2
            )
          );

          const token = await loginCustomer(parsed.data.email, parsed.data.password);
          if (!token) {
            console.error('[Auth] loginCustomer returned null — invalid credentials');
            return null;
          }

          const customer = await getCustomer(token.accessToken);
          if (!customer) {
            console.error('[Auth] getCustomer returned null — could not fetch customer');
            return null;
          }

          console.log('[Auth] Login success:', customer.email, '| approved:', customer.approved, '| status:', customer.b2bStatus);

          return {
            id: customer.id,
            email: customer.email,
            name: `${customer.firstName} ${customer.lastName}`.trim(),
            firstName: customer.firstName,
            lastName: customer.lastName,
            approved: customer.approved,
            b2bStatus: customer.b2bStatus,
            accessToken: token.accessToken,
            expiresAt: token.expiresAt,
          };
        } catch (err) {
          console.error('[Auth] authorize error:', err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.email = user.email as string;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.approved = (user as any).approved;
        token.b2bStatus = (user as any).b2bStatus;
        token.accessToken = (user as any).accessToken;
        token.expiresAt = (user as any).expiresAt;
        token.approvedCheckedAt = Date.now();
      }

      // Re-check approval status every 5 minutes
      const checkedAt = (token.approvedCheckedAt as number) ?? 0;
      const fiveMinutes = 5 * 60 * 1000;

      if (token.accessToken && Date.now() - checkedAt > fiveMinutes) {
        try {
          const customer = await getCustomer(token.accessToken as string);
          if (customer) {
            token.approved = customer.approved;
            token.b2bStatus = customer.b2bStatus;
            token.approvedCheckedAt = Date.now();
          }
        } catch (err) {
          console.warn('[JWT] Could not refresh approval status:', err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      (session.user as any).firstName = token.firstName;
      (session.user as any).lastName = token.lastName;
      (session.user as any).approved = token.approved;
      (session.user as any).b2bStatus = token.b2bStatus;
      (session.user as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
});
