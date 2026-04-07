"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLangStore } from "@/stores/langStore";
import { getLocalizedUrl } from "@/utils/i18n";

export default function OrderTrackingForm() {
    const { lang } = useLangStore();
    const [orderNumber, setOrderNumber] = useState("");
    const router = useRouter();

    const t = {
        tr: {
            title: "Kargo Takip",
            subtitle: "Siparişinizin durumunu öğrenmek için sipariş numaranızı girin.",
            orderNumberLabel: "Sipariş Numarası",
            placeholder: "Örn: SP2026...",
            searchButton: "Sorgula"
        },
        en: {
            title: "Order Tracking",
            subtitle: "Enter your order number to learn your order status.",
            orderNumberLabel: "Order Number",
            placeholder: "e.g. SP2026...",
            searchButton: "Track"
        }
    }[lang] || {
        tr: {
            title: "Kargo Takip",
            subtitle: "Siparişinizin durumunu öğrenmek için sipariş numaranızı girin.",
            orderNumberLabel: "Sipariş Numarası",
            placeholder: "Örn: SP2026...",
            searchButton: "Sorgula"
        }
    }.tr;

    const handleSearch = (e) => {
        e.preventDefault();
        if (orderNumber.trim()) {
            router.push(getLocalizedUrl(`/kargo-takip/${orderNumber.trim()}`, lang));
        }
    };

    return (
        <section className="flat-spacing-11">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6 col-md-8">
                        <div className="text-center mb_40">
                            <h3 className="fw-5">{t.title}</h3>
                            <p className="text_black-2 mt_10">
                                {t.subtitle}
                            </p>
                        </div>
                        <div className="tf-page-cart-item">
                            <div className="bg_white p-4 radius-10 border-line">
                                <form onSubmit={handleSearch}>
                                    <div className="mb_20">
                                        <label className="mb_10 fw-6">{t.orderNumberLabel}</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder={t.placeholder}
                                            value={orderNumber}
                                            onChange={(e) => setOrderNumber(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="tf-btn btn-fill animate-hover-btn w-100 justify-content-center radius-3">
                                        {t.searchButton}
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

