"use client";
import React, { useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";
import { log } from "@/utils/logger";
import { filterNameValue, formatPhoneValue } from "@/utils/inputFormatters";
import CircularLoading from "@/components/common/CircularLoading";
import PhoneInput from "@/components/common/PhoneInput";

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

  // Telefon doğrulama
  const [customerPhone, setCustomerPhone] = useState("");
  const [phoneVerifiedAt, setPhoneVerifiedAt] = useState("");
  const [phoneForVerify, setPhoneForVerify] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");

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
          if (customer.phone) setCustomerPhone(customer.phone);
          if (customer.phone_verified_at) setPhoneVerifiedAt(customer.phone_verified_at);
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
    const filtered = (name === "first_name" || name === "last_name") ? filterNameValue(value) : value;
    setCustomerData((prev) => ({
      ...prev,
      [name]: filtered,
    }));
    // Mesajları temizle
    setMessage("");
    setError("");
  };

  // API cevabı: errors doluysa onları göster, boşsa sadece message
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

  /** Doğrulama kodu gönder: body'de sadece phone */
  const handleSendVerificationCode = async () => {
    const phone = formatPhoneValue(phoneForVerify);
    if (!phone || phone.length < 12) {
      setPhoneError("Geçerli bir telefon numarası girin (+90 ile başlamalı, 10 hane).");
      return;
    }
    setPhoneError("");
    setPhoneMessage("");
    setSendCodeLoading(true);
    try {
      const response = await apiClient.post("/customer/phone/verify", { phone });
      if (response.data?.status === "success") {
        setPhoneMessage(response.data?.message || "Doğrulama kodu telefonunuza gönderildi.");
        setCodeSent(true);
      } else {
        setPhoneError(getApiErrorMessage(response.data) || "Kod gönderilemedi.");
      }
    } catch (err) {
      setPhoneError(
        getApiErrorMessage(err.response?.data) || err.message || "Kod gönderilirken bir hata oluştu."
      );
    } finally {
      setSendCodeLoading(false);
    }
  };

  /** Kodu doğrula: body'de phone + code */
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
    setPhoneMessage("");
    setVerifyLoading(true);
    try {
      const response = await apiClient.post("/customer/phone/verify", {
        phone,
        code: verificationCode.trim(),
      });
      if (response.data?.status === "success") {
        setPhoneMessage(response.data?.message || "Telefon numaranız başarıyla doğrulandı.");
        setCodeSent(false);
        setVerificationCode("");
        setPhoneForVerify("");
        if (response.data?.data?.phone) setCustomerPhone(response.data.data.phone);
        if (response.data?.data?.phone_verified_at) setPhoneVerifiedAt(response.data.data.phone_verified_at);
        // Müşteri bilgilerini yeniden yükle (phone_verified_at güncellenmiş olabilir)
        const meRes = await apiClient.get("/customer/me");
        if (meRes.data?.data?.customer?.phone_verified_at) {
          setPhoneVerifiedAt(meRes.data.data.customer.phone_verified_at);
        }
      } else {
        setPhoneError(getApiErrorMessage(response.data) || "Doğrulama başarısız.");
      }
    } catch (err) {
      setPhoneError(
        getApiErrorMessage(err.response?.data) || err.message || "Doğrulama sırasında bir hata oluştu."
      );
    } finally {
      setVerifyLoading(false);
    }
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
        getApiErrorMessage(err.response?.data) ||
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
        <CircularLoading text="Hesap bilgileri yükleniyor..." />
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

          {/* Telefon Doğrulama */}
          <h6 className="mb_20">Telefon Doğrulama</h6>
          {phoneMessage && (
            <div
              className="mb_15"
              style={{
                padding: "12px 16px",
                backgroundColor: "#d4edda",
                border: "1px solid #c3e6cb",
                borderRadius: "4px",
                color: "#155724",
              }}
            >
              {phoneMessage}
            </div>
          )}
          {phoneError && (
            <div
              className="mb_15"
              style={{
                padding: "12px 16px",
                backgroundColor: "#f8d7da",
                border: "1px solid #f5c6cb",
                borderRadius: "4px",
                color: "#721c24",
              }}
            >
              {phoneError}
            </div>
          )}
          {phoneVerifiedAt ? (
            <p className="mb_20" style={{ color: "#155724" }}>
              Telefonunuz doğrulandı: {customerPhone ? (customerPhone.startsWith("+") ? customerPhone : `+${customerPhone}`) : "—"}
            </p>
          ) : (
            <>
              <div className="tf-field style-1 mb_15">
                <PhoneInput
                  id="phone-verify"
                  value={phoneForVerify}
                  onChange={setPhoneForVerify}
                  placeholder="+90 5XX XXX XX XX"
                  className="tf-field-input tf-input fw-6"
                />
                <label className="tf-field-label fw-4 text_black-2" htmlFor="phone-verify">
                  Telefon numaranız
                </label>
              </div>
              <div className="mb_15">
                <button
                  type="button"
                  className="tf-btn radius-3 btn-fill animate-hover-btn"
                  onClick={handleSendVerificationCode}
                  disabled={sendCodeLoading}
                >
                  {sendCodeLoading ? "Gönderiliyor..." : "Doğrulama kodu gönder"}
                </button>
              </div>
              {codeSent && (
                <>
                  <div className="tf-field style-1 mb_15">
                    <input
                      className="tf-field-input tf-input fw-6"
                      placeholder=" "
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      id="verify-code"
                      value={verificationCode}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setVerificationCode(v);
                        setPhoneError("");
                      }}
                    />
                    <label className="tf-field-label fw-4 text_black-2" htmlFor="verify-code">
                      Doğrulama kodu (6 rakam)
                    </label>
                  </div>
                  <div className="mb_20">
                    <button
                      type="button"
                      className="tf-btn radius-3 btn-fill animate-hover-btn"
                      onClick={handleVerifyCode}
                      disabled={verifyLoading}
                    >
                      {verifyLoading ? "Doğrulanıyor..." : "Doğrula"}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

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
