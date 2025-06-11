'use client'

import { useEffect, useState, useRef } from 'react'
import { Product } from '@/lib/interfaces'
import { useCart } from '@/context/CartContext'
import { getViewHistory, postViewHistory } from '@/lib/analytics'
import ProductImageGallery from './ProductImageGallery'
import ProductInfo from './ProductInfo'
import ProductHistoryCarousel from './ProductHistoryCarousel'
import SimilarProducts from './SimilarProducts'
import { sendRequestToPublicAPI } from '@/lib/api-service'

export default function ProductClientView({ product, bundle }: { product: Product, bundle: Product[] }) {
	const { addToCart } = useCart()
	const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({})
	const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
	const [showDescription, setShowDescription] = useState(false)
	const [count, setCount] = useState(1)
	const [productHistory, setProductHistory] = useState<Product[]>([])
	const [similarProducts, setSimilarProducts] = useState<Product[]>([])
	const viewedSlugRef = useRef<Set<string>>(new Set())

	useEffect(() => {
		if (!viewedSlugRef.current.has(product.slug)) {
			postViewHistory([product.slug])
			viewedSlugRef.current.add(product.slug)

			const fetchHistory = async () => {
				const response = await getViewHistory(1, 20)
				setProductHistory(response?.results?.products || [])
			}
			const fetchSimilar = async () => {
				const response = await sendRequestToPublicAPI('POST', '/product/similar/', {
					product_slug: product.slug,
					full_data: false,
					page: 1,
					page_size: 20,
				})
				setSimilarProducts(response?.results || [])
			}

			fetchHistory()
			fetchSimilar()
			setCount(1)
		}
	}, [product.slug])

	
	// Filter attributes to only include values with inventory > 0 in at least one variant
	const allAttributes = (() => {
		const map: Record<string, Set<string>> = {}
		product.variants?.forEach(variant => {
			if (variant.inventory && variant.inventory > 0) {
				variant.attributes?.forEach(attr => {
					if (!map[attr.attribute]) map[attr.attribute] = new Set()
					map[attr.attribute].add(attr.value)
				})
			}
		})
		return map
	})()

	// Check if all variants are out of stock or no variants exist
	const isOutOfStock = !product.variants || product.variants.length === 0 || product.variants.every(v => (v.inventory ?? 0) === 0)

	const matchedVariant = product.variants?.find(variant =>
		variant.attributes?.every(attr => selectedAttributes[attr.attribute] === attr.value)
	) || null

	const variantImages = matchedVariant?.images?.length
		? matchedVariant.images
		: product.images || []

	const lightboxImages = variantImages.map(img => ({
		src: img.high,
		alt: product.name,
	}))

	const attributeOrder = Object.keys(allAttributes)

	const getValidValues = (attribute: string) => {
		const otherSelected = { ...selectedAttributes }
		delete otherSelected[attribute]

		const valid = new Set<string>()
		product.variants?.forEach(variant => {
			const matches = Object.entries(otherSelected).every(
				([attr, val]) => variant.attributes?.find(a => a.attribute === attr)?.value === val
			)
			if (matches) {
				const attr = variant.attributes?.find(a => a.attribute === attribute)
				if (attr) valid.add(attr.value)
			}
		})

		return valid
	}

	const toVariant = (variant: any) => {
		if (!variant) return null
		return {
			...variant,
			discount_price: variant.discount_price ?? undefined,
			attributes: variant.attributes || [],
		}
	}

	const safeMatchedVariant = toVariant(matchedVariant)

	return (
		<div className='max-w-7xl mx-auto p-4'>
			<div className='grid grid-cols-1 sm:grid-cols-10 sm:gap-8 sm:my-6'>
				<ProductImageGallery
					productName={product.name}
					variantImages={variantImages}
					lightboxImages={lightboxImages}
					lightboxIndex={lightboxIndex}
					setLightboxIndex={setLightboxIndex}
				/>
					
					<ProductInfo
						product={product}
						bundle={bundle}
						attributeOrder={attributeOrder}
						allAttributes={allAttributes}
						selectedAttributes={selectedAttributes}
						setSelectedAttributes={setSelectedAttributes}
						getValidValues={getValidValues}
						matchedVariant={safeMatchedVariant}
						count={count}
						setCount={setCount}
						addToCart={addToCart}
						showDescription={showDescription}
						setShowDescription={setShowDescription}
						isOutOfStock={isOutOfStock}
					/>
			</div>
			<SimilarProducts products={similarProducts} />
			<ProductHistoryCarousel productHistory={productHistory} />
		</div>
	)
}
