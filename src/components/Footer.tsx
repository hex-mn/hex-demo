'use client';

import { useStore } from '@/context/StoreContext';
import {
	FaFacebookF,
	FaYoutube,
	FaInstagram,
	FaTiktok,
	FaXTwitter,
	FaRegCopyright,
} from 'react-icons/fa6';
import Link from 'next/link';

export default function Footer() {
	const { setup } = useStore();
	const currentYear = new Date().getFullYear();

	return (
		<footer className="py-6 border-t border-gray-200 min-h-[120px] bg-white">
			<div className="mx-auto px-4">
				<div className="flex flex-col md:flex-row justify-between items-center">

					<div className="flex flex-wrap justify-center gap-4 mb-4 md:mb-0 text-sm text-gray-700">
						<Link href="/info/about" className="hover:underline">Бидний тухай</Link>
						<Link href="/info/branches" className="hover:underline">Салбар байршил</Link>
						<Link href="/info/terms" className="hover:underline">Үйлчилгээний нөхцөл</Link>
						<Link href="/info/faq" className="hover:underline">Асуулт хариулт</Link>
						<Link href="/blog" className="hover:underline">Нийтлэл</Link>
					</div>

					<div className="flex space-x-3 text-white text-lg">
						{setup.facebook && (
							<a
								href={setup.facebook}
								target="_blank"
								rel="noopener noreferrer"
								className="p-2 rounded bg-gray-500 hover:bg-[#1877F2] transition"
							>
								<FaFacebookF />
							</a>
						)}
						{setup.youtube && (
							<a
								href={setup.youtube}
								target="_blank"
								rel="noopener noreferrer"
								className="p-2 rounded bg-gray-500 hover:bg-[#FF0000] transition"
							>
								<FaYoutube />
							</a>
						)}
						{setup.instagram && (
							<a
								href={setup.instagram}
								target="_blank"
								rel="noopener noreferrer"
								className="p-2 rounded bg-gray-500 hover:bg-gradient-to-br from-pink-500 via-red-500 to-slate-500 transition"
							>
								<FaInstagram />
							</a>
						)}
						{setup.tiktok && (
							<a
								href={setup.tiktok}
								target="_blank"
								rel="noopener noreferrer"
								className="p-2 rounded bg-gray-500 hover:bg-black transition"
							>
								<FaTiktok />
							</a>
						)}
						{setup.x_platform && (
							<a
								href={setup.x_platform}
								target="_blank"
								rel="noopener noreferrer"
								className="p-2 rounded bg-gray-500 hover:bg-[#1DA1F2] transition"
							>
								<FaXTwitter />
							</a>
						)}
					</div>
				</div>

				<div className="mt-4 text-center text-sm text-gray-600">
					<p className="flex items-center justify-center gap-1 mt-1">
						<FaRegCopyright />
						{/* I would be really happy if you include the powered by message. Remove it if you want. */}
						<span>{currentYear} {setup.name}. Powered by <a href="https://hex.mn" className='underline'>hex.mn</a></span>
					</p>
				</div>
			</div>
		</footer>
	);
}
