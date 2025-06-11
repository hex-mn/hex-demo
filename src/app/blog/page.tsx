'use client'
import useBlogFetcher from "@/hooks/useBlogFetcher";
import Link from "next/link";
import InfoLoader from "@/app/info/InfoLoader";
import { useState, useEffect } from "react";
import debounce from "lodash/debounce";

export default function BlogListPage() {
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const handler = debounce((val: string) => setDebouncedSearch(val), 400);
		handler(search);
		return () => handler.cancel();
	}, [search]);

	const { blogs, infiniteLoading } = useBlogFetcher(debouncedSearch);

	return (
		<div className="max-w-3xl w-full mx-auto py-8 px-4 space-y-8 mb-10">
			<div className="mb-6 flex flex-col md:flex-row gap-2 md:gap-4 items-center">
				<input
					type="text"
					placeholder="Блогийн гарчиг хайх..."
					value={search}
					onChange={e => setSearch(e.target.value)}
					className="w-full md:w-80 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
				/>
			</div>
			{blogs.length === 0 && infiniteLoading ? (
				<InfoLoader />
			) : blogs.length === 0 ? (
				<div className="text-center text-gray-400">Блог олдсонгүй.</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{blogs.map((blog) => (
						<Link
							key={blog.slug}
							href={`/blog/${blog.slug}`}
							className="block"
							style={{ textDecoration: "none" }}
						>
							<div className="bg-white rounded-xl shadow flex flex-col border border-slate-100 cursor-pointer hover:bg-slate-50 transition p-0">
								{blog.image && (
									<div className="w-full h-48 flex-shrink-0">
										<img
											src={blog.image}
											alt={blog.title}
											className="w-full h-full object-cover rounded-t-xl m-0 p-0"
										/>
									</div>
								)}
								<div className="flex flex-col justify-between flex-1 p-6">
									<div>
										<div className="text-xl font-semibold">
											{blog.title}
										</div>
										<div className="text-gray-400 text-xs mt-1">
											{new Date(blog.created_at).toLocaleDateString()}
										</div>
									</div>
								</div>
							</div>
						</Link>
					))}
					{infiniteLoading && (
						<div className="col-span-full text-center py-4">
							<InfoLoader />
						</div>
					)}
				</div>
			)}
		</div>
	);
}
