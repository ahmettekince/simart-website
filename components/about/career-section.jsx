"use client"

import React, { useRef, useState } from "react"
import Image from "next/image"
import Accordion from "@/components/common/Accordion"
import apiClient from "@/utils/apiClient"
import { formatFullNameValue } from "@/utils/inputFormatters"
import RecaptchaV3 from "@/components/common/RecaptchaV3"

export function CareerSection({ faqs = [], lang }) {
    const isEn = lang === "en"
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

    const t = {
        fullName: isEn ? "Full Name *" : "Ad Soyad *",
        phone: isEn ? "Phone *" : "Telefon *",
        message: isEn ? "Your Message *" : "Mesajınız *",
        chooseFile: isEn ? "Choose File" : "Dosya Seç",
        noFile: isEn ? "No file chosen" : "Dosya seçilmedi",
        maxFileSize: isEn ? "Max file size: 3MB" : "Maksimum dosya boyutu: 3MB",
        privacyNote: isEn ? (
            <>
                I have read and accept the <a href="/en/privacy-policy" target="_blank" className="text-decoration-underline text-primary">Privacy Policy</a>.
            </>
        ) : (
            <>
                <a href="/gizlilik-politikasi" target="_blank" className="text-decoration-underline text-primary">Gizlilik Sözleşmesi</a>'ni okudum ve kabul ediyorum.
            </>
        ),
        send: isEn ? "Send" : "Gönder",
        sending: isEn ? "Sending..." : "Gönderiliyor...",
        faqTitle: isEn ? "Frequently Asked Questions" : "Sık Sorulan Sorular",
        charsEntered: isEn ? "characters entered." : "karakter girildi.",
        fileSizeError: isEn ? "File size cannot be larger than 3MB." : "Dosya boyutu 3MB'dan büyük olamaz.",
        privacyError: isEn ? "Please accept the privacy policy." : "Lütfen gizlilik sözleşmesini kabul edin.",
        messageLengthError: isEn ? "Your message cannot be longer than 500 characters." : "Mesajınız 500 karakterden uzun olamaz.",
        recaptchaError: isEn ? "Security verification failed." : "Güvenlik doğrulaması yapılamadı.",
        recaptchaMissing: isEn ? "Please complete the security step." : "Lütfen güvenlik adımını tamamlayın.",
        successMsg: isEn ? "Your application has been sent successfully." : "Başvurunuz başarıyla gönderildi.",
        genericError: isEn ? "An error occurred. Please try again." : "Bir hata oluştu. Lütfen tekrar deneyin."
    }

    const handleShowMessage = () => {
        setShowMessage(true)
        setTimeout(() => {
            setShowMessage(false)
        }, 7000)
    }

    const handleFullNameChange = (e) => {
        setFullName(formatFullNameValue(e.target.value));

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
                setFileError(t.fileSizeError)
                setSelectedFile(null)
                e.target.value = "" // Reset input
            } else {
                setFileError("")
                setSelectedFile(file.name)
                // Hata varsa temizle
                if (fieldErrors.resume_file) {
                    setFieldErrors(prev => ({ ...prev, resume_file: null }))
                }
            }
        } else {
            setSelectedFile(null)
            setFileError("")
        }
    }

    const handlePhoneChange = (e) => {
        let value = e.target.value;

        // Rakamları al
        let raw = value.replace(/\D/g, "");

        // Baştaki 90 veya 0'ı temizle (Çünkü biz +90'ı hep sabit ekliyoruz)
        if (raw.startsWith("90")) raw = raw.slice(2);
        if (raw.startsWith("0")) raw = raw.slice(1);

        // Maksimum 10 hane (5XX...)
        let digits = raw.slice(0, 10);

        // Formatlama: +90 5XX XXX XX XX
        let formatted = "+90";
        if (digits.length > 0) formatted += " " + digits.slice(0, 3);
        if (digits.length > 3) formatted += " " + digits.slice(3, 6);
        if (digits.length > 6) formatted += " " + digits.slice(6, 8);
        if (digits.length > 8) formatted += " " + digits.slice(8, 10);

        setPhone(formatted);

        // Hata varsa temizle
        if (fieldErrors.phone) {
            setFieldErrors(prev => ({ ...prev, phone: null }));
        }
    }

    const sendCareerApplication = async (e) => {
        e.preventDefault()
        setFieldErrors({}) // Reset previous errors

        if (!privacyAccepted) {
            setSuccess(false)
            setApiMessage(t.privacyError)
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
            setApiMessage(t.messageLengthError)
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
                setApiMessage(t.recaptchaError)
                handleShowMessage()
                return
            }
        }

        if (!token) {
            setSuccess(false)
            setApiMessage(t.recaptchaMissing)
            handleShowMessage()
            return
        }

        setLoading(true)
        const formData = new FormData(e.target)
        formData.set("full_name", fullName) // State'deki formatlı ismi kullan
        formData.set("phone", phone.replace(/\s/g, "")) // Boşlukları temizleyerek API'ye gönder (+905XXXXXXXXX)
        formData.set("message", message) // State'deki mesajı kullan
        formData.append("g-recaptcha-response", token)

        try {
            const response = await apiClient.post("/career", formData)

            if (response.data.status === "success") {
                setSuccess(true)
                setApiMessage(t.successMsg)
                e.target.reset()
                setSelectedFile(null)
                setMessageLength(0)
                setPhone("+90")
                setFullName("")
                setMessage("")
                setPrivacyAccepted(false)
                handleShowMessage()
            } else {
                setSuccess(false)
                const errors = response.data.errors
                if (errors && Object.keys(errors).length > 0) {
                    setFieldErrors(errors)
                    setApiMessage(response.data.message || t.genericError)
                    handleShowMessage()
                } else {
                    setApiMessage(response.data.message || t.genericError)
                    handleShowMessage()
                }
            }
        } catch (error) {
            setSuccess(false)
            console.error("Career Form Error:", error)

            const errorData = error.response?.data
            if (errorData?.errors && Object.keys(errorData.errors).length > 0) {
                setFieldErrors(errorData.errors)
                setApiMessage(errorData.message || t.genericError)
                handleShowMessage()
            } else {
                const errorMessage = errorData?.message || t.genericError
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
                                    placeholder={t.fullName}
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

                        {/* Telefon */}
                        <div className="mb_15">
                            <fieldset className="w-100">
                                <input
                                    type="tel"
                                    name="phone"
                                    id="phone"
                                    required
                                    placeholder={t.phone}
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    maxLength={17}
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
                                    placeholder={t.message}
                                    cols={30}
                                    rows={10}
                                    maxLength={500}
                                    value={message}
                                    onChange={handleMessageChange}
                                    className={fieldErrors.message ? "error-border" : ""}
                                />
                                <div className="text-muted mt-1" style={{ fontSize: '12px', color: '#666' }}>
                                    {messageLength} / 500 {t.charsEntered}
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
                                    name="resume_file"
                                    id="resume_file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <label
                                    htmlFor="resume_file"
                                    className={`btn btn-outline-secondary ${fieldErrors.resume_file ? "border-danger text-danger" : ""}`}
                                    style={{ cursor: 'pointer', margin: 0, padding: '8px 16px' }}
                                >
                                    {t.chooseFile}
                                </label>
                                <span className="text-muted" style={{ fontSize: '14px' }}>
                                    {selectedFile || t.noFile}
                                </span>
                                <div className="w-100 text-muted" style={{ fontSize: '12px' }}>
                                    {t.maxFileSize}
                                </div>
                                {fileError && <div className="w-100 text-danger" style={{ fontSize: '12px' }}>{fileError}</div>}
                                {fieldErrors.resume_file && (
                                    <div className="w-100 text-danger" style={{ fontSize: '12px' }}>
                                        {fieldErrors.resume_file[0]}
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
                                    {t.privacyNote}
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
                                {loading ? t.sending : t.send}
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
                        {t.faqTitle}
                    </h5>
                    <div className="flat-accordion style-default has-btns-arrow">
                        <Accordion faqs={faqs} />
                    </div>
                </div>
            )}

        </>
    )
}
