'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { WishlistItem, getWishlist, addToWishlist as cookieAdd, removeFromWishlist as cookieRemove, clearWishlist as cookieClear, setWishlist as cookieSet } from '@/lib/wishlist';
import { postWishlist } from '@/lib/analytics';

interface WishlistContextValue {
	wishlist: WishlistItem[];
	isInWishlist: (slug: string) => boolean;
	addToWishlist: (item: WishlistItem) => void;
	addProductToWishlist: (slug: string) => void;
	removeFromWishlist: (slug: string) => void;
	clearWishlist: () => void;
	refreshWishlist: () => void;
	setWishlist: (wishlist: WishlistItem[]) => void;
}

interface WishlistProviderProps {
	children: React.ReactNode;
	onWishlistChange?: (wishlist: WishlistItem[]) => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export const WishlistProvider = ({ children, onWishlistChange }: WishlistProviderProps) => {
	const [wishlist, setWishlistState] = useState<WishlistItem[]>([]);

	const refreshWishlist = () => {
		const w = getWishlist();
		setWishlistState(w);
		if (onWishlistChange) onWishlistChange(w);
		return w;
	};

	useEffect(() => {
		refreshWishlist();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	//Probably not needed, but keeping for consistency
	const addToWishlist = (item: WishlistItem) => {
		cookieAdd(item);
		postWishlist(refreshWishlist().map(item => item.slug));
	};

	const addProductToWishlist = (slug: string) => {
		const item: WishlistItem = {
			slug,
			added_at: new Date().toISOString(),
		};
		addToWishlist(item);
	};

	const removeFromWishlist = (slug: string) => {
		cookieRemove(slug);
		postWishlist(refreshWishlist().map(item => item.slug));
	};

	const clearWishlist = () => {
		cookieClear();
		postWishlist(refreshWishlist().map(item => item.slug));
	};

	const setWishlist = (wishlist: WishlistItem[]) => {
		cookieSet(wishlist);
		postWishlist(refreshWishlist().map(item => item.slug));
	};

	const isInWishlist = (slug: string) => wishlist.some(item => item.slug === slug);

	return (
		<WishlistContext.Provider
			value={{
				wishlist,
				isInWishlist,
				addToWishlist,
				addProductToWishlist,
				removeFromWishlist,
				clearWishlist,
				refreshWishlist,
				setWishlist,
			}}
		>
			{children}
		</WishlistContext.Provider>
	);
};

export const useWishlist = () => {
	const context = useContext(WishlistContext);
	if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
	return context;
};
