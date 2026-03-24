"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/utils/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { useLangStore } from "@/stores/langStore";
import { getLocalizedUrl } from "@/utils/i18n";
import { siteConfig } from "@/config/site";
import RecaptchaV3 from "@/components/common/RecaptchaV3";

export default function Login() {
  const router = useRouter();
  const { lang } = useLangStore();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || getLocalizedUrl("/", lang);
  const { setAuthenticated } = useAuthStore();
  const executeRecaptchaRef = useRef(null);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});


  const handleChange = (e) => {
    const { name, value } = e.target;
    let filtered = value;
    if (name === "email") {
      filtered = value
        .replace(/Ç/g, "c")
        .replace(/ç/g, "c")
        .replace(/Ğ/g, "g")
        .replace(/ğ/g, "g")
        .replace(/I/g, "i")
        .replace(/ı/g, "i")
        .replace(/İ/g, "i")
        .replace(/Ö/g, "o")
        .replace(/ö/g, "o")
        .replace(/Ş/g, "s")
        .replace(/ş/g, "s")
        .replace(/Ü/g, "u")
        .replace(/ü/g, "u")
        .toLowerCase()
        .replace(/[^a-z0-9@._+-]/g, "");
    }
    setLoginData((prev) => ({
      ...prev,
      [name]: filtered,
    }));
    // Mesajları temizle
    setMessage("");
    setError("");
    // İlgili alanın hatasını temizle
    setFieldErrors((prev) => ({
      ...prev,
      [name]: null
    }));
  };

  const handleLogin = async (e) => {
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
      // Body ile POST isteği gönder
      const response = await apiClient.post("/customer/login", {
        email: loginData.email,
        password: loginData.password,
        "g-recaptcha-response": token,
      });

      if (response.data?.status === "success") {
        // Başarı mesajını göster
        setMessage(response.data?.message || "Giriş başarılı. Yönlendiriliyorsunuz...");

        // Tema loader'ını aktif et (tam sayfa loading için)
        const preloader = document.getElementById("preloader");
        if (preloader) {
          preloader.classList.remove("disabled");
        }

        // Auth state'ini güncelle
        setAuthenticated(true);

        // reCAPTCHA'yı resetle (V3'te gerek yok)
        // if (RECAPTCHA_SITE_KEY && window.grecaptcha && recaptchaWidgetId.current !== null) {
        //   window.grecaptcha.reset(recaptchaWidgetId.current);
        //   setRecaptchaVerified(false);
        // }

        // returnUrl varsa oraya, yoksa ana sayfaya yönlendir
        window.location.href = returnUrl;
      } else {
        setError(response.data?.message || "Giriş işlemi başarısız oldu.");
      }
    } catch (err) {
      // Hata mesajını göster
      const responseData = err.response?.data;

      if (responseData?.errors) {
        const errors = responseData.errors;
        const parsedErrors = {};

        // Her field için ilk hatayı al
        Object.keys(errors).forEach((key) => {
          if (Array.isArray(errors[key]) && errors[key].length > 0) {
            parsedErrors[key] = errors[key][0];
          } else if (typeof errors[key] === "string") {
            parsedErrors[key] = errors[key];
          }
        });
        setFieldErrors(parsedErrors);
      }

      const errorMessage =
        responseData?.message ||
        responseData?.error ||
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
                <form onSubmit={handleLogin} name="login-form" method="post" noValidate>
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
                      autoComplete="username"
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
                    {fieldErrors.email && (
                      <div style={{ color: "#d93025", fontSize: "12px", marginTop: "4px", marginLeft: "2px" }}>
                        {fieldErrors.email}
                      </div>
                    )}
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
                    {fieldErrors.password && (
                      <div style={{ color: "#d93025", fontSize: "12px", marginTop: "4px", marginLeft: "2px" }}>
                        {fieldErrors.password}
                      </div>
                    )}
                  </div>
                  <div className="mb_20">
                    <Link href={getLocalizedUrl("/sifremi-unuttum", lang)} className="tf-btn btn-line">
                      Şifrenizi mi unuttunuz?
                    </Link>
                  </div>

                  {/* reCAPTCHA V3 */}
                  <RecaptchaV3
                    onVerify={(executeFn) => {
                      executeRecaptchaRef.current = executeFn;
                    }}
                    action="login"
                  />

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
            {/* <h5 className="mb_36">Hesabınız yok mu?</h5> */}
            <p className="mb_20">
              Şımart Teknoloji'ye kayıt olun ve erken satış erişimine, yeni gelenler, trendler ve promosyonlara erişin.
            </p>
            <Link href={getLocalizedUrl("/kayit-ol", lang)} className="tf-btn btn-line">
              Kayıt Ol
              <i className="icon icon-arrow1-top-left" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
