'use client';

import Link from "next/link";
import Image from "next/image";
import { useStore } from '@/context/StoreContext';
import { useState, useEffect } from "react";
import { LiaHeart, LiaUser, LiaBarsSolid, LiaShoppingBasketSolid, LiaSearchSolid } from "react-icons/lia";
import CategoryModal from "./CategoryModal";
import { useCart } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";
import ProductSearchModal from "./ProductSearchModal";


export default function MainMenu() {
	const { totalCount, openCart } = useCart();
	const { setup } = useStore();
	const [categoryModalOpen, setCategoryModalOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const [scrollDir, setScrollDir] = useState<"up" | "down">("up");

	useEffect(() => {
		let lastScrollY = window.scrollY;
		const updateScrollDir = () => {
			const scrollY = window.scrollY;
			if (Math.abs(scrollY - lastScrollY) < 10) return;
			setScrollDir(scrollY > lastScrollY ? "down" : "up");
			lastScrollY = scrollY;
		};
		window.addEventListener("scroll", updateScrollDir);
		return () => window.removeEventListener("scroll", updateScrollDir);
	}, []);


	return (
		<>
			<nav className={`bg-white border-b border-gray-200 shadow-xs sticky top-0 z-10 transition-transform duration-300 ${scrollDir === "down" ? "lg:translate-y-0 -translate-y-full" : "translate-y-0"}`}>
				<div className="w-full px-4">
					<div className="flex items-center justify-between gap-2 lg:gap-8 flex-shrink-0 w-full lg:py-4 py-2 h-[72px]">
						<div className="flex items-center gap-2 lg:gap-8 flex-shrink-0">
							<Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-500 ">
								{setup.logo ? (
									<span className="relative flex items-center">
										<Image
											src={setup.logo}
											alt={setup.name || "brand logo"}
											height={56}
											width={0}
											style={{ height: 'auto', width: 'auto', objectFit: 'contain' }}
											sizes="56px"
											priority
										/>
									</span>
								) : (
									setup.name
								)}
							</Link>

							<button
								className="flex flex-col items-center px-2 py-1 text-xs font-medium hover:text-slate-500 text-gray-800"
								onClick={() => setCategoryModalOpen(true)}
							>
								<LiaBarsSolid size={32} />
								<span className="hidden md:block">Ангилал</span>
							</button>
						</div>

						<div className="flex items-center gap-2 lg:gap-8 flex-shrink-0">
							<button
								className="flex flex-col items-center px-2 py-1 text-xs font-medium hover:text-slate-500 text-gray-800"
								onClick={() => setSearchOpen(true)}
							>
								<LiaSearchSolid size={32} />
								<span className="hidden md:block">Хайх</span>
							</button>
							<Link href="/wishlist">
								<button
									className="flex flex-col items-center px-2 py-1 text-xs font-medium hover:text-slate-500 text-gray-800"
								>
									<LiaHeart size={32} />
									<span className="hidden md:block">Хадгалсан</span>
								</button>
							</Link>
							<Link href="/account">
								<button
									className="flex flex-col items-center px-2 py-1 text-xs font-medium hover:text-slate-500 text-gray-800"
								>
									<LiaUser size={32} />
									<span className="hidden md:block">Бүртгэл</span>
								</button>
							</Link>
							<button
								className="relative flex flex-col items-center px-2 py-1 text-xs font-medium hover:text-slate-500 text-gray-800"
								onClick={openCart}
							>
								<LiaShoppingBasketSolid size={32} />
								{totalCount > 0 && (
									<span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[11px] px-1.5 py-0.5 font-bold shadow">
										{totalCount}
									</span>
								)}
								<span className="hidden md:block">Сагс</span>
							</button>
						</div>
					</div>
				</div>
			</nav>

			<CategoryModal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} setup={setup} />
			<CartDrawer/>
			<ProductSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
		</>
	);
}