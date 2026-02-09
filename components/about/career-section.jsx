"use client"

import React, { useRef, useState } from "react"
import Image from "next/image"
import Accordion from "@/components/common/Accordion"
import apiClient from "@/utils/apiClient"
import RecaptchaWidget from "@/components/common/RecaptchaWidget"

export function CareerSection({ faqs = [] }) {
    const formRef = useRef()
    const recaptchaRef = useRef(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [showMessage, setShowMessage] = useState(false)
    const [apiMessage, setApiMessage] = useState("")
    const [messageLength, setMessageLength] = useState(0)
    const [selectedFile, setSelectedFile] = useState(null)
    const [recaptchaVerified, setRecaptchaVerified] = useState(false)

    const handleShowMessage = () => {
        setShowMessage(true)
        setTimeout(() => {
            setShowMessage(false)
        }, 7000)
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file.name)
        } else {
            setSelectedFile(null)
        }
    }

    const sendCareerApplication = async (e) => {
        e.preventDefault()
        
        if (!recaptchaVerified) {
            setSuccess(false)
            setApiMessage("Lütfen reCAPTCHA'yı tamamlayın.")
            handleShowMessage()
            return
        }

        setLoading(true)
        const formData = new FormData(e.target)
        const data = {
            full_name: formData.get("full_name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            message: formData.get("message"),
        }

        // Dosya varsa ekle
        const fileInput = formData.get("cv_file")
        if (fileInput && fileInput instanceof File) {
            data.cv_file = fileInput
        }

        try {
            const response = await apiClient.post("/career", data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            if (response.data.status === "success") {
                setSuccess(true)
                setApiMessage("Başvurunuz başarıyla gönderildi.")
                e.target.reset()
                setSelectedFile(null)
                setMessageLength(0)
                setRecaptchaVerified(false)
                recaptchaRef.current?.reset?.()
            } else {
                setSuccess(false)
                setApiMessage(response.data.message || "Bir hata oluştu.")
            }
        } catch (error) {
            setSuccess(false)
            const errorMessage = error.response?.data?.message || "Bir hata oluştu. Lütfen tekrar deneyin."
            setApiMessage(errorMessage)
            console.error("Career Form Error:", error)
        } finally {
            setLoading(false)
            handleShowMessage()
        }
    }

    return (
        <>
            <div className="row">
                {/* Form Alanı */}
                <div className="col-lg-7">
                    <form ref={formRef} onSubmit={sendCareerApplication} className="form-contact">
                        {/* Ad Soyad */}
                        <div className="mb_15">
                            <fieldset className="w-100">
                                <input
                                    type="text"
                                    name="full_name"
                                    id="full_name"
                                    required
                                    placeholder="Ad Soyad *"
                                />
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
                                />
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
                                />
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
                                    onChange={(e) => setMessageLength(e.target.value.length)}
                                />
                                <div className="text-muted mt-1" style={{ fontSize: '12px', color: '#666' }}>
                                    {messageLength} karakter girildi.
                                </div>
                            </fieldset>
                        </div>

                        {/* Dosya Yükleme */}
                        <div className="mb_15">
                            <div className="d-flex align-items-center gap-2">
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
                                    className="btn btn-outline-secondary"
                                    style={{ cursor: 'pointer', margin: 0, padding: '8px 16px' }}
                                >
                                    Dosya Seç
                                </label>
                                <span className="text-muted" style={{ fontSize: '14px' }}>
                                    {selectedFile || "Dosya seçilmedi"}
                                </span>
                            </div>
                        </div>

                        {/* reCAPTCHA */}
                        <div className="mb_15">
                            <RecaptchaWidget
                                ref={recaptchaRef}
                                containerId="recaptcha-container-career"
                                onVerifiedChange={setRecaptchaVerified}
                            />
                        </div>

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
