"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "@/utils/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { siteConfig } from "@/config/site";

export default function Login() {
  const router = useRouter();
  const { setAuthenticated } = useAuthStore();
  const recaptchaRef = useRef(null);
  const recaptchaWidgetId = useRef(null);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Mesajları temizle
    setMessage("");
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    // reCAPTCHA kontrolü (key varsa)
    if (RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY !== "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" && !recaptchaVerified) {
      setError("Lütfen reCAPTCHA'yı tamamlayın.");
      setIsLoading(false);
      return;
    }

    try {
      // Query parametreleri ile POST isteği gönder
      const response = await apiClient.post("/customer/login", null, {
        params: {
          email: loginData.email,
          password: loginData.password,
        },
      });

      if (response.data?.status === "success") {
        // Başarı mesajını göster
        setMessage(response.data?.message || "Giriş başarılı.");

        // Auth state'ini güncelle
        setAuthenticated(true);

        // device_id_token'ı cookie'ye kaydet (eğer varsa)
        // Not: Proxy route'u zaten Set-Cookie header'ını forward ediyor,
        // ama yine de client-side'da da kaydedelim (fallback)
        if (response.data?.data?.device_id_token) {
          document.cookie = `DEVICE_ID=${response.data.data.device_id_token}; path=/; max-age=31536000; SameSite=Lax`;
        }

        // reCAPTCHA'yı resetle
        if (RECAPTCHA_SITE_KEY && window.grecaptcha && recaptchaWidgetId.current !== null) {
          window.grecaptcha.reset(recaptchaWidgetId.current);
          setRecaptchaVerified(false);
        }

        // 2 saniye sonra hesabım sayfasına yönlendir
        setTimeout(() => {
          window.location.href = "/hesabim";
        }, 2000);
      } else {
        setError(response.data?.message || "Giriş işlemi başarısız oldu.");
      }
    } catch (err) {
      // Hata mesajını göster
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Giriş işlemi sırasında bir hata oluştu.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flat-spacing-10">
      <div className="container">
        <div className="tf-grid-layout lg-col-2 tf-login-wrap">
          <div className="tf-login-form">
            <div id="recover">
              <h5 className="mb_24">Şifrenizi Sıfırlayın</h5>
              <p className="mb_30">
                Şifrenizi sıfırlamak için bir e-posta göndereceğiz
              </p>
              <div>
                <form onSubmit={(e) => e.preventDefault()} className="">
                  <div className="tf-field style-1 mb_15">
                    <input
                      className="tf-field-input tf-input"
                      placeholder=""
                      required
                      type="email"
                      autoComplete="abc@xyz.com"
                      id="property3"
                      name="email"
                    />
                    <label
                      className="tf-field-label fw-4 text_black-2"
                      htmlFor="property3"
                    >
                      Email *
                    </label>
                  </div>
                  <div className="mb_20">
                    <a href="#login" className="tf-btn btn-line">
                      İptal
                    </a>
                  </div>
                  <div className="">
                    <button
                      type="submit"
                      className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                    >
                      Şifrenizi Sıfırla
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div id="login">
              <h5 className="mb_36">Giriş Yap</h5>
              <div>
                <form onSubmit={handleLogin}>
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
                      required
                      className="tf-field-input tf-input"
                      placeholder=""
                      type="email"
                      autoComplete="email"
                      id="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleChange}
                    />
                    <label
                      className="tf-field-label fw-4 text_black-2"
                      htmlFor="email"
                    >
                      E-posta *
                    </label>
                  </div>
                  <div className="tf-field style-1 mb_30">
                    <input
                      required
                      className="tf-field-input tf-input"
                      placeholder=""
                      type="password"
                      id="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                    />
                    <label
                      className="tf-field-label fw-4 text_black-2"
                      htmlFor="password"
                    >
                      Şifre *
                    </label>
                  </div>
                  <div className="mb_20">
                    <a href="#recover" className="tf-btn btn-line">
                      Şifrenizi mi unuttunuz?
                    </a>
                  </div>

                  {/* reCAPTCHA */}
                  {RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY !== "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" && (
                    <div className="mb_20">
                      <div ref={recaptchaRef} id="recaptcha-container-login"></div>
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

                  <div className="">
                    <button
                      type="submit"
                      className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                      disabled={isLoading}
                    >
                      {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="tf-login-content">
            <h5 className="mb_36">Yeni Misiniz?</h5>
            <p className="mb_20">
              Şımart Teknoloji'ye kayıt olun ve erken satış erişimine, yeni gelenler, trendler ve promosyonlara erişin.
            </p>
            <Link href={`/kayit-ol`} className="tf-btn btn-line">
              Kayıt Ol
              <i className="icon icon-arrow1-top-left" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
