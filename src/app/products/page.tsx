'use client';
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductListing from "@/components/listing/ProductListing";

function ProductPageContent() {
	const searchParams = useSearchParams();
	const query = searchParams.get("query") || null;
	return <ProductListing query={query} />;
}

export default function ProductPage() {
	return (
		<Suspense>
			<ProductPageContent />
		</Suspense>
	);
}
