"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "@/utils/apiClient";
import { siteConfig } from "@/config/site";

export default function ForgotPassword() {
  const router = useRouter();
  const recaptchaRef = useRef(null);
  const recaptchaWidgetId = useRef(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  // Google reCAPTCHA site key
  const RECAPTCHA_SITE_KEY = siteConfig.site.recaptchaSiteKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

  useEffect(() => {
    // Key yoksa test modunda çalış (otomatik doğrulanmış sayılır)
    if (!RECAPTCHA_SITE_KEY || RECAPTCHA_SITE_KEY === "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI") {
      setRecaptchaVerified(true);
      setRecaptchaLoaded(true);
      return;
    }

    // reCAPTCHA script'inin yüklenmesini bekle
    const checkRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.render) {
        setRecaptchaLoaded(true);
        // Widget'ı render et
        if (recaptchaRef.current && !recaptchaRef.current.hasChildNodes()) {
          const widgetId = window.grecaptcha.render(recaptchaRef.current, {
            sitekey: RECAPTCHA_SITE_KEY,
            callback: (token) => {
              setRecaptchaVerified(true);
            },
            'expired-callback': () => {
              setRecaptchaVerified(false);
            },
            'error-callback': () => {
              setRecaptchaVerified(false);
            }
          });
          recaptchaWidgetId.current = widgetId;
        }
      } else {
        setTimeout(checkRecaptcha, 100);
      }
    };

    // Script yüklenmişse direkt kontrol et, değilse bekle
    if (document.readyState === 'complete') {
      checkRecaptcha();
    } else {
      window.addEventListener('load', checkRecaptcha);
      return () => window.removeEventListener('load', checkRecaptcha);
    }
  }, [RECAPTCHA_SITE_KEY]);

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

    // reCAPTCHA kontrolü (key varsa)
    if (RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY !== "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" && !recaptchaVerified) {
      setError("Lütfen reCAPTCHA'yı tamamlayın.");
      setIsLoading(false);
      return;
    }

    try {
      // Şifre sıfırlama isteği gönder
      const response = await apiClient.post("/customer/forgot-password", null, {
        params: {
          email: email,
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

              {/* reCAPTCHA */}
              {RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY !== "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" && (
                <div className="mb_20">
                  <div ref={recaptchaRef} id="recaptcha-container-forgot-password"></div>
                  {!recaptchaLoaded && (
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                      reCAPTCHA yükleniyor...
                    </div>
                  )}
                  <div className="mt-2" style={{ fontSize: '12px', color: '#666' }}>
                    <span>reCAPTCHA</span>
                    <span className="mx-1">•</span>
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#666' }}>
                      Gizlilik
                    </a>
                    <span className="mx-1">•</span>
                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#666' }}>
                      Şartlar
                    </a>
                  </div>
                </div>
              )}

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
