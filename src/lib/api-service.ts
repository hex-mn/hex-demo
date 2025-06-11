// This file provides API service utilities for handling authenticated and public API requests, token refresh, and user session management.
// It uses axios for HTTP requests and react-toastify for user notifications.
// Token and user info are managed via cookies, and cart/wishlist state is cleared on logout or token expiration.
import axios, { AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import { clearTokens, getAccessToken, setAccessToken, setUsername } from './cookie-manipulation';
import { clearCart } from './cart';
import { mergeAnalytics } from './analytics';
import { clearWishlist } from './wishlist';

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
// Promise to track ongoing refresh request
let refreshPromise: Promise<string | null> | null = null; 
let isLoggingOut = false; // Prevent multiple logout calls

// Attempts to refresh the access token using the refresh token (stored as httpOnly cookie).
// If already refreshing, returns the ongoing promise.
// On 401, logs out the user and clears session data.
export const refresh = async (): Promise<string | null> => {
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }
    try {
        isRefreshing = true;
        refreshPromise = axios.post('/api/oauth/refresh')
            .then((response) => {
                setAccessToken(response.data.access_token); // Store new access token
                setUsername(response.data.username); // Update username
                return response.data.access_token;
            })
            .catch((error) => {
                if (error.response?.status === 401 && !isLoggingOut) {
                    isLoggingOut = true;
                    axios.post('/api/oauth/logout');
                    clearCart();
                    clearWishlist();
                    clearTokens();
                    window.location.href = '/account';
                }
                throw error;
            })
            .finally(() => {
                isRefreshing = false;
                refreshPromise = null;
            });
        return refreshPromise;
    } catch (error: any) {
        isRefreshing = false;
        refreshPromise = null;
        throw error;
    }
};

// Helper to make HTTP requests of various types using axios
const makeRequest = async (type: string, endpoint: string, data?: any, config?: AxiosRequestConfig) => {
    switch (type.toUpperCase()) {
        case "GET":
            return (await axios.get(endpoint, config)).data;
        case "POST":
            return (await axios.post(endpoint, data, config)).data;
        case "PUT":
        case "UPDATE":
            return (await axios.put(endpoint, data, config)).data;
        case "DELETE":
            return (await axios.delete(endpoint, config)).data;
        default:
            throw new Error(`Unsupported request type: ${type}`);
    }
};

// Sends an authenticated request with Bearer token.
// If token is missing/expired, attempts to refresh it.
// Handles error notifications and auto-logout on 401.
export const sendRequestWithToken = async (type: string, endpoint: string, data?: any, silent: boolean = false): Promise<any> => {
    try {
        let accessToken = getAccessToken();
        if (!accessToken) {
            accessToken = await refresh();
            if (!accessToken) return null;
        }
        return await makeRequest(type, endpoint, data, { headers: { Authorization: `Bearer ${accessToken}` }, withCredentials:true });
    } catch (error:any) {
        if (error.response?.status === 400) {
            if (!silent) {
                toast.error(error.response.data.message?.toString() || "Алдаатай мэдээлэл");
            }
        }
        if (error.response?.status === 500) {
            if (!silent) {
                toast.error("Серверт холбогдоход алдаа гарлаа. Та дахин оролдоно уу.");
            }
        }
        if (error.response?.status === 401) {
            logout();
        }
        return null;
    }
};

// Sends a request to a public API endpoint, optionally including a slug in the URL.
// Handles error notifications for 400/500 responses.
export const sendRequestToPublicAPI = async (type: string, endpoint: string, data?: any, addSlug: boolean = true, silent: boolean = false): Promise<any> => {
    try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const slug = process.env.NEXT_PUBLIC_SLUG;
        const url = addSlug
            ? `${baseUrl}/open/${slug}${endpoint}`
            : `${baseUrl}${endpoint}`;
        return await makeRequest(type, url, data);
    } catch (error: any) {
    const status = error.response?.status;
    if (status === 400) {
      if (!silent && typeof window !== 'undefined') {
        toast.error(error.response.data.message?.toString() || "Алдаатай мэдээлэл");
      }
    } else if (status === 500) {
      if (!silent && typeof window !== 'undefined') {
        toast.error("Серверт холбогдоход алдаа гарлаа. Та дахин оролдоно уу.");
      }
    }
    return null;
  }
};

// Logs out the user: clears tokens, cart, wishlist, and redirects to /account
export const logout = async (): Promise<void> => {
    if (isLoggingOut) return; // Prevent multiple logouts
    isLoggingOut = true;
    try {
        // Call our own API route to clear httpOnly refresh_token cookie
        await sendRequestWithToken('POST', `${process.env.NEXT_PUBLIC_API_URL}/provider/oauth/logout/`, {client_id: process.env.NEXT_PUBLIC_CLIENT_ID}) // Clear server-side session
        await axios.post('/api/oauth/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        clearCart();
        clearWishlist();
        clearTokens();
        window.location.href = '/account';
    }
};

// Exchanges an OAuth code for access/refresh tokens via API route.
// Sets access token and username, merges analytics, and refreshes cart/wishlist.
export const exchangeCodeForTokens = async (code: string, refreshCart: () => void, refreshWishlist: () => void): Promise<void> => {
    try {
        // Call our own API route to handle token exchange securely
        const response = await axios.post('/api/oauth/exchange', { code });
        setAccessToken(response.data.access_token); // Store access_token in JS cookie
        setUsername(response.data.username); // Set username for tracking logged-in user
        await mergeAnalytics();
        refreshCart();
        refreshWishlist();
    } catch (error: any) {
        toast.error('OAuth солилцооны үед алдаа гарлаа.');
        throw error;
    }
};
