'use client';

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useEffect } from "react";
import { CgClose } from "react-icons/cg";
import CartSummary from './CartSummary';

export default function CartDrawer() {
	const { cart, isCartOpen, closeCart } = useCart();

	useEffect(() => {
		const escHandler = (e: KeyboardEvent) => {
			if (e.key === "Escape") closeCart();
		};
		document.addEventListener("keydown", escHandler);
		return () => document.removeEventListener("keydown", escHandler);
	}, [closeCart]);

	const handleLinkClick = () => {
		closeCart();
	};

	return (
		<div
			className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
			onClick={closeCart}
		>
			<div
				className={`fixed right-0 top-0 bg-white w-[85%] max-w-md h-full shadow-xl p-0 flex flex-col transition-transform duration-300 ${isCartOpen ? "translate-x-0" : "translate-x-full"
					}`}
				style={{ willChange: "transform" }}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between px-8 py-4 border-b border-gray-300 sticky top-0 bg-white z-10">
					<h2 className="text-xl font-bold">Сагс</h2>
					<button
						className="text-xl p-2 hover:bg-slate-100 rounded"
						onClick={closeCart}
						aria-label="Close cart"
					>
						<CgClose />
					</button>
				</div>
				<div className="flex-1 overflow-y-auto px-4 py-4">
					<CartSummary onLinkClick={handleLinkClick} />
				</div>
				<div className="px-8 py-6 border-t border-gray-300 sticky bottom-0 bg-white z-10">
					<Link href="/checkout" onClick={handleLinkClick}>
						<button
							className="w-full px-4 py-3 bg-slate-800 text-white rounded hover:bg-slate-900 text-lg font-semibold shadow"
							disabled={!cart || cart.length === 0}
						>
							Үргэлжлүүлэх
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
}
