// React hook for fetching, filtering, and infinite scrolling of products from the public API
import { useCallback, useEffect, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { sendRequestToPublicAPI } from "@/lib/api-service";
import { Attribute, Product } from "@/lib/interfaces";

const PAGE_SIZE = 20;

type UseProductFetcherParams = {
	filtersReady?: boolean;
	query?: string;
	discounted?: boolean;
	isFeatured?: boolean;
	isNew?: boolean;
	orderBy?: string | null;
	priceLow?: number | null;
	priceHigh?: number | null;
	selectedAttributes?: Record<string, any>;
	categories?: string[];
	collections?: string[];
};

const useProductFetcher = ({
	filtersReady = true,
	query,
	discounted,
	isFeatured,
	isNew,
	orderBy,
	priceLow,
	priceHigh,
	selectedAttributes,
	categories,
	collections,
}: UseProductFetcherParams) => {
	const [products, setProducts] = useState<Product[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const [infiniteLoading, setInfiniteLoading] = useState(false);
	const [availableAttributes, setAvailableAttributes] =  useState<Attribute[]>([]);
	const pageRef = useRef(1); // Tracks current page across renders

	const getProducts = useCallback(
		async (page = 1, append = false) => {
			if (!filtersReady) return; // Wait for filters to be ready
			if (infiniteLoading) return;

			setInfiniteLoading(true);
			const params: any = {
				page,
				page_size: PAGE_SIZE,
				full_data: true,
			};
			if (query) {
				params.query = query;
			} else {
				params.discounted = discounted;
				params.is_featured = isFeatured;
				params.is_new = isNew;
				params.order_by = orderBy;
				params.plow = priceLow ?? undefined;
				params.phigh = priceHigh ?? undefined;
				params.attribute_filters = selectedAttributes;
				params.categories = categories;
				params.collections = collections;
			}
			const response = await sendRequestToPublicAPI("POST", "/product/list/", params);

			const newProducts = response.results.products || [];
			const newAvailableAttributes = response.results.available_attributes || [];
			setProducts(prev => (append ? [...prev, ...newProducts] : newProducts));
			setTotalCount(response.count ?? null);
			setAvailableAttributes(newAvailableAttributes);

			const loadedCount = append ? products.length + newProducts.length : newProducts.length;
			setHasMore(response.count ? loadedCount < response.count : newProducts.length === PAGE_SIZE);
			setInfiniteLoading(false);
		},
		[
			query,
			discounted,
			isFeatured,
			isNew,
			orderBy,
			priceLow,
			priceHigh,
			selectedAttributes,
			infiniteLoading,
			products.length, // still needed for loadedCount
			filtersReady,
			categories,
			collections
		]
	);

	// Fetch on mount and filters change
	useEffect(() => {
		pageRef.current = 1;
		const fetchInitial = async () => {
			if (!filtersReady) return;
			setInfiniteLoading(true);
			const params: any = {
				page: 1,
				page_size: PAGE_SIZE,
				full_data: true,
			};
			if (query) {
				params.query = query;
			} else {
				params.discounted = discounted;
				params.is_featured = isFeatured;
				params.is_new = isNew;
				params.order_by = orderBy;
				params.plow = priceLow ?? undefined;
				params.phigh = priceHigh ?? undefined;
				params.attribute_filters = selectedAttributes;
				params.categories = categories;
				params.collections = collections;
			}
			const response = await sendRequestToPublicAPI("POST", "/product/list/", params);
			const newProducts = response.results.products || [];
			const newAvailableAttributes = response.results.available_attributes || [];
			setProducts(newProducts);
			setTotalCount(response.count ?? null);
			setHasMore(response.count ? newProducts.length < response.count : newProducts.length === PAGE_SIZE);
			setAvailableAttributes(newAvailableAttributes);
			setInfiniteLoading(false);
		};

		fetchInitial();
	}, [filtersReady, query, discounted, isFeatured, isNew, orderBy, priceLow, priceHigh, selectedAttributes, categories, collections]);

	// Infinite scroll handler
	useEffect(() => {
		const handleScroll = debounce(() => {
			if (
				infiniteLoading ||
				!hasMore ||
				window.innerHeight + window.scrollY < document.body.offsetHeight - 200
			)
				return;
			pageRef.current += 1;
			getProducts(pageRef.current, true);
		}, 200);

		window.addEventListener("scroll", handleScroll);
		return () => {
			handleScroll.cancel(); // Properly cancel debounced handler
			window.removeEventListener("scroll", handleScroll);
		};
	}, [infiniteLoading, hasMore, getProducts]);

	return { products, infiniteLoading, hasMore, totalCount, availableAttributes };
};

export default useProductFetcher;
