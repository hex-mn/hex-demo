// Analytics utility functions for managing user analytics, cart, and wishlist data.
// Handles both logged-in and guest users, syncing with server and local storage.
import { sendRequestToPublicAPI, sendRequestWithToken } from "./api-service";
import { setCart } from './cart';
import { setAnalyticIdCookie, getAnalyticIdCookie, removeAnalyticIdCookie, isLoggedIn, getAnalyticIdLocalStorage, removeAnalyticIdLocalStorage, setAnalyticIdLocalStorage } from './cookie-manipulation';
import { setWishlist } from "./wishlist";

// Checks if analytics is enabled via environment variable
export const isAnalyticsEnabled = () => process.env.NEXT_PUBLIC_ANALYTIC_ENABLED === "true";
// Retrieves the store slug from environment variables
export const getStoreSlug = () => process.env.NEXT_PUBLIC_SLUG;

// Gets or creates a unique analytic ID for the user (cookie & localStorage & server)
export const getOrCreateAnalyticId = async () => {
	if (typeof window === 'undefined') return null;
	const localId = getAnalyticIdCookie();
	if (localId) {
		setAnalyticIdCookie(localId);
		setAnalyticIdLocalStorage(localId);
		return localId;
	} else {
		const localStorageId = getAnalyticIdLocalStorage();
		if (localStorageId) {
			setAnalyticIdCookie(localStorageId);
			return localStorageId;
		}
		const res = await sendRequestToPublicAPI("GET", `/analytic/get/`, null, true, true);
		if (res?.uuid) {
			setAnalyticIdCookie(res.uuid);
			setAnalyticIdLocalStorage(res.uuid);
			return res.uuid;
		}
	}
	return null;
};

// Updates the local cart from the server using the analytic ID
export const updateLocalCartFromServer = async () => {
	const analyticId = getAnalyticIdCookie();
	try {
		const serverCart = await sendRequestWithToken("POST", `${process.env.NEXT_PUBLIC_API_URL}/provider/analytics/cart/get/`, { uuid: analyticId }, true);
		if (serverCart && Array.isArray(serverCart.items)) {
			const localCart = serverCart.items.map((item: any) => ({
				sku: item.sku,
				amount: item.amount,
				price: Number(item.price),
			}));
			setCart(localCart);
		}
	} catch (e) {
		console.error('Failed to update local cart from server:', e);
	}
};

// Updates the local wishlist from the server using the analytic ID
export const updateLocalWishlistFromServer = async () => {
	const analyticId = getAnalyticIdCookie();
	try {
		const serverWishlist = await sendRequestWithToken("POST", `${process.env.NEXT_PUBLIC_API_URL}/provider/analytics/wishlist/get/`, { uuid: analyticId }, true);
		if (serverWishlist && Array.isArray(serverWishlist)) {
			// Just ensuring each item matches WishlistItem shape because something went wrong
			const normalizedWishlist = serverWishlist.map((item: any) => ({
				slug: item.slug,
				added_at: item.added_at,
			}));
			setWishlist(normalizedWishlist);
		}
	} catch (e) {
		console.error('Failed to update local wishlist from server:', e);
	}
};

// Merges analytics data (cart, view history, wishlist) for the current user
export const mergeAnalytics = async (opts?: { merge_cart?: boolean; merge_view_history?: boolean; merge_wishlist?: boolean }) => {
	const analyticId = getAnalyticIdCookie();
	if (!isAnalyticsEnabled()) return;
	try {
		if (analyticId) {
			await sendRequestWithToken("POST", `${process.env.NEXT_PUBLIC_API_URL}/provider/analytics/merge/`, {
				uuid: analyticId,
				merge_cart: opts?.merge_cart ?? true,
				merge_view_history: opts?.merge_view_history ?? true,
				merge_wishlist: opts?.merge_wishlist ?? true,
			}, true);
		}
		removeAnalyticIdLocalStorage();
		removeAnalyticIdCookie();
		await updateLocalCartFromServer();
		await updateLocalWishlistFromServer();
	} catch (e) {
		console.error('Analytics merge failed:', e);
	}
};

// Ensures analytic_id is set for non-logged-in users
const ensureAnalyticId = async (): Promise<string | null> => {
	let analyticId = getAnalyticIdCookie();
	if (!analyticId && !isLoggedIn()) {
		analyticId = await getOrCreateAnalyticId();
	}
	return analyticId;
};

// Posts the cart items to the server (handles both logged-in and guest users)
export const postCart = async (items: any[]) => {
	const analyticId = await ensureAnalyticId();
	if (!isAnalyticsEnabled()) return;
	if (isLoggedIn()) {
		return sendRequestWithToken("POST", `${process.env.NEXT_PUBLIC_API_URL}/provider/analytics/cart/post/`, { items }, true);
	} else {
		if (analyticId) {
			return sendRequestToPublicAPI("POST", `/cart/post/`, { uuid: analyticId, items }, true, true);
		}
	}
};

export const getCartFromServer = async () => {
	const analyticId = await ensureAnalyticId();
	if (!isAnalyticsEnabled()) return;
	if (isLoggedIn()) {
		return sendRequestWithToken("POST", `${process.env.NEXT_PUBLIC_API_URL}/provider/analytics/cart/get/`, { uuid: analyticId }, true);
	} else {
		return null;
	}
};

// posts list to accommadate mass posts. Modify it to your needs.
export const postViewHistory = async (product_slugs: string[]) => {
	const analyticId = await ensureAnalyticId();
	if (!isAnalyticsEnabled()) return;
	if (isLoggedIn()) {
		return sendRequestWithToken("POST", `${process.env.NEXT_PUBLIC_API_URL}/provider/analytics/view-history/post/`, { uuid: analyticId, product_slugs }, true);
	} else {
		return sendRequestToPublicAPI("POST", `/view/history/post/`, { uuid: analyticId, product_slugs }, true, true);
	}
};

export const getViewHistory = async (page = 1, page_size = 10) => {
	const analyticId = await ensureAnalyticId();
	if (!isAnalyticsEnabled()) return;
	if (isLoggedIn()) {
		return sendRequestWithToken("POST", `${process.env.NEXT_PUBLIC_API_URL}/provider/analytics/view-history/get/`, { uuid: analyticId, page, page_size }, true);
	} else {
		return sendRequestToPublicAPI("POST", `/view/history/get/`, { uuid: analyticId, page, page_size }, true, true);
	}
};

export const postWishlist = async (product_slugs: string[]) => {
	const analyticId = getAnalyticIdCookie();
	if (!isAnalyticsEnabled()) return;
	if (isLoggedIn()) {
		return sendRequestWithToken("POST", `${process.env.NEXT_PUBLIC_API_URL}/provider/analytics/wishlist/post/`, { uuid: analyticId, product_slugs }, true);
	} else {
		if (analyticId) {
			return sendRequestToPublicAPI("POST", `/wishlist/post/`, { uuid: analyticId, product_slugs }, true, true);
		}
	}
};

export const getWishlist = async () => {
	const analyticId = getAnalyticIdCookie();
	if (!isAnalyticsEnabled()) return;
	if (isLoggedIn()) {
		return sendRequestWithToken("POST", `${process.env.NEXT_PUBLIC_API_URL}/provider/analytics/wishlist/get/`, { uuid: analyticId }, true);
	} else {
		return null;
	}
};
