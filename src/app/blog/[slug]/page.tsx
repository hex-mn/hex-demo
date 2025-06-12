import { sendRequestToPublicAPI } from "@/lib/api-service";
import InfoLoader from "@/app/info/InfoLoader";
import { Metadata } from "next";

async function getBlogData(slug: string) {
	return await sendRequestToPublicAPI("GET", `/blog/get/${slug}/`);
}

function getAbsoluteImageUrl(image: string | undefined): string | undefined {
	if (!image) return undefined;
	if (image.startsWith('http://') || image.startsWith('https://')) return image;
	// You may want to set this dynamically from config/env or do whatever
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
	return baseUrl.replace(/\/$/, '') + (image.startsWith('/') ? image : '/' + image);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params;
	let blog = null;
	try {
		blog = await getBlogData(slug);
	} catch (e) {
		console.error("Error fetching blog:", e);
		return {
			title: "Blog not found",
			description: "Blog not found",
		};
	}
	if (!blog) {
		return {
			title: "Blog",
			description: "Blog detail",
		};
	}
	const absImage = getAbsoluteImageUrl(blog.image);
	return {
		title: blog.title,
		description: blog.content ? blog.content.replace(/<[^>]+>/g, '').slice(0, 160) : blog.title,
		openGraph: {
			title: blog.title,
			description: blog.content ? blog.content.replace(/<[^>]+>/g, '').slice(0, 160) : blog.title,
			images: absImage ? [absImage] : [],
		},
		twitter: {
			card: absImage ? "summary_large_image" : "summary",
			title: blog.title,
			description: blog.content ? blog.content.replace(/<[^>]+>/g, '').slice(0, 160) : blog.title,
			images: absImage ? [absImage] : [],
		},
	};
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	let blog = null;
	let error = null;
	try {
		blog = await getBlogData(slug);
	} catch (e) {
		console.error("Error fetching blog:", e);
		error = "Blog not found";
	}

	if (error) {
		return <div className="max-w-2xl w-full mx-auto py-8 px-4 text-center text-gray-400">{error}</div>;
	}
	if (!blog) {
		return <div className="max-w-2xl w-full mx-auto py-8 px-4"><InfoLoader /></div>;
	}

	return (
		<div className="max-w-2xl w-full mx-auto py-8 px-4 mb-10">
			<h1 className="text-2xl md:text-3xl font-bold mb-4">{blog.title}</h1>
			<div className="text-gray-400 text-xs mb-4">{new Date(blog.created_at).toLocaleDateString()}</div>
			{blog.image && (
				<div className="mb-6">
					<img src={blog.image} alt={blog.title} className="w-full max-h-96 object-cover rounded-lg" />
				</div>
			)}
			{blog.content && (
				<div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
			)}
		</div>
	);
}
