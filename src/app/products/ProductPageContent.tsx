import { useSearchParams } from "next/navigation";
import ProductListing from "@/components/listing/ProductListing";

export default function ProductPageContent() {
	const searchParams = useSearchParams();
	const query = searchParams.get("query") || null;
	return <ProductListing query={query} />;
}
