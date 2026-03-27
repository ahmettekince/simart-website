import { useEffect } from "react";

export default function RecommendationModal({ showModal, setShowModal, recommendedRobot, onReset }) {
    if (!showModal || !recommendedRobot) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 1000,
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px"
            }}
            onClick={() => setShowModal(false)}
        >
            <div
                style={{
                    background: "#fff",
                    width: "100%",
                    maxWidth: "450px",
                    borderRadius: "24px",
                    padding: "40px",
                    textAlign: "center",
                    position: "relative",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                    animation: "modalSlideUp 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards"
                }}
                onClick={e => e.stopPropagation()}
            >
                <style>{`
                    @keyframes modalSlideUp {
                        from { opacity: 0; transform: translateY(50px) scale(0.9); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                `}</style>

                <button
                    onClick={() => setShowModal(false)}
                    style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        background: "#f5f6fa",
                        border: "none",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        color: "#747d8c",
                        fontWeight: "bold"
                    }}
                >
                    ✕
                </button>

                <p style={{ color: "#636e72", fontSize: "14px", marginBottom: "20px", lineHeight: "1.5", fontWeight: "500" }}>
                    {recommendedRobot.description}
                </p>

                <div style={{
                    background: "#f8f9fa",
                    borderRadius: "12px",
                    padding: "8px",
                    marginBottom: "16px",
                    border: "1px solid #eee"
                }}>
                    <div style={{
                        width: "100%",
                        height: "260px",
                        background: "#fff",
                        borderRadius: "12px",
                        marginBottom: "15px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 5px 15px rgba(0,0,0,0.03)",
                        overflow: "hidden"
                    }}>
                        <img src={recommendedRobot.image} alt={recommendedRobot.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <h3 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 4px 0", color: "#3c81b5" }}>{recommendedRobot.name}</h3>
                    <div style={{ display: "flex", justifyContent: "center", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "16px", fontWeight: "700", color: "#2d3436" }}>{recommendedRobot.price}</span>
                        <span style={{ fontSize: "13px", color: "#eb4d4b", fontWeight: "600", background: "#ffeaa7", padding: "2px 8px", borderRadius: "20px" }}>-{recommendedRobot.discount} İndirim</span>
                    </div>

                    <div style={{
                        border: "2px dashed #3c81b5",
                        background: "#e1f5fe",
                        padding: "10px",
                        borderRadius: "10px",
                        marginTop: "10px"
                    }}>
                        <div style={{ fontSize: "20px", fontWeight: "900", color: "#0984e3", letterSpacing: "2px" }}>{recommendedRobot.couponCode}</div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                    <button
                        onClick={() => { setShowModal(false); onReset(); }}
                        style={{ flex: 1, padding: "16px", borderRadius: "12px", border: "1px solid #e0e0e0", background: "#fff", color: "#2d3436", fontWeight: "700", cursor: "pointer" }}
                    >
                        Kapat
                    </button>
                    <button
                        onClick={() => window.open(`${recommendedRobot.link}?coupon=${recommendedRobot.couponCode}`, '_blank')}
                        style={{
                            flex: 2,
                            padding: "16px",
                            borderRadius: "12px",
                            border: "none",
                            background: "#3c81b5",
                            color: "#fff",
                            fontWeight: "700",
                            cursor: "pointer",
                            boxShadow: "0 10px 20px rgba(60, 129, 181, 0.2)"
                        }}
                    >
                        Ürünü Şimdi İncele
                    </button>
                </div>
            </div>
        </div>
    );
}
