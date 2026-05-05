"use client";
import React, { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import Image from "next/image";

export default function DetailKatyaT({ product }) {
    const { addItem } = useCartStore();
    const [isAdding, setIsAdding] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleAddToCart = async () => {
        if (isAdding) return;
        setIsAdding(true);
        try {
            const result = await addItem(product, 1, false);
            if (result?.success || result?.added) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsAdding(false);
        }
    };

    const price = product.discount_price || product.price || 0;
    const imgUrl = product.images?.[0]?.url || product.images?.[0] || "";

    return (
        <div style={{ maxWidth: "500px", width: "100%", textAlign: "center", border: "1px solid #ddd", padding: "40px", borderRadius: "24px", background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            <h1 style={{ fontSize: "22px", marginBottom: "20px", fontWeight: "600" }}>{product.title}</h1>
            
            {imgUrl && (
                <div style={{ marginBottom: "25px" }}>
                    <Image src={imgUrl} alt={product.title} width={300} height={300} style={{ objectFit: "contain" }} unoptimized={imgUrl.startsWith("http")} />
                </div>
            )}

            <div style={{ fontSize: "32px", fontWeight: "800", color: "#3c81b5", marginBottom: "30px" }}>
                {price.toLocaleString("tr-TR")} TL
            </div>

            <button
                onClick={handleAddToCart}
                disabled={isAdding}
                style={{
                    width: "100%",
                    padding: "18px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    background: showSuccess ? "#10b981" : "#3c81b5",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                }}
            >
                {showSuccess ? "Sepete Eklendi! ✓" : isAdding ? "Ekleniyor..." : "SEPETE EKLE"}
            </button>

            {showSuccess && (
                <div style={{ marginTop: "15px", color: "#10b981", fontWeight: "600" }}>
                    Ürün sepetinize başarıyla eklendi.
                </div>
            )}
        </div>
    );
}
