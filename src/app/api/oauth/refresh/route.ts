import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
	try {
		// Forward the httpOnly refresh_token cookie to the provider
		const refresh_token = req.cookies.get('refresh_token')?.value;
		if (!refresh_token) {
			return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
		}
		const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/provider/oauth/refresh-token/`, {
			client_id:process.env.NEXT_PUBLIC_CLIENT_ID,
			refresh_token,
		});
		const { access_token, refresh_token: new_refresh_token, username } = response.data;
		const res = NextResponse.json({ access_token, username });
		if (new_refresh_token) {
			res.cookies.set('refresh_token', new_refresh_token, {
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				path: '/',
				maxAge: Number(process.env.NEXT_PUBLIC_REFRESH_TOKEN_EXPIRY) * 60,
			});
		}
		return res;
	} catch (error: any) {
		console.log('Error refreshing token:', error);
		return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
	}
}
