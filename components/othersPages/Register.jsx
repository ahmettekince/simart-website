"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "@/utils/apiClient";
import { filterNameValue, formatFirstNameValue, formatLastNameValue } from "@/utils/inputFormatters";
import RecaptchaV3 from "@/components/common/RecaptchaV3";
import { useLangStore } from "@/stores/langStore";
import { getLocalizedUrl } from "@/utils/i18n";

export default function Register() {
  const { lang } = useLangStore();
  const router = useRouter();
  const executeRecaptchaRef = useRef(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [agreements, setAgreements] = useState({
    termsAccepted: true,
    newsletterSubscription: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [recaptchaError, setRecaptchaError] = useState("");

  const t = {
    tr: {
      title: "Kayıt Ol",
      subtitle: "Giriş yap veya hesap oluştur, fırsatları kaçırma!",
      firstName: "Adınız *",
      lastName: "Soyadınız *",
      email: "E-posta *",
      password: "Şifre *",
      terms: "Şartlar ve Koşullar",
      termsSuffix: "'ı okudum, kabul ediyorum.",
      newsletter: "Kampanya ve fırsatlardan e-posta/SMS ile haberdar olmak istiyorum.",
      registerButton: "Kayıt Ol",
      registering: "Kayıt yapılıyor...",
      alreadyHaveAccount: "Zaten Hesabınız Var Mı? Giriş Yapın",
      successMsg: "Kayıt başarılı. Otomatik giriş yapıldı.",
      errorMsg: "Kayıt işlemi başarısız oldu.",
      generalError: "Kayıt işlemi sırasında bir hata oluştu.",
      recaptchaError: "Güvenlik doğrulaması yapılamadı.",
      recaptchaRequired: "Lütfen güvenlik adımını tamamlayın.",
      termsLink: "/sartlar-kosullar"
    },
    en: {
      title: "Register",
      subtitle: "Login or create an account, don't miss the opportunities!",
      firstName: "First Name *",
      lastName: "Last Name *",
      email: "Email *",
      password: "Password *",
      terms: "Terms and Conditions",
      termsSuffix: "I have read and agree to the ",
      newsletter: "I want to be informed about campaigns and opportunities via email/SMS.",
      registerButton: "Register",
      registering: "Registering...",
      alreadyHaveAccount: "Already Have an Account? Login",
      successMsg: "Registration successful. Automatic login performed.",
      errorMsg: "Registration failed.",
      generalError: "An error occurred during registration.",
      recaptchaError: "Security verification failed.",
      recaptchaRequired: "Please complete the security step.",
      termsLink: "/enterms-and-conditions"
    }
  }[lang] || {
    tr: {
      title: "Kayıt Ol",
      subtitle: "Giriş yap veya hesap oluştur, fırsatları kaçırma!",
      firstName: "Adınız *",
      lastName: "Soyadınız *",
      email: "E-posta *",
      password: "Şifre *",
      terms: "Şartlar ve Koşullar",
      termsSuffix: "'ı okudum, kabul ediyorum.",
      newsletter: "Kampanya ve fırsatlardan e-posta/SMS ile haberdar olmak istiyorum.",
      registerButton: "Kayıt Ol",
      registering: "Kayıt yapılıyor...",
      alreadyHaveAccount: "Zaten Hesabınız Var Mı? Giriş Yapın",
      successMsg: "Kayıt başarılı. Otomatik giriş yapıldı.",
      errorMsg: "Kayıt işlemi başarısız oldu.",
      generalError: "Kayıt işlemi sırasında bir hata oluştu.",
      recaptchaError: "Güvenlik doğrulaması yapılamadı.",
      recaptchaRequired: "Lütfen güvenlik adımını tamamlayın.",
      termsLink: "/sartlar-kosullar"
    }
  }.tr;

  // Hata mesajı çeviri haritası
  const errorMap = {
    tr: {},
    en: {
        "Ad gereklidir.": "First name is required.",
        "Soyad gereklidir.": "Last name is required.",
        "E-posta gereklidir.": "Email is required.",
        "Şifre gereklidir.": "Password is required.",
        "Geçersiz e-posta adresi.": "Invalid email address.",
        "Şifre en az 6 karakter olmalıdır.": "Password must be at least 6 characters.",
        "Bu e-posta adresi zaten kullanımda.": "This email address is already in use.",
        "Lütfen şartları kabul edin.": "Please accept the terms."
    }
  };

  const translateError = (msg) => {
    if (lang === "tr") return msg;
    return errorMap.en[msg] || msg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filtered = value;
    if (name === "first_name") filtered = formatFirstNameValue(filterNameValue(value));
    else if (name === "last_name") filtered = formatLastNameValue(filterNameValue(value));
    else if (name === "email") {
      filtered = value.replace(/Ç/g, "c").replace(/ç/g, "c").replace(/Ğ/g, "g").replace(/ğ/g, "g").replace(/I/g, "i").replace(/ı/g, "i").replace(/İ/g, "i").replace(/Ö/g, "o").replace(/ö/g, "o").replace(/Ş/g, "s").replace(/ş/g, "s").replace(/Ü/g, "u").replace(/ü/g, "u").toLowerCase().replace(/[^a-z0-9@._+-]/g, "");
    }
    setFormData(prev => ({ ...prev, [name]: filtered }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setMessage("");
    setError("");
  };

  const handleAgreementChange = (name) => {
    setAgreements(prev => ({ ...prev, [name]: !prev[name] }));
    if (name === "termsAccepted" && fieldErrors.terms_accepted) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.terms_accepted;
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
        setRecaptchaError(t.recaptchaError);
        setIsLoading(false);
        return;
      }
    }

    if (!token) {
      setRecaptchaError(t.recaptchaRequired);
      setIsLoading(false);
      return;
    }
    setRecaptchaError("");

    try {
      const response = await apiClient.post("/customer/register", null, {
        params: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          terms_accepted: agreements.termsAccepted,
          newsletter_subscription: agreements.newsletterSubscription,
          "g-recaptcha-response": token,
        },
      });

      if (response.data?.status === "success") {
        setMessage(translateError(response.data?.message) || t.successMsg);
        if (response.data?.data?.device_id_token) {
          document.cookie = `DEVICE_ID=${response.data.data.device_id_token}; path=/; max-age=31536000; SameSite=Lax`;
        }
        setTimeout(() => {
          window.location.href = getLocalizedUrl("/", lang);
        }, 2000);
      } else {
        setError(translateError(response.data?.message) || t.errorMsg);
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const parsedErrors = {};
        Object.keys(errors).forEach(key => {
          if (Array.isArray(errors[key]) && errors[key].length > 0) parsedErrors[key] = translateError(errors[key][0]);
        });
        setFieldErrors(parsedErrors);
      } else {
        setError(translateError(err.response?.data?.message) || t.generalError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flat-spacing-10">
      <div className="container">
        <div className="form-register-wrap">
          <div className="flat-title align-items-start gap-0 px-0">
            <h5 className="mb_18">{t.title}</h5>
            <p className="text_black-2">{t.subtitle}</p>
          </div>
          <div>
            <form onSubmit={handleSubmit} noValidate>
              {message && <div className="mb_20" style={{ padding: "12px 16px", backgroundColor: "#d4edda", border: "1px solid #c3e6cb", borderRadius: "4px", color: "#155724" }}>{message}</div>}
              {error && <div className="mb_20" style={{ padding: "12px 16px", backgroundColor: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: "4px", color: "#721c24" }}>{error}</div>}
              
              <div className="tf-grid-layout md-col-2 mb_15">
                <div className="tf-field style-1">
                  <input className="tf-field-input tf-input" placeholder=" " type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} />
                  <label className="tf-field-label fw-6 text_black-2" htmlFor="first_name">{t.firstName}</label>
                  {fieldErrors.first_name && <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.first_name}</div>}
                </div>
                <div className="tf-field style-1">
                  <input className="tf-field-input tf-input" placeholder=" " type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} />
                  <label className="tf-field-label fw-6 text_black-2" htmlFor="last_name">{t.lastName}</label>
                  {fieldErrors.last_name && <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.last_name}</div>}
                </div>
              </div>

              <div className="tf-field style-1 mb_15">
                <input className="tf-field-input tf-input" placeholder=" " type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
                <label className="tf-field-label fw-6 text_black-2" htmlFor="email">{t.email}</label>
                {fieldErrors.email && <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.email}</div>}
              </div>

              <div className="tf-field style-1 mb_30">
                <input className="tf-field-input tf-input" placeholder=" " type="password" id="password" name="password" value={formData.password} onChange={handleChange} autoComplete="new-password" />
                <label className="tf-field-label fw-6 text_black-2" htmlFor="password">{t.password}</label>
                {fieldErrors.password && <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.password}</div>}
              </div>

              <div className="mb_20">
                <div className="box-checkbox fieldset-radio" style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "10px" }}>
                  <input type="checkbox" id="termsAccepted" className="tf-check" checked={agreements.termsAccepted} onChange={() => handleAgreementChange("termsAccepted")} />
                  <label htmlFor="termsAccepted" className="text_black-2 fw-4" style={{ fontSize: "14px", lineHeight: "1.5", cursor: "pointer" }}>
                    {lang === 'en' ? t.termsSuffix : ''}
                    <Link href={getLocalizedUrl(t.termsLink, lang)} target="_blank" style={{ color: "#007bff", textDecoration: "underline" }} onClick={(e) => e.stopPropagation()}>{t.terms}</Link>
                    {lang === 'tr' ? t.termsSuffix : ' I agree.'}
                  </label>
                </div>
                <div className="box-checkbox fieldset-radio" style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <input type="checkbox" id="newsletterSubscription" className="tf-check" checked={agreements.newsletterSubscription} onChange={() => handleAgreementChange("newsletterSubscription")} />
                  <label htmlFor="newsletterSubscription" className="text_black-2 fw-4" style={{ fontSize: "14px", lineHeight: "1.5", cursor: "pointer" }}>{t.newsletter}</label>
                </div>
              </div>

              <RecaptchaV3 onVerify={(executeFn) => { executeRecaptchaRef.current = executeFn; }} action="register" />
              {recaptchaError && <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px", marginBottom: "15px" }}>{recaptchaError}</div>}

              <div className="mb_20">
                <button type="submit" className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center" disabled={isLoading}>
                  {isLoading ? t.registering : t.registerButton}
                </button>
              </div>
              <div className="text-center">
                <Link href={getLocalizedUrl("/giris-yap", lang)} className="tf-btn btn-line">
                  {t.alreadyHaveAccount}
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
