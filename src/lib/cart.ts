// Utility functions for managing the shopping cart using cookies (add, edit, clear, and retrieve cart items)

import { setCartCookie, getCartCookie, removeCartCookie } from "./cookie-manipulation";

export interface CartItem {
	sku: string;
	amount: number;
	price: number;
}

// Encode and store cart in cookie
export const setCart = (cart: CartItem[]) => {
	if (typeof window === 'undefined') return; // avoid running on server
	if (!Array.isArray(cart)) return;
	const stringified = encodeURIComponent(JSON.stringify(cart));
	setCartCookie(stringified)
};

// Safely decode and parse cookie
export const getCart = (): CartItem[]  => {
	if (typeof window === 'undefined') return [];
	const raw = getCartCookie();
	if (!raw) return [];
	try {
		const decoded = decodeURIComponent(raw);
		const parsed = JSON.parse(decoded);
		if (!Array.isArray(parsed)) return [];
		return parsed;
	} catch (e) {
		console.error("Failed to parse cart cookie:", e);
		return [];
	}
};

export const getCartTotalCount = (): number => {
	const cart = getCart();
	return cart?.reduce((sum, item) => sum + item.amount, 0) || 0;
};

export const getCartItemCount = (sku: string): number => {
	const cart = getCart();
	if (!cart) return 0;
	const item = cart.find(item => item.sku === sku);
	return item ? item.amount : 0;
};

export const addToCart = (sku: string, amount: number = 1, price: number = 0) => {
	if (amount <= 0) return;
	let cart = getCart();
	if (!cart) {
		cart = [{ sku, amount, price }];
	} else {
		const item = cart.find(item => item.sku === sku);
		if (item) {
			item.amount += amount;
			item.price = price; // update price if needed
		} else {
			cart.push({ sku, amount, price });
		}
	}
	setCart(cart);
};

export const editCartItem = (sku: string, amount: number, price: number) => {
	const cart = getCart();
	if (!cart) return;
	const idx = cart.findIndex(item => item.sku === sku);
	if (idx === -1) return;
	if (amount <= 0) {
		cart.splice(idx, 1);
		setCart(cart);
		return;
	}
	cart[idx].amount = amount;
	cart[idx].price = price;
	setCart(cart);
};


export const clearCart = () => {
	if (typeof window === 'undefined') return;
	removeCartCookie();
};

