'use server';

import { invalidatePlatformSession } from '@abge/auth';
import { redirect } from 'next/navigation';

export async function adminLogout() {
  await invalidatePlatformSession();
  redirect('/login');
}
