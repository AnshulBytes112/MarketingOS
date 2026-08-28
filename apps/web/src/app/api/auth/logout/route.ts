import { NextResponse } from 'next/server';
import { invalidateSession } from '@abge/auth';

export async function POST() {
  try {
    await invalidateSession();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await invalidateSession();
  } catch (error) {
    console.error('Logout error:', error);
  }
  return NextResponse.redirect(new URL('/login', request.url));
}
