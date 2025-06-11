'use client'
import { useParams } from "next/navigation";
import ProductListing from "@/components/listing/ProductListing";

export default function ProductPage() {
    const params = useParams();
    const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : "";
    return <ProductListing collections={[decodeURIComponent(slug)]}/>;
}
