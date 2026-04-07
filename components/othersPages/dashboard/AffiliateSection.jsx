"use client";
import React, { useEffect, useState } from "react";
import { useCustomerStore } from "@/stores/customerStore";
import CircularLoading from "@/components/common/CircularLoading";
import Link from "next/link";
import apiClient from "@/utils/apiClient";
import SimartButton from "@/components/common/SimartButton";
import AffiliateDashboard from "./AffiliateDashboard";
import { useLangStore } from "@/stores/langStore";
import { getLocalizedUrl } from "@/utils/i18n";

export default function AffiliateSection() {
    const lang = useLangStore((s) => s.lang);
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
    const [fieldErrors, setFieldErrors] = useState({});

    const t = {
        tr: {
            checkingInfo: "Bilgileriniz kontrol ediliyor...",
            phoneVerifyRequired: "Telefon Doğrulaması Gerekli",
            phoneVerifyDesc: "Paylaş Şımart programına başvurabilmeniz için öncelikle profilinizdeki ana telefon numarasını doğrulamış olmanız gerekmektedir.",
            goToProfile: "Profile Git",
            applyTitle: "Paylaş Şımart Başvurusu",
            applyDesc: "Referans adınızı belirleyin ve doğum tarihinizi girerek süreci başlatın.",
            refName: "Referans Adı",
            refPlaceholder: "Örn: simartteknoloji",
            birthDate: "Doğum Tarihi",
            agreementPrefix: "",
            agreementLink: "Satış Ortaklığı Sözleşmesini",
            agreementSuffix: " okudum ve kabul ediyorum.",
            processing: "İşleniyor...",
            continue: "Devam Et",
            smsTitle: "SMS Doğrulaması",
            smsDesc: "Telefonunuza gelen 6 haneli doğrulama kodunu aşağıya girin.",
            smsCode: "Doğrulama Kodu",
            verifying: "Doğrulanıyor...",
            verifyAndApply: "Doğrula ve Başvur",
            inReviewTitle: "Başvurunuz İnceleniyor",
            pendingApproval: "Onay Bekleniyor",
            defaultInReviewMsg: "Başvurunuz alındı. İncelendikten sonra bilgilendirileceksiniz.",
            resultTitle: "Başvuru Sonucu",
            rejectedTitle: "Başvurunuz Reddedildi",
            errorSms: "Lütfen doğrulama kodunu girin.",
            errorGeneral: "Bir hata oluştu.",
            errorApply: "Başvuru sırasında bir hata oluştu.",
            errorVerify: "Doğrulama başarısız.",
            successSmsSent: "Doğrulama kodu telefonunuza gönderildi.",
            successApplied: "Başvurunuz başarıyla alındı."
        },
        en: {
            checkingInfo: "Checking your information...",
            phoneVerifyRequired: "Phone Verification Required",
            phoneVerifyDesc: "To apply for the Share Şımart program, you must first verify your primary phone number in your profile.",
            goToProfile: "Go to Profile",
            applyTitle: "Share Şımart Application",
            applyDesc: "Set your reference name and enter your birth date to start the process.",
            refName: "Reference Name",
            refPlaceholder: "e.g. simarttech",
            birthDate: "Date of Birth",
            agreementPrefix: "I have read and agree to the ",
            agreementLink: "Affiliate Agreement",
            agreementSuffix: ".",
            processing: "Processing...",
            continue: "Continue",
            smsTitle: "SMS Verification",
            smsDesc: "Enter the 6-digit verification code sent to your phone below.",
            smsCode: "Verification Code",
            verifying: "Verifying...",
            verifyAndApply: "Verify and Apply",
            inReviewTitle: "Your Application is Under Review",
            pendingApproval: "Pending Approval",
            defaultInReviewMsg: "Your application has been received. You will be notified after review.",
            resultTitle: "Application Result",
            rejectedTitle: "Your Application was Rejected",
            errorSms: "Please enter the verification code.",
            errorGeneral: "An error occurred.",
            errorApply: "An error occurred during application.",
            errorVerify: "Verification failed.",
            successSmsSent: "Verification code sent to your phone.",
            successApplied: "Your application has been received successfully."
        }
    }[lang] || {};

    useEffect(() => {
        fetchCustomer();
    }, [fetchCustomer]);

    useEffect(() => {
        if (applyError || applySuccess) {
            const timer = setTimeout(() => {
                setApplyError("");
                setApplySuccess("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [applyError, applySuccess]);

    const getLocalizedFieldError = (msg) => {
        if (!msg || typeof msg !== "string" || !isEn) return msg;

        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes("zaten alınmış") || lowerMsg.includes("zaten mevcut") || lowerMsg.includes("taken")) {
            return "This username is already taken.";
        }
        if (lowerMsg.includes("doğum tarihi") || lowerMsg.includes("birth date")) {
            return "Please enter a valid birth date.";
        }
        if (lowerMsg.includes("onaylamalısınız") || lowerMsg.includes("kabul etmelisiniz") || lowerMsg.includes("must accept")) {
            return "You must accept the affiliate agreement to continue.";
        }
        if (lowerMsg.includes("geçersiz") || lowerMsg.includes("invalid")) {
            return "Invalid value provided.";
        }
        if (lowerMsg.includes("zorunlu") || lowerMsg.includes("required")) {
            return "This field is required.";
        }

        return msg;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setApplyError("");
        setFieldErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleApply = async (e) => {
        e.preventDefault();
        setIsApplying(true);
        setApplyError("");
        setApplySuccess("");
        setFieldErrors({});

        try {
            const response = await apiClient.post("/affiliate/create", null, {
                params: {
                    birth_date: formData.birth_date ? formData.birth_date.replace(/-/g, "/") : "",
                    username: formData.username,
                    affiliate_checkbox: formData.affiliate_checkbox ? 1 : 0
                }
            });

            if (response.data?.status === "success") {
                setApplySuccess(response.data.message || t.successSmsSent);
                setTimeout(() => fetchCustomer(true), 1500);
            } else {
                const errors = response.data?.errors;
                if (errors && Object.keys(errors).length > 0) {
                    setFieldErrors(errors);
                } else {
                    setApplyError(response.data?.message || t.errorApply);
                }
            }
        } catch (err) {
            const data = err.response?.data;
            const errors = data?.errors;
            if (errors && Object.keys(errors).length > 0) {
                setFieldErrors(errors);
            } else {
                setApplyError(data?.message || t.errorGeneral);
            }
        } finally {
            setIsApplying(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (!verificationCode) {
            setApplyError(t.errorSms);
            return;
        }

        setIsVerifying(true);
        setApplyError("");
        setFieldErrors({});

        try {
            const response = await apiClient.post("/affiliate/create", null, {
                params: {
                    birth_date: formData.birth_date ? formData.birth_date.replace(/-/g, "/") : "",
                    code: verificationCode
                }
            });

            if (response.data?.status === "success") {
                setApplySuccess(response.data.message || t.successApplied);
                setTimeout(() => fetchCustomer(true), 2000);
            } else {
                const errors = response.data?.errors;
                if (errors && Object.keys(errors).length > 0) {
                    setFieldErrors(errors);
                } else {
                    setApplyError(response.data?.message || t.errorVerify);
                }
            }
        } catch (err) {
            const data = err.response?.data;
            const errors = data?.errors;
            if (errors && Object.keys(errors).length > 0) {
                setFieldErrors(errors);
            } else {
                setApplyError(data?.message || t.errorGeneral);
            }
        } finally {
            setIsVerifying(false);
        }
    };

    if (isLoading || !customer) {
        return (
            <div className="d-flex justify-content-center p-5">
                <CircularLoading text={t.checkingInfo} />
            </div>
        );
    }

    const isPhoneVerified = customer?.is_phone_verified;
    const affiliateStatus = customer?.affiliate_status ?? null;
    const affiliateMessage = customer?.affiliate_message;

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
                    <h4 className="mb-3 fw-6">{t.phoneVerifyRequired}</h4>
                    <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '500px' }}>
                        {t.phoneVerifyDesc}
                    </p>
                    <Link href={getLocalizedUrl("/hesabim", lang)} className="tf-btn btn-primary-main style-3 mx-auto">
                        <span>{t.goToProfile}</span>
                    </Link>
                </div>
            </div>
        );
    }

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
                        <h4 className="fw-6">{t.applyTitle}</h4>
                        <p className="text-muted mx-auto" style={{ maxWidth: '500px' }}>
                            {t.applyDesc}
                        </p>
                    </div>

                    <form onSubmit={handleApply} style={{ maxWidth: '400px', margin: '0 auto' }}>
                        {applyError && <div className="alert alert-danger py-2 mb-3">{applyError}</div>}
                        {applySuccess && <div className="alert alert-success py-2 mb-3">{applySuccess}</div>}

                        <div className="mb-3">
                            <label className="form-label fw-6" style={{ fontSize: '14px' }}>{t.refName}</label>
                            <input
                                type="text"
                                name="username"
                                className="tf-field-input tf-input"
                                placeholder={t.refPlaceholder}
                                value={formData.username}
                                onChange={handleInputChange}
                            />
                            {fieldErrors.username && (
                                <div style={{ color: '#dc3545', fontSize: '13px', marginTop: '4px' }}>
                                    {getLocalizedFieldError(fieldErrors.username[0])}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-6" style={{ fontSize: '14px' }}>{t.birthDate}</label>
                            <input
                                type="date"
                                name="birth_date"
                                className="tf-field-input tf-input"
                                value={formData.birth_date}
                                onChange={handleInputChange}
                            />
                            {fieldErrors.birth_date && (
                                <div style={{ color: '#dc3545', fontSize: '13px', marginTop: '4px' }}>
                                    {getLocalizedFieldError(fieldErrors.birth_date[0])}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <div className="d-flex align-items-start gap-2">
                                <input
                                    type="checkbox"
                                    id="affiliate_checkbox"
                                    name="affiliate_checkbox"
                                    style={{ marginTop: '4px', width: '18px', height: '18px', cursor: 'pointer' }}
                                    checked={formData.affiliate_checkbox}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="affiliate_checkbox" style={{ fontSize: '13px', cursor: 'pointer', lineHeight: '1.4' }}>
                                    {t.agreementPrefix}
                                    <Link href={getLocalizedUrl("/sozlesme/satis-ortakligi", lang)} target="_blank" className="text-primary text-decoration-underline">{t.agreementLink}</Link>
                                    {t.agreementSuffix}
                                </label>
                            </div>
                            {fieldErrors.affiliate_checkbox && (
                                <div style={{ color: '#dc3545', fontSize: '13px', marginTop: '4px', width: '100%' }}>
                                    {getLocalizedFieldError(fieldErrors.affiliate_checkbox[0])}
                                </div>
                            )}
                        </div>

                        <SimartButton type="submit" fullWidth disabled={isApplying}>
                            {isApplying ? t.processing : t.continue}
                        </SimartButton>
                    </form>
                </div>
            </div>
        );
    }

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
                        <h4 className="fw-6">{t.smsTitle}</h4>
                        <p className="text-muted mx-auto" style={{ maxWidth: '500px' }}>
                            {t.smsDesc}
                        </p>
                    </div>

                    <form onSubmit={handleVerifyCode} style={{ maxWidth: '400px', margin: '0 auto' }}>
                        {applyError && <div className="alert alert-danger py-2 mb-3">{applyError}</div>}
                        {applySuccess && <div className="alert alert-success py-2 mb-3">{applySuccess}</div>}

                        <div className="mb-4">
                            <label className="form-label fw-6" style={{ fontSize: '14px' }}>{t.smsCode}</label>
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
                            {fieldErrors.code && (
                                <div style={{ color: '#dc3545', fontSize: '13px', marginTop: '4px', textAlign: 'center' }}>
                                    {getLocalizedFieldError(fieldErrors.code[0])}
                                </div>
                            )}
                        </div>

                        <SimartButton type="submit" fullWidth disabled={isVerifying}>
                            {isVerifying ? t.verifying : t.verifyAndApply}
                        </SimartButton>
                    </form>
                </div>
            </div>
        );
    }

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
                    <h4 className="mb-3 fw-6">{t.inReviewTitle}</h4>
                    <div className="alert alert-warning d-inline-block px-4 py-2 border-0 mb-4" style={{ backgroundColor: '#fffbeb', color: '#b45309', borderRadius: '8px' }}>
                        <strong>{t.pendingApproval}</strong>
                    </div>
                    <p className="text-muted mx-auto" style={{ maxWidth: '600px', fontSize: '16px' }}>
                        {affiliateMessage || t.defaultInReviewMsg}
                    </p>
                </div>
            </div>
        );
    }

    if (affiliateStatus === 2) {
        return <AffiliateDashboard />;
    }

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
                    <h4 className="mb-3 fw-6">{t.resultTitle}</h4>
                    <div className="alert alert-danger d-inline-block px-4 py-2 border-0 mb-4" style={{ backgroundColor: '#fff5f5', color: '#c53030', borderRadius: '8px' }}>
                        <strong>{t.rejectedTitle}</strong>
                    </div>
                    {affiliateMessage && <p className="text-muted mx-auto">{affiliateMessage}</p>}
                </div>
            </div>
        );
    }

    return null;
}
