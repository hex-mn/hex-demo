import { NextResponse } from 'next/server';

export async function POST() {
	// Remove the httpOnly refresh_token cookie
	const res = NextResponse.json({ success: true });
	res.cookies.set('refresh_token', '', {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		path: '/',
		maxAge: 0,
	});
	return res;
}
