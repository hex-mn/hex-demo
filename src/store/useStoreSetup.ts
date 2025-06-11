// React hook for fetching and caching store setup settings with localStorage and API fallback
'use client';
import { sendRequestToPublicAPI } from '@/lib/api-service';
import { placeholderSettings, StoreSettings } from '@/lib/interfaces';
import { useEffect, useState } from 'react';

const CACHE_KEY = 'store_setup_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Custom React hook to fetch and cache store setup settings
export function useStoreSetup() {
	// State for store settings, loading, and error
	const [setup, setSetup] = useState<StoreSettings>(placeholderSettings);
	const [isLoading, setLoading] = useState(true);
	const [isError, setError] = useState(false);

	useEffect(() => {
		// Attempt to load cached setup from localStorage
		const cached = localStorage.getItem(CACHE_KEY);
		const now = Date.now();

		if (cached) {
			try {
				const parsed = JSON.parse(cached);
				// If cache is still valid, use it and skip API call
				if (now - parsed.timestamp < CACHE_TTL) {
					if (parsed.data == null) {
						throw new Error('Setup is null or undefined');
					}
					setSetup(parsed.data);
					setLoading(false);
					return;
				}
			} catch (err) {
				// If cache is corrupted or invalid, set error and stop loading
				setError(true);
				setLoading(false);
				throw err;
			}
		}

		// If no valid cache, fetch setup from API
		sendRequestToPublicAPI('GET', `/setup/get/`)
			.then(res => {
				if (!res) throw new Error('Failed to fetch');
				return res;
			})
			.then(data => {
				if (data == null) {
					throw new Error('Setup is null or undefined');
				}
				setSetup(data);
				// Cache the fetched setup with timestamp
				localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: now, data }));
			})
			.catch(() => setError(true))
			.finally(() => setLoading(false));
	}, []);

	// Return setup state and status flags for consumers of this hook
	return {
		setup,
		isLoading,
		isError,
	};
}
