
import React, { Suspense } from "react";
import { cookies } from "next/headers";
import PaymentResultContent from "@/components/othersPages/PaymentResultContent";

export default async function PaymentResultPage() {
    // Cookie'den veriyi oku
    const cookieStore = await cookies();
    const paymentCookie = cookieStore.get('payment_result');
    let postData = {};

    if (paymentCookie) {
        try {
            postData = JSON.parse(paymentCookie.value);
        } catch (e) {
            console.error("Payment cookie parse error:", e);
        }
    }

    return (
        <>
            <Suspense fallback={
                <>
                    <div className="tf-page-title">
                        <div className="container-full">
                            <div className="heading text-center">Ödeme Durumu</div>
                        </div>
                    </div>
                    <div className="container" style={{ marginTop: "30px", textAlign: "center" }}>
                        <p>Yükleniyor...</p>
                    </div>
                </>
            }>
                <PaymentResultContent initialData={postData} />
            </Suspense>
        </>
    );
}
