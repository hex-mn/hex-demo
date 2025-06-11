// Handles caching and deduplication of variant API requests
import { sendRequestToPublicAPI } from './api-service';
import { VariantFull } from './interfaces';

// In-memory cache for variants, keyed by sorted SKU list string
export const variantCache: Record<string, VariantFull[]> = {};
// Tracks in-flight API requests to prevent duplicate calls for the same SKU list
const inFlightRequests: Record<string, Promise<VariantFull[]>> = {};

/**
 * Fetches variants for a list of SKUs, using cache and deduplication.
 * @param skuList List of SKUs to fetch variants for
 * @param forceRefresh If true, bypasses cache and refetches from API
 * @returns Promise resolving to an array of VariantFull objects
 */
export async function getVariants(skuList: string[], forceRefresh = false): Promise<VariantFull[]> {
	// Create a cache key by sorting and joining the SKU list
	const key = skuList.slice().sort().join(',');
	// Return cached result if available and not forcing refresh
	if (!forceRefresh && variantCache[key]) return variantCache[key];

	// If no request in flight or force refresh, start a new API call
	if (!inFlightRequests[key] || forceRefresh) {
		inFlightRequests[key] = fetchVariants(skuList).then(res => {
			variantCache[key] = res; // Cache the result
			delete inFlightRequests[key]; // Clean up in-flight tracker
			return res;
		});
	}

	// Return the in-flight promise (deduplicates concurrent requests)
	return inFlightRequests[key];
}

/**
 * Makes the actual API call to fetch variants for the given SKUs.
 * @param skuList List of SKUs
 * @returns Promise resolving to an array of VariantFull objects (empty if API fails)
 */
async function fetchVariants(skuList: string[]): Promise<VariantFull[]> {
	const response = await sendRequestToPublicAPI('POST', '/variant/list/', {
		sku_list: skuList,
	});
	return response ? response : [];
}
