"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderTrackingForm() {
    const [orderNumber, setOrderNumber] = useState("");
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        if (orderNumber.trim()) {
            router.push(`/kargo-takip/${orderNumber.trim()}`);
        }
    };

    return (
        <section className="flat-spacing-11">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6 col-md-8">
                        <div className="text-center mb_40">
                            <h3 className="fw-5">Kargo Takip</h3>
                            <p className="text_black-2 mt_10">
                                Siparişinizin durumunu öğrenmek için sipariş numaranızı girin.
                            </p>
                        </div>
                        <div className="tf-page-cart-item">
                            <div className="bg_white p-4 radius-10 border-line">
                                <form onSubmit={handleSearch}>
                                    <div className="mb_20">
                                        <label className="mb_10 fw-6">Sipariş Numarası</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Örn: SP2026..."
                                            value={orderNumber}
                                            onChange={(e) => setOrderNumber(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="tf-btn btn-fill animate-hover-btn w-100 justify-content-center radius-3">
                                        Sorgula
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
