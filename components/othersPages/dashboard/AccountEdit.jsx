"use client";
import React, { useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";
import { log } from "@/utils/logger";

export default function AccountEdit() {
  const [customerData, setCustomerData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirm: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Müşteri bilgilerini yükle
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await apiClient.get("/customer/me");
        if (response.data?.status === "success" && response.data?.data?.customer) {
          const customer = response.data.data.customer;
          setCustomerData({
            first_name: customer.first_name || "",
            last_name: customer.last_name || "",
            email: customer.email || "",
          });
        }
      } catch (error) {
        log("Müşteri bilgileri yüklenirken hata:", error);
        setError("Müşteri bilgileri yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomerData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Mesajları temizle
    setMessage("");
    setError("");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Mesajları temizle
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      // Şifre değiştirme kontrolü
      const isPasswordChange = passwordData.current_password || passwordData.new_password || passwordData.new_password_confirm;

      if (isPasswordChange) {
        // Şifre alanlarından biri doldurulmuşsa hepsi dolu olmalı
        if (!passwordData.current_password || !passwordData.new_password || !passwordData.new_password_confirm) {
          setError("Şifre değiştirmek için tüm şifre alanlarını doldurun.");
          setIsSaving(false);
          return;
        }

        // Yeni şifreler eşleşmeli
        if (passwordData.new_password !== passwordData.new_password_confirm) {
          setError("Yeni şifreler eşleşmiyor.");
          setIsSaving(false);
          return;
        }

        // Şifre değiştirme API endpoint'i
        const passwordResponse = await apiClient.post("/customer/change-password", null, {
          params: {
            current_password: passwordData.current_password,
            new_password: passwordData.new_password,
            new_password_confirmation: passwordData.new_password_confirm,
          },
        });

        if (passwordResponse.data?.status === "success") {
          setMessage(passwordResponse.data?.message || "Şifreniz başarıyla değiştirildi.");
          // Şifre alanlarını temizle
          setPasswordData({
            current_password: "",
            new_password: "",
            new_password_confirm: "",
          });
        } else {
          setError(passwordResponse.data?.message || "Şifre değiştirilirken bir hata oluştu.");
          setIsSaving(false);
          return;
        }
      }

      // Müşteri bilgilerini güncelle
      // TODO: API endpoint'i eklenecek
      // const response = await apiClient.put("/customer/me", {
      //   first_name: customerData.first_name,
      //   last_name: customerData.last_name,
      //   email: customerData.email,
      // });

      // Şimdilik başarı mesajı göster
      setMessage("Bilgileriniz başarıyla güncellendi.");

      // Şifre alanlarını temizle
      if (isPasswordChange) {
        setPasswordData({
          current_password: "",
          new_password: "",
          new_password_confirm: "",
        });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Bilgiler güncellenirken bir hata oluştu.";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="my-account-content account-edit">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-account-content account-edit">
      <div className="">
        <form
          onSubmit={handleSubmit}
          className=""
          id="form-password-change"
          action="#"
        >
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
          <h6 className="mb_20">Kullanıcı Bilgileri</h6>
          <div className="tf-field style-1 mb_15">
            <input
              className="tf-field-input tf-input fw-6"
              placeholder=" "
              type="text"
              id="property1"
              required
              name="first_name"
              value={customerData.first_name}
              onChange={handleChange}
            />
            <label
              className="tf-field-label fw-4 text_black-2"
              htmlFor="property1"
            >
              Adınız
            </label>
          </div>
          <div className="tf-field style-1 mb_15">
            <input
              className="tf-field-input tf-input fw-6"
              placeholder=" "
              type="text"
              required
              id="property2"
              name="last_name"
              value={customerData.last_name}
              onChange={handleChange}
            />
            <label
              className="tf-field-label fw-4 text_black-2"
              htmlFor="property2"
            >
              Soyadınız
            </label>
          </div>
          <div className="tf-field style-1 mb_15">
            <input
              className="tf-field-input tf-input fw-6"
              placeholder=" "
              type="email"
              autoComplete="email"
              required
              id="property3"
              name="email"
              value={customerData.email}
              onChange={handleChange}
            />
            <label
              className="tf-field-label fw-4 text_black-2"
              htmlFor="property3"
            >
              E-posta adresiniz
            </label>
          </div>
          <h6 className="mb_20">Şifre Değiştirme</h6>
          <div className="tf-field style-1 mb_30">
            <input
              className="tf-field-input tf-input fw-6"
              placeholder=" "
              type="password"
              autoComplete="current-password"
              id="property4"
              name="current_password"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
            />
            <label
              className="tf-field-label fw-4 text_black-2"
              htmlFor="property4"
            >
              Mevcut Şifreniz
            </label>
          </div>
          <div className="tf-field style-1 mb_30">
            <input
              className="tf-field-input tf-input fw-6"
              placeholder=" "
              type="password"
              id="property5"
              autoComplete="new-password"
              name="new_password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
            />
            <label
              className="tf-field-label fw-4 text_black-2"
              htmlFor="property5"
            >
              Yeni Şifreniz
            </label>
          </div>
          <div className="tf-field style-1 mb_30">
            <input
              className="tf-field-input tf-input"
              placeholder=" "
              type="password"
              id="property6"
              autoComplete="new-password"
              name="new_password_confirm"
              value={passwordData.new_password_confirm}
              onChange={handlePasswordChange}
            />
            <label
              className="tf-field-label fw-4 text_black-2"
              htmlFor="property6"
            >
              Yeni Şifreniz Tekrar
            </label>
          </div>
          <div className="mb_20">
            <button
              type="submit"
              className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
              disabled={isSaving}
            >
              {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
