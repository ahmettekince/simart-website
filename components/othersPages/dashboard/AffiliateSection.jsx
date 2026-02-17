"use client";

import React, { useEffect, useState } from "react";
import { useCustomerStore } from "@/stores/customerStore";
import CircularLoading from "@/components/common/CircularLoading";
import Link from "next/link";
import apiClient from "@/utils/apiClient";
import SimartButton from "@/components/common/SimartButton";

export default function AffiliateSection() {
    const customer = useCustomerStore((s) => s.customer);
    const fetchCustomer = useCustomerStore((s) => s.fetchCustomer);
    const isLoading = useCustomerStore((s) => s.isLoading);

    const [formData, setFormData] = useState({
        username: "",
        birth_date: "",
        affiliate_checkbox: false
    });
    const [verificationCode, setVerificationCode] = useState("");
    const [isApplying, setIsApplying] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [applyError, setApplyError] = useState("");
    const [applySuccess, setApplySuccess] = useState("");

    useEffect(() => {
        fetchCustomer();
    }, [fetchCustomer]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setApplyError("");
    };

    const handleApply = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.birth_date) {
            setApplyError("Lütfen tüm alanları doldurun.");
            return;
        }

        setIsApplying(true);
        setApplyError("");
        setApplySuccess("");

        try {
            const response = await apiClient.post("/affiliate/create", null, {
                params: {
                    birth_date: formData.birth_date.replace(/-/g, "/"),
                    username: formData.username,
                    affiliate_checkbox: formData.affiliate_checkbox ? 1 : 0
                }
            });

            if (response.data?.status === "success") {
                setApplySuccess(response.data.message || "Doğrulama kodu telefonunuza gönderildi.");
                // Update customer to jump to affiliate_status 0 (SMS wait)
                setTimeout(() => fetchCustomer(true), 1500);
            } else {
                setApplyError(response.data?.message || "Başvuru sırasında bir hata oluştu.");
            }
        } catch (err) {
            setApplyError(err.response?.data?.message || "Bir hata oluştu.");
        } finally {
            setIsApplying(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (!verificationCode) {
            setApplyError("Lütfen doğrulama kodunu girin.");
            return;
        }

        setIsVerifying(true);
        setApplyError("");

        try {
            // we might need birth_date here too as per previous logic, but depends on API
            // User said: {{SITE_API_URL}}/affiliate/create?birth_date=2002/12/12&code=123213
            // Since birth_date is in formData if they just filled it, or we might need it from elsewhere.
            // For safety, we keep birth_date in local state if we just transitioned.
            const response = await apiClient.post("/affiliate/create", null, {
                params: {
                    birth_date: formData.birth_date.replace(/-/g, "/"),
                    code: verificationCode
                }
            });

            if (response.data?.status === "success") {
                setApplySuccess(response.data.message || "Başvurunuz başarıyla alındı.");
                setTimeout(() => fetchCustomer(true), 2000);
            } else {
                setApplyError(response.data?.message || "Doğrulama başarısız.");
            }
        } catch (err) {
            setApplyError(err.response?.data?.message || "Bir hata oluştu.");
        } finally {
            setIsVerifying(false);
        }
    };

    if (isLoading && !customer) {
        return (
            <div className="d-flex justify-content-center p-5">
                <CircularLoading text="Bilgileriniz kontrol ediliyor..." />
            </div>
        );
    }

    const isPhoneVerified = customer?.is_phone_verified;
    const affiliateStatus = customer?.affiliate_status ?? null; // null | 0 | 1 | 2 | 3
    const affiliateMessage = customer?.affiliate_message;

    // Telefon doğrulanmamışsa (Genel hesap güvenliği)
    if (!isPhoneVerified) {
        return (
            <div className="my-account-content">
                <div className="p-5 bg-white rounded shadow-sm text-center border">
                    <div className="mb-4">
                        <div
                            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light"
                            style={{ width: '80px', height: '80px' }}
                        >
                            <i className="icon-phone" style={{ fontSize: '32px', color: '#dc3545' }}></i>
                        </div>
                    </div>
                    <h4 className="mb-3 fw-6">Telefon Doğrulaması Gerekli</h4>
                    <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '500px' }}>
                        Paylaş Şımart programına başvurabilmeniz için öncelikle profilinizdeki ana telefon numarasını doğrulamış olmanız gerekmektedir.
                    </p>
                    <Link href="/hesabim" className="tf-btn btn-primary-main style-3 mx-auto">
                        <span>Profile Git</span>
                    </Link>
                </div>
            </div>
        );
    }

    // Durum: null -> Hiç başvurmamış, Form göster
    if (affiliateStatus === null) {
        return (
            <div className="my-account-content">
                <div className="p-5 bg-white rounded shadow-sm border">
                    <div className="text-center mb-4">
                        <div
                            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light mb-3"
                            style={{ width: '80px', height: '80px' }}
                        >
                            <i className="icon-share" style={{ fontSize: '32px', color: 'var(--primary)' }}></i>
                        </div>
                        <h4 className="fw-6">Paylaş Şımart Başvurusu</h4>
                        <p className="text-muted mx-auto" style={{ maxWidth: '500px' }}>
                            Kullanıcı adınızı belirleyin ve doğum tarihinizi girerek süreci başlatın.
                        </p>
                    </div>

                    <form onSubmit={handleApply} style={{ maxWidth: '400px', margin: '0 auto' }}>
                        {applyError && <div className="alert alert-danger py-2 mb-3">{applyError}</div>}
                        {applySuccess && <div className="alert alert-success py-2 mb-3">{applySuccess}</div>}

                        <div className="mb-3">
                            <label className="form-label fw-6" style={{ fontSize: '14px' }}>Kullanıcı Adı</label>
                            <input
                                type="text"
                                name="username"
                                className="tf-field-input tf-input"
                                placeholder="Örn: alinahmettekin"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-6" style={{ fontSize: '14px' }}>Doğum Tarihi</label>
                            <input
                                type="date"
                                name="birth_date"
                                className="tf-field-input tf-input"
                                value={formData.birth_date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="mb-4 d-flex align-items-start gap-2">
                            <input
                                type="checkbox"
                                id="affiliate_checkbox"
                                name="affiliate_checkbox"
                                style={{ marginTop: '4px', width: '18px', height: '18px', cursor: 'pointer' }}
                                checked={formData.affiliate_checkbox}
                                onChange={handleInputChange}
                                required
                            />
                            <label htmlFor="affiliate_checkbox" style={{ fontSize: '13px', cursor: 'pointer', lineHeight: '1.4' }}>
                                <Link href="/sozlesme/satis-ortakligi" target="_blank" className="text-primary text-decoration-underline">Satış Ortaklığı Sözleşmesini</Link> okudum ve kabul ediyorum.
                            </label>
                        </div>

                        <SimartButton type="submit" fullWidth disabled={isApplying}>
                            {isApplying ? "İşleniyor..." : "Devam Et"}
                        </SimartButton>
                    </form>
                </div>
            </div>
        );
    }

    // Durum: 0 -> SMS onayı bekliyor
    if (affiliateStatus === 0) {
        return (
            <div className="my-account-content">
                <div className="p-5 bg-white rounded shadow-sm border">
                    <div className="text-center mb-4">
                        <div
                            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light mb-3"
                            style={{ width: '80px', height: '80px' }}
                        >
                            <i className="icon-shield-check" style={{ fontSize: '32px', color: '#f59e0b' }}></i>
                        </div>
                        <h4 className="fw-6">SMS Doğrulaması</h4>
                        <p className="text-muted mx-auto" style={{ maxWidth: '500px' }}>
                            Telefonunuza gelen 6 haneli doğrulama kodunu aşağıya girin.
                        </p>
                    </div>

                    <form onSubmit={handleVerifyCode} style={{ maxWidth: '400px', margin: '0 auto' }}>
                        {applyError && <div className="alert alert-danger py-2 mb-3">{applyError}</div>}
                        {applySuccess && <div className="alert alert-success py-2 mb-3">{applySuccess}</div>}

                        <div className="mb-4">
                            <label className="form-label fw-6" style={{ fontSize: '14px' }}>Doğrulama Kodu</label>
                            <input
                                type="text"
                                className="tf-field-input tf-input text-center"
                                style={{ fontSize: '24px', letterSpacing: '4px' }}
                                placeholder="000000"
                                maxLength={6}
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                                required
                            />
                            {/* SMS gelmediyse veya bir hata varsa birth_date girmesini saglayacak alanlar eklenebilir ama user istegine gore form'a donme butonu ekliyorum */}
                        </div>

                        {/* Kod doğrulaması için birth_date gerekebilir. 
                            Eğer kullanıcı sayfayı kapatıp açarsa status:0 gelir ama birth_date elimizde olmaz. 
                            Bu durumda birth_date'i de isteyen bir form göstermek gerekebilir. */}
                        {(!formData.birth_date) && (
                            <div className="mb-4">
                                <label className="form-label fw-6" style={{ fontSize: '14px' }}>Doğum Tarihiniz (Onay için tekrar)</label>
                                <input
                                    type="date"
                                    name="birth_date"
                                    className="tf-field-input tf-input"
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        )}

                        <SimartButton type="submit" fullWidth disabled={isVerifying}>
                            {isVerifying ? "Doğrulanıyor..." : "Doğrula ve Başvur"}
                        </SimartButton>
                    </form>
                </div>
            </div>
        );
    }

    // Durum: 1 -> Başvuru onayı bekleniyor
    if (affiliateStatus === 1) {
        return (
            <div className="my-account-content">
                <div className="p-5 bg-white rounded shadow-sm text-center border">
                    <div className="mb-4">
                        <div
                            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light"
                            style={{ width: '80px', height: '80px' }}
                        >
                            <i className="icon-clock" style={{ fontSize: '32px', color: '#f59e0b' }}></i>
                        </div>
                    </div>
                    <h4 className="mb-3 fw-6">Başvurunuz İnceleniyor</h4>
                    <div className="alert alert-warning d-inline-block px-4 py-2 border-0 mb-4" style={{ backgroundColor: '#fffbeb', color: '#b45309', borderRadius: '8px' }}>
                        <strong>Onay Bekleniyor</strong>
                    </div>
                    <p className="text-muted mx-auto" style={{ maxWidth: '600px', fontSize: '16px' }}>
                        {affiliateMessage || "Başvurunuz alındı. İncelendikten sonra bilgilendirileceksiniz."}
                    </p>
                </div>
            </div>
        );
    }

    // Durum: 2 -> Kabul edildi
    if (affiliateStatus === 2) {
        return (
            <div className="my-account-content">
                <div className="p-5 bg-white rounded shadow-sm text-center border">
                    <div className="mb-4">
                        <div
                            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light"
                            style={{ width: '80px', height: '80px' }}
                        >
                            <i className="icon-check" style={{ fontSize: '32px', color: '#28a745' }}></i>
                        </div>
                    </div>
                    <h4 className="mb-3 fw-6">Tebrikler, Kabul Edildiniz!</h4>
                    <div className="alert alert-success d-inline-block px-4 py-2 border-0 mb-4" style={{ backgroundColor: '#f0fff4', color: '#2f855a', borderRadius: '8px' }}>
                        <strong>Satış Ortaklığı Aktif</strong>
                    </div>
                    {affiliateMessage && <p className="text-muted mb-4 mx-auto">{affiliateMessage}</p>}
                    <div className="mt-4 pt-2">
                        <Link href="/magaza" className="tf-btn btn-primary-main style-3">
                            <span>Ürün Paylaşmaya Başla</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Durum: 3 -> Reddedildi
    if (affiliateStatus === 3) {
        return (
            <div className="my-account-content">
                <div className="p-5 bg-white rounded shadow-sm text-center border">
                    <div className="mb-4">
                        <div
                            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light"
                            style={{ width: '80px', height: '80px' }}
                        >
                            <i className="icon-x" style={{ fontSize: '32px', color: '#dc3545' }}></i>
                        </div>
                    </div>
                    <h4 className="mb-3 fw-6">Başvuru Sonucu</h4>
                    <div className="alert alert-danger d-inline-block px-4 py-2 border-0 mb-4" style={{ backgroundColor: '#fff5f5', color: '#c53030', borderRadius: '8px' }}>
                        <strong>Başvurunuz Reddedildi</strong>
                    </div>
                    {affiliateMessage && <p className="text-muted mx-auto">{affiliateMessage}</p>}
                </div>
            </div>
        );
    }

    return null;
}
