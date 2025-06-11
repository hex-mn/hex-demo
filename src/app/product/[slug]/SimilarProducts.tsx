import { Product } from '@/lib/interfaces';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { CgArrowRight } from 'react-icons/cg';

interface SimilarProductsProps {
	products: Product[];
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({ products }) => {
	if (!products || products.length === 0) return null;

	return (
		<div className="mt-10">
			<h2 className="text-lg font-semibold mb-4 text-slate-600">Төстэй бараа</h2>
			<div className="masonry-columns">
				{products.map((product) => {
					const imageUrl = product.images?.[0]?.mid || product.images?.[0]?.high || '/icons/x.svg';
					const price = product.variants?.[0]?.discount_price ?? product.variants?.[0]?.price ?? '';
					const originalPrice = product.variants?.[0]?.discount_price ? product.variants?.[0]?.price : null;
					return (
						<Link href={`/product/${product.slug}`} className="block group mb-4 break-inside-avoid" key={product.slug}>
							<div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col">
								<div className="relative w-full aspect-[4/5] bg-gray-100">
									<img
										src={imageUrl}
										alt={product.name}
										className="object-cover group-hover:scale-105 transition w-full h-full"
									/>
								</div>
								<div className="p-3 flex flex-col flex-1">
									<div className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{product.name}</div>
									<div className="mt-auto flex items-center gap-2">
										<span className="text-base font-semibold text-primary">{price ? `${formatPrice(price)}` : ''}</span>
										{originalPrice && (
											<span className="text-xs text-gray-400 line-through">{formatPrice(originalPrice)}</span>
										)}
									</div>
								</div>
							</div>
						</Link>
					);
				})}

			</div>
			<div className="flex justify-center mt-8">
				<Link
					href="/products"
					className="inline-flex items-center gap-2 text-base font-medium py-2 px-8 rounded-full bg-slate-600 text-white shadow hover:bg-slate-700 transition-all duration-150"
				>
					<span>Бүх бараа</span>
					<CgArrowRight/>
				</Link>
			</div>
			<style jsx>{`
				.masonry-columns {
					column-count: 2;
					column-gap: 1rem;
				}
				@media (min-width: 1024px) {
					.masonry-columns {
						column-count: 4;
					}
				}
				.masonry-columns > * {
					margin-bottom: 1rem;
				}
				.break-inside-avoid {
					break-inside: avoid;
				}
				.masonry-filler {
					width: 100%;
					height: 0;
					break-inside: avoid;
				}
			`}</style>
		</div>
	);
};

export default SimilarProducts;
