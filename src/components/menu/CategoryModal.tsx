import { RemoveScroll } from 'react-remove-scroll'
import { CgClose } from 'react-icons/cg'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TbArticle, TbCheckbox, TbPercentage, TbTag } from 'react-icons/tb'
import { HiMiniSquares2X2 } from 'react-icons/hi2'

interface CategoryModalProps {
	open: boolean
	onClose: () => void
	setup: {
		menu: {
			id: number
			title: string
			url?: string
			children: { title: string; url: string }[]
		}[]
	}
}

export default function CategoryModal({ open, onClose, setup }: CategoryModalProps) {
	const [searchValue, setSearchValue] = useState('')
	const [filteredMenu, setFilteredMenu] = useState(setup.menu)

	useEffect(() => {
		const lowerSearch = searchValue.toLowerCase()

		const filtered = setup.menu
			.map((parent) => {
				const titleMatch = parent.title.toLowerCase().includes(lowerSearch)
				const matchingChildren = parent.children.filter((child) =>
					child.title.toLowerCase().includes(lowerSearch)
				)

				if (titleMatch || matchingChildren.length > 0) {
					return {
						...parent,
						children: matchingChildren,
					}
				}

				return null
			})
			.filter(Boolean) as typeof setup.menu

		setFilteredMenu(filtered)
	}, [searchValue, setup])

	if (!open) return null

	return (
		<RemoveScroll>
			<div
				className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-start px-4 py-8 sm:px-6 animate-fadeIn overflow-y-auto"
				onClick={onClose}
			>
				<div
					className="relative bg-white rounded-2xl shadow-2xl w-full max-w-screen-xl max-h-[90vh] overflow-y-auto animate-scaleIn"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Top Bar */}
					<div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
						<input
							type="text"
							placeholder="Ангилал хайх"
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
							className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
						/>
						<button
							className="ml-4 text-gray-500 hover:text-slate-500 text-2xl transition"
							onClick={onClose}
						>
							<CgClose />
						</button>
					</div>

					<div className="flex md:flex-row flex-wrap gap-4 px-6 py-6 ">
						<Link
							href="/blog"
							className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 font-semibold shadow-xs transition"
							onClick={onClose}
						>
							<TbArticle />
							Нийтлэл
						</Link>

						<a
							href="/products"
							className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 font-semibold shadow-xs transition"
							onClick={onClose}
						>
							<HiMiniSquares2X2 />
							Бүх бараа
						</a>

						<a
							href="/products?isNew=true"
							className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-green-600 font-semibold shadow-xs transition"
							onClick={onClose}
						>
							<TbCheckbox />
							Шинэ
						</a>

						<a
							href="/products?discounted=true"
							className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-red-500 font-semibold shadow-xs transition"
							onClick={onClose}
						>
							<TbPercentage />
							Хямдралтай
						</a>
						<a
							href="/products?isFeatured=true"
							className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-red-500 font-semibold shadow-xs transition"
							onClick={onClose}
						>
							<TbTag />
							Онцгой
						</a>
					</div>

					{/* Categories */}
					<div className="px-6 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6 gap-2">
						{filteredMenu.map((parent) => (
							<div key={parent.id}>
								{parent.url ? (
									<Link
										href={parent.url}
										className="font-semibold mb-3 rounded-lg bg-gray-100 p-2 block underline hover:text-gray-500 transition-colors text-center md:text-start"
									>
										{parent.title}
									</Link>
								) : (
									<div className="font-semibold mb-3 text-gray-900 rounded-lg bg-gray-100 p-2 text-center md:text-start">
										{parent.title}
									</div>
								)}
								{parent.children.length > 0 && (
									<ul className="space-y-2 mb-4 md:mb-0">
										{parent.children.map((child, index) => (
											<li key={index}>
												<a
													href={child.url}
													className="text-gray-800 hover:text-slate-500 hover:ps-2 transition-all block md:text-start text-center"
												>
													{child.title}
												</a>
											</li>
										))}
									</ul>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</RemoveScroll>
	)
}
