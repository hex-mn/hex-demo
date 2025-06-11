import React from 'react';
import Link from 'next/link';
import { BiChevronDown } from 'react-icons/bi';
import { FaHeart } from 'react-icons/fa';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/lib/utils';
import { Product, ProductVariant } from '@/lib/interfaces';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

interface ProductInfoProps {
	product: Product;
	bundle: Product[];
	attributeOrder: string[];
	allAttributes: Record<string, Set<string>>;
	selectedAttributes: Record<string, string>;
	setSelectedAttributes: (attrs: Record<string, string>) => void;
	getValidValues: (attribute: string) => Set<string>;
	matchedVariant: ProductVariant | null;
	count: number;
	setCount: React.Dispatch<React.SetStateAction<number>>;
	addToCart: (sku: string, count: number, price: number, show: boolean) => void;
	showDescription: boolean;
	setShowDescription: (show: boolean) => void;
	isOutOfStock?: boolean;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
	product,
	bundle,
	attributeOrder,
	allAttributes,
	selectedAttributes,
	setSelectedAttributes,
	getValidValues,
	matchedVariant,
	count,
	setCount,
	addToCart,
	showDescription,
	setShowDescription,
	isOutOfStock = false,
}) => {
	const { isInWishlist, removeFromWishlist, addProductToWishlist } = useWishlist();
	const slug = product.slug;
	const inWishlist = isInWishlist(slug);


	return (
		<div className="flex flex-col gap-2 col-span-4 sticky top-26 self-start mt-4 sm:mt-0 sm:px-10">
			<div className='flex flex-row justify-between items-start mb-4'>
				<div>
					<h1 className="text-2xl font-bold">{product.name}</h1>
					<Link href={`/products/category/${product.category_slug}`} className="text-gray-500 mb-6">Ангилал: <span className='underline'>{product.category_name}</span></Link>
					<div className="flex gap-1 mt-2 text-center">
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
				</div>
				<div className="ml-4 flex items-start">
					<button
						aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
						onClick={() => inWishlist ? removeFromWishlist(slug) : addProductToWishlist(slug)}
						className={`p-2 rounded-full border transition-colors ${inWishlist ? 'bg-white text-red-500 border-red-200' : 'bg-gray-100 text-gray-400 border-gray-200 hover:text-red-500 hover:border-red-300'}`}
						title={inWishlist ? 'Хүслийн жагсаалтаас хасах' : 'Хүслийн жагсаалтад нэмэх'}
					>
						<FaHeart size={22} fill={inWishlist ? '#ef4444' : 'currentColor'} />
					</button>
				</div>
			</div>

			{bundle && bundle.length > 0 && (
				<div className="w-full mb-4">
					<div className="block">
						<Swiper
							spaceBetween={10}
							slidesPerView={'auto'}
							breakpoints={{
								0: { slidesPerView: 'auto', spaceBetween: 10 },
							}}
							className="bundle-swiper"
							style={{ width: '100%' }}
						>
							{bundle.map((b) => (
								<SwiperSlide key={b.slug} style={{ width: 80, maxWidth: 80, minWidth: 80 }}>
									<Link href={`/product/${b.slug}`} className="block group">
										<img
											src={b.images?.[0]?.low || '/default.jpg'}
											alt={b.name}
											className={`aspect-square w-full object-cover rounded border transition-all ${b.slug === product.slug ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
											style={{ aspectRatio: '1 / 1' }}
										/>
									</Link>
								</SwiperSlide>
							))}
						</Swiper>
					</div>
				</div>
			)}
			
			{!isOutOfStock && (
				<>
					{attributeOrder.map((attribute) => {
						// Only show values that have inventory > 0 in at least one variant
						const values = [...allAttributes[attribute]].filter(value =>
							product.variants?.some((v: ProductVariant) => {
								const attr = Array.isArray(v.attributes) ? v.attributes.find(a => a.attribute === attribute) : undefined;
								return attr && attr.value === value && (v.inventory === undefined || v.inventory > 0);
							})
						);
						const validValues = getValidValues(attribute);
						return (
							<div key={attribute}>
								<label className="block font-medium">{attribute}:</label>
								<div className="flex flex-wrap gap-2 mt-1">
									{values.map(value => {
										const isSelected = selectedAttributes[attribute] === value;
										const isDisabled = !validValues.has(value);
										const colorRegex = /^#([0-9a-fA-F]{3,8})$/;
										const multiColorRegex = /^#([0-9a-fA-F]{3,8})(\/#([0-9a-fA-F]{3,8}))+$/;
										const isColor = colorRegex.test(value.trim()) || multiColorRegex.test(value.trim());
										let colorStyle = {};
										if (isColor) {
											const colors = value.trim().split('/').map(c => c.trim());
											colorStyle = {
												background:
													colors.length === 1
														? colors[0]
														: colors.length === 2
															? `linear-gradient(90deg, ${colors[0]} 50%, ${colors[1]} 50%)`
															: `linear-gradient(90deg, ${colors.join(', ')})`,
												boxShadow: isSelected
													? '0 0 0 4px #666'
													: '0 0 0 1px #ccc',
												opacity: isDisabled ? 0.1 : 1,
												pointerEvents: isDisabled ? 'none' : undefined,
												width: '2rem',
												height: '2rem',
												borderRadius: '8px',
												display: 'inline-block',
												border: 'none',
											};
										}
										return (
											<button
												key={value}
												onClick={() => {
													if (isDisabled) return;
													const newSelection: Record<string, string> = { ...selectedAttributes };
													if (selectedAttributes[attribute] === value) {
														delete newSelection[attribute];
													} else {
														newSelection[attribute] = value;
													}
													const isValidCombination = (selection: Record<string, string>) =>
														product.variants?.some((v: ProductVariant) =>
															Object.entries(selection).every(
																([k, val]) => Array.isArray(v.attributes) && v.attributes.find(a => a.attribute === k)?.value === val
															)
														);
													const keys = Object.keys(newSelection);
													for (let i = keys.length; i >= 0; i--) {
														const partial = Object.fromEntries(keys.slice(0, i).map(k => [k, newSelection[k]]));
														if (isValidCombination(partial)) {
															setSelectedAttributes(partial);
															return;
														}
													}
													setSelectedAttributes({});
												}}
												disabled={isDisabled}
												className={
													isColor
														? "border"
														: `px-3 py-1 border border-gray-200 rounded transition-colors ${isSelected ? 'bg-slate-500 text-white border-slate-500 font-bold' : isDisabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-40' : 'bg-white text-gray-800 hover:bg-slate-100'}`
												}
												style={isColor ? colorStyle : undefined}
											>
												{isColor ? '' : value}
											</button>
										);
									})}
								</div>
							</div>
						);
					})}
					<div>
						<button
							type="button"
							onClick={() => setSelectedAttributes({})}
							className="text-xs mt-2 mb-4 px-4 py-2 border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 transition rounded-lg"
						>
							Цэвэрлэх
						</button>
					</div>
				</>
			)}


			{matchedVariant && (
				<>
					<div className="flex flex-col gap-2 mt-6 mb-4">
						<div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-semibold shadow-sm w-fit">
							SKU: {matchedVariant.sku}
						</div>
						{matchedVariant.discount_price ? (
							<div className="flex flex-col gap-1">
								<div className="flex items-center gap-2">
									<span className="text-gray-400 line-through text-base">
										{formatPrice(matchedVariant.price)}
									</span>
									<span className="text-red-500 text-xs font-bold">
										-{Math.round(100 - (matchedVariant.discount_price / matchedVariant.price) * 100)}%
									</span>
								</div>
								<div className="text-2xl font-extrabold text-gray-800 drop-shadow-sm">
									{formatPrice(matchedVariant.discount_price)}
								</div>
							</div>
						) : (
							<div className="text-2xl font-extrabold text-gray-800 drop-shadow-sm">
								{formatPrice(matchedVariant.price)}
							</div>
						)}
					</div>
					<div className='text-xs text-gray-500'>Үлдэгдэл: {matchedVariant.inventory}</div>
					<div className="flex items-center gap-3 mb-2">
						<div className="flex items-center border border-gray-200 rounded overflow-hidden">
							<button
								type="button"
								className="px-2 py-1 text-lg disabled:opacity-10 hover:text-gray-500"
								onClick={() => setCount(c => Math.max(1, c - 1))}
								disabled={count <= 1}
								aria-label="Decrease count"
							>-</button>
							<input
								type="number"
								min={1}
								max={matchedVariant.inventory ?? 9999}
								value={count}
								onChange={e => {
									let val = parseInt(e.target.value, 10);
									if (isNaN(val) || val < 1) val = 1;
									if (matchedVariant.inventory !== undefined && val > matchedVariant.inventory) val = matchedVariant.inventory;
									setCount(val);
								}}
								className="w-12 px-2 py-1 text-lg text-center font-mono border-0 focus:ring-0 outline-none hide-number-spin"
							/>
							<button
								type="button"
								className="px-2 py-1 text-lg disabled:opacity-10 hover:text-gray-500"
								onClick={() => setCount(c => Math.min((matchedVariant.inventory ?? 99), c + 1))}
								disabled={matchedVariant.inventory !== undefined && count >= matchedVariant.inventory}
								aria-label="Increase count"
							>+</button>
						</div>
					</div>
					<button
						onClick={() => {
							addToCart(matchedVariant.sku, count, matchedVariant.discount_price || matchedVariant.price, true);
							setCount(1);
						}}
						disabled={matchedVariant.inventory === 0}
						className={`px-4 py-2 rounded text-white ${(matchedVariant.inventory ?? 0) > 0 ? 'bg-slate-500 hover:bg-slate-700' : 'bg-gray-400 cursor-not-allowed'}`}
					>
						{(matchedVariant.inventory ?? 0) > 0 ? 'Сагсанд нэмэх' : 'Дууссан'}
					</button>
				</>
			)}
			<div className='border-t border-b border-gray-400 py-6 mt-4'>
				<button
					className="w-full text-left text-lg flex flex-row justify-between items-center focus:outline-none"
					onClick={() => setShowDescription(!showDescription)}
					type="button"
				>
					<span>Дэлгэрэнгүй</span>
					<span className={`transition-transform ${showDescription ? 'rotate-180' : ''}`}>
						<BiChevronDown size={25} />
					</span>
				</button>
				{showDescription && (
					<div
						className="prose max-w-none mt-4"
						dangerouslySetInnerHTML={{ __html: product.description ?? '' }}
					/>
				)}
			</div>
		</div>
	);
};

export default ProductInfo;
