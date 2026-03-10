import React from "react";

import OrderTrackingContent from "./OrderTrackingContent";

export const metadata = {
    title: "Kargo Takip - Şımart Teknoloji",
    description: "Sipariş durumunuzu sorgulayın.",
};

export default function OrderTrackingPage({ params }) {
    return (
        <>
            <OrderTrackingContent params={params} />
        </>
    );
}
