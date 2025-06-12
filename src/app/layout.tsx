import type { Metadata } from "next";
import "../styles/globals.css";
import { ToastContainer } from "react-toastify";

import { GlobalLoader } from "@/components/GlobalLoader";
import { StoreProvider } from "@/context/StoreContext";
import MainMenu from "@/components/menu/MainMenu";
import Footer from "@/components/Footer";
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from "@/context/WishlistContext";

export const metadata: Metadata = {
	title: "Hex Demo",
	description: "Hex ecommerce demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head></head>
			<body className="">
				<StoreProvider>
					<CartProvider>
					<WishlistProvider>
						<GlobalLoader />
						<ToastContainer
							position="bottom-center"
							autoClose={5000}
							hideProgressBar={false}
							pauseOnFocusLoss={false}
							pauseOnHover={false}
							draggable={true}
						/>
						<MainMenu />
						{/* Every page slightly higher than screen height on purpose by 10px to keep GridLayout from overflowing horizontally*/}
						<div className="min-h-[calc(100vh-140px)]">
							{children}
						</div>
						<Footer />
					</WishlistProvider>
					</CartProvider>
				</StoreProvider>
			</body>
		</html>
	);
}
