'use client';

import { useStore } from '../context/StoreContext';

export const GlobalLoader = () => {
	const { loading, error } = useStore();
	if (loading) return <Loader />;
	if (error) return <ErrorPage />;
	return null;
};

const Hexagon = ({ delay }: { delay: string }) => (
	<div className="relative w-16 h-16 m-2">
		<div
			className="absolute inset-0 animate-ping scale-110"
			style={{ animationDelay: delay }}
		>
			<svg viewBox="0 0 100 100" className="w-full h-full opacity-70">
				<defs>
					<linearGradient id={`pingGradient-${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#4b5563" />
						<stop offset="100%" stopColor="#9ca3af" />
					</linearGradient>
				</defs>
				<polygon
					points="50,1 95,25 95,75 50,99 5,75 5,25"
					fill={`url(#pingGradient-${delay})`}
				/>
			</svg>
		</div>
		<svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]">
			<defs>
				<linearGradient id={`mainGradient-${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#111827" />
					<stop offset="100%" stopColor="#374151" />
				</linearGradient>
			</defs>
			<polygon
				points="50,1 95,25 95,75 50,99 5,75 5,25"
				fill={`url(#mainGradient-${delay})`}
			/>
		</svg>
	</div>
);

const Loader: React.FC = () => (
	<div className='fixed inset-0 z-[9999]'>
		<div className="flex flex-col justify-center items-center h-screen bg-slate-50/90 px-4 transition-all">
			<div className="flex justify-center items-center space-x-4">
				<Hexagon delay="0s" />
				<Hexagon delay="0.3s" />
				<Hexagon delay="0.6s" />
			</div>
		</div>
	</div>
);

const ErrorPage: React.FC = () => {
	const handleRefresh = () => {
		if (typeof window !== "undefined") {
			window.location.reload();
		}
	};

	return (
		<div className='fixed inset-0 z-[9999]'>
			<div className="flex flex-col justify-center items-center h-screen bg-slate-50 px-4 transition-all">
				<div className="text-center space-x-4">
					<h1 className="text-2xl font-semibold text-black-600 mb-4">Асуудал гарлаа.</h1>
					<p className="text-slate-600 mb-6">Сүлжээнд холбогдож чадсангүй. Та дахин ачааллана уу.</p>
					<button
						onClick={handleRefresh}
						className="cursor-pointer px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition"
					>
						Дахин ачааллах
					</button>
				</div>
			</div>
		</div>
	);
};
