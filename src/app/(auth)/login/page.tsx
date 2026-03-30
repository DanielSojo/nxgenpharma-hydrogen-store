import { auth } from '@/lib/auth';
import LoginForm from '@/components/auth/LoginForm';
import { redirect } from 'next/navigation';

function sanitizeCallbackUrl(callbackUrl?: string) {
  if (!callbackUrl || callbackUrl.startsWith('/login') || callbackUrl.startsWith('http')) {
    return '/';
  }

  return callbackUrl;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  const safeCallbackUrl = sanitizeCallbackUrl(callbackUrl);

  if (session?.user) {
    const user = session.user as typeof session.user & {
      approved?: boolean;
      b2bStatus?: string | null;
    };

    if (user.b2bStatus === 'b2b-refused') {
      redirect('/refused');
    }

    if (user.approved !== true) {
      redirect('/pending');
    }

    redirect(safeCallbackUrl);
  }

  return <LoginForm callbackUrl={safeCallbackUrl} />;
}
