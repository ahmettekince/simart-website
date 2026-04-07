"use client";
import React, { useState, useEffect, useMemo } from "react";
import apiClient from "@/utils/apiClient";
import AccountTabs from "@/components/common/AccountTabs";
import CircularLoading from "@/components/common/CircularLoading";
import SimartButton from "@/components/common/SimartButton";
import { log } from "@/utils/logger";
import { useCustomerStore } from "@/stores/customerStore";
import { useLangStore } from "@/stores/langStore";
import { getLocalizedUrl } from "@/utils/i18n";

export default function AffiliateDashboard() {
    const lang = useLangStore((s) => s.lang);
    const [loading, setLoading] = useState(true);
    const [info, setInfo] = useState(null);
    const [activeTab, setActiveTab] = useState("genel");
    const [copyStatus, setCopyStatus] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLink, setSelectedLink] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const { customer, fetchCustomer } = useCustomerStore();

    const t = {
        tr: {
            loading: "Panel verileri yükleniyor...",
            error: "Panel verileri şu anda alınamadı. Lütfen daha sonra tekrar deneyin.",
            statTotalVisits: "Toplam Ziyaret",
            statOrders: "Siparişler",
            statCommRate: "Komisyon Oranı",
            statPending: "Bekleyen Hakediş",
            statWithdrawable: "Çekilebilir Bakiye",
            statLifetime: "Toplam Kazanç",
            tabOverview: "Genel Bakış",
            tabCreateLink: "Link Oluştur",
            tabOrders: "Siparişler",
            tabVisitors: "Ziyaretçiler",
            welcome: "Hoş Geldiniz",
            overviewDesc: "Satış ortaklığı paneliniz üzerinden performansınızı takip edebilir ve referans linklerinizi yönetebilirsiniz.",
            mainRefLink: "Ana Referans Linkiniz",
            copied: "Kopyalandı!",
            copy: "Kopyala",
            infoTitle: "Bilgilendirme",
            infoOrderTracking: "Sipariş Takibi",
            infoOrderTrackingDesc: "Referans linkinizle yapılan başarılı alışverişler otomatik olarak sisteminize kaydedilir.",
            info14Days: "14 Gün Onay Süresi",
            info14DaysDesc: "Hakedişleriniz, müşteri memnuniyeti ve yasal iade süreci nedeniyle teslimattan 14 gün sonra çekilebilir bakiyeye aktarılır.",
            infoEarnComm: "Komisyon Kazanma",
            infoEarnCommDesc: "Linkinize tıklayan kullanıcıların 3 gün içerisinde yapacağı alışverişlerden komisyon kazanırsınız.",
            infoCancelRefund: "İptal ve İade Koşulu",
            infoCancelRefundDesc: "İptal edilen veya iade edilen siparişlerden komisyon kazanılamaz.",
            createRefLink: "Referans Linki Oluştur",
            anyProductDesc: "Paylaştığınız link üzerinden siteye giren kullanıcılar, hangi ürünü alırsa alsın komisyon kazanırsınız.",
            searchLabel: "Arayın ve seçin (Ürün, Kategori veya Genel Linkler)",
            searchPlaceholder: "Örn: Akıllı Parmak, Robotlar, Anasayfa...",
            noResults: "Sonuç bulunamadı.",
            catLabel: "Kategori",
            prodLabel: "Ürün",
            genLabel: "Genel",
            mainPage: "Anasayfa",
            allProducts: "Tüm Ürünler (Mağaza)",
            refLinkOf: "Referans Linki",
            clear: "Temizle",
            thOrderNo: "Sipariş No",
            thComm: "Komisyon",
            thStatus: "Durum",
            thSettlementDate: "Hakediş Tarihi",
            thOrderDate: "Sipariş Tarihi",
            noOrders: "Henüz referansınızla eşleşen bir sipariş bulunmuyor.",
            thTargetPage: "Hedef Sayfa",
            thVisitTime: "Ziyaret Zamanı",
            noVisitors: "Henüz ziyaretçi trafiği kaydedilmedi.",
            statusApproved: "Onaylandı",
            statusPending: "Beklemede"
        },
        en: {
            loading: "Loading dashboard data...",
            error: "Panel data could not be retrieved at this time. Please try again later.",
            statTotalVisits: "Total Visits",
            statOrders: "Orders",
            statCommRate: "Commission Rate",
            statPending: "Pending Earnings",
            statWithdrawable: "Withdrawable Balance",
            statLifetime: "Total Earnings",
            tabOverview: "Overview",
            tabCreateLink: "Create Link",
            tabOrders: "Orders",
            tabVisitors: "Visitors",
            welcome: "Welcome",
            overviewDesc: "You can track your performance and manage your referral links through your affiliate dashboard.",
            mainRefLink: "Your Primary Referral Link",
            copied: "Copied!",
            copy: "Copy",
            infoTitle: "Information",
            infoOrderTracking: "Order Tracking",
            infoOrderTrackingDesc: "Successful purchases made with your referral link are automatically recorded in your system.",
            info14Days: "14 Days Approval Period",
            info14DaysDesc: "Due to customer satisfaction and legal return processes, your earnings are transferred to your withdrawable balance 14 days after delivery.",
            infoEarnComm: "Earning Commission",
            infoEarnCommDesc: "You earn commissions on purchases made by users who click your link within 3 days.",
            infoCancelRefund: "Cancellation and Return Policy",
            infoCancelRefundDesc: "No commission is earned from canceled or returned orders.",
            createRefLink: "Create Referral Link",
            anyProductDesc: "You earn commission regardless of which product users buy after entering the site via your link.",
            searchLabel: "Search and select (Product, Category, or General Links)",
            searchPlaceholder: "e.g. Smart Finger, Robots, Home...",
            noResults: "No results found.",
            catLabel: "Category",
            prodLabel: "Product",
            genLabel: "General",
            mainPage: "Home",
            allProducts: "All Products (Store)",
            refLinkOf: "Referral Link",
            clear: "Clear",
            thOrderNo: "Order No",
            thComm: "Commission",
            thStatus: "Status",
            thSettlementDate: "Settlement Date",
            thOrderDate: "Order Date",
            noOrders: "No orders matching your reference found yet.",
            thTargetPage: "Target Page",
            thVisitTime: "Visit Time",
            noVisitors: "No visitor traffic recorded yet.",
            statusApproved: "Approved",
            statusPending: "Pending"
        }
    }[lang] || {};

    const isEn = lang === "en";

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                fetchCustomer();
                const response = await apiClient.get("/affiliate/info");
                if (response.data?.status === "success") {
                    log("Affiliate Info Response:", response.data);
                    setInfo(response.data.data.affiliate);
                }
            } catch (err) {
                console.error("Affiliate info fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, [fetchCustomer]);

    const tabs = useMemo(() => [
        { id: "genel", label: t.tabOverview },
        { id: "link-olustur", label: t.tabCreateLink },
        { id: "siparisler", label: t.tabOrders, count: info?.orders?.length || 0 },
        { id: "ziyaretciler", label: t.tabVisitors, count: info?.visitors_recent?.length || 0 },
    ], [info, t.tabOverview, t.tabCreateLink, t.tabOrders, t.tabVisitors]);

    const handleCopy = (text, id) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopyStatus(id);
            setTimeout(() => setCopyStatus(null), 2000);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center p-5">
                <CircularLoading text={t.loading} />
            </div>
        );
    }

    if (!info) {
        return (
            <div className="my-account-content text-center p-5 bg-white border" style={{ borderRadius: '12px' }}>
                <p className="text-muted">{t.error}</p>
            </div>
        );
    }

    return (
        <div className="affiliate-dashboard">
            {/* İstatistik Özetleri */}
            <div className="row g-3 mb-4">
                <StatCard title={t.statTotalVisits} value={info.visitors_total} icon="icon-view" color="#3c81b5" />
                <StatCard title={t.statOrders} value={info.orders_count} icon="icon-bag" color="#f59e0b" />
                <StatCard title={t.statCommRate} value={`%${info.commission_rate}`} icon="icon-card" color="#3b82f6" />
                <StatCard title={t.statPending} value={`${Number(info.commission_pending).toLocaleString(isEn ? "en-US" : "tr-TR")} TL`} icon="icon-time" color="#8b5cf6" />
                <StatCard title={t.statWithdrawable} value={`${Number(info.commission_withdrawable).toLocaleString(isEn ? "en-US" : "tr-TR")} TL`} icon="icon-check" color="#10b981" isGreen />
                <StatCard title={t.statLifetime} value={`${Number(info.commission_lifetime).toLocaleString(isEn ? "en-US" : "tr-TR")} TL`} icon="icon-card" color="#ef4444" isHighlight />
            </div>

            <AccountTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="tab-content mt-4">
                {activeTab === "genel" && (
                    <div className="row g-4">
                        <div className="col-md-7">
                            <div className="bg-white p-4 border h-100" style={{ borderRadius: '12px' }}>
                                <h5 className="fw-6 mb-3" style={{ fontSize: '18px' }}>
                                    {t.welcome}, {customer ? `${customer.first_name} ${customer.last_name}` : info.username}
                                </h5>
                                <p className="text-muted small mb-4">
                                    {t.overviewDesc}
                                </p>

                                <div className="p-3 bg-light border" style={{ borderRadius: '10px' }}>
                                    <label className="fw-6 small mb-2 d-block">{t.mainRefLink}</label>
                                    <div className="d-flex gap-2 align-items-center">
                                        <div className="flex-grow-1 bg-white px-3 py-2 border text-truncate" style={{ fontSize: '13px', borderRadius: '10px' }}>
                                            <code>{info.referral_urls.home.url}</code>
                                        </div>
                                        <SimartButton
                                            onClick={() => handleCopy(info.referral_urls.home.url, 'main')}
                                            className={copyStatus === 'main' ? 'btn-success' : 'btn-primary-main'}
                                            style={{ minWidth: copyStatus === 'main' ? '110px' : '90px', height: '38px', fontSize: '12px', borderRadius: '10px' }}
                                        >
                                            {copyStatus === 'main' ? t.copied : t.copy}
                                        </SimartButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-5">
                            <div className="bg-white p-4 border h-100" style={{ borderRadius: '12px' }}>
                                <h5 className="fw-6 mb-3" style={{ fontSize: '18px' }}>{t.infoTitle}</h5>
                                <div className="d-flex flex-column gap-4">
                                    <div className="d-flex gap-3 align-items-start">
                                        <div className="bg-primary-subtle p-2 rounded text-primary" style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="icon-check" style={{ fontSize: '14px' }}></i>
                                        </div>
                                        <div>
                                            <div className="fw-6 medium mb-1">{t.infoOrderTracking}</div>
                                            <p className="text-muted mb-0" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                                {t.infoOrderTrackingDesc}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-3 align-items-start">
                                        <div className="bg-warning-subtle p-2 rounded text-warning" style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="icon-time" style={{ fontSize: '14px' }}></i>
                                        </div>
                                        <div>
                                            <div className="fw-6 medium mb-1">{t.info14Days}</div>
                                            <p className="text-muted mb-0" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                                {t.info14DaysDesc}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-3 align-items-start">
                                        <div className="bg-info-subtle p-2 rounded text-info" style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="icon-card" style={{ fontSize: '14px' }}></i>
                                        </div>
                                        <div>
                                            <div className="fw-6 medium mb-1">{t.infoEarnComm}</div>
                                            <p className="text-muted mb-0" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                                {t.infoEarnCommDesc}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-3 align-items-start">
                                        <div className="bg-danger-subtle p-2 rounded text-danger" style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <i className="icon-close" style={{ fontSize: '14px' }}></i>
                                        </div>
                                        <div>
                                            <div className="fw-6 medium mb-1">{t.infoCancelRefund}</div>
                                            <p className="text-muted mb-0" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                                                {t.infoCancelRefundDesc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "link-olustur" && (
                    <div className="bg-white p-4 rounded shadow-sm border" >
                        <h5 className="fw-6 mb-3" style={{ fontSize: '18px' }}>{t.createRefLink}</h5>
                        <div className="p-3 d-flex gap-3 align-items-center mb-4" style={{ backgroundColor: '#3c81b5', borderRadius: '10px' }}>
                            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ minWidth: '32px', height: '32px', color: '#3c81b5' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="6" x2="12" y2="10"></line>
                                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                                </svg>
                            </div>
                            <p className="text-white mb-0 medium fw-500">
                                {t.anyProductDesc}
                            </p>
                        </div>

                        <div className="position-relative mb-4">
                            <label className="fw-6 small mb-2 d-block text-muted">{t.searchLabel}</label>
                            <div className="position-relative">
                                <input
                                    type="text"
                                    className="tf-field-input tf-input ps-5"
                                    placeholder={t.searchPlaceholder}
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowResults(true);
                                    }}
                                    onFocus={() => setShowResults(true)}
                                    style={{ height: '48px', fontSize: '14px', borderRadius: '12px' }}
                                />
                                <i className="icon-search position-absolute top-50 translate-middle-y ms-3 text-muted" style={{ left: '5px' }}></i>
                            </div>

                            {/* Arama Sonuçları Dropdown */}
                            {showResults && searchQuery.length > 0 && (
                                <div
                                    className="position-absolute w-100 bg-white shadow-lg border mt-1 overflow-auto"
                                    style={{ zIndex: 100, maxHeight: '300px', borderRadius: '12px' }}
                                >
                                    {/* Genel Linkler Filtrele */}
                                    {[
                                        { label: t.mainPage, url: info.referral_urls.home.url, type: t.genLabel },
                                        { label: t.allProducts, url: info.referral_urls.store.url, type: t.genLabel }
                                    ].filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase())).map((item, idx) => (
                                        <div
                                            key={`genel-${idx}`}
                                            className="p-3 border-bottom cursor-pointer hover-bg-light d-flex justify-content-between align-items-center"
                                            onClick={() => {
                                                setSelectedLink(item);
                                                setShowResults(false);
                                                setSearchQuery("");
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <span className="fw-500">{item.label}</span>
                                            <span className="badge bg-secondary-subtle text-secondary small" style={{ fontSize: '10px' }}>{item.type}</span>
                                        </div>
                                    ))}

                                    {/* Kategoriler Filtrele */}
                                    {info.referral_urls.categories
                                        .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map(cat => (
                                            <div
                                                key={`cat-${cat.id}`}
                                                className="p-3 border-bottom cursor-pointer hover-bg-light d-flex justify-content-between align-items-center"
                                                onClick={() => {
                                                    setSelectedLink({ label: cat.name, url: cat.url });
                                                    setShowResults(false);
                                                    setSearchQuery("");
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <span className="fw-500">{cat.name}</span>
                                                <span className="badge bg-primary-subtle text-primary small" style={{ fontSize: '10px' }}>{t.catLabel}</span>
                                            </div>
                                        ))
                                    }

                                    {/* Ürünler Filtrele */}
                                    {info.referral_urls.products
                                        .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map(prod => (
                                            <div
                                                key={`prod-${prod.id}`}
                                                className="p-3 border-bottom cursor-pointer hover-bg-light d-flex justify-content-between align-items-center"
                                                onClick={() => {
                                                    setSelectedLink({ label: prod.name, url: prod.url });
                                                    setShowResults(false);
                                                    setSearchQuery("");
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <span className="fw-500">{prod.name}</span>
                                                <span className="badge bg-info-subtle text-info small" style={{ fontSize: '10px' }}>{t.prodLabel}</span>
                                            </div>
                                        ))
                                    }

                                    {/* Sonuç Yoksa */}
                                    {searchQuery.length > 0 &&
                                        ![...info.referral_urls.categories, ...info.referral_urls.products].some(i => (i.name || i.label).toLowerCase().includes(searchQuery.toLowerCase())) &&
                                        ![t.mainPage.toLowerCase(), t.allProducts.toLowerCase()].some(s => s.includes(searchQuery.toLowerCase())) && (
                                            <div className="p-4 text-center text-muted small">{t.noResults}</div>
                                        )}
                                </div>
                            )}
                        </div>

                        {/* Seçilen Link Kutusu */}
                        {selectedLink && (
                            <div className="mt-5 p-4 bg-light border border-primary-subtle" style={{ borderRadius: '12px' }}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-6 mb-0 text-primary">{selectedLink.label} {t.refLinkOf}</h6>
                                    <SimartButton
                                        className="btn-link btn-sm text-muted p-0 text-decoration-none"
                                        onClick={() => setSelectedLink(null)}
                                        style={{ background: 'none', border: 'none', minWidth: 'auto', height: 'auto' }}
                                    >
                                        {t.clear}
                                    </SimartButton>
                                </div>
                                <div className="d-flex gap-2 align-items-center bg-white p-2 border shadow-sm" style={{ borderRadius: '10px' }}>
                                    <div className="flex-grow-1 px-3 py-2 text-truncate" style={{ fontSize: '14px' }}>
                                        <code className="text-secondary">{selectedLink.url}</code>
                                    </div>
                                    <SimartButton
                                        onClick={() => handleCopy(selectedLink.url, 'selected')}
                                        className={copyStatus === 'selected' ? 'btn-success' : 'btn-primary-main'}
                                        style={{ minWidth: '100px', height: '42px', borderRadius: '10px' }}
                                    >
                                        {copyStatus === 'selected' ? t.copied : t.copy}
                                    </SimartButton>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "siparisler" && (
                    <div className="bg-white border overflow-hidden" style={{ borderRadius: '12px' }}>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0" style={{ fontSize: '13px' }}>
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 border-0 fw-6 text-nowrap text-white">{t.thOrderNo}</th>
                                        <th className="px-4 py-3 border-0 fw-6 text-nowrap text-white">{t.thComm}</th>
                                        <th className="px-4 py-3 border-0 fw-6 text-center text-nowrap text-white">{t.thStatus}</th>
                                        <th className="px-4 py-3 border-0 fw-6 text-center text-nowrap text-white">{t.thSettlementDate}</th>
                                        <th className="px-4 py-3 border-0 fw-6 text-end text-nowrap text-white">{t.thOrderDate}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {info.orders.length > 0 ? info.orders.map(order => (
                                        <tr key={order.id}>
                                            <td className="px-4 py-3 font-monospace text-nowrap">#{order.order_number}</td>
                                            <td className="px-4 py-3 text-success fw-6 text-nowrap">+{Number(order.commission_amount || order.commission).toLocaleString(isEn ? "en-US" : "tr-TR")} TL</td>
                                            <td className="px-4 py-3 text-center text-nowrap">
                                                <span
                                                    className={`px-2 py-1 rounded small fw-6 ${[5, 6].includes(order.status) || order.status === 'onaylandi' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}
                                                    style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
                                                >
                                                    {order.status_message || order.status_label || (order.status === 5 || order.status === 6 ? t.statusApproved : t.statusPending)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center text-muted small text-nowrap">
                                                {order.hakedis_at ? order.hakedis_at.split(' ')[0].split('-').reverse().join('.') : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-end text-muted small text-nowrap">
                                                {new Date(order.created_at).toLocaleString(isEn ? "en-US" : "tr-TR", {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-muted">
                                                <div className="mb-2"><i className="icon-shopping-bag" style={{ fontSize: '32px', opacity: 0.3 }}></i></div>
                                                {t.noOrders}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "ziyaretciler" && (
                    <div className="bg-white border overflow-hidden" style={{ borderRadius: '12px' }}>
                        <div className="table-responsive">
                            <table className="table table-hover mb-0" style={{ fontSize: '13px' }}>
                                <thead className="bg-light">
                                    <tr>
                                        <th className="px-4 py-3 border-0 fw-6">{t.thTargetPage}</th>
                                        <th className="px-4 py-3 border-0 fw-6 text-end">{t.thVisitTime}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {info.visitors_recent.length > 0 ? info.visitors_recent.map(visit => (
                                        <tr key={visit.id}>
                                            <td className="px-4 py-3 text-truncate" style={{ maxWidth: '350px' }}>
                                                <span className="text-muted">{visit.page}</span>
                                            </td>
                                            <td className="px-4 py-3 text-end text-muted small">
                                                {new Date(visit.created_at).toLocaleString(isEn ? "en-US" : "tr-TR", {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="3" className="text-center py-5 text-muted">{t.noVisitors}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .affiliate-dashboard {
                    animation: fadeIn 0.4s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .bg-success-subtle { background-color: #ecfdf5; }
                .bg-warning-subtle { background-color: #fffbeb; }
                .text-success { color: #10b981 !important; }
                .text-warning { color: #b45309 !important; }
                .bg-info-subtle { background-color: #e0f2fe; }
                .text-info { color: #0284c7 !important; }
                .bg-danger-subtle { background-color: #fef2f2; }
                .text-danger { color: #dc2626 !important; }
                .table thead tr th { 
                    background-color: #f5f5f5 !important; 
                    color: #000 !important; 
                    border: none !important;
                }
            `}</style>
        </div >
    );
}

function StatCard({ title, value, icon, color, isHighlight, isGreen }) {
    return (
        <div className="col-6 col-md">
            <div className={`p-4 border h-100 ${isHighlight ? 'bg-primary-main text-white border-0' : 'bg-white'}`} style={{ borderRadius: '12px' }}>
                <div className="d-flex flex-column gap-2">
                    <div
                        className="d-flex align-items-center justify-content-center rounded-circle mb-1"
                        style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: isHighlight ? 'rgba(255,255,255,0.2)' : `${color}10`,
                            color: isHighlight ? '#fff' : color
                        }}
                    >
                        <i className={icon} style={{ fontSize: '20px' }}></i>
                    </div>
                    <div>
                        <div className={`small mb-1 text-nowrap ${isHighlight ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '12px' }}>{title}</div>
                        <div className="h4 fw-bold mb-0 text-nowrap" style={{
                            letterSpacing: '-0.5px',
                            color: isHighlight ? '#fff' : (isGreen ? '#10b981' : '#000')
                        }}>{value}</div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .bg-primary-main { background-color: var(--primary) !important; }
            `}</style>
        </div>
    );
}

function LinkItem({ label, url, onCopy, isCopied, compact }) {
    return (
        <div className={`p-3 bg-light rounded border d-flex align-items-center gap-3 transition-all ${compact ? 'py-2 px-3' : ''}`} style={{ transition: 'all 0.2s' }}>
            <div className="flex-grow-1 min-width-0">
                <div className="fw-6 small mb-1">{label}</div>
                <div className="text-muted small text-truncate" style={{ fontSize: '11px', opacity: 0.7 }}>{url}</div>
            </div>
            <SimartButton
                onClick={onCopy}
                className={isCopied ? 'btn-success' : 'btn-outline-primary'}
                style={{
                    minWidth: '85px',
                    height: '32px',
                    fontSize: '11px',
                    borderRadius: '8px',
                    borderColor: isCopied ? '#10b981' : 'var(--primary)',
                    backgroundColor: isCopied ? '#10b981' : 'transparent',
                    color: isCopied ? '#fff' : 'var(--primary)',
                }}
            >
                {isCopied ? "Kopyalandı" : "Kopyala"}
            </SimartButton>
        </div>
    );
}
