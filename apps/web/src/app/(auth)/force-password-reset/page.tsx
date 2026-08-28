import { requireAuth } from '@abge/auth';
import { redirect } from 'next/navigation';
import { ForcePasswordResetClient } from './reset-client';

export default async function ForcePasswordResetPage() {
  const session = await requireAuth({ allowForcePasswordReset: true, allowSuspended: true });

  if (!session.mustChangePassword) {
    redirect('/overview');
  }

  return <ForcePasswordResetClient />;
}
