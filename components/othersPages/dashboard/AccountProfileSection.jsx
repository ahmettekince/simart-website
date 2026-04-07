"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import apiClient from "@/utils/apiClient";
import { formatPhoneValue } from "@/utils/inputFormatters";
import CircularLoading from "@/components/common/CircularLoading";
import PhoneInput from "@/components/common/PhoneInput";
import SimartButton from "@/components/common/SimartButton";
import { useCustomerStore } from "@/stores/customerStore";
import { useLangStore } from "@/stores/langStore";

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

export default function AccountProfileSection() {
  const lang = useLangStore((s) => s.lang);
  const customer = useCustomerStore((s) => s.customer);
  const isLoading = useCustomerStore((s) => s.isLoading);
  const storeError = useCustomerStore((s) => s.error);
  const refreshAfterPhoneVerify = useCustomerStore((s) => s.refreshAfterPhoneVerify);

  const [customerData, setCustomerData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [customerPhone, setCustomerPhone] = useState("");
  const [phoneVerifiedAt, setPhoneVerifiedAt] = useState("");
  const [phoneForVerify, setPhoneForVerify] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [sendCodeSuccess, setSendCodeSuccess] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const fileInputRef = React.useRef(null);
  const photoMenuRef = React.useRef(null);

  const translations = {
    tr: {
      firstName: "İsim",
      lastName: "Soyisim",
      email: "E-posta",
      phone: "Telefon",
      verified: "Doğrulandı",
      verify: "Doğrula",
      confirm: "Onayla",
      code: "Kod",
      sent: "Gönderildi",
      loading: "Hesap bilgileri yükleniyor...",
      loadError: "Müşteri bilgileri yüklenirken bir hata oluştu.",
      updateSuccess: "Bilgileriniz başarıyla güncellendi.",
      updateError: "Bilgiler güncellenirken bir hata oluştu.",
      photoUpdated: "Profil fotoğrafınız güncellendi.",
      photoDeleted: "Profil fotoğrafınız silindi.",
      photoDeleteConfirm: "Profil fotoğrafınızı silmek istediğinize emin misiniz?",
      photoUpload: "Fotoğraf Yükle",
      photoChange: "Fotoğrafı Değiştir",
      photoRemove: "Fotoğrafı Kaldır",
      invalidPhone: "Geçerli bir telefon numarası girin (+90 ile başlamalı, 10 hane).",
      enterCode: "Doğrulama kodunu girin.",
      verifyFailed: "Doğrulama başarısız."
    },
    en: {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone",
      verified: "Verified",
      verify: "Verify",
      confirm: "Confirm",
      code: "Code",
      sent: "Sent",
      loading: "Loading profile info...",
      loadError: "Error loading customer info.",
      updateSuccess: "Information updated successfully.",
      updateError: "Error updating information.",
      photoUpdated: "Profile photo updated.",
      photoDeleted: "Profile photo deleted.",
      photoDeleteConfirm: "Are you sure you want to delete your profile photo?",
      photoUpload: "Upload Photo",
      photoChange: "Change Photo",
      photoRemove: "Remove Photo",
      invalidPhone: "Enter a valid phone number (+90 starting, 10 digits).",
      enterCode: "Enter verification code.",
      verifyFailed: "Verification failed."
    }
  };

  const t = translations[lang] || translations.tr;

  useEffect(() => {
    if (customer) {
      setCustomerData({
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        email: customer.email || "",
      });
      if (customer.phone) {
        setCustomerPhone(customer.phone);
        setPhoneForVerify(customer.phone);
      }
      if (customer.phone_verified_at) setPhoneVerifiedAt(customer.phone_verified_at);
    }
  }, [customer]);

  useEffect(() => {
    if (storeError) setProfileError(t.loadError);
  }, [storeError, t.loadError]);

  // Fotoğraf menüsünü dışarı tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (photoMenuRef.current && !photoMenuRef.current.contains(event.target)) {
        setShowPhotoMenu(false);
      }
    };
    if (showPhotoMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPhotoMenu]);

  // Hata ve başarı mesajlarını 5 saniye sonra temizle
  useEffect(() => {
    if (profileMessage || profileError || phoneError) {
      const timer = setTimeout(() => {
        setProfileMessage("");
        setProfileError("");
        setPhoneError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [profileMessage, profileError, phoneError]);

  const handleSendVerificationCode = async () => {
    const phone = formatPhoneValue(phoneForVerify).replace(/\s/g, "");
    if (!phone || phone.length < 13) {
      setPhoneError(t.invalidPhone);
      return;
    }
    setPhoneError("");
    setSendCodeLoading(true);
    try {
      const response = await apiClient.post("/customer/phone/verify", { phone });
      if (response.data?.status === "success") {
        setSendCodeSuccess(true);
        setTimeout(() => {
          setSendCodeSuccess(false);
          setCodeSent(true);
        }, 1500);
      } else {
        setPhoneError(getApiErrorMessage(response.data) || (lang === "tr" ? "Kod gönderilemedi." : "Unable to send code."));
      }
    } catch (err) {
      setPhoneError(getApiErrorMessage(err.response?.data) || err.message || (lang === "tr" ? "Hata oluştu." : "Error occurred."));
    } finally {
      setSendCodeLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const phone = formatPhoneValue(phoneForVerify).replace(/\s/g, "");
    if (!phone || phone.length < 13) {
      setPhoneError(t.invalidPhone);
      return;
    }
    if (!verificationCode.trim()) {
      setPhoneError(t.enterCode);
      return;
    }
    setPhoneError("");
    setVerifyLoading(true);
    try {
      const response = await apiClient.post("/customer/phone/verify", {
        phone,
        code: verificationCode.trim(),
      });
      if (response.data?.status === "success") {
        setVerifySuccess(true);
        setTimeout(async () => {
          setVerifySuccess(false);
          setCodeSent(false);
          setVerificationCode("");
          setPhoneForVerify("");
          if (response.data?.data?.phone) setCustomerPhone(response.data.data.phone);
          if (response.data?.data?.phone_verified_at) setPhoneVerifiedAt(response.data.data.phone_verified_at);
          const updated = await refreshAfterPhoneVerify();
          if (updated?.phone_verified_at) setPhoneVerifiedAt(updated.phone_verified_at);
        }, 2000);
      } else {
        setPhoneError(getApiErrorMessage(response.data) || t.verifyFailed);
      }
    } catch (err) {
      setPhoneError(getApiErrorMessage(err.response?.data) || err.message || (lang === "tr" ? "Hata oluştu." : "Error occurred."));
    } finally {
      setVerifyLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError(lang === "tr" ? "Lütfen geçerli bir resim dosyası seçin." : "Please select a valid image file.");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    setIsPhotoLoading(true);
    setProfileError("");
    setProfileMessage("");

    try {
      const response = await apiClient.post("/customer/profile-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data?.status === "success") {
        setProfileMessage(t.photoUpdated);
        await useCustomerStore.getState().fetchCustomer(true);
      } else {
        setProfileError(getApiErrorMessage(response.data) || (lang === "tr" ? "Fotoğraf yüklenemedi." : "Photo could not be uploaded."));
      }
    } catch (err) {
      setProfileError(getApiErrorMessage(err.response?.data) || err.message || (lang === "tr" ? "Hata oluştu." : "Error occurred."));
    } finally {
      setIsPhotoLoading(false);
      setShowPhotoMenu(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePhotoDelete = async (e) => {
    e.stopPropagation();
    if (!customer?.profile_photo_url) return;
    if (!confirm(t.photoDeleteConfirm)) return;

    setIsPhotoLoading(true);
    setProfileError("");
    setProfileMessage("");

    try {
      const response = await apiClient.delete("/customer/profile-photo");
      if (response.data?.status === "success") {
        setProfileMessage(t.photoDeleted);
        await useCustomerStore.getState().fetchCustomer(true);
      } else {
        setProfileError(getApiErrorMessage(response.data) || (lang === "tr" ? "Fotoğraf silinemedi." : "Photo could not be deleted."));
      }
    } catch (err) {
      setProfileError(getApiErrorMessage(err.response?.data) || err.message || (lang === "tr" ? "Hata oluştu." : "Error occurred."));
    } finally {
      setIsPhotoLoading(false);
      setShowPhotoMenu(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileMessage("");
    setProfileError("");
    try {
      // TODO: API endpoint - profile update
      setProfileMessage(t.updateSuccess);
    } catch (err) {
      setProfileError(getApiErrorMessage(err.response?.data) || err.message || t.updateError);
    } finally {
      setIsSaving(false);
    }
  };

  const showLoading = isLoading && !customer;
  if (showLoading) {
    return (
      <div className="account-profile-section" style={{ padding: "40px 0", textAlign: "center" }}>
        <CircularLoading text={t.loading} />
      </div>
    );
  }

  return (
    <div className="account-profile-section">
      <form onSubmit={handleSubmit}>
        {profileMessage && (
          <div className="mb_15" style={{ padding: "12px 16px", backgroundColor: "#d4edda", border: "1px solid #c3e6cb", borderRadius: "4px", color: "#155724" }}>
            {profileMessage}
          </div>
        )}
        {profileError && (
          <div className="mb_15" style={{ padding: "12px 16px", backgroundColor: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: "4px", color: "#721c24" }}>
            {profileError}
          </div>
        )}

        {/* Profil Resmi */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "30px" }}>
          <div
            style={{
              position: "relative",
              width: "100px",
              height: "100px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                border: "2px solid #3c81b5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                backgroundColor: "#fff",
                boxShadow: "0 4px 12px rgba(60, 129, 181, 0.15)",
              }}
              className="profile-photo-wrapper"
            >
              {isPhotoLoading ? (
                <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
                  <CircularLoading size={24} />
                </div>
              ) : null}

              <Image
                src={customer?.profile_photo_url || "/images/logo/favicon.png"}
                alt="Profile Photo"
                fill
                style={{ objectFit: customer?.profile_photo_url ? "cover" : "contain", padding: customer?.profile_photo_url ? "0" : "15px" }}
              />
            </div>

            <div
              onClick={(e) => {
                e.preventDefault();
                setShowPhotoMenu(!showPhotoMenu);
              }}
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                width: "32px",
                height: "32px",
                backgroundColor: "#3c81b5",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "0 3px 6px rgba(0,0,0,0.25)",
                border: "2px solid #fff",
                zIndex: 15,
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              }}
              className="photo-edit-trigger"
            >
              <i className="icon-edit" style={{ fontSize: '13px' }}></i>

              {showPhotoMenu && (
                <div
                  ref={photoMenuRef}
                  style={{
                    position: "absolute",
                    top: "38px",
                    right: "0px",
                    width: "170px",
                    backgroundColor: "#fff",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                    borderRadius: "10px",
                    zIndex: 100,
                    overflow: "hidden",
                    border: "1px solid #f0f0f0"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: "12px 16px",
                      fontSize: "13px",
                      color: "#333",
                      cursor: "pointer",
                      borderBottom: "1px solid #f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px"
                    }}
                    className="photo-menu-item"
                  >
                    <i className="icon-camera" style={{ fontSize: '14px' }} />
                    {customer?.profile_photo_url ? t.photoChange : t.photoUpload}
                  </div>

                  {customer?.profile_photo_url && (
                    <div
                      onClick={handlePhotoDelete}
                      style={{
                        padding: "12px 16px",
                        fontSize: "13px",
                        color: "#dc3545",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                      }}
                      className="photo-menu-item"
                    >
                      <i className="icon-trash" style={{ fontSize: '14px' }} />
                      {t.photoRemove}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>

        <style jsx>{`
          .photo-edit-trigger:hover {
            background-color: #2a5d84 !important;
          }
          .photo-menu-item:hover {
            background-color: #f8f9fa;
            color: #3c81b5 !important;
          }
          .photo-menu-item:active {
            background-color: #f0f1f2;
          }
        `}</style>

        <div className="account-profile-row account-profile-row-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
          <input
            className="tf-field-input tf-input fw-6 account-profile-input"
            placeholder={t.firstName}
            type="text"
            name="first_name"
            value={customerData.first_name}
            readOnly
          />
          <input
            className="tf-field-input tf-input fw-6 account-profile-input"
            placeholder={t.lastName}
            type="text"
            name="last_name"
            value={customerData.last_name}
            readOnly
          />
        </div>

        <input
          className="tf-field-input tf-input fw-6 account-profile-input"
          placeholder={t.email}
          type="email"
          name="email"
          value={customerData.email}
          readOnly
          style={{ marginBottom: "12px", display: "block", width: "100%" }}
        />

        {phoneError && (
          <div className="mb_15" style={{ padding: "12px 16px", backgroundColor: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: "4px", color: "#721c24" }}>
            {phoneError}
          </div>
        )}
        <div className="account-profile-phone-row" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <div style={{ flex: "1 1 120px", minWidth: 0 }}>
            <PhoneInput
              id="phone-verify"
              value={phoneVerifiedAt ? customerPhone : phoneForVerify}
              onChange={setPhoneForVerify}
              placeholder={t.phone}
              className="tf-field-input tf-input fw-6 account-profile-input account-profile-phone-input"
              disabled={!!phoneVerifiedAt}
            />
          </div>
          {phoneVerifiedAt ? (
            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#155724", fontSize: "12px", paddingBottom: "6px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {t.verified}
            </span>
          ) : !codeSent ? (
            <SimartButton
              className="account-profile-phone-btn"
              type="button"
              onClick={handleSendVerificationCode}
              disabled={sendCodeLoading}
              success={sendCodeSuccess}
            >
              {sendCodeLoading ? "..." : sendCodeSuccess ? t.sent : t.verify}
            </SimartButton>
          ) : (
            <>
              <input
                className="tf-field-input tf-input fw-6 account-profile-input account-profile-phone-input"
                placeholder={t.code}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setPhoneError("");
                }}
                style={{ flex: "0 0 70px", minWidth: "60px" }}
              />
              <SimartButton
                type="button"
                className="account-profile-phone-btn"
                onClick={handleVerifyCode}
                disabled={verifyLoading}
                success={verifySuccess}
              >
                {verifyLoading ? "..." : verifySuccess ? t.verified : t.confirm}
              </SimartButton>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
