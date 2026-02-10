"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "@/utils/apiClient";
import { siteConfig } from "@/config/site";
import RecaptchaV3 from "@/components/common/RecaptchaV3";

export default function ForgotPassword() {
  const router = useRouter();
  const executeRecaptchaRef = useRef(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});


  const handleChange = (e) => {
    const { value } = e.target;
    setEmail(value);
    // Field error'ı temizle
    if (fieldErrors.email) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
    // Mesajları temizle
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");
    setFieldErrors({});

    // V3: Token al
    let token = null;
    if (executeRecaptchaRef.current) {
      try {
        token = await executeRecaptchaRef.current();
      } catch (e) {
        console.error("reCAPTCHA hatası:", e);
        setError("Güvenlik doğrulaması yapılamadı.");
        setIsLoading(false);
        return;
      }
    }

    if (!token) {
      setError("Lütfen güvenlik adımını tamamlayın.");
      setIsLoading(false);
      return;
    }

    try {
      // Şifre sıfırlama isteği gönder
      const response = await apiClient.post("/customer/forgot-password", null, {
        params: {
          email: email,
          "g-recaptcha-response": token,
        },
      });

      if (response.data?.status === "success") {
        // Başarı mesajını göster
        setMessage(response.data?.message || "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
      } else {
        setError(response.data?.message || "Şifre sıfırlama işlemi başarısız oldu.");
      }
    } catch (err) {
      // API'den gelen hataları parse et
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const parsedErrors = {};

        // Her field için ilk hatayı al
        Object.keys(errors).forEach((key) => {
          if (Array.isArray(errors[key]) && errors[key].length > 0) {
            parsedErrors[key] = errors[key][0];
          }
        });

        setFieldErrors(parsedErrors);

        // Eğer errors dizisi boşsa (yani field-specific hata yoksa) genel mesajı göster
        const hasFieldErrors = Object.keys(parsedErrors).length > 0;
        if (!hasFieldErrors && err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError(""); // Field hataları varsa genel mesajı gösterme
        }
      } else {
        // Genel hata mesajı (errors dizisi yoksa veya boşsa)
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          const errorMessage =
            err.response?.data?.error ||
            err.message ||
            "Şifre sıfırlama işlemi sırasında bir hata oluştu.";
          setError(errorMessage);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flat-spacing-11">
      <div className="container">
        <div className="form-register-wrap">
          <div className="flat-title align-items-start gap-0  px-0">
            <h5 className="mb_18">Şifremi Unuttum</h5>
            <p className="text_black-2">
              Şifrenizi sıfırlamak için e-posta adresinizi girin. Size şifre sıfırlama bağlantısı göndereceğiz.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="" id="forgot-password-form">
              {/* Başarı Mesajı */}
              {message && (
                <div
                  className="mb_20"
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#d4edda",
                    border: "1px solid #c3e6cb",
                    borderRadius: "4px",
                    color: "#155724",
                  }}
                >
                  {message}
                </div>
              )}

              {/* Hata Mesajı */}
              {error && (
                <div
                  className="mb_20"
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#f8d7da",
                    border: "1px solid #f5c6cb",
                    borderRadius: "4px",
                    color: "#721c24",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="tf-field style-1 mb_15">
                <input
                  className={`tf-field-input tf-input ${fieldErrors.email ? "error" : ""}`}
                  placeholder=" "
                  type="email"
                  autoComplete="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  style={fieldErrors.email ? { borderColor: "#dc3545" } : {}}
                />
                <label
                  className="tf-field-label fw-6 text_black-2"
                  htmlFor="email"
                >
                  E-posta *
                </label>
                {fieldErrors.email && (
                  <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                    {fieldErrors.email}
                  </div>
                )}
              </div>

              {/* reCAPTCHA V3 */}
              <RecaptchaV3
                onVerify={(executeFn) => {
                  executeRecaptchaRef.current = executeFn;
                }}
                action="forgot_password"
              />

              <div className="mb_20">
                <button
                  type="submit"
                  className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                  disabled={isLoading}
                >
                  {isLoading ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
                </button>
              </div>
              <div className="text-center">
                <Link href={`/giris-yap`} className="tf-btn btn-line">
                  Giriş Sayfasına Dön
                  <i className="icon icon-arrow1-top-left" />
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
