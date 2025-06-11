import React from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

interface ProductHistoryCarouselProps {
	productHistory: any[];
}

const ProductHistoryCarousel: React.FC<ProductHistoryCarouselProps> = ({ productHistory }) => {
	if (!productHistory.length) return null;
	return (
		<div className="col-span-10 sm:col-span-4 mt-10 select-none">
			<h2 className="text-lg font-semibold mb-4 text-slate-600">Сүүлд үзсэн</h2>
			<Swiper
				spaceBetween={10}
				slidesPerView={'auto'}
				breakpoints={{
					0: { slidesPerView: 'auto', spaceBetween: 10 },
				}}
				className="product-history-swiper"
				style={{ width: '100%' }}
			>
				{productHistory.map((item) => (
					<SwiperSlide
						key={item.slug}
						style={{ width: 100, maxWidth: 100, minWidth: 100 }}
					>
						<Link
							href={`/product/${item.slug}`}
							className="hover:shadow-md transition"
						>
							<img
								src={item.images?.[0]?.mid || '/placeholder.jpg'}
								alt={item.name}
								className="w-25 h-25 object-cover rounded mb-2 mx-auto"
								style={{ aspectRatio: '1 / 1' }}
							/>
						</Link>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
};

export default ProductHistoryCarousel;
