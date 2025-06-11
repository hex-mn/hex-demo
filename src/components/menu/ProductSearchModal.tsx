'use client';
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendRequestToPublicAPI } from "@/lib/api-service";
import { Product } from "@/lib/interfaces";
import Link from "next/link";
import { BiSearch } from "react-icons/bi";

interface ProductSearchModalProps {
	open: boolean;
	onClose: () => void;
}

const PAGE_SIZE = 20;

export default function ProductSearchModal({ open, onClose }: ProductSearchModalProps) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Product[]>([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loadingNext, setLoadingNext] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const router = useRouter();

	const fetchProducts = useCallback(async (q: string, p = 1, append = false) => {
		if (!q) {
			setResults([]);
			setHasMore(false);
			return;
		}
		if (p === 1) setLoading(true);
		else setLoadingNext(true);
		const res = await sendRequestToPublicAPI("POST", "/product/list/", {
			page: p,
			page_size: PAGE_SIZE,
			full_data: true,
			query: q,
		});
		const products = res?.results?.products || [];
		setResults(prev => (append ? [...prev, ...products] : products));
		setHasMore(products.length === PAGE_SIZE);
		setLoading(false);
		setLoadingNext(false);
	}, []);

	// Infinite scroll
	useEffect(() => {
		const container = scrollRef.current;
		if (!container) return;
		const handleScroll = () => {
			if (
				container.scrollTop + container.clientHeight >= container.scrollHeight - 100 &&
				hasMore && !loadingNext
			) {
				const nextPage = page + 1;
				setPage(nextPage);
				fetchProducts(query, nextPage, true);
			}
		};
		container.addEventListener("scroll", handleScroll);
		return () => container.removeEventListener("scroll", handleScroll);
	}, [hasMore, loadingNext, page, query, fetchProducts]);

	// Reset on open
	useEffect(() => {
		if (open) {
			setQuery("");
			setResults([]);
			setPage(1);
			setHasMore(true);
		}
	}, [open]);

	// Search on query change
	useEffect(() => {
		if (query) {
			setPage(1);
			fetchProducts(query, 1, false);
		} else {
			setResults([]);
			setHasMore(false);
		}
	}, [query, fetchProducts]);

	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			goToSearchPage();
		}
	};

	const goToSearchPage = () => {
		if (query) {
			onClose();
			router.push(`/products?query=${encodeURIComponent(query)}`);
		}
	};

	if (!open) return null;

	return (

		<div
			className="fixed inset-0 z-[110] bg-black/30 flex items-center justify-center backdrop-blur-xs"
			onClick={onClose}
		>
			<div
				className="fixed top-[50px] bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col shadow-lg"
				onClick={e => e.stopPropagation()}
			>
				<div className="p-4 border-b border-gray-300 flex items-center gap-2">
					<input
						type="text"
						placeholder="Барааны нэрээр хайх..."
						className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-0 focus:border-gray-300"
						value={query}
						onChange={handleInput}
						onKeyDown={handleKeyDown}
						autoFocus
					/>
					<button
						onClick={goToSearchPage}
						className="p-2 font-semibold border text-gray-600 border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-0 focus:border-gray-300 transition"
						aria-label="Search"
					>
						<BiSearch className="w-[24px] h-[24px]"/>
					</button>
				</div>
				<div ref={scrollRef} className="flex-1 overflow-y-auto divide-y divide-gray-200 max-h-[calc(100vh-300px)]">

					{loading && <div className="text-center text-sm text-gray-400 p-6">Уншиж байна...</div>}
					{!loading && results.length === 0 && query && (
						<div className="text-center text-sm text-gray-400 p-6">Илэрц олдсонгүй.</div>
					)}
					{results.map(product => (
						<Link onClick={onClose} key={product.slug} href={`/product/${product.slug}`}>
							<div className="flex items-center gap-4 p-4 hover:bg-gray-100 transition">
								<div
									className="w-20 h-20 min-w-[5rem] bg-gray-200 rounded"
									style={{
										backgroundImage: `url(${product.images?.[0]?.low || ""})`,
										backgroundSize: 'cover',
										backgroundPosition: 'center',
									}}
								/>
								<div className="flex flex-col text-sm text-gray-700 w-full gap-1">
									<div className="font-semibold">{product.name}</div>
									<div className="text-xs text-gray-500">{product.category_name}</div>
								</div>
							</div>
						</Link>
					))}
					{loadingNext && <div className="text-center text-sm text-gray-400 p-4">Уншиж байна...</div>}
				</div>
			</div>
		</div>

	);
}
