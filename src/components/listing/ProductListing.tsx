"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { sendRequestToPublicAPI } from "@/lib/api-service";
import { Attribute, ProductVariant } from "@/lib/interfaces";
import { formatPrice } from "@/lib/utils";
import useProductFetcher from "@/hooks/useProductFetcher";
import AttributeFilterList from "./AttributeFilterList";
import ProductFilterHeader from "./ProductFilterHeader";
import Link from "next/link";
import { useDebouncedCallback } from "use-debounce";
import { BiFilter } from "react-icons/bi";

export default function ProductListing({ categories, collections, query }: {
	categories?: string[];
	collections?: string[];
	query?: string | null;
}) {
	const router = useRouter();
	const [filtersReady, setFiltersReady] = useState(false);
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
	const [atTop, setAtTop] = useState(true);
	const lastScrollY = useRef(0);
	useEffect(() => {
		const handleScroll = () => {
			const scrollY = window.scrollY;
			setAtTop(scrollY < 10);
			lastScrollY.current = scrollY;
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);
	const [scrollDir, setScrollDir] = useState<'up' | 'down'>('up');
	const prevScrollY = useRef(0);
	useEffect(() => {
		const handleScroll = () => {
			const scrollY = window.scrollY;
			setAtTop(scrollY < 10);
			if (scrollY < prevScrollY.current) {
				setScrollDir('up');
			} else if (scrollY > prevScrollY.current) {
				setScrollDir('down');
			}
			prevScrollY.current = scrollY;
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);
	const [attributes, setAttributes] = useState<Attribute[]>([]);
	const [discounted, setDiscounted] = useState(false);
	const [isFeatured, setIsFeatured] = useState(false);
	const [isNew, setIsNew] = useState(false);
	const [orderBy, setOrderBy] = useState<string | null>(null);
	const [priceLow, setPriceLow] = useState<number | null>(null);
	const [priceHigh, setPriceHigh] = useState<number | null>(null);
	const [selectedAttributes, setSelectedAttributes] = useState<{ attribute: string; value: string }[]>([]);
	const [tempPriceLow, setTempPriceLow] = useState<number | null>(null);
	const [tempPriceHigh, setTempPriceHigh] = useState<number | null>(null);
	useEffect(() => {
		const fetchAttributes = async () => {
			const res = await sendRequestToPublicAPI("GET", "/attributes/");
			setAttributes(res.attributes || []);
		};
		fetchAttributes();
	}, []);
	const parseURLFilters = () => {
		const params = new URLSearchParams(window.location.search);
		return {
			discounted: params.get("discounted") === "true",
			isFeatured: params.get("isFeatured") === "true",
			isNew: params.get("isNew") === "true",
			orderBy: params.get("orderBy") ?? null,
			priceLow: params.get("priceLow") ? parseInt(params.get("priceLow")!) : null,
			priceHigh: params.get("priceHigh") ? parseInt(params.get("priceHigh")!) : null,
			attributeFilters: params.get("attribute_filters")?.split(",").map(pair => {
				const [attribute, value] = pair.split(":");
				return { attribute, value };
			}) ?? []
		};
	};
	useEffect(() => {
		const {
			discounted,
			isFeatured,
			isNew,
			orderBy,
			priceLow,
			priceHigh,
			attributeFilters
		} = parseURLFilters();

		setDiscounted(discounted);
		setIsFeatured(isFeatured);
		setIsNew(isNew);
		setOrderBy(orderBy);
		setPriceLow(priceLow);
		setPriceHigh(priceHigh);
		setTempPriceLow(priceLow);
		setTempPriceHigh(priceHigh);
		setSelectedAttributes(attributeFilters);
		setFiltersReady(true);
	}, []);
	const productFetcherProps = query ? {
		filtersReady: true,
		query,
	} : {
		filtersReady,
		discounted,
		isFeatured,
		isNew,
		orderBy,
		priceLow,
		priceHigh,
		selectedAttributes,
		categories,
		collections,
	};
	const { products, infiniteLoading, totalCount, availableAttributes } = useProductFetcher(productFetcherProps);
	const updateURLParams = useDebouncedCallback(() => {
		const params = new URLSearchParams();
		if (discounted) params.set("discounted", "true");
		if (isFeatured) params.set("isFeatured", "true");
		if (isNew) params.set("isNew", "true");
		if (orderBy) params.set("orderBy", orderBy);
		if (priceLow !== null) params.set("priceLow", priceLow.toString());
		if (priceHigh !== null) params.set("priceHigh", priceHigh.toString());
		if (selectedAttributes.length > 0) {
			const attrParam = selectedAttributes.map(a => `${a.attribute}:${a.value}`).join(",");
			params.set("attribute_filters", attrParam);
		}
		if (query) params.set("query", query); 
		router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
	}, 300);
	useEffect(() => {
		if (filtersReady) updateURLParams();
	}, [
		discounted, isFeatured, isNew, orderBy, priceLow, priceHigh, selectedAttributes, filtersReady, updateURLParams
	]);
	function getPriceInfo(variants:ProductVariant[]) {
		const prices = variants.map(v => v.price);
		const minPrice = Math.min(...prices);
		const maxPrice = Math.max(...prices);
		const discounted = variants.filter(v => v.discount_price != null);
		const nondiscounted = variants.filter(v => v.discount_price == null);
		const lowest = Math.min(
			...[...discounted.map(v => v.discount_price!), ...nondiscounted.map(v => v.price)]
		);
		const highest = Math.max(
			...[...discounted.map(v => v.discount_price!), ...nondiscounted.map(v => v.price)]
		);
		const discounts = discounted.map(v => Math.round((1 - v.discount_price! / v.price) * 100));
		const maxSale = discounts.length ? Math.max(...discounts) : null;

		return { minPrice, maxPrice, lowest, highest, maxSale, hasDiscount: discounted.length > 0 };
	}
	const toggleAttributeValue = (attribute: string, value: string) => {
		setSelectedAttributes(prev => {
			const exists = prev.find(a => a.attribute === attribute && a.value === value);
			if (exists) {
				return prev.filter(a => !(a.attribute === attribute && a.value === value));
			} else {
				return [...prev, { attribute, value }];
			}
		});
	};

	return (
		<div className="min-h-screen bg-gray-100">
			{filterDrawerOpen && (
				<button
					type="button"
					className="fixed inset-0 z-40 bg-black/50 bg-opacity-40 transition-opacity duration-300 md:hidden"
					onClick={() => setFilterDrawerOpen(false)}
					aria-label="Close filter drawer"
				/>
			)}
			<button
				className="md:hidden fixed left-0 right-0 z-10 bg-white border-b border-gray-200 shadow flex items-center justify-center h-14 font-semibold text-slate-700 transition-all duration-300"
				onClick={() => setFilterDrawerOpen(true)}
				style={{
					top:  atTop || scrollDir === 'up' ? 73 : 0,
					position: 'fixed',
				}}
			>
				Шүүлтүүр <BiFilter className="ms-1"/>
			</button>
			{/* Mobile Filter Drawer */}
			<div
				id="mobile-filter-drawer"
				className={`md:hidden overflow-y-auto pb-10 fixed top-0 left-0 h-full w-[80%] max-w-full bg-white z-50 shadow-lg transition-transform duration-300 ${filterDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
			>
				<div className="bg-white z-20 border-b border-gray-200 ">
					<div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
						<span className="font-semibold">Шүүлтүүр</span>
						<button onClick={() => setFilterDrawerOpen(false)} className="text-gray-500 text-lg font-bold">✕</button>
					</div>
					<ProductFilterHeader
						totalCount={totalCount}
						selectedAttributes={selectedAttributes}
						setSelectedAttributes={setSelectedAttributes}
						isNew={isNew}
						setIsNew={setIsNew}
						isFeatured={isFeatured}
						setIsFeatured={setIsFeatured}
						discounted={discounted}
						setDiscounted={setDiscounted}
						priceLow={priceLow}
						setPriceLow={setPriceLow}
						priceHigh={priceHigh}
						setPriceHigh={setPriceHigh}
						orderBy={orderBy}
						setOrderBy={setOrderBy}
						query={query}
						setQuery={() => {
							const params = new URLSearchParams(window.location.search);
							params.delete('query');
							router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
						}}
					/>
				</div>
				<div className="px-4">
					<div className="mb-4 space-y-4 bg-white rounded shadow-sm p-4 mt-4">
						{[
							{ label: "Шинэ", checked: isNew, onChange: () => setIsNew(p => !p) },
							{ label: "Хямдралтай", checked: discounted, onChange: () => setDiscounted(p => !p) },
							{ label: "Онцгой", checked: isFeatured, onChange: () => setIsFeatured(p => !p) },
						].map(({ label, checked, onChange }, idx) => (
							<label key={idx} className="flex items-center space-x-2 cursor-pointer">
								<input type="checkbox" checked={checked} onChange={onChange} className="hidden peer" />
								<span className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center transition-all duration-200 peer-checked:border-slate-400 peer-checked:bg-slate-400 peer-checked:shadow">
									<svg className="w-3 h-3 text-white hidden peer-checked:block" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
									</svg>
								</span>
								<span>{label}</span>
							</label>
						))}
					</div>
					<div className="mb-4 bg-white rounded shadow-sm p-4">
						<label className="block text-sm font-medium mb-1">Үнэ</label>
						<div className="flex items-center gap-2">
							<input
								type="text"
								inputMode="numeric"
								placeholder="Доод"
								className="w-full border border-gray-300 p-2 text-sm rounded"
								value={tempPriceLow !== null ? tempPriceLow.toLocaleString() : ""}
								onChange={(e) => {
									const raw = e.target.value.replace(/,/g, "");
									const num = raw ? parseInt(raw) : null;
									setTempPriceLow(num);
								}}
							/>
							<span>-</span>
							<input
								type="text"
								inputMode="numeric"
								placeholder="Дээд"
								className="w-full border border-gray-300 p-2 text-sm rounded"
								value={tempPriceHigh !== null ? tempPriceHigh.toLocaleString() : ""}
								onChange={(e) => {
									const raw = e.target.value.replace(/,/g, "");
									const num = raw ? parseInt(raw) : null;
									setTempPriceHigh(num);
								}}
							/>
						</div>
						<button
							className="mt-3 w-full bg-slate-400 hover:bg-slate-500 text-white font-semibold py-2 rounded transition"
							onClick={() => {
								setPriceLow(tempPriceLow ?? null);
								setPriceHigh(tempPriceHigh ?? null);
							}}
							type="button"
						>
							Шүүх
						</button>
					</div>
					<AttributeFilterList
						attributes={attributes}
						selectedAttributes={selectedAttributes}
						availableAttributes={availableAttributes}
						onToggleValue={toggleAttributeValue}
					/>
				</div>
			</div>
			<div className="flex flex-col md:flex-row max-w-7xl mx-auto pt-6">
				{/* Desktop sidebar */}
				<aside className="w-full md:w-80 p-4 hidden md:block">
					<h4 className="font-semibold mb-4">Шүүлтүүр</h4>
					<div className="mb-4 space-y-4 bg-white rounded shadow-sm p-4">
						{[
							{ label: "Шинэ", checked: isNew, onChange: () => setIsNew(p => !p) },
							{ label: "Хямдралтай", checked: discounted, onChange: () => setDiscounted(p => !p) },
							{ label: "Онцгой", checked: isFeatured, onChange: () => setIsFeatured(p => !p) },
						].map(({ label, checked, onChange }, idx) => (
							<label key={idx} className="flex items-center space-x-2 cursor-pointer">
								<input type="checkbox" checked={checked} onChange={onChange} className="hidden peer" />
								<span className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center transition-all duration-200 peer-checked:border-slate-400 peer-checked:bg-slate-400 peer-checked:shadow">
									<svg className="w-3 h-3 text-white hidden peer-checked:block" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
									</svg>
								</span>
								<span>{label}</span>
							</label>
						))}
					</div>
					<div className="mb-4 bg-white rounded shadow-sm p-4">
						<label className="block text-sm font-medium mb-1">Үнэ</label>
						<div className="flex items-center gap-2">
							<input
								type="text"
								inputMode="numeric"
								placeholder="Доод"
								className="w-full border border-gray-300 p-2 text-sm rounded"
								value={tempPriceLow !== null ? tempPriceLow.toLocaleString() : ""}
								onChange={(e) => {
									const raw = e.target.value.replace(/,/g, "");
									const num = raw ? parseInt(raw) : null;
									setTempPriceLow(num);
								}}
							/>
							<span>-</span>
							<input
								type="text"
								inputMode="numeric"
								placeholder="Дээд"
								className="w-full border border-gray-300 p-2 text-sm rounded"
								value={tempPriceHigh !== null ? tempPriceHigh.toLocaleString() : ""}
								onChange={(e) => {
									const raw = e.target.value.replace(/,/g, "");
									const num = raw ? parseInt(raw) : null;
									setTempPriceHigh(num);
								}}
							/>
						</div>
						<button
							className="mt-3 w-full bg-slate-400 hover:bg-slate-500 text-white font-semibold py-2 rounded transition"
							onClick={() => {
								setPriceLow(tempPriceLow ?? null);
								setPriceHigh(tempPriceHigh ?? null);
							}}
							type="button"
						>
							Шүүх
						</button>
					</div>
					<AttributeFilterList
						attributes={attributes}
						selectedAttributes={selectedAttributes}
						availableAttributes={availableAttributes}
						onToggleValue={toggleAttributeValue}
					/>
				</aside>

				<main className="flex-1 p-4">
					<div className="hidden md:block mb-4">
						<ProductFilterHeader
							totalCount={totalCount}
							selectedAttributes={selectedAttributes}
							setSelectedAttributes={setSelectedAttributes}
							isNew={isNew}
							setIsNew={setIsNew}
							isFeatured={isFeatured}
							setIsFeatured={setIsFeatured}
							discounted={discounted}
							setDiscounted={setDiscounted}
							priceLow={priceLow}
							setPriceLow={setPriceLow}
							priceHigh={priceHigh}
							setPriceHigh={setPriceHigh}
							orderBy={orderBy}
							setOrderBy={setOrderBy}
							query={query}
							setQuery={() => {
								const params = new URLSearchParams(window.location.search);
								params.delete('query');
								router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
							}}
						/>
					</div>
					<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-[40px] md:mt-0">
						{products.map((product, i) => {
							const variants = product.variants ?? [];
							const { minPrice, maxPrice, lowest, highest, maxSale, hasDiscount } = getPriceInfo(variants);

							return (
								<div key={i} className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-200 relative">
									{/* Sale badge */}
									{maxSale && (
										<div className="absolute top-3 right-3 z-5 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
											-{maxSale}%
										</div>
									)}
									<div className="absolute top-2 left-2 flex flex-col gap-1 mb-2 text-center">
										{product.is_featured && (
											<span className="inline-block bg-yellow-400 text-white text-xs font-semibold px-2 py-1 rounded">
												Онцгой
											</span>
										)}
										{product.is_new && (
											<span className="inline-block bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
												Шинэ
											</span>
										)}
									</div>
									<Link href={`/product/${product.slug}`} className="block">
										<div className="p-2 px-6">
											<img
												src={product.images?.[0]?.mid || "/placeholder.jpg"}
												alt={product.name}
												className="w-full h-42 object-cover rounded"
											/>
										</div>
										
										<div className="p-3">
											<h3 className="text-sm font-medium truncate">{product.name}</h3>
											<p className="text-xs text-gray-500 mb-1">{product.category_name}</p>
											<div className="text-gray-800 font-semibold text-end min-h-[3rem] flex flex-col justify-end">
												{hasDiscount ? (
													<>
													<div className="text-gray-400 text-sm line-through">
													{minPrice === maxPrice
														? formatPrice(minPrice)
														: `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
													</div>
													<div className="">
														{lowest !== highest
															? `${formatPrice(lowest)} - ${formatPrice(highest)}`
															: formatPrice(lowest)}
													</div>
													</>
												) : <div>
													{minPrice === maxPrice
														? formatPrice(minPrice)
														: `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
												</div>}
											</div>
										</div>
									</Link>
								</div>
							);
						})}
					</div>
					{infiniteLoading && (
						<div className="flex flex-col items-center justify-center py-8">
							<div className="w-10 h-10 border-4 border-slate-400 border-t-transparent rounded-full animate-spin mb-3"></div>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
