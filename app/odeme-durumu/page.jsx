
import React, { Suspense } from "react";
import PaymentResultContent from "@/components/othersPages/PaymentResultContent";

export default function PaymentResultPage() {
    return (
        <>
            <Suspense fallback={
                <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Yükleniyor...</span>
                    </div>
                    <p className="mt-3">Sayfa yükleniyor...</p>
                </div>
            }>
                <PaymentResultContent />
            </Suspense>
        </>
    );
}
