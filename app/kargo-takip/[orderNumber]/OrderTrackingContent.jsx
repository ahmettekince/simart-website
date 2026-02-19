"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import apiClient from "@/utils/apiClient";
import CircularLoading from "@/components/common/CircularLoading";
import Link from "next/link";

const PackageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z"></path><polyline points="2.32 6.16 12 11 21.68 6.16"></polyline><line x1="12" y1="22.76" x2="12" y2="11"></line></svg>
);
const TruckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
);
const CourierIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const BranchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l8-4 8 4v14" /><path d="M8 21v-9a4 4 0 0 1 8 0v9" /><path d="M12 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" /></svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);

const getEventIcon = (status, description) => {
    const s = (status || "").toLowerCase();
    const d = (description || "").toLowerCase();
    const text = s + " " + d;

    if (text.includes("teslim edildi") || text.includes("delivered")) return <CheckIcon />;
    if (text.includes("dağıtım") || text.includes("kurye") || text.includes("out for delivery")) return <CourierIcon />;
    if (text.includes("varış") || text.includes("şube") || text.includes("transfer") || text.includes("destination")) return <BranchIcon />;
    if (text.includes("yol") || text.includes("transit") || text.includes("hareket")) return <TruckIcon />;
    if (text.includes("hazır") || text.includes("created") || text.includes("alındı")) return <PackageIcon />;

    return <InfoIcon />;
};

