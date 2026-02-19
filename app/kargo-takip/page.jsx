
import React from "react";
import Header from "@/components/headers/Header";
import Footer from "@/components/footers/Footer";
import OrderTrackingForm from "./OrderTrackingForm";

export const metadata = {
    title: "Kargo Takip - Şımart Teknoloji",
    description: "Siparişinizi takip edin.",
};

export default function OrderTracking() {
    return (
        <>
            <Header />
            <OrderTrackingForm />
            <Footer />
        </>
    );
}
