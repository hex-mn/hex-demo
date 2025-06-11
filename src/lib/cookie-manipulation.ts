// Utility functions for managing cookies and local storage.
// Mostly uses get/set methods to isolate cookie manipulation logic. Just personal preference.

import Cookies from 'universal-cookie';

export const ACCESS_TOKEN_EXPIRY = parseInt(process.env.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRY || '59', 10); // minutes
export const REFRESH_TOKEN_EXPIRY = parseInt(process.env.NEXT_PUBLIC_REFRESH_TOKEN_EXPIRY || '43200', 10); // minutes, default 1 year

export const CART_COOKIE_NAME = 'hex_cart';
export const CART_ALIVE_TIME = parseInt(process.env.NEXT_PUBLIC_CART_ALIVE_TIME || '525600', 10); // 1 year in minutes

export const ANALYTIC_ID_COOKIE_NAME = 'analytic_id';
export const ANALYTIC_ID_EXPIRY = 525600; // 1 year in minutes

export const WISHLIST_COOKIE_NAME = 'wishlist';
export const WISHLIST_ALIVE_TIME = parseInt(process.env.NEXT_PUBLIC_WISHLIST_ALIVE_TIME || '525600', 10); // 1 year in minutes

const cookies = new Cookies();
const isProduction = process.env.NODE_ENV === 'production';

// --- Local Storage helpers ---
export const setLocalStorage = (key: string, value: string) => {
	if (typeof window !== 'undefined') {
		localStorage.setItem(key, value);
	}
};
export const getLocalStorage = (key: string): string | null => {
	if (typeof window !== 'undefined') {
		return localStorage.getItem(key);
	}
	return null;
};
export const removeLocalStorage = (key: string) => {
	if (typeof window !== 'undefined') {
		localStorage.removeItem(key);
	}
};

export const setCookie = (name: string, value: string | number, minutes: number) => {
    const expiryDate = new Date(Date.now() + minutes * 60 * 1000);
    cookies.set(name, value, { path: '/', expires: expiryDate, secure: isProduction });
};

// if possible avoid retrieving/removing cookies by getCookie method
export const getCookie = (name: string) => cookies.get(name);
export const removeCookie = (name: string) => cookies.remove(name, { path: '/' });


export const clearTokens = () => {
    ['access_token', 'username'].forEach(removeCookie);
};

export const setAccessToken = (token: string) => setCookie('access_token', token, ACCESS_TOKEN_EXPIRY);

export const getAccessToken = () => getCookie('access_token') || null;

export const setUsername = (username:string) => setCookie('username', username, REFRESH_TOKEN_EXPIRY);

export const getUsername = () => getCookie('username') || null;

// I just use this to check if user is logged in
export const isLoggedIn = () => !!getUsername();

export const setCartCookie = (cart: string) => setCookie(CART_COOKIE_NAME, cart, CART_ALIVE_TIME);

export const getCartCookie = () => getCookie(CART_COOKIE_NAME);

export const removeCartCookie = () => removeCookie(CART_COOKIE_NAME);

// --- Analytic ID cookie helpers ---
export const setAnalyticIdCookie = (id: string) => setCookie(ANALYTIC_ID_COOKIE_NAME, id, ANALYTIC_ID_EXPIRY); // 1 year in minutes
export const getAnalyticIdCookie = () => getCookie(ANALYTIC_ID_COOKIE_NAME);
export const removeAnalyticIdCookie = () => removeCookie(ANALYTIC_ID_COOKIE_NAME);

// --- Analytic ID localStorage helpers ---
export const setAnalyticIdLocalStorage = (id: string) => setLocalStorage(ANALYTIC_ID_COOKIE_NAME, id);
export const getAnalyticIdLocalStorage = (): string | null => getLocalStorage(ANALYTIC_ID_COOKIE_NAME);
export const removeAnalyticIdLocalStorage = () => removeLocalStorage(ANALYTIC_ID_COOKIE_NAME);

// --- Wishlist cookie helpers ---
export const setWishlistCookie = (wishlist: string) => setCookie(WISHLIST_COOKIE_NAME, wishlist, WISHLIST_ALIVE_TIME);
export const getWishlistCookie = () => getCookie(WISHLIST_COOKIE_NAME);
export const removeWishlistCookie = () => removeCookie(WISHLIST_COOKIE_NAME);

