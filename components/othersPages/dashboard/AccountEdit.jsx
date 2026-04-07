"use client";
import React, { useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";
import SimartButton from "@/components/common/SimartButton";
import { useLangStore } from "@/stores/langStore";

export default function AccountEdit() {
  const lang = useLangStore((s) => s.lang);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirm: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSaved) return;
    const t = setTimeout(() => setIsSaved(false), 2000);
    return () => clearTimeout(t);
  }, [isSaved]);

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

  const translations = {
    tr: {
      title: "Şifre Değiştirme",
      currentPassword: "Mevcut Şifreniz",
      newPassword: "Yeni Şifreniz",
      confirmNewPassword: "Yeni Şifreniz Tekrar",
      saving: "Kaydediliyor",
      saved: "Kaydedildi",
      saveChanges: "Değişiklikleri Kaydet",
      errorFillAll: "Şifre değiştirmek için tüm şifre alanlarını doldurun.",
      errorMatch: "Yeni şifreler eşleşmiyor.",
      errorGeneral: "Bilgiler güncellenirken bir hata oluştu.",
      errorPasswordChange: "Şifre değiştirilirken bir hata oluştu."
    },
    en: {
      title: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmNewPassword: "Confirm New Password",
      saving: "Saving...",
      saved: "Saved",
      saveChanges: "Save Changes",
      errorFillAll: "Fill all password fields to change password.",
      errorMatch: "New passwords do not match.",
      errorGeneral: "Error updating information.",
      errorPasswordChange: "Error changing password."
    }
  };

  const t = translations[lang] || translations.tr;

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setIsSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const isPasswordChange = passwordData.current_password || passwordData.new_password || passwordData.new_password_confirm;

      if (isPasswordChange) {
        if (!passwordData.current_password || !passwordData.new_password || !passwordData.new_password_confirm) {
          setError(t.errorFillAll);
          setIsSaving(false);
          return;
        }

        if (passwordData.new_password !== passwordData.new_password_confirm) {
          setError(t.errorMatch);
          setIsSaving(false);
          return;
        }

        const passwordResponse = await apiClient.post("/customer/change-password", null, {
          params: {
            current_password: passwordData.current_password,
            new_password: passwordData.new_password,
            new_password_confirmation: passwordData.new_password_confirm,
          },
        });

        if (passwordResponse.data?.status === "success") {
          setIsSaved(true);
          setPasswordData({
            current_password: "",
            new_password: "",
            new_password_confirm: "",
          });
        } else {
          setError(getApiErrorMessage(passwordResponse.data) || t.errorPasswordChange);
          setIsSaving(false);
          return;
        }
      }
    } catch (err) {
      const errorMessage =
        getApiErrorMessage(err.response?.data) ||
        err.response?.data?.error ||
        err.message ||
        t.errorGeneral;
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
          <h6 className="mb_20">{t.title}</h6>
          <div className="account-edit-password-row">
            <input
              className="tf-field-input tf-input fw-6 account-edit-password-input"
              placeholder={t.currentPassword}
              type="password"
              autoComplete="current-password"
              name="current_password"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
            />
            <input
              className="tf-field-input tf-input fw-6 account-edit-password-input"
              placeholder={t.newPassword}
              type="password"
              autoComplete="new-password"
              name="new_password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
            />
            <input
              className="tf-field-input tf-input fw-6 account-edit-password-input"
              placeholder={t.confirmNewPassword}
              type="password"
              autoComplete="new-password"
              name="new_password_confirm"
              value={passwordData.new_password_confirm}
              onChange={handlePasswordChange}
            />
            <SimartButton
              type="submit"
              disabled={isSaving}
              success={isSaved}
            >
              {isSaving ? t.saving : isSaved ? t.saved : t.saveChanges}
            </SimartButton>
          </div>
        </form>
      </div>
    </div>
  );
}
