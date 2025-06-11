import { sendRequestToPublicAPI } from '@/lib/api-service'
import { ProductResponse } from '@/lib/interfaces'

export async function getProductData(slug: string): Promise<ProductResponse | null> {
	return await sendRequestToPublicAPI('GET', `/product/get/${slug}/`, {})
}