import React from "react";
import { getProductBySlug } from "@/api/products";
import { notFound } from "next/navigation";
import DetailKatyaT from "./DetailKatyaT";

export async function generateMetadata({ params }) {
    const { lang } = await params;
    const product = await getProductBySlug("katya-t-akilli-robot-supurge", lang);
    if (!product) return { title: "Ürün Bulunamadı" };
    return { title: product.title + " - Özel Satın Alma", robots: "noindex, nofollow" };
}

export default async function page({ params }) {
    const { lang } = await params;
    const product = await getProductBySlug("katya-t-akilli-robot-supurge", lang);

    if (!product) {
        notFound();
    }

    return (
        <div className="container" style={{ padding: "50px 20px", display: "flex", justifyContent: "center" }}>
            <DetailKatyaT product={product} />
        </div>
    );
}
