
import React from "react";

import OrderTrackingForm from "./OrderTrackingForm";

export const metadata = {
    title: "Kargo Takip - Şımart Teknoloji",
    description: "Siparişinizi takip edin.",
};

export default function OrderTracking() {
    return (
        <>
            <OrderTrackingForm />
        </>
    );
}
