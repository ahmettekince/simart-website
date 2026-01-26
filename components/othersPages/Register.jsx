"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "@/utils/apiClient";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Mesajları temizle
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      // Query parametreleri ile POST isteği gönder
      const response = await apiClient.post("/customer/register", null, {
        params: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
        },
      });

      if (response.data?.status === "success") {
        // Başarı mesajını göster
        setMessage(response.data?.message || "Kayıt başarılı. Otomatik giriş yapıldı.");

        // device_id_token'ı cookie'ye kaydet
        if (response.data?.data?.device_id_token) {
          document.cookie = `DEVICE_ID=${response.data.data.device_id_token}; path=/; max-age=31536000; SameSite=Lax`;
        }

        // 2 saniye sonra yönlendir veya sayfayı yenile
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        setError(response.data?.message || "Kayıt işlemi başarısız oldu.");
      }
    } catch (err) {
      // Hata mesajını göster
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Kayıt işlemi sırasında bir hata oluştu.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flat-spacing-10">
      <div className="container">
        <div className="form-register-wrap">
          <div className="flat-title align-items-start gap-0 mb_30 px-0">
            <h5 className="mb_18">Kayıt Ol</h5>
            <p className="text_black-2">
              Şımart Teknoloji'ye kayıt olun ve erken satış erişimine, yeni gelenler, trendler ve promosyonlara erişin. İptal etmek için e-postalarımızda iptal et butonuna tıklayın.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="" id="register-form">
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
                    className="tf-field-input tf-input"
                    placeholder=" "
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                  <label
                    className="tf-field-label fw-4 text_black-2"
                    htmlFor="first_name"
                  >
                    Adınız *
                  </label>
                </div>
                <div className="tf-field style-1">
                  <input
                    className="tf-field-input tf-input"
                    placeholder=" "
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                  <label
                    className="tf-field-label fw-4 text_black-2"
                    htmlFor="last_name"
                  >
                    Soyadınız *
                  </label>
                </div>
              </div>
              <div className="tf-field style-1 mb_15">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="email"
                  autoComplete="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
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
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <label
                  className="tf-field-label fw-4 text_black-2"
                  htmlFor="password"
                >
                  Şifre *
                </label>
              </div>
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
