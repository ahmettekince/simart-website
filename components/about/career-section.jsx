"use client"

import React, { useRef, useState } from "react"
import Image from "next/image"
import Accordion from "@/components/common/Accordion"
import apiClient from "@/utils/apiClient"
import RecaptchaV3 from "@/components/common/RecaptchaV3"

export function CareerSection({ faqs = [] }) {
    const formRef = useRef()
    const executeRecaptchaRef = useRef(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [showMessage, setShowMessage] = useState(false)
    const [apiMessage, setApiMessage] = useState("")
    const [messageLength, setMessageLength] = useState(0)
    const [selectedFile, setSelectedFile] = useState(null)
    const [recaptchaVerified, setRecaptchaVerified] = useState(false)

    const [phone, setPhone] = useState("+90")
    const [fullName, setFullName] = useState("")
    const [message, setMessage] = useState("")
    const [privacyAccepted, setPrivacyAccepted] = useState(false)
    const [fileError, setFileError] = useState("")
    const [fieldErrors, setFieldErrors] = useState({})

    const handleShowMessage = () => {
        setShowMessage(true)
        setTimeout(() => {
            setShowMessage(false)
        }, 7000)
    }

    const handleFullNameChange = (e) => {
        // Sadece harfler ve boşluk
        const value = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, "")
        setFullName(value)
        // Hata varsa temizle
        if (fieldErrors.full_name) {
            setFieldErrors(prev => ({ ...prev, full_name: null }))
        }
    }

    const handleMessageChange = (e) => {
        const value = e.target.value
        if (value.length <= 500) {
            setMessage(value)
            setMessageLength(value.length)
            // Hata varsa temizle
            if (fieldErrors.message) {
                setFieldErrors(prev => ({ ...prev, message: null }))
            }
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 3 * 1024 * 1024) {
                setFileError("Dosya boyutu 3MB'dan büyük olamaz.")
                setSelectedFile(null)
                e.target.value = "" // Reset input
            } else {
                setFileError("")
                setSelectedFile(file.name)
                // Hata varsa temizle
                if (fieldErrors.cv_file) {
                    setFieldErrors(prev => ({ ...prev, cv_file: null }))
                }
            }
        } else {
            setSelectedFile(null)
            setFileError("")
        }
    }

    const handlePhoneChange = (e) => {
        let value = e.target.value
        // Sadece rakamlar ve + işareti
        value = value.replace(/[^0-9+]/g, "")
        // +90 ile başlamasını sağla (veya sadece rakam girmesine izin verip prefix ekle)
        if (!value.startsWith("+")) {
            value = "+" + value
        }
        setPhone(value)
        // Hata varsa temizle
        if (fieldErrors.phone) {
            setFieldErrors(prev => ({ ...prev, phone: null }))
        }
    }

    const sendCareerApplication = async (e) => {
        e.preventDefault()
        setFieldErrors({}) // Reset previous errors

        if (!privacyAccepted) {
            setSuccess(false)
            setApiMessage("Lütfen gizlilik sözleşmesini kabul edin.")
            handleShowMessage()
            return
        }

        if (fileError) {
            setSuccess(false)
            setApiMessage(fileError)
            handleShowMessage()
            return
        }

        if (message.length > 500) {
            setSuccess(false)
            setApiMessage("Mesajınız 500 karakterden uzun olamaz.")
            handleShowMessage()
            return
        }

        // V3: Token al
        let token = null;
        if (executeRecaptchaRef.current) {
            try {
                token = await executeRecaptchaRef.current();
            } catch (e) {
                console.error("reCAPTCHA hatası:", e);
                setSuccess(false)
                setApiMessage("Güvenlik doğrulaması yapılamadı.")
                handleShowMessage()
                return
            }
        }

        if (!token) {
            setSuccess(false)
            setApiMessage("Lütfen güvenlik adımını tamamlayın.")
            handleShowMessage()
            return
        }

        setLoading(true)
        const formData = new FormData(e.target)
        formData.set("full_name", fullName) // State'deki formatlı ismi kullan
        formData.set("phone", phone) // State'deki formatlı telefonu kullan
        formData.set("message", message) // State'deki mesajı kullan
        formData.append("g-recaptcha-response", token)

        try {
            const response = await apiClient.post("/career", formData)

            if (response.data.status === "success") {
                setSuccess(true)
                setApiMessage("Başvurunuz başarıyla gönderildi.")
                e.target.reset()
                setSelectedFile(null)
                setMessageLength(0)
                setPhone("+90")
                setFullName("")
                setMessage("")
                setPrivacyAccepted(false)
            } else {
                setSuccess(false)
                if (response.data.errors) {
                    setFieldErrors(response.data.errors)
                } else {
                    setApiMessage(response.data.message || "Bir hata oluştu.")
                    handleShowMessage()
                }
            }
        } catch (error) {
            setSuccess(false)
            console.error("Career Form Error:", error)

            if (error.response?.data?.errors) {
                setFieldErrors(error.response.data.errors)
            } else {
                const errorMessage = error.response?.data?.message || "Bir hata oluştu. Lütfen tekrar deneyin."
                setApiMessage(errorMessage)
                handleShowMessage()
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="row">
                {/* Form Alanı */}
                <div className="col-lg-7">
                    <form ref={formRef} onSubmit={sendCareerApplication} className="form-contact" noValidate>
                        {/* Ad Soyad */}
                        <div className="mb_15">
                            <fieldset className="w-100">
                                <input
                                    type="text"
                                    name="full_name"
                                    id="full_name"
                                    required
                                    placeholder="Ad Soyad *"
                                    value={fullName}
                                    onChange={handleFullNameChange}
                                    className={fieldErrors.full_name ? "error-border" : ""}
                                />
                                {fieldErrors.full_name && (
                                    <div className="text-danger mt-1" style={{ fontSize: '12px' }}>
                                        {fieldErrors.full_name[0]}
                                    </div>
                                )}
                            </fieldset>
                        </div>

                        {/* E-Mail */}
                        <div className="mb_15">
                            <fieldset className="w-100">
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    required
                                    placeholder="E-Mail *"
                                    className={fieldErrors.email ? "error-border" : ""}
                                    onChange={() => {
                                        if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: null }))
                                    }}
                                />
                                {fieldErrors.email && (
                                    <div className="text-danger mt-1" style={{ fontSize: '12px' }}>
                                        {fieldErrors.email[0]}
                                    </div>
                                )}
                            </fieldset>
                        </div>

                        {/* Telefon */}
                        <div className="mb_15">
                            <fieldset className="w-100">
                                <input
                                    type="tel"
                                    name="phone"
                                    id="phone"
                                    required
                                    placeholder="Telefon *"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    className={fieldErrors.phone ? "error-border" : ""}
                                />
                                {fieldErrors.phone && (
                                    <div className="text-danger mt-1" style={{ fontSize: '12px' }}>
                                        {fieldErrors.phone[0]}
                                    </div>
                                )}
                            </fieldset>
                        </div>

                        {/* Mesaj */}
                        <div className="mb_15">
                            <fieldset className="w-100">
                                <textarea
                                    name="message"
                                    id="message"
                                    required
                                    placeholder="Mesajınız *"
                                    cols={30}
                                    rows={10}
                                    maxLength={500}
                                    value={message}
                                    onChange={handleMessageChange}
                                    className={fieldErrors.message ? "error-border" : ""}
                                />
                                <div className="text-muted mt-1" style={{ fontSize: '12px', color: '#666' }}>
                                    {messageLength} / 500 karakter girildi.
                                </div>
                                {fieldErrors.message && (
                                    <div className="text-danger mt-1" style={{ fontSize: '12px' }}>
                                        {fieldErrors.message[0]}
                                    </div>
                                )}
                            </fieldset>
                        </div>

                        {/* Dosya Yükleme */}
                        <div className="mb_15">
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <input
                                    type="file"
                                    name="cv_file"
                                    id="cv_file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <label
                                    htmlFor="cv_file"
                                    className={`btn btn-outline-secondary ${fieldErrors.cv_file ? "border-danger text-danger" : ""}`}
                                    style={{ cursor: 'pointer', margin: 0, padding: '8px 16px' }}
                                >
                                    Dosya Seç
                                </label>
                                <span className="text-muted" style={{ fontSize: '14px' }}>
                                    {selectedFile || "Dosya seçilmedi"}
                                </span>
                                <div className="w-100 text-muted" style={{ fontSize: '12px' }}>
                                    Maksimum dosya boyutu: 3MB
                                </div>
                                {fileError && <div className="w-100 text-danger" style={{ fontSize: '12px' }}>{fileError}</div>}
                                {fieldErrors.cv_file && (
                                    <div className="w-100 text-danger" style={{ fontSize: '12px' }}>
                                        {fieldErrors.cv_file[0]}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Gizlilik Sözleşmesi Checkbox */}
                        <div className="mb_15">
                            <div className="box-checkbox fieldset-radio d-flex align-items-start gap-2">
                                <input
                                    type="checkbox"
                                    id="privacyAccepted"
                                    className="tf-check"
                                    checked={privacyAccepted}
                                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                                    style={{ marginTop: '4px' }}
                                />
                                <label htmlFor="privacyAccepted" className="text_black-2 fw-4" style={{ fontSize: '14px', cursor: 'pointer' }}>
                                    <a href="/gizlilik-politikasi" target="_blank" className="text-decoration-underline text-primary">Gizlilik Sözleşmesi</a>'ni okudum ve kabul ediyorum.
                                </label>
                            </div>
                        </div>

                        {/* reCAPTCHA V3 */}
                        <RecaptchaV3
                            onVerify={(executeFn) => {
                                executeRecaptchaRef.current = executeFn;
                            }}
                            action="career"
                        />

                        {/* Mesaj */}
                        <div className={`tfSubscribeMsg ${showMessage ? "active" : ""}`}>
                            <p style={{ color: success ? "rgb(52, 168, 83)" : "red" }}>{apiMessage}</p>
                        </div>

                        {/* Gönder Butonu */}
                        <div className="send-wrap">
                            <button
                                type="submit"
                                disabled={loading}
                                className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                                style={{
                                    background: success ? 'rgb(52, 168, 83)' : 'var(--primary, #000)',
                                    opacity: loading || !privacyAccepted ? 0.7 : 1,
                                    cursor: loading || !privacyAccepted ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? "Gönderiliyor..." : "Gönder"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Fotoğraf Alanı */}
                <div className="col-lg-5">
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        minHeight: '500px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                    }}>
                        <Image
                            src="/images/career/kariyer.jpg"
                            alt="Kariyer"
                            fill
                            style={{
                                objectFit: 'cover',
                            }}
                            sizes="(max-width: 768px) 100vw, 40vw"
                        />
                    </div>
                </div>
            </div>

            {/* FAQ Bölümü */}
            {faqs && faqs.length > 0 && (
                <div className="mt-5">
                    <h5 className="mb_24">
                        Sık Sorulan Sorular
                    </h5>
                    <div className="flat-accordion style-default has-btns-arrow">
                        <Accordion faqs={faqs} />
                    </div>
                </div>
            )}

        </>
    )
}
