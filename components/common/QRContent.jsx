"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, Globe, MapPin, Instagram, Facebook, Linkedin, Youtube } from "lucide-react";
import { useLangStore } from "@/stores/langStore";

export default function QRContent({ qrData, menuItems }) {
    const { lang } = useLangStore();

    const t = {
        tr: {
            title: "Şımart Teknoloji",
            phone: "Telefon",
            email: "E-Posta",
            website: "Web Sitesi",
            address: "Adres",
            showOnMap: "Haritada Göster"
        },
        en: {
            title: "Şımart Technology",
            phone: "Phone",
            email: "Email",
            website: "Website",
            address: "Address",
            showOnMap: "Show on Map"
        }
    }[lang] || {
        tr: {
            title: "Şımart Teknoloji",
            phone: "Telefon",
            email: "E-Posta",
            website: "Web Sitesi",
            address: "Adres",
            showOnMap: "Haritada Göster"
        }
    }.tr;

    const userData = {
        name: qrData.full_name || `${qrData.first_name} ${qrData.last_name}`,
        title: t.title,
        image: qrData.image_url,
        phone: qrData.phone,
        email: qrData.email,
        website: "www.simart.me",
        address: "Yeşilova Mah. 4023. Cad. Ser Tower Apt. Dış Kapı: 1 G Etimesgut/Ankara TÜRKİYE",
        mapLink: "https://maps.app.goo.gl/W5z8J9z5v5z8J9z5v",
        socials: [
            { icon: Instagram, href: "https://www.instagram.com/simartteknoloji/" },
            { icon: Facebook, href: "https://www.facebook.com/simartteknoloji" },
            { icon: Linkedin, href: "https://www.linkedin.com/company/şımart-teknoloji/" },
            { icon: Youtube, href: "https://www.youtube.com/c/ŞımartTeknoloji" }
        ]
    };

    return (
        <>
            <main className="qr-page-wrapper" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: 'Gilroy, sans-serif' }}>
                <div className="qr-header-full" style={{ backgroundColor: "#3c81b5", width: "100%", padding: "60px 0" }}>
                    <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", color: "#fff" }}>
                            <div className="profile-image-wrapper" style={{
                                width: "160px",
                                height: "160px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                border: "4px solid rgba(255,255,255,0.2)",
                                marginBottom: "25px",
                                backgroundColor: "#2a5d85",
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                {userData.image && (
                                    <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
                                        <Image
                                            src={userData.image}
                                            alt=""
                                            fill
                                            style={{ objectFit: "cover" }}
                                        />
                                    </div>
                                )}
                                <div style={{
                                    fontSize: "44px",
                                    fontWeight: "bold",
                                    color: "#fff",
                                    zIndex: 0
                                }}>
                                    {userData.name.split(' ').map(n => n[0]).join('')}
                                </div>
                            </div>

                            <h1 style={{ fontSize: "26px", fontWeight: "700", marginBottom: "8px", letterSpacing: "-0.5px", color: "#fff" }}>{userData.name}</h1>
                            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px", marginBottom: "20px" }}>{userData.title}</p>

                            <div className="social-links" style={{ display: "flex", gap: "20px" }}>
                                {userData.socials.map((social, idx) => (
                                    <Link key={idx} href={social.href} target="_blank" style={{
                                        width: "42px",
                                        height: "42px",
                                        borderRadius: "50%",
                                        backgroundColor: "rgba(0,0,0,0.3)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "transform 0.2s"
                                    }}>
                                        <social.icon size={20} color="#fff" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="qr-content-full" style={{ backgroundColor: "#ffffff", width: "100%", padding: "50px 0 30px 0", flex: 1 }}>
                    <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "50px",
                            marginBottom: "60px"
                        }}>
                            {/* ÜST SATIR: TELEFON VE E-POSTA */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: "30px",
                                width: "100%"
                            }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
                                    <div style={{
                                        backgroundColor: "#f0f7ff",
                                        padding: "15px",
                                        borderRadius: "50%",
                                        color: "#3c81b5",
                                        display: "flex"
                                    }}>
                                        <Phone size={24} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <Link href={`tel:${userData.phone}`} style={{ display: "block", fontSize: "18px", fontWeight: "600", color: "#333", letterSpacing: "-0.3px" }}>
                                            {userData.phone}
                                        </Link>
                                        <span style={{ fontSize: "13px", color: "#888", display: "block", marginTop: "2px" }}>{t.phone}</span>
                                    </div>
                                </div>

                                {userData.email && (
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
                                        <div style={{
                                            backgroundColor: "#f0f7ff",
                                            padding: "15px",
                                            borderRadius: "50%",
                                            color: "#3c81b5",
                                            display: "flex"
                                        }}>
                                            <Mail size={24} strokeWidth={2} />
                                        </div>
                                        <div>
                                            <Link href={`mailto:${userData.email}`} style={{ display: "block", fontSize: "18px", fontWeight: "600", color: "#333", letterSpacing: "-0.3px" }}>
                                                {userData.email}
                                            </Link>
                                            <span style={{ fontSize: "13px", color: "#888", display: "block", marginTop: "2px" }}>{t.email}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ALT SATIR: WEB SİTESİ (ORTALI) */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
                                <div style={{
                                    backgroundColor: "#f0f7ff",
                                    padding: "15px",
                                    borderRadius: "50%",
                                    color: "#3c81b5",
                                    display: "flex"
                                }}>
                                    <Globe size={24} strokeWidth={2} />
                                </div>
                                <div>
                                    <Link href={`https://${userData.website}`} target="_blank" style={{ display: "block", fontSize: "18px", fontWeight: "600", color: "#333", letterSpacing: "-0.3px" }}>
                                        {userData.website}
                                    </Link>
                                    <span style={{ fontSize: "13px", color: "#888", display: "block", marginTop: "2px" }}>{t.website}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            borderTop: "1px solid #f0f0f0",
                            paddingTop: "50px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "15px",
                            textAlign: "center"
                        }}>
                            <div style={{
                                backgroundColor: "#f0f7ff",
                                padding: "15px",
                                borderRadius: "50%",
                                color: "#3c81b5",
                                display: "flex"
                            }}>
                                <MapPin size={24} strokeWidth={2} />
                            </div>
                            <div style={{ maxWidth: "500px" }}>
                                <span style={{ display: "block", fontSize: "17px", fontWeight: "500", color: "#333", lineHeight: "1.6", marginBottom: "12px" }}>
                                    {userData.address}
                                </span>
                                <Link href={userData.mapLink} target="_blank" style={{ fontSize: "14px", color: "#3c81b5", fontWeight: "600", textDecoration: "none", borderBottom: "1px solid #3c81b5" }}>
                                    {t.showOnMap}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
