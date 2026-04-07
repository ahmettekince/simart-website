"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/utils/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { useLangStore } from "@/stores/langStore";
import { getLocalizedUrl } from "@/utils/i18n";
import RecaptchaV3 from "@/components/common/RecaptchaV3";

export default function Login() {
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

  const t = {
    tr: {
      title: "Giriş Yap",
      recoverTitle: "Şifrenizi Sıfırlayın",
      recoverDesc: "Şifrenizi sıfırlamak için bir e-posta göndereceğiz",
      cancel: "İptal",
      resetButton: "Şifrenizi Sıfırla",
      emailLabel: "E-posta *",
      passwordLabel: "Şifre *",
      forgotPassword: "Şifrenizi mi unuttunuz?",
      loginButton: "Giriş Yap",
      loggingIn: "Giriş yapılıyor...",
      noAccount: "Hesabınız yok mu?",
      registerDesc: "Şımart Teknoloji'ye kayıt olun ve erken satış erişimine, yeni gelenler, trendler ve promosyonlara erişin.",
      registerButton: "Kayıt Ol",
      successMsg: "Giriş başarılı. Yönlendiriliyorsunuz...",
      errorMsg: "Giriş işlemi başarısız oldu.",
      generalError: "Giriş işlemi sırasında bir hata oluştu.",
      recaptchaError: "Güvenlik doğrulaması yapılamadı.",
      recaptchaRequired: "Lütfen güvenlik adımını tamamlayın."
    },
    en: {
      title: "Login",
      recoverTitle: "Reset Your Password",
      recoverDesc: "We will send you an email to reset your password",
      cancel: "Cancel",
      resetButton: "Reset Password",
      emailLabel: "Email *",
      passwordLabel: "Password *",
      forgotPassword: "Forgot your password?",
      loginButton: "Login",
      loggingIn: "Logging in...",
      noAccount: "Don't have an account?",
      registerDesc: "Register with Şımart Teknoloji and get early access to sales, new arrivals, trends and promotions.",
      registerButton: "Register",
      successMsg: "Login successful. Redirecting...",
      errorMsg: "Login failed.",
      generalError: "An error occurred during login.",
      recaptchaError: "Security verification failed.",
      recaptchaRequired: "Please complete the security step."
    }
  }[lang] || {
    tr: {
      title: "Giriş Yap",
      recoverTitle: "Şifrenizi Sıfırlayın",
      recoverDesc: "Şifrenizi sıfırlamak için bir e-posta göndereceğiz",
      cancel: "İptal",
      resetButton: "Şifrenizi Sıfırla",
      emailLabel: "E-posta *",
      passwordLabel: "Şifre *",
      forgotPassword: "Şifrenizi mi unuttunuz?",
      loginButton: "Giriş Yap",
      loggingIn: "Giriş yapılıyor...",
      noAccount: "Hesabınız yok mu?",
      registerDesc: "Şımart Teknoloji'ye kayıt olun ve erken satış erişimine, yeni gelenler, trendler ve promosyonlara erişin.",
      registerButton: "Kayıt Ol",
      successMsg: "Giriş başarılı. Yönlendiriliyorsunuz...",
      errorMsg: "Giriş işlemi başarısız oldu.",
      generalError: "Giriş işlemi sırasında bir hata oluştu.",
      recaptchaError: "Güvenlik doğrulaması yapılamadı.",
      recaptchaRequired: "Lütfen güvenlik adımını tamamlayın."
    }
  }.tr;

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
    setMessage("");
    setError("");
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

    let token = null;
    if (executeRecaptchaRef.current) {
      try {
        token = await executeRecaptchaRef.current();
      } catch (e) {
        console.error("reCAPTCHA hatası:", e);
        setError(t.recaptchaError);
        setIsLoading(false);
        return;
      }
    }

    if (!token) {
      setError(t.recaptchaRequired);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.post("/customer/login", {
        email: loginData.email,
        password: loginData.password,
        "g-recaptcha-response": token,
      });

      if (response.data?.status === "success") {
        setMessage(response.data?.message || t.successMsg);
        const preloader = document.getElementById("preloader");
        if (preloader) {
          preloader.classList.remove("disabled");
        }
        setAuthenticated(true);
        window.location.href = returnUrl;
      } else {
        setError(response.data?.message || t.errorMsg);
      }
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.errors) {
        const errors = responseData.errors;
        const parsedErrors = {};
        Object.keys(errors).forEach((key) => {
          if (Array.isArray(errors[key]) && errors[key].length > 0) {
            parsedErrors[key] = errors[key][0];
          } else if (typeof errors[key] === "string") {
            parsedErrors[key] = errors[key];
          }
        });
        setFieldErrors(parsedErrors);
      }
      const errorMessage = responseData?.message || responseData?.error || err.message || t.generalError;
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
              <h5 className="mb_24">{t.recoverTitle}</h5>
              <p className="mb_30">{t.recoverDesc}</p>
              <div>
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="tf-field style-1 mb_15">
                    <input
                      className="tf-field-input tf-input"
                      placeholder=""
                      required
                      type="email"
                      id="property3"
                      name="email"
                    />
                    <label className="tf-field-label fw-4 text_black-2" htmlFor="property3">
                      {t.emailLabel}
                    </label>
                  </div>
                  <div className="mb_20">
                    <a href="#login" className="tf-btn btn-line">{t.cancel}</a>
                  </div>
                  <div className="">
                    <button type="submit" className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center">
                      {t.resetButton}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div id="login">
              <h5 className="mb_36">{t.title}</h5>
              <div>
                <form onSubmit={handleLogin} noValidate>
                  {message && (
                    <div className="mb_20" style={{ padding: "12px 16px", backgroundColor: "#d4edda", border: "1px solid #c3e6cb", borderRadius: "4px", color: "#155724" }}>
                      {message}
                    </div>
                  )}
                  {error && (
                    <div className="mb_20" style={{ padding: "12px 16px", backgroundColor: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: "4px", color: "#721c24" }}>
                      {error}
                    </div>
                  )}
                  <div className="tf-field style-1 mb_15">
                    <input
                      required
                      className="tf-field-input tf-input"
                      placeholder=""
                      type="email"
                      id="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleChange}
                    />
                    <label className="tf-field-label fw-4 text_black-2" htmlFor="email">{t.emailLabel}</label>
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
                    <label className="tf-field-label fw-4 text_black-2" htmlFor="password">{t.passwordLabel}</label>
                    {fieldErrors.password && (
                      <div style={{ color: "#d93025", fontSize: "12px", marginTop: "4px", marginLeft: "2px" }}>
                        {fieldErrors.password}
                      </div>
                    )}
                  </div>
                  <div className="mb_20">
                    <Link href={getLocalizedUrl("/sifremi-unuttum", lang)} className="tf-btn btn-line">
                      {t.forgotPassword}
                    </Link>
                  </div>
                  <RecaptchaV3
                    onVerify={(executeFn) => { executeRecaptchaRef.current = executeFn; }}
                    action="login"
                  />
                  <div>
                    <button type="submit" className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center" disabled={isLoading}>
                      {isLoading ? t.loggingIn : t.loginButton}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="tf-login-content">
            <p className="mb_20">{t.registerDesc}</p>
            <Link href={getLocalizedUrl("/kayit-ol", lang)} className="tf-btn btn-line">
              {t.registerButton}
              <i className="icon icon-arrow1-top-left" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
