"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import apiClient from "@/utils/apiClient";
import RecaptchaV3 from "@/components/common/RecaptchaV3";
import { useLangStore } from "@/stores/langStore";
import { getLocalizedUrl } from "@/utils/i18n";

export default function ForgotPassword() {
  const { lang } = useLangStore();
  const executeRecaptchaRef = useRef(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const t = {
    tr: {
      title: "Şifremi Unuttum",
      description: "Şifrenizi sıfırlamak için e-posta adresinizi girin. Size şifre sıfırlama bağlantısı göndereceğiz.",
      emailLabel: "E-posta *",
      sendButton: "Şifre Sıfırlama Bağlantısı Gönder",
      sending: "Gönderiliyor...",
      backToLogin: "Giriş Sayfasına Dön",
      successMsg: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
      failMsg: "Şifre sıfırlama işlemi başarısız oldu.",
      generalError: "Şifre sıfırlama işlemi sırasında bir hata oluştu.",
      recaptchaError: "Güvenlik doğrulaması yapılamadı.",
      recaptchaRequired: "Lütfen güvenlik adımını tamamlayın."
    },
    en: {
      title: "Forgot Password",
      description: "Enter your email address to reset your password. We will send you a password reset link.",
      emailLabel: "Email *",
      sendButton: "Send Password Reset Link",
      sending: "Sending...",
      backToLogin: "Back to Login",
      successMsg: "A password reset link has been sent to your email address.",
      failMsg: "Password reset process failed.",
      generalError: "An error occurred during the password reset process.",
      recaptchaError: "Security verification failed.",
      recaptchaRequired: "Please complete the security step."
    }
  }[lang] || {
    tr: {
      title: "Şifremi Unuttum",
      description: "Şifrenizi sıfırlamak için e-posta adresinizi girin. Size şifre sıfırlama bağlantısı göndereceğiz.",
      emailLabel: "E-posta *",
      sendButton: "Şifre Sıfırlama Bağlantısı Gönder",
      sending: "Gönderiliyor...",
      backToLogin: "Giriş Sayfasına Dön",
      successMsg: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
      failMsg: "Şifre sıfırlama işlemi başarısız oldu.",
      generalError: "Şifre sıfırlama işlemi sırasında bir hata oluştu.",
      recaptchaError: "Güvenlik doğrulaması yapılamadı.",
      recaptchaRequired: "Lütfen güvenlik adımını tamamlayın."
    }
  }.tr;

  const handleChange = (e) => {
    const { value } = e.target;
    setEmail(value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
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
      const response = await apiClient.post("/customer/forgot-password", null, {
        params: {
          email: email,
          "g-recaptcha-response": token,
        },
      });

      if (response.data?.status === "success") {
        setMessage(response.data?.message || t.successMsg);
      } else {
        setError(response.data?.message || t.failMsg);
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const parsedErrors = {};
        Object.keys(errors).forEach((key) => {
          if (Array.isArray(errors[key]) && errors[key].length > 0) {
            parsedErrors[key] = errors[key][0];
          }
        });
        setFieldErrors(parsedErrors);
      } else {
        setError(err.response?.data?.message || t.generalError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flat-spacing-11">
      <div className="container">
        <div className="form-register-wrap">
          <div className="flat-title align-items-start gap-0 px-0">
            <h5 className="mb_18">{t.title}</h5>
            <p className="text_black-2">{t.description}</p>
          </div>
          <div>
            <form onSubmit={handleSubmit} noValidate>
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
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                />
                <label className="tf-field-label fw-6 text_black-2" htmlFor="email">
                  {t.emailLabel}
                </label>
                {fieldErrors.email && (
                  <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                    {fieldErrors.email}
                  </div>
                )}
              </div>

              <RecaptchaV3
                onVerify={(executeFn) => { executeRecaptchaRef.current = executeFn; }}
                action="forgot_password"
              />

              <div className="mb_20">
                <button
                  type="submit"
                  className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                  disabled={isLoading}
                >
                  {isLoading ? t.sending : t.sendButton}
                </button>
              </div>
              <div className="text-center">
                <Link href={getLocalizedUrl("/giris-yap", lang)} className="tf-btn btn-line">
                  {t.backToLogin}
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
