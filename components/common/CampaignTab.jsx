"use client";
import React, { useState } from "react";
import Link from "next/link";

// Mock Data: Daha fazla kupon ekledim ki 2 sütunlu yapı dolsun
const coupons = [
    {
        id: 1,
        brand: "Şımart",
        title: "Robot Süpürge",
        date: "Son 2 Gün",
        info: "%15",
        color: "bg-[#00796b]", // Koyu yeşilimsi (Starbucks tarzı)
        link: "/magaza/robot-supurge"
    },
    {
        id: 2,
        brand: "Şımart",
        title: "Akıllı Priz",
        date: "Sınırlı Stok",
        info: "1 ALANA 1",
        color: "bg-[#1e88e5]", // Mavi
        link: "/magaza/akilli-ev"
    },
    {
        id: 3,
        brand: "Hoşgeldin",
        title: "İlk Sipariş",
        date: "Geçerlilik: 1 Ay",
        info: "100TL",
        color: "bg-[#d32f2f]", // Kırmızı
        link: "/register"
    },
    {
        id: 4,
        brand: "Kargo",
        title: "Ücretsiz Kargo",
        date: "Sepette",
        info: "BEDAVA",
        color: "bg-[#fbc02d]", // Sarı
        textColor: "text-gray-800",
        link: "/magaza"
    },
    {
        id: 5,
        brand: "Hediye",
        title: "Sürpriz Kutu",
        date: "Yarın Bitiyor",
        info: "GİZLİ",
        color: "bg-[#7b1fa2]", // Mor
        link: "/magaza"
    },
    {
        id: 6,
        brand: "Fırsat",
        title: "Yaz İndirimi",
        date: "Haziran Sonu",
        info: "%50",
        color: "bg-[#e64a19]", // Turuncu
        link: "/magaza"
    }
];

export default function CampaignTab() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* KULAKÇIK (KAPALI HALİ) */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed left-0 top-1/2 z-[999] cursor-pointer transition-all duration-300 ease-in-out shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:scale-105 flex items-center justify-center`}
                style={{
                    transform: isOpen ? "translate(-100%, -50%)" : "translate(0, -50%)",
                    background: "linear-gradient(135deg, #2c3e50 0%, #000000 100%)",
                    color: "white",
                    padding: "16px 10px",
                    borderTopRightRadius: "16px",
                    borderBottomRightRadius: "16px",
                    minHeight: "140px",
                    width: "50px",
                    border: "1px solid rgba(255,255,255,0.1)"
                }}
            >
                <div style={{ writingMode: "vertical-rl", textOrientation: "mixed", letterSpacing: "2px", fontWeight: "700", fontSize: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="icon icon-percentage" style={{ fontSize: "22px", marginBottom: "6px", transform: "rotate(90deg)" }}></span>
                    <span>KUPONLAR</span>
                </div>

                {/* Pulse Animasyonu */}
                {!isOpen && (
                    <span className="absolute top-3 right-3 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </div>

            {/* AÇILIR PANEL (DRAWER) */}
            <div
                className={`fixed top-1/2 left-0 z-[999] bg-[#f5f7fa] shadow-2xl transition-transform duration-500 cubic-bezier(0.25, 1, 0.5, 1)`}
                style={{
                    transform: `translate(${isOpen ? "0" : "-100%"}, -50%)`,
                    width: "440px", // Genişletildi (2 sütun için)
                    maxWidth: "90vw",
                    height: "auto",
                    maxHeight: "85vh",
                    borderRadius: "0 20px 20px 0",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    border: "1px solid #e2e8f0"
                }}
            >
                {/* HEADER */}
                <div
                    className="p-5 flex justify-between items-center bg-white shadow-sm z-10"
                >
                    <div>
                        <h5 className="font-bold text-gray-900 m-0 text-lg flex items-center gap-2">
                            <i className="icon-gift text-red-500"></i>
                            Fırsat Kuponları
                        </h5>
                        <span className="text-xs text-gray-500 mt-1 block font-medium">Sana özel tanımlanan indirimler</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-200 transition-colors text-gray-600"
                    >
                        <i className="icon-close"></i>
                    </button>
                </div>

                {/* CONTENT LIST (GRID) */}
                <div className="overflow-y-auto p-4 bg-[#f0f2f5]" style={{ maxHeight: "65vh" }}>
                    <div className="grid grid-cols-2 gap-3">
                        {coupons.map((item) => (
                            <Link
                                href={item.link}
                                key={item.id}
                                className="block group relative hover:-translate-y-1 transition-transform duration-300"
                            >
                                <div className="flex h-[110px] bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md">
                                    {/* SOL TARAF (BEYAZ) */}
                                    <div className="flex-1 p-3 flex flex-col justify-center relative">
                                        <span className="text-[9px] font-bold text-[#00796b] uppercase tracking-wider mb-1">
                                            {item.brand}
                                        </span>
                                        <h6 className="text-sm font-black text-gray-800 leading-tight mb-2">
                                            {item.title}
                                        </h6>
                                        <span className="text-[10px] text-gray-400 font-medium mt-auto">
                                            {item.date}
                                        </span>

                                        {/* Sol ile Sağ arasındaki tırtıklı geçiş efekti (Opsiyonel basit çizgi) */}
                                        <div className="absolute right-0 top-2 bottom-2 border-r-2 border-dashed border-gray-200"></div>
                                    </div>

                                    {/* SAĞ TARAF (RENKLİ) */}
                                    <div className={`w-[35%] ${item.color} relative flex items-center justify-center`}>
                                        {/* Yarım daire çentik (Sağ kenarda) */}
                                        <div
                                            className="absolute top-1/2 right-[-8px] w-4 h-4 bg-[#f0f2f5] rounded-full transform -translate-y-1/2"
                                        ></div>

                                        {/* Yarım daire çentik (Sol kenarda - birleşim yeri) 
                                <div 
                                    className="absolute top-1/2 left-[-6px] w-3 h-3 bg-[#f0f2f5] rounded-full transform -translate-y-1/2 z-10"
                                ></div>
                                */}

                                        <div className={`text-center rotate-0 transform ${item.textColor || 'text-white'}`}>
                                            <span className="block text-lg font-black leading-none">
                                                {item.info}
                                            </span>
                                            {/* <span className="block text-[8px] opacity-90 mt-1 uppercase">İndirim</span> */}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-4 text-center">
                        <Link
                            href="/magaza"
                            className="inline-block px-6 py-2 bg-gray-900 text-white rounded-full text-xs font-bold hover:bg-black transition-colors shadow-lg"
                        >
                            MAĞAZAYA GİT
                        </Link>
                    </div>
                </div>
            </div>

            {/* OVERLAY */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/40 z-[998] backdrop-blur-sm transition-opacity"
                ></div>
            )}
        </>
    );
}
