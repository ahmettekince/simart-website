"use client";
import React, { useState } from "react";
import apiClient from "@/utils/apiClient";

export default function AccountEdit() {
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirm: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getApiErrorMessage = (data) => {
    if (!data) return null;
    const errors = data.errors;
    const msg = data.message;
    const hasErrors = errors && typeof errors === "object" && Object.keys(errors).length > 0;
    const errorValues = hasErrors ? Object.values(errors).flat().filter(Boolean) : [];
    if (errorValues.length > 0) return errorValues.join(" ");
    if (msg) return msg;
    return null;
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
          setError(getApiErrorMessage(passwordResponse.data) || "Şifre değiştirilirken bir hata oluştu.");
          setIsSaving(false);
          return;
        }
      }
      if (isPasswordChange) {
        setPasswordData({
          current_password: "",
          new_password: "",
          new_password_confirm: "",
        });
      }
    } catch (err) {
      const errorMessage =
        getApiErrorMessage(err.response?.data) ||
        err.response?.data?.error ||
        err.message ||
        "Bilgiler güncellenirken bir hata oluştu.";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

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
          <h6 className="mb_20">Şifre Değiştirme</h6>
          <div className="account-edit-password-row">
            <input
              className="tf-field-input tf-input fw-6 account-edit-password-input"
              placeholder="Mevcut Şifreniz"
              type="password"
              autoComplete="current-password"
              name="current_password"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
            />
            <input
              className="tf-field-input tf-input fw-6 account-edit-password-input"
              placeholder="Yeni Şifreniz"
              type="password"
              autoComplete="new-password"
              name="new_password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
            />
            <input
              className="tf-field-input tf-input fw-6 account-edit-password-input"
              placeholder="Yeni Şifreniz Tekrar"
              type="password"
              autoComplete="new-password"
              name="new_password_confirm"
              value={passwordData.new_password_confirm}
              onChange={handlePasswordChange}
            />
            <button
              type="submit"
              className="tf-btn radius-3 btn-fill animate-hover-btn account-edit-password-btn"
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
