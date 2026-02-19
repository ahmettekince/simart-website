import React from "react";
import Header from "@/components/headers/Header";
import Footer from "@/components/footers/Footer";
import OrderTrackingContent from "./OrderTrackingContent";

export const metadata = {
    title: "Kargo Takip - Şımart Teknoloji",
    description: "Sipariş durumunuzu sorgulayın.",
};

export default function OrderTrackingPage({ params }) {
    return (
        <>
            <Header />
            <OrderTrackingContent params={params} />
            <Footer />
        </>
    );
}
