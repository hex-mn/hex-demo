// Utility functions for managing the shopping wishlist using cookies (add, edit, clear, and retrieve wishlist items)

import { setWishlistCookie, getWishlistCookie, removeWishlistCookie } from './cookie-manipulation';

export interface WishlistItem {
	slug: string;
	added_at: string;
}

export const setWishlist = (wishlist: WishlistItem[]) => {
	if (typeof window === 'undefined') return;
	if (!Array.isArray(wishlist)) return;
	const stringified = encodeURIComponent(JSON.stringify(wishlist));
	setWishlistCookie(stringified);
};

export const getWishlist = (): WishlistItem[] => {
	if (typeof window === 'undefined') return [];
	const raw = getWishlistCookie();
	if (!raw) return [];
	try {
		const decoded = decodeURIComponent(raw);
		const parsed = JSON.parse(decoded);
		if (!Array.isArray(parsed)) return [];
		return parsed;
	} catch (e) {
		console.error('Failed to parse wishlist cookie:', e);
		return [];
	}
};

export const addToWishlist = (item: WishlistItem) => {
	if (!item || !item.slug) return;
	const wishlist = getWishlist();
	if (!wishlist.find(w => w.slug === item.slug)) {
		wishlist.push(item);
		setWishlist(wishlist);
	}
};

export const removeFromWishlist = (slug: string) => {
	const wishlist = getWishlist();
	const updatedWishlist = wishlist.filter(item => item.slug !== slug);
	setWishlist(updatedWishlist);
};

export const clearWishlist = () => {
	if (typeof window === 'undefined') return;
	removeWishlistCookie();
};