export default function OrderTrackingContent() {
    const params = useParams();
    const orderNumber = params?.orderNumber;

    const [loading, setLoading] = useState(true);
    const [trackingData, setTrackingData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (orderNumber) {
            fetchTrackingInfo();
        }
    }, [orderNumber]);

    const fetchTrackingInfo = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get(`/orders/shipping-status`, {
                params: { order_number: orderNumber }
            });

            if (response.data && response.data.status === 'success') {
                setTrackingData(response.data.data);
            } else {
                setError(response.data?.message || "Kargo bilgisi bulunamadı.");
            }
        } catch (err) {
            console.error("Kargo takip hatası:", err);
            setError(err.response?.data?.message || "Kargo bilgisi sorgulanırken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    // Events'i ters çevir (En yeni en üstte)
    const sortedEvents = trackingData?.events ? [...trackingData.events].reverse() : [];

    return (
        <section className="flat-spacing-11">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="text-center mb_40">
                            <h3 className="fw-5">Kargo Takip</h3>
                            <p className="text_black-2 mt_10">Sipariş Numarası: <strong>{orderNumber}</strong></p>
                        </div>

                        {loading ? (
                            <div className="d-flex justify-content-center py-5">
                                <CircularLoading />
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger text-center">
                                <p>{error}</p>
                                <Link href="/kargo-takip" className="tf-btn btn-outline animate-hover-btn mt_20">
                                    Farklı Bir Sipariş Sorgula
                                </Link>
                            </div>
                        ) : trackingData ? (
                            <div className="tf-page-cart-item">
                                <div className="bg_white p-4 radius-10 border-line shadow-sm">
                                    {/* Üst Bilgi Başlığı */}
                                    <div className="d-flex justify-content-between align-items-center mb_30 flex-wrap gap-20 border-bottom pb-4">
                                        <div>
                                            <span className="text_black-2 d-block mb-1" style={{ fontSize: '13px' }}>Kargo Durumu</span>
                                            <h4 className={`fw-7 ${trackingData.shipping_status === 'delivered' ? 'text-success' : 'text-primary'}`}>
                                                {trackingData.shipping_status_text || trackingData.shipping_status || "İşleniyor"}
                                            </h4>
                                        </div>
                                        {trackingData.tracking_url && (
                                            <a
                                                href={trackingData.tracking_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="tf-btn btn-fill animate-hover-btn radius-3 btn-sm"
                                            >
                                                Kargo Firmasında Takip Et
                                            </a>
                                        )}
                                    </div>

                                    {/* Detay Bilgileri Grid */}
                                    <div className="row mb_40">
                                        <div className="col-6 col-md-3 mb_20">
                                            <div className="tracking-info-box">
                                                <span className="label">Kargo Firması</span>
                                                <div className="value">{trackingData.shipping_provider?.toUpperCase() || "-"}</div>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-3 mb_20">
                                            <div className="tracking-info-box">
                                                <span className="label">Takip No</span>
                                                <div className="value">{trackingData.shipping_cargo_code || trackingData.tracking_number || "-"}</div>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-3 mb_20">
                                            <div className="tracking-info-box">
                                                <span className="label">Alıcı</span>
                                                <div className="value">{trackingData.delivery_to || "-"}</div>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-3 mb_20">
                                            <div className="tracking-info-box">
                                                <span className="label">Teslim Tarihi</span>
                                                <div className="value">{trackingData.delivery_date_time || "-"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    {sortedEvents.length > 0 && (
                                        <div className="tracking-timeline-wrapper">
                                            <h6 className="mb_20 fw-6">Gönderi Hareketleri</h6>
                                            <div className="timeline">
                                                {sortedEvents.map((event, index) => {
                                                    const isDelivered = event.eventStatus?.toLowerCase().includes("teslim edildi");
                                                    return (
                                                        <div key={index} className={`timeline-item ${index === 0 ? 'current' : ''} ${isDelivered ? 'delivered' : ''}`}>
                                                            <div className="timeline-marker">
                                                                {getEventIcon(event.eventStatus, event.description)}
                                                            </div>
                                                            <div className="timeline-content">
                                                                <div className="timeline-header">
                                                                    <span className="status fw-6">{event.eventStatus}</span>
                                                                    <span className="date">{event.eventDateTime || event.eventDateTime2}</span>
                                                                </div>
                                                                <div className="timeline-body">
                                                                    <p className="location text_black-2">
                                                                        {event.locationAddress || event.location}
                                                                        {event.locationAddress && event.location && event.locationAddress !== event.location ? `, ${event.location}` : ''}
                                                                    </p>
                                                                    {event.description && <p className="desc text-muted">{event.description}</p>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="text-center mt_30">
                                    <Link href="/" className="tf-btn btn-link animate-hover-btn">
                                        Alışverişe Dön
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p>Herhangi bir kargo bilgisi bulunamadı.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .bg_white {
                    background-color: #fff;
                }
                .radius-10 {
                    border-radius: 10px;
                }
                .shadow-sm {
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                .tracking-info-box .label {
                    display: block;
                    font-size: 12px;
                    color: #888;
                    margin-bottom: 4px;
                }
                .tracking-info-box .value {
                    font-weight: 600;
                    color: #111;
                    font-size: 14px;
                }
                
                /* Timeline Styles */
                .timeline {
                    position: relative;
                    padding-left: 40px;
                    margin-top: 10px;
                }
                /* Eski global çizgi yerine item bazlı çizgi */
                .timeline-item::before {
                    content: '';
                    position: absolute;
                    top: 36px;
                    bottom: -24px; 
                    left: -21px; /* Marker ortası: -40px (padding) + 19px(center)?  Padding-left 40. Marker left -40. Marker width 38. Center -21. */
                    width: 2px;
                    background: #e5e7eb;
                    z-index: 0;
                }
                .timeline-item:last-child::before {
                    display: none;
                }
                
                .timeline-item {
                    position: relative;
                    padding-bottom: 24px;
                }
                .timeline-item:last-child {
                    padding-bottom: 0;
                }
                
                .timeline-marker {
                    position: absolute;
                    left: -40px;
                    top: 4px;
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    background: #fff;
                    border: 2px solid #d1d5db;
                    z-index: 1;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6b7280;
                }
                
                .timeline-item.current .timeline-marker {
                    border-color: var(--primary, #3c81b5);
                    background: #eef7fc;
                    color: var(--primary, #3c81b5);
                    box-shadow: 0 0 0 4px rgba(60, 129, 181, 0.1);
                }
                
                .timeline-item.delivered .timeline-marker {
                    border-color: #0bc15c;
                    background: #e6f9ed;
                    color: #0bc15c;
                }

                .timeline-item.delivered .timeline-content {
                     border-left: 3px solid #0bc15c;
                }
                
                .timeline-content {
                    background: #f9fafb;
                    padding: 12px 16px;
                    border-radius: 8px;
                    border: 1px solid #f3f4f6;
                }
                
                .timeline-item.current .timeline-content {
                    background: #fff;
                    border-color: var(--primary, #3c81b5);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                
                .timeline-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 4px;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                
                .timeline-header .status {
                    font-size: 15px;
                    color: #111;
                }
                .timeline-item.current .timeline-header .status {
                    color: var(--primary, #3c81b5);
                }
                .timeline-item.delivered .timeline-header .status {
                    color: #0bc15c;
                }
                
                .timeline-header .date {
                    font-size: 13px;
                    color: #6b7280;
                    white-space: nowrap;
                }
                
                .timeline-body .location {
                    font-size: 13px;
                    margin-bottom: 0;
                    color: #4b5563;
                }
                .timeline-body .desc {
                    font-size: 12px;
                    margin-top: 4px;
                }
            `
            }} />
        </section>
    );
}
