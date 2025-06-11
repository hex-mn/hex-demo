import React from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import { Swiper, SwiperSlide } from 'swiper/react';
import { CgChevronLeft, CgChevronRight } from 'react-icons/cg';
import 'swiper/css';
import 'swiper/css/pagination';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

interface Image {
	id: string | number;
	mid: string;
	high: string;
}

interface ProductImageGalleryProps {
	productName: string;
	variantImages: Image[];
	lightboxImages: { src: string; alt: string }[];
	lightboxIndex: number | null;
	setLightboxIndex: (index: number | null) => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
	productName,
	variantImages,
	lightboxImages,
	lightboxIndex,
	setLightboxIndex,
}) => {
	return (
		<>
			{/* Desktop grid */}
			<div className="hidden sm:grid grid-cols-2 gap-2 col-span-6" id="product-gallery">
				{variantImages.map((img, index) => (
					<button
						key={img.id}
						type="button"
						onClick={() => setLightboxIndex(index)}
						className={index === 0 ? "col-span-2 row-span-2" : ""}
						style={{ padding: 0, border: 'none', background: 'none' }}
					>
						<img
							src={img.mid}
							alt={`Product ${index + 1}`}
							className={`w-full h-full object-cover rounded cursor-pointer ${index === 0 ? "" : "h-80"}`}
						/>
					</button>
				))}
			</div>
			{/* Mobile horizontal slider */}
			<div className="sm:hidden mb-4">
				<div className="z-20 bg-white pb-2">
					<button
						type="button"
						onClick={() => setLightboxIndex(0)}
						style={{ padding: 0, border: 'none', background: 'none' }}
						className="w-full"
					>
						<img
							src={variantImages?.[0]?.mid || "/placeholder.jpg"}
							alt={productName}
							className="w-full object-cover rounded cursor-pointer"
						/>
					</button>
				</div>
				{variantImages.length > 1 && (
					<div className="relative pb-4">
						<div className="absolute left-0 top-0 h-full w-8 z-5 bg-gradient-to-r from-white via-white/80 to-transparent" />
						<div className="absolute right-0 top-0 h-full w-8 z-5 bg-gradient-to-l from-white via-white/80 to-transparent" />
						<div className="flex overflow-x-auto gap-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-1">
							<Swiper
								spaceBetween={10}
								slidesPerView={'auto'}
								className="!px-1"
							>
								{variantImages.map((img, index) => (
									<SwiperSlide key={img.id} style={{ width: '8rem' }}>
										<button
											type="button"
											onClick={() => setLightboxIndex(index)}
											style={{ padding: 0, border: 'none', background: 'none' }}
											className="block w-full"
										>
											<img
												src={img.mid}
												alt={`Product ${index + 1}`}
												className="w-full h-32 object-cover rounded cursor-pointer border-2 border-transparent hover:border-slate-500 transition"
											/>
										</button>
									</SwiperSlide>
								))}
							</Swiper>
						</div>
						<div className="absolute -bottom-2 inset-x-0 flex justify-center items-center gap-1 text-gray-400 text-xs z-5 pointer-events-none">
							<CgChevronLeft />
							<span>Гүйлгэнэ үү</span>
							<CgChevronRight />
						</div>
					</div>
				)}
			</div>
			{/* Lightbox */}
			<Lightbox
				open={lightboxIndex !== null}
				close={() => setLightboxIndex(null)}
				slides={lightboxImages}
				index={lightboxIndex ?? 0}
				animation={{ fade: 300, swipe: 400 }}
				styles={{
					container: {
						backgroundColor: 'rgba(0, 0, 0, 0.85)',
					},
				}}
				plugins={[Zoom, Thumbnails]}
				carousel={{ finite: true }}
				thumbnails={{
					border: 2,
					borderColor: '#000',
					padding: 2,
					borderRadius: 4,
				}}
			/>
		</>
	);
};

export default ProductImageGallery;
