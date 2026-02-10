"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "@/utils/apiClient";
import { filterNameValue, formatFirstNameValue, formatLastNameValue } from "@/utils/inputFormatters";
import RecaptchaV3 from "@/components/common/RecaptchaV3";

export default function Register() {
  const router = useRouter();
  const executeRecaptchaRef = useRef(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [agreements, setAgreements] = useState({
    termsAccepted: true, // Şartlar ve Koşullar (varsayılan true)
    newsletterSubscription: true, // Kampanya bildirimleri (varsayılan true)
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [recaptchaError, setRecaptchaError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filtered = value;
    if (name === "first_name") {
      filtered = formatFirstNameValue(filterNameValue(value));
    } else if (name === "last_name") {
      filtered = formatLastNameValue(filterNameValue(value));
    }
    setFormData((prev) => ({
      ...prev,
      [name]: filtered,
    }));
    // Field error'ı temizle
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // Mesajları temizle
    setMessage("");
    setError("");
  };

  const handleAgreementChange = (name) => {
    setAgreements((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
    // Field error'ı temizle
    if (name === "termsAccepted" && fieldErrors.terms_accepted) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.terms_accepted;
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
        setRecaptchaError("Güvenlik doğrulaması yapılamadı.");
        setIsLoading(false);
        return;
      }
    }

    if (!token) {
      setRecaptchaError("Lütfen güvenlik adımını tamamlayın.");
      setIsLoading(false);
      return;
    }
    setRecaptchaError("");

    try {
      // Query parametreleri ile POST isteği gönder
      const response = await apiClient.post("/customer/register", null, {
        params: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          terms_accepted: agreements.termsAccepted,
          newsletter_subscription: agreements.newsletterSubscription,
          "g-recaptcha-response": token, // V3 token'ını gönder
        },
      });

      if (response.data?.status === "success") {
        // Başarı mesajını göster
        setMessage(response.data?.message || "Kayıt başarılı. Otomatik giriş yapıldı.");

        // device_id_token'ı cookie'ye kaydet
        if (response.data?.data?.device_id_token) {
          document.cookie = `DEVICE_ID=${response.data.data.device_id_token}; path=/; max-age=31536000; SameSite=Lax`;
        }

        // recaptchaRef.current?.reset?.(); // V3'te reset gerekmez
        // setRecaptchaVerified(false);

        // 2 saniye sonra yönlendir veya sayfayı yenile
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        setError(response.data?.message || "Kayıt işlemi başarısız oldu.");
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
            "Kayıt işlemi sırasında bir hata oluştu.";
          setError(errorMessage);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flat-spacing-10">
      <div className="container">
        <div className="form-register-wrap">
          <div className="flat-title align-items-start gap-0  px-0">
            <h5 className="mb_18">Kayıt Ol</h5>
            <p className="text_black-2">
              Giriş yap veya hesap oluştur, fırsatları kaçırma!
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="" id="register-form" noValidate>
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

              <div className="tf-grid-layout md-col-2 mb_15">
                <div className="tf-field style-1">
                  <input
                    className={`tf-field-input tf-input ${fieldErrors.first_name ? "error" : ""}`}
                    placeholder=" "
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    style={fieldErrors.first_name ? { borderColor: "#dc3545" } : {}}
                  />
                  <label
                    className="tf-field-label fw-6 text_black-2"
                    htmlFor="first_name"
                  >
                    Adınız *
                  </label>
                  {fieldErrors.first_name && (
                    <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                      {fieldErrors.first_name}
                    </div>
                  )}
                </div>
                <div className="tf-field style-1">
                  <input
                    className={`tf-field-input tf-input ${fieldErrors.last_name ? "error" : ""}`}
                    placeholder=" "
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    style={fieldErrors.last_name ? { borderColor: "#dc3545" } : {}}
                  />
                  <label
                    className="tf-field-label fw-6 text_black-2"
                    htmlFor="last_name"
                  >
                    Soyadınız *
                  </label>
                  {fieldErrors.last_name && (
                    <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                      {fieldErrors.last_name}
                    </div>
                  )}
                </div>
              </div>
              <div className="tf-field style-1 mb_15">
                <input
                  className={`tf-field-input tf-input ${fieldErrors.email ? "error" : ""}`}
                  placeholder=" "
                  type="email"
                  autoComplete="email"
                  id="email"
                  name="email"
                  value={formData.email}
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
              <div className="tf-field style-1 mb_30">
                <input
                  className={`tf-field-input tf-input ${fieldErrors.password ? "error" : ""}`}
                  placeholder=" "
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  style={fieldErrors.password ? { borderColor: "#dc3545" } : {}}
                />
                <label
                  className="tf-field-label fw-6 text_black-2"
                  htmlFor="password"
                >
                  Şifre *
                </label>
                {fieldErrors.password && (
                  <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                    {fieldErrors.password}
                  </div>
                )}
              </div>

              {/* Şartlar ve Koşullar */}
              <div className="mb_20" style={{ marginTop: "20px" }}>
                <div
                  className="box-checkbox fieldset-radio"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    marginBottom: fieldErrors.terms_accepted ? "4px" : "15px",
                  }}
                >
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    className="tf-check"
                    checked={agreements.termsAccepted}
                    onChange={() => handleAgreementChange("termsAccepted")}
                    style={{ marginTop: "4px", flexShrink: 0 }}
                  />
                  <label
                    htmlFor="termsAccepted"
                    className="text_black-2 fw-4"
                    style={{ fontSize: "14px", lineHeight: "1.5", cursor: "pointer" }}
                  >
                    <Link
                      href="/kullanım-sartlari"
                      target="_blank"
                      style={{ color: "#007bff", textDecoration: "underline" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Şartlar ve Koşullar
                    </Link>
                    'ı okudum, kabul ediyorum.
                  </label>
                </div>
                {fieldErrors.terms_accepted && (
                  <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "0px", marginBottom: "10px", marginLeft: "28px" }}>
                    {fieldErrors.terms_accepted}
                  </div>
                )}

                <div
                  className="box-checkbox fieldset-radio"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  <input
                    type="checkbox"
                    id="newsletterSubscription"
                    className="tf-check"
                    checked={agreements.newsletterSubscription}
                    onChange={() => handleAgreementChange("newsletterSubscription")}
                    style={{ marginTop: "4px", flexShrink: 0 }}
                  />
                  <label
                    htmlFor="newsletterSubscription"
                    className="text_black-2 fw-4"
                    style={{ fontSize: "14px", lineHeight: "1.5", cursor: "pointer" }}
                  >
                    Kampanya ve fırsatlardan e-posta/SMS ile haberdar olmak istiyorum.
                  </label>
                </div>
              </div>

              {/* reCAPTCHA V3 (Gizli) */}
              <RecaptchaV3
                onVerify={(executeFn) => {
                  executeRecaptchaRef.current = executeFn;
                }}
                action="register"
              />
              {recaptchaError && (
                <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px", marginBottom: "15px" }}>
                  {recaptchaError}
                </div>
              )}

              <div className="mb_20">
                <button
                  type="submit"
                  className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                  disabled={isLoading}
                >
                  {isLoading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
                </button>
              </div>
              <div className="text-center">
                <Link href={`/giris-yap`} className="tf-btn btn-line">
                  Zaten Hesabınız Var Mı? Giriş Yapın
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
