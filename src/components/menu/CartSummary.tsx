'use client';
import { useCart } from '@/context/CartContext';
import { VariantFull } from '@/lib/interfaces';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { getVariants } from '@/lib/variant-cache';
import { updateLocalCartFromServer } from '@/lib/analytics';
import { isLoggedIn } from '@/lib/cookie-manipulation';
import { TbRefresh } from 'react-icons/tb';
import { useStore } from '@/context/StoreContext';

interface CartSummaryProps {
	onLinkClick?: () => void;
	noteEnabled?: boolean;
}

const CartSummary = forwardRef<{ refreshVariantList: () => Promise<void> }, CartSummaryProps>(
	({ onLinkClick, noteEnabled = false }, ref) => {
		const { setup } = useStore();
		const { cart, addToCart, editCartItem, refreshCart } = useCart();
		const [variantList, setVariantList] = useState<VariantFull[]>([]);
		const [cartLoading, setCartLoading] = useState(true);
		const [inputAmount, setInputAmount] = useState<Record<string, string>>({});
		const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

		const cartItems = React.useMemo(() => Array.isArray(cart) ? cart : [], [cart]);

		const syncWithServer = async () => {
			setCartLoading(true);
			await updateLocalCartFromServer();
			refreshCart();
			setCartLoading(false);
		};

		useEffect(() => {
			const items = cartItems;
			const skus = items.map(item => item.sku);
			if (skus.length === 0) {
				setCartLoading(false);
				setVariantList([]);
				return;
			}
			const fetch = async () => {
				setCartLoading(true);
				try {
					const variants = await getVariants(skus);
					setVariantList(variants);
				} finally {
					setCartLoading(false);
				}
			};
			fetch();
		}, [cartItems]);

		useEffect(() => {
			setInputAmount(
				cartItems.reduce((acc, item) => {
					acc[item.sku] = item.amount.toString();
					return acc;
				}, {} as Record<string, string>)
			);
		}, [cartItems]);

		const handleInputChange = (
			sku: string,
			value: string,
			inventory: number | undefined,
			currentAmount: number
		) => {
			setInputAmount(prev => ({ ...prev, [sku]: value }));
			if (debounceTimers.current[sku]) clearTimeout(debounceTimers.current[sku]);

			debounceTimers.current[sku] = setTimeout(() => {
				let amount = parseInt(value, 10);
				if (isNaN(amount) || amount < 1) amount = 1;
				if (typeof inventory === 'number' && amount > inventory) amount = inventory;
				setInputAmount(prev => ({ ...prev, [sku]: amount.toString() }));

				if (amount !== currentAmount) {
					const variant = variantList.find(v => v.sku === sku);
					const price = variant ? (variant.discount_price ?? variant.price) : 0;
					editCartItem(sku, amount, price);
				}
			}, 400);
		};

		const refreshVariantList = async () => {
			const items = cartItems;
			const skus = items.map(item => item.sku);
			if (skus.length === 0) {

				setVariantList([]);
				return;
			}
			setCartLoading(true);
			try {
				const variants = await getVariants(skus, true);
				setVariantList(variants);
			} finally {
				setCartLoading(false);
			}
		};

		useImperativeHandle(ref, () => ({
			refreshVariantList
		}));

		return (
			<div className="relative">
				{cartLoading ? (
					<div className="absolute inset-0 flex justify-center items-center z-10 pointer-events-auto py-6">
						<div className="w-6 h-6 border-4 border-slate-300 border-t-slate-400 rounded-full animate-spin"></div>
					</div>
				) : cartItems.length === 0 ? (
					<p className="text-gray-400 text-center py-8 text-sm">Сагс хоосон байна.</p>
				) : (
					<>
						<ul className="divide-y divide-gray-300 px-4">
							{cartItems.map(item => {
								const { sku, amount, price: cartPrice } = item;
								const variant = variantList.find(v => v.sku === sku);
								let error = '';
								let productName = '';
								let productSlug = '';
								let image = '';
								let inventory = 0;
								let price = 0;
								let discountPrice: number | null = null;
								if (variant) {
									productName = variant.product?.name || '';
									productSlug = variant.product?.slug || '';
									const images = (variant.images?.length ? variant.images : variant.product?.images) || [];
									image = images[0]?.low || '';
									inventory = variant.inventory;
									price = variant.price;
									discountPrice = variant.discount_price;

									if (inventory && amount > inventory) {
										error = `Та хамгийн ихдээ (${inventory}) ширхэгийг авах боломжтой.`;
									}
									// Add max_limit warning
									const maxLimit = variant.product?.max_limit;
									if (typeof maxLimit === 'number' && maxLimit > 0 && amount > maxLimit) {
										error = `Та хамгийн ихдээ (${maxLimit}) ширхэг авах боломжтой.`;
									}
								} else {
									error = 'Бараа олдсонгүй.';
								}
								const actualPrice = discountPrice ?? price;

								return (
									<li key={sku} className="py-4 flex gap-3 relative group">
										<div className="w-24 h-24 flex-shrink-0 rounded bg-gray-100 overflow-hidden border border-gray-300 flex items-center justify-center">
											<Link href={`/product/${productSlug}`} onClick={onLinkClick}>
												{image ? (
													<img src={image} alt={productName} className="w-full h-full object-cover" />
												) : (
													<span className="text-gray-300 text-2xl">?</span>
												)}
											</Link>
										</div>
										<div className="flex-1 min-w-0">
											<Link href={`/product/${productSlug}`} onClick={onLinkClick}>
												<div className="font-semibold text-gray-900 truncate">{productName || sku}</div>
											</Link>
											<div className="text-xs text-gray-500 font-mono">{sku}</div>

											{variant && (
												<div className="mt-1">
													<div className="flex items-center gap-2">
														{discountPrice ? (
															<>
																<span className="line-through text-sm text-gray-400">{formatPrice(price)}</span>
																<span className="text-gray-800">{formatPrice(discountPrice)}</span>
															</>
														) : (
															<span className="text-gray-800">{formatPrice(price)}</span>
														)}
													</div>

													{Number(actualPrice) !== Number(cartPrice) && (
														<div className="text-red-500 text-xs mt-1 flex items-center gap-2">
															Үнийн дүн өөрчлөгдсөн байна.
															<button
																className="animate-bounce ml-1 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200 border border-red-400"
																onClick={() => editCartItem(sku, amount, actualPrice)}
															>
																ОК
															</button>
														</div>
													)}

													<div className="flex items-center gap-4 mt-2">
														<div className="flex border border-gray-200 rounded">
															<button
																className="px-3 py-1 text-lg text-slate-700 hover:text-slate-400 disabled:opacity-10"
																onClick={() => amount > 1 && editCartItem(sku, amount - 1, actualPrice)}
																disabled={amount <= 1}
															>
																-
															</button>
															<input
																type="number"
																min={1}
																max={inventory}
																value={inputAmount[sku] ?? amount.toString()}
																onChange={e => handleInputChange(sku, e.target.value, inventory, amount)}
																className="w-14 text-center py-1 text-lg font-mono focus:ring-0 outline-none hide-number-spin"
															/>
															<button
																className="px-3 py-1 text-lg text-slate-700 hover:text-slate-400 disabled:opacity-10"
																onClick={() => addToCart(sku, 1, actualPrice)}
																disabled={!!inventory && amount >= inventory}
															>
																+
															</button>
														</div>
														<button
															className="text-sm text-gray-700 border-b border-gray-700"
															onClick={() => editCartItem(sku, 0, 0)}
														>
															Устгах
														</button>
													</div>
												</div>
											)}

											{error && (
												<div className={`mt-2 text-xs text-red-500`}>
													{error}
													{error.includes('олдсонгүй') && (
														<button
															className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200"
															onClick={() => editCartItem(sku, 0, 0)}
														>
															Устгах
														</button>
													)}
												</div>
											)}
										</div>
									</li>
								);
							})}
						</ul>
						{setup.delivery_fee_enabled && (
							<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-t border-gray-300 py-4 mx-4 mt-4 gap-1">
								<span className="text-sm text-gray-700">Хүргэлтийн үнэ:</span>
								{(() => {
									const total = cartItems.reduce((sum, item) => {
										const variant = variantList.find(v => v.sku === item.sku);
										const actualPrice = variant ? (variant.discount_price ?? variant.price) : item.price;
										return sum + actualPrice * item.amount;
									}, 0);
									const threshold = setup.delivery_fee_threshold || 0;
									const fee = setup.delivery_fee || 0;
									if (total >= threshold && threshold > 0) {
										return (
											<span className="font-bold text-green-600">
												0₮ <span className="text-xs text-gray-500">(Үнэгүй хүргэлт)</span>
											</span>
										);
									} else {
										const diff = Math.max(0, threshold - total);
										return (
											<div className="flex flex-col items-end w-full sm:w-auto">
												<span className="font-bold text-gray-900">{formatPrice(fee)}</span>
												{threshold > 0 && (
													<span className="mt-1 sm:mt-0 sm:ml-2 text-xs text-gray-500 whitespace-nowrap">
														{formatPrice(diff)} нэмбэл үнэгүй хүргэлттэй
													</span>
												)}
											</div>
										);
									}
								})()}
							</div>
						)}
					</>
				)}



				{setup.checkout_note && noteEnabled && (
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-t border-gray-300 py-4 mx-4  gap-1 text-gray-700">
						<div dangerouslySetInnerHTML={{ __html: setup.checkout_note }} />
					</div>
				)}

				{!cartLoading && (
					<div className='flex flex-row justify-between mx-4 items-center border-t border-gray-300 pt-6'>
						<div>
							{isLoggedIn() && (
								<button
									className='text-sm border border-gray-600 text-gray-700 p-2 rounded-lg shadow-md hover:bg-gray-100 hover:border-gray-600 transition-colors duration-150 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-400'
									onClick={syncWithServer}
									title="Сагсыг шинэчлэх"
								>
									<TbRefresh className="w-4 h-4" />
								</button>
							)}
						</div>
						<div className="text-right font-bold text-xl">
							{(() => {
								const total = cartItems.reduce((sum, item) => {
									const variant = variantList.find(v => v.sku === item.sku);
									const actualPrice = variant ? (variant.discount_price ?? variant.price) : item.price;
									return sum + actualPrice * item.amount;
								}, 0);
								const threshold = setup.delivery_fee_threshold || 0;
								const fee = setup.delivery_fee || 0;
								const showDeliveryFee = setup.delivery_fee_enabled && (threshold === 0 || total < threshold);
								const grandTotal = showDeliveryFee ? total + fee : total;
								return (
									<>
										Нийт:{' '}
										{grandTotal.toLocaleString()}₮
										{showDeliveryFee && (
											<span className="block text-xs text-gray-500">
												(Хүргэлтийн үнэ багтсан)
											</span>
										)}
									</>
								);
							})()}
						</div>
					</div>
				)}
			</div>
		);
	}
);

CartSummary.displayName = 'CartSummary';
export default CartSummary;
