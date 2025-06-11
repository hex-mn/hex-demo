import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
	try {
		const { code } = await req.json();
		const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/provider/oauth/token-exchange/`, {
			client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			code,
		});
		// Optionally log token exchange response on the server
		// console.log('Token exchange response:', response.data);

		const { access_token, refresh_token, username } = response.data;

		// Set refresh_token as httpOnly cookie
		const res = NextResponse.json({ access_token, username });
		res.cookies.set('refresh_token', refresh_token, {
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			path: '/',
			maxAge: Number(process.env.NEXT_PUBLIC_REFRESH_TOKEN_EXPIRY) * 60,
		});
		return res;
	} catch (error: any) {
		let message = 'Token exchange failed';
		if (axios.isAxiosError(error) && error.response?.data) {
			message = error.response.data.error || error.response.data.message || JSON.stringify(error.response.data);
			console.error('Token exchange error:', message);
		}
		return NextResponse.json({ error: message }, { status: 400 });
	}
}
