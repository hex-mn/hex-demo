'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
	getCart,
	addToCart as cookieAdd,
	clearCart as cookieClear,
	CartItem,
	editCartItem as cookieEdit,
} from '@/lib/cart';
import { postCart } from '@/lib/analytics';

interface CartContextValue {
	cart: CartItem[];
	totalCount: number;
	isCartOpen: boolean;
	openCart: () => void;
	closeCart: () => void;
	toggleCart: () => void;
	addToCart: (sku: string, count?: number, price?: number, open?: boolean) => void;
	editCartItem: (sku: string, amount: number, price: number) => void;
	clearCart: () => void;
	refreshCart: () => void;
}

interface CartProviderProps {
	children: React.ReactNode;
	onCartChange?: (cart: CartItem[]) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children, onCartChange }: CartProviderProps) => {
	const [cart, setCartState] = useState<CartItem[]>([]);
	const [isCartOpen, setIsCartOpen] = useState(false);

	const refreshCart = () => {
		const c = getCart();
		setCartState(c);
		if (onCartChange) onCartChange(c);
		return c;
	};

	useEffect(() => {
		refreshCart();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const addToCart = (sku: string, count: number = 1, price: number = 0, open: boolean = false) => {
		cookieAdd(sku, count, price);
		postCart(refreshCart());
		if (open) openCart();
	};

	const editCartItem = (sku: string, amount: number, price: number) => {
		cookieEdit(sku, amount, price);
		postCart(refreshCart());
	};

	const clearCart = () => {
		cookieClear();
		postCart(refreshCart());
	};

	const openCart = () => setIsCartOpen(true);
	const closeCart = () => setIsCartOpen(false);
	const toggleCart = () => setIsCartOpen(prev => !prev);

	const totalCount = cart?.reduce((sum, item) => sum + item.amount, 0) || 0;

	return (
		<CartContext.Provider
			value={{
				cart,
				totalCount,
				addToCart,
				editCartItem,
				clearCart,
				refreshCart,
				isCartOpen,
				openCart,
				closeCart,
				toggleCart,
			}}
		>
			{children}
		</CartContext.Provider>
	);
};

export const useCart = () => {
	const context = useContext(CartContext);
	if (!context) throw new Error('useCart must be used within a CartProvider');
	return context;
};
