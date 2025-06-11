import { Metadata } from 'next'
import { getProductData } from './product-loader'
import ProductClientView from './ProductClientView'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params;
	const productResponse = await getProductData(slug)
	if (!productResponse) {
		return {
			title: 'Бараа олдсонгүй. Та дараа дахин оролдоно уу.',
			description: 'Бараа олдсонгүй. Та дараа дахин оролдоно уу.',
		}
	}
	const product = productResponse.product
	const firstImage = product.images?.[0]?.high || '/default.jpg'

	return {
		title: product.name,
		description: product.description || '',
		openGraph: {
			title: product.name,
			description: product.description || '',
			images: [
				{
					url: firstImage,
					width: 800,
					height: 600,
					alt: product.name,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: product.name,
			description: product.description || '',
			images: [firstImage],
		},
	}
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const productResponse = await getProductData(slug)

	if (!productResponse) {
		return <div className="max-w-7xl mx-auto p-8 text-center">Бараа олдсонгүй. Та дараа дахин оролдоно уу.</div>
	}

	return <ProductClientView product={productResponse.product} bundle={productResponse.bundle} />
}
