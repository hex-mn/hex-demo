'use client'
import Link from 'next/link'

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center h-[90vh]">
			<h1 className="text-6xl font-bold text-slate-800">404</h1>
			<p className="mt-2 text-xl text-slate-600">Хуудас олдсонгүй.</p>
			<Link href="/">
				<div className="mt-6 px-6 py-3 text-white bg-slate-600 rounded-lg hover:bg-slate-700">
					Нүүр хуудас
				</div>
			</Link>
		</div>
	);
}