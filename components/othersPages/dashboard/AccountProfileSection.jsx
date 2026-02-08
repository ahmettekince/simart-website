"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";
import { formatPhoneValue } from "@/utils/inputFormatters";
import CircularLoading from "@/components/common/CircularLoading";
import PhoneInput from "@/components/common/PhoneInput";
import SimartButton from "@/components/common/SimartButton";
import { useCustomerStore } from "@/stores/customerStore";

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
    if (storeError) setProfileError("Müşteri bilgileri yüklenirken bir hata oluştu.");
  }, [storeError]);

  const handleSendVerificationCode = async () => {
    const phone = formatPhoneValue(phoneForVerify);
    if (!phone || phone.length < 12) {
      setPhoneError("Geçerli bir telefon numarası girin (+90 ile başlamalı, 10 hane).");
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
        setPhoneError(getApiErrorMessage(response.data) || "Kod gönderilemedi.");
      }
    } catch (err) {
      setPhoneError(getApiErrorMessage(err.response?.data) || err.message || "Kod gönderilirken bir hata oluştu.");
    } finally {
      setSendCodeLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const phone = formatPhoneValue(phoneForVerify);
    if (!phone || phone.length < 12) {
      setPhoneError("Geçerli bir telefon numarası girin.");
      return;
    }
    if (!verificationCode.trim()) {
      setPhoneError("Doğrulama kodunu girin.");
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
        setPhoneError(getApiErrorMessage(response.data) || "Doğrulama başarısız.");
      }
    } catch (err) {
      setPhoneError(getApiErrorMessage(err.response?.data) || err.message || "Doğrulama sırasında bir hata oluştu.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileMessage("");
    setProfileError("");
    try {
      // TODO: API endpoint - profile update
      setProfileMessage("Bilgileriniz başarıyla güncellendi.");
    } catch (err) {
      setProfileError(getApiErrorMessage(err.response?.data) || err.message || "Bilgiler güncellenirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const showLoading = isLoading && !customer;
  if (showLoading) {
    return (
      <div className="account-profile-section" style={{ padding: "40px 0", textAlign: "center" }}>
        <CircularLoading text="Hesap bilgileri yükleniyor..." />
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

        {/* Foto placeholder */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              border: "2px dashed #ddd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
              fontSize: "11px",
              backgroundColor: "#fafafa",
            }}
          >
            Foto
          </div>
        </div>

        {/* İsim | Soyisim - yan yana */}
        <div className="account-profile-row account-profile-row-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
          <input
            className="tf-field-input tf-input fw-6 account-profile-input"
            placeholder="İsim"
            type="text"
            name="first_name"
            value={customerData.first_name}
            readOnly
          />
          <input
            className="tf-field-input tf-input fw-6 account-profile-input"
            placeholder="Soyisim"
            type="text"
            name="last_name"
            value={customerData.last_name}
            readOnly
          />
        </div>

        {/* E-posta */}
        <input
          className="tf-field-input tf-input fw-6 account-profile-input"
          placeholder="E-posta"
          type="email"
          name="email"
          value={customerData.email}
          readOnly
          style={{ marginBottom: "12px", display: "block", width: "100%" }}
        />

        {/* Telefon + Doğrula / Tik */}
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
              placeholder="Telefon"
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
              Doğrulandı
            </span>
          ) : !codeSent ? (
            <SimartButton
              className="account-profile-phone-btn"
              type="button"
              onClick={handleSendVerificationCode}
              disabled={sendCodeLoading}
              success={sendCodeSuccess}
            >
              {sendCodeLoading ? "..." : sendCodeSuccess ? "Gönderildi" : "Doğrula"}
            </SimartButton>
          ) : (
            <>
              <input
                className="tf-field-input tf-input fw-6 account-profile-input account-profile-phone-input"
                placeholder="Kod"
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
                {verifyLoading ? "..." : verifySuccess ? "Doğrulandı" : "Onayla"}
              </SimartButton>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
