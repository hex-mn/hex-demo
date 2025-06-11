'use client';
import React, { useEffect, useState } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { sendRequestToPublicAPI } from '@/lib/api-service';
import { Product } from '@/lib/interfaces';
import { MdClose } from 'react-icons/md';
import { formatDateString, formatPrice } from '@/lib/utils';
import { updateLocalWishlistFromServer } from '@/lib/analytics';
import { isLoggedIn } from '@/lib/cookie-manipulation';

const WishlistPage = () => {
	const { wishlist, removeFromWishlist } = useWishlist();
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchProducts = async () => {
			setLoading(true);
			if (isLoggedIn()){
				await updateLocalWishlistFromServer();
			}
			if (!wishlist.length) {
				setLoading(false);
				return;
			}
			const slugs = wishlist.map(item => item.slug);
			const response = await sendRequestToPublicAPI('POST', '/product/list/', { slugs });
			setProducts(response || []);
			setLoading(false);
		};
		fetchProducts();
	}, [wishlist]);

	return (
		<div className="max-w-3xl mx-auto py-10 px-4">
			<h1 className="text-2xl font-semibold mb-8 text-center">Хадгалсан бараа</h1>
			{loading ? (
				<div className="flex flex-col items-center justify-center py-20">
					<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-gray-300 border-solid mb-4"></div>
					<div className="text-lg text-gray-600 font-semibold">Уншиж байна...</div>
				</div>
			) : products.length === 0 ? (
				<div className="flex flex-col items-center pb-20">
					<div className="text-lg text-gray-500">Танд хадгалсан бараа байхгүй байна.</div>
				</div>
			) : (
				<ul className="flex flex-col gap-4">
					{products.map((product) => {
						const variants = product.variants || [];
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
						const hasDiscount = discounted.length > 0;

						return (
							<li key={product.slug} className="flex bg-white rounded-xl shadow border border-gray-100 overflow-hidden ">
								<a href={`/product/${product.slug}`} className="flex-shrink-0 block w-32 h-32 sm:w-40 sm:h-40 relative group">
									{product.images && product.images[0] ? (
										<img
											src={product.images[0].mid || product.images[0].low}
											alt={product.name}
											className="w-full h-full object-cover object-center"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300 text-4xl">Бараа</div>
									)}
									{maxSale && (
										<span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow">
											-{maxSale}%
										</span>
									)}
								</a>
								<div className="flex-1 flex flex-col justify-between p-4 min-w-0">
									<div>
										<a href={`/product/${product.slug}`} className="block font-bold text-lg text-gray-800 group-hover:text-gray-900 transition-colors truncate">
											{product.name}
										</a>
										<div className="text-xs text-gray-400">
											{(() => {
												const item = wishlist.find(w => w.slug === product.slug);
												return item?.added_at
													? `Хадгалсан огноо: ${formatDateString(item.added_at)}`
													: null;
											})()}
										</div>
										<div className="font-semibold text-xl text-gray-700 mt-1">
											{hasDiscount ? (
												<>
													<div className="text-gray-400 text-sm line-through">
														{minPrice === maxPrice
															? formatPrice(minPrice)
															: `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
													</div>
													<div className="text-red-500">
														{lowest !== highest
															? `${formatPrice(lowest)} - ${formatPrice(highest)}`
															: `${formatPrice(lowest)}`}
													</div>
												</>
											) : (
												<span>
													{minPrice === maxPrice
														? formatPrice(minPrice)
														: `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
												</span>
											)}
										</div>
									</div>
								</div>
								<button
									className="self-start m-1 hover:text-red-500 text-gray-500 rounded-full p-2 z-10"
									onClick={() => removeFromWishlist(product.slug)}
									title="Remove from wishlist"
									type="button"
								>
									<MdClose className='w-5 h-5'/>
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};

export default WishlistPage;