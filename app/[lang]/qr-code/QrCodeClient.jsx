"use client";
import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function QrCodeClient() {
    return (
        <div className="app-landing-page">
            <main className="content-wrapper min-vh-100 d-flex align-items-center justify-content-center">
                <div className="container">
                    <div className="row justify-content-center py-5">
                        <div className="col-lg-8 text-center">
                            <h1 className="main-title animate-up">
                                Evinizi Cebinizden <br />
                                <span className="text-primary-gradient">Yönetmeye Başlayın</span>
                            </h1>

                            <p className="sub-description animate-up delay-1 mx-auto">
                                Şımart Teknoloji'nin hayatınızı kolaylaştıran yerli teknoloji akıllı ürünleri artık parmağınızın ucunda.
                                Uygulama sayesinde Şımart akıllı cihazlarınızı uzaktan kontrol edebilir, birbirine bağlayarak farklı senaryolar oluşturabilir ve konforun keyfini çıkartabilirsiniz.
                            </p>

                            <div className="download-buttons animate-up delay-2 justify-content-center">
                                <a
                                    href={siteConfig.apps.appStore}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="store-button apple"
                                >
                                    <div className="icon">
                                        <svg viewBox="0 0 384 512" width="24" height="24" fill="currentColor">
                                            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                                        </svg>
                                    </div>
                                    <div className="text">
                                        <span className="small">App Store'dan</span>
                                        <span className="big">İndirin</span>
                                    </div>
                                </a>

                                <a
                                    href={siteConfig.apps.googlePlay}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="store-button google"
                                >
                                    <div className="icon">
                                        <svg viewBox="0 0 512 512" width="24" height="24">
                                            <path fill="#00d7ff" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z" />
                                            <path fill="#ffbe00" d="M472.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z" />
                                            <path fill="#00f076" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z" />
                                            <path fill="#ff1900" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                                        </svg>
                                    </div>
                                    <div className="text">
                                        <span className="small">Google Play'den</span>
                                        <span className="big">İndirin</span>
                                    </div>
                                </a>
                            </div>

                            <div className="social-section animate-up delay-3">
                                <p className="social-label">Bizi Sosyal Medyada Takip Edin</p>
                                <div className="social-icons justify-content-center mb-4">
                                    {siteConfig.social.filter(s => s.url).map((s) => (
                                        <Link key={s.name} href={s.url || "#"} target="_blank" className={`social-icon-btn ${s.className}`}>
                                            <i className={s.icon} style={{ fontSize: '32px' }} />
                                        </Link>
                                    ))}
                                </div>
                                <div className="website-link">
                                    <Link href={siteConfig.site.url} className="site-link-text">
                                        Web Sitemizi Ziyaret Edin
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .app-landing-page {
                    background: radial-gradient(circle at top right, #edf5ff 0%, #ffffff 50%, #f7fbff 100%);
                    min-height: 100vh;
                    overflow: hidden;
                    font-family: 'Inter', sans-serif;
                }

                .main-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    line-height: 1.1;
                    color: #111;
                    margin-bottom: 24px;
                    letter-spacing: -0.03em;
                }

                .text-primary-gradient {
                    background: linear-gradient(90deg, #3c81b5, #67b7f5);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .sub-description {
                    font-size: 1.15rem;
                    color: #555;
                    line-height: 1.6;
                    max-width: 500px;
                    margin-bottom: 32px;
                }

                .download-buttons {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 48px;
                }

                .store-button {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #111;
                    color: #fff;
                    padding: 10px 20px;
                    border-radius: 12px;
                    text-decoration: none;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid #111;
                }

                .store-button:hover {
                    background: #333;
                    transform: translateY(-4px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
                }

                .store-button .text {
                    display: flex;
                    flex-direction: column;
                }

                .store-button .small {
                    font-size: 10px;
                    text-transform: uppercase;
                    opacity: 0.8;
                }

                .store-button .big {
                    font-size: 18px;
                    font-weight: 700;
                    line-height: 1;
                    margin-top: 2px;
                }

                .social-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #999;
                    margin-bottom: 16px;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .social-icons {
                    display: flex;
                    gap: 12px;
                }

                .social-icon-btn {
                    width: 68px;
                    height: 68px;
                    border-radius: 50%;
                    background: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #333;
                    transition: all 0.3s;
                    border: 1px solid #f0f0f0;
                    text-decoration: none;
                }

                .social-icon-btn:hover {
                    background: #3c81b5;
                    color: #fff;
                    border-color: #3c81b5;
                    transform: scale(1.1);
                }

                .site-link-text {
                    color: #3c81b5;
                    font-weight: 600;
                    font-size: 15px;
                    text-decoration: underline;
                    transition: opacity 0.3s;
                }

                .site-link-text:hover {
                    opacity: 0.8;
                }

                .website-link {
                    margin-top: 15px;
                }

                /* Animations */
                .animate-up {
                    opacity: 0;
                    transform: translateY(30px);
                    animation: fadeInUp 0.8s forwards;
                }

                .delay-1 { animation-delay: 0.1s; }
                .delay-2 { animation-delay: 0.2s; }
                .delay-3 { animation-delay: 0.3s; }

                @keyframes fadeInUp {
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 991px) {
                    .main-title { font-size: 2.8rem; }
                    .download-buttons { justify-content: center; flex-direction: row; align-items: center; }
                    .store-button .small { font-size: 8px; }
                    .social-icons { justify-content: center; }
                    .sub-description { max-width: 100%; }
                }
            `}</style>
        </div>
    );
}
