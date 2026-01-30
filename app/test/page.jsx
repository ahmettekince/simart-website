"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function TestContent() {
    const searchParams = useSearchParams();

    // Tüm parametreleri al
    const params = {};
    searchParams.forEach((value, key) => {
        params[key] = value;
    });

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>Test Sayfası</h1>
            <div style={{ marginTop: "20px" }}>
                <h2>Gelen Parametreler:</h2>
                {Object.keys(params).length > 0 ? (
                    <div style={{ backgroundColor: "#f5f5f5", padding: "15px", borderRadius: "5px", marginTop: "10px" }}>
                        {Object.entries(params).map(([key, value]) => (
                            <div key={key} style={{ marginBottom: "10px" }}>
                                <strong>{key}:</strong> {value}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: "#666" }}>Henüz parametre gelmedi.</p>
                )}
            </div>
        </div>
    );
}

export default function TestPage() {
    return (
        <Suspense fallback={<div style={{ padding: "20px" }}>Yükleniyor...</div>}>
            <TestContent />
        </Suspense>
    );
}
