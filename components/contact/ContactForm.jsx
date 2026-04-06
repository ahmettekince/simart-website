"use client";
import { socialLinksWithBorder } from "@/data/socials";
import Link from "next/link";
import React, { useRef, useState } from "react";
import apiClient from "@/utils/apiClient";
import { siteConfig } from "@/config/site";
import { formatPhoneValue, formatFullNameValue } from "@/utils/inputFormatters";
import RecaptchaV3 from "@/components/common/RecaptchaV3";

const translations = {
  tr: {
    title: "Bizimle iletişime geçin",
    visitShop: "Mağazamızı Ziyaret Edin",
    address: "Adres",
    contactNumbers: "İletişim Numaraları",
    emailLabel: "E-Posta",
    customerService: "Müşteri Hizmetleri",
    whatsappLine: "WhatsApp Hattı",
    fullNamePlaceholder: "İsim Soyisim *",
    emailPlaceholder: "E-Posta *",
    phonePlaceholder: "+90 5XX XXX XX XX",
    messagePlaceholder: "Mesajınız *",
    sendButton: "Gönder",
    sendingButton: "Gönderiliyor...",
    recaptchaError: "Güvenlik doğrulaması yapılamadı.",
    recaptchaIncomplete: "Lütfen güvenlik adımını tamamlayın.",
    successMessage: "Mesajınız başarıyla gönderildi.",
    errorMessage: "Bir hata oluştu.",
    generalErrorMessage: "Bir hata oluştu. Lütfen tekrar deneyin."
  },
  en: {
    title: "Contact Us",
    visitShop: "Visit Our Shop",
    address: "Address",
    contactNumbers: "Contact Numbers",
    emailLabel: "E-Mail",
    customerService: "Customer Service",
    whatsappLine: "WhatsApp Line",
    fullNamePlaceholder: "Full Name *",
    emailPlaceholder: "E-Mail *",
    phonePlaceholder: "Phone Number *",
    messagePlaceholder: "Your Message *",
    sendButton: "Send",
    sendingButton: "Sending...",
    recaptchaError: "Security verification failed.",
    recaptchaIncomplete: "Please complete the security step.",
    successMessage: "Your message has been sent successfully.",
    errorMessage: "An error occurred.",
    generalErrorMessage: "An error occurred. Please try again."
  }
};

export default function ContactForm({ lang = "tr" }) {
  const t = translations[lang] || translations.tr;
  const formRef = useRef();
  const executeRecaptchaRef = useRef(null);
  const [success, setSuccess] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [phoneValue, setPhoneValue] = useState("+90");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");

  const handleShowMessage = () => {
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 7000);
  };

  const setErrorsFromResponse = (data) => {
    const errs = data?.errors && typeof data.errors === "object" ? data.errors : {};
    const next = {};
    ["full_name", "email", "phone", "message"].forEach((key) => {
      const arr = errs[key];
      next[key] = Array.isArray(arr) ? arr : [];
    });
    setFieldErrors(next);
  };

  const sendMail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    const formData = new FormData(e.target);
    const phone = formData.get("phone") || phoneValue;
    const data = {
      full_name: fullName,
      email: formData.get("email"),
      phone: formatPhoneValue(phone) || phone,
      message: formData.get("message"),
      lang: lang
    };

    let token = null;
    if (executeRecaptchaRef.current) {
      try {
        token = await executeRecaptchaRef.current();
      } catch (e) {
        console.error("reCAPTCHA Error:", e);
        setSuccess(false);
        setApiMessage(t.recaptchaError);
        handleShowMessage();
        setLoading(false);
        return;
      }
    }

    if (!token) {
      setSuccess(false);
      setApiMessage(t.recaptchaIncomplete);
      handleShowMessage();
      setLoading(false);
      return;
    }

    data["g-recaptcha-response"] = token;

    try {
      const response = await apiClient.post("/contact", data);

      if (response.data.status === "success") {
        setSuccess(true);
        setApiMessage(t.successMessage);
        e.target.reset();
        setPhoneValue("+90");
        setFullName("");
        setMessage("");
      } else {
        setSuccess(false);
        setApiMessage(response.data.message || t.errorMessage);
        setErrorsFromResponse(response.data);
      }
    } catch (error) {
      setSuccess(false);
      const errData = error.response?.data;
      setApiMessage(errData?.message || t.generalErrorMessage);
      setErrorsFromResponse(errData || {});
      if (error.response?.status !== 429) {
        console.error("Contact Form Error:", error);
      }
    } finally {
      setLoading(false);
      handleShowMessage();
    }
  };

  return (
    <section className="flat-spacing-21">
      <div className="container">
        <div className="tf-grid-layout gap30 lg-col-2">
          <div className="tf-content-right">
            <h5 className="mb_20">{t.title}</h5>
            <div>
              <form ref={formRef} onSubmit={sendMail} className="form-contact" id="contactform" noValidate>
                <div className="d-flex gap-15 mb_15">
                  <fieldset className="w-100">
                    <input
                      type="text"
                      name="full_name"
                      id="name"
                      required
                      placeholder={t.fullNamePlaceholder}
                      value={fullName}
                      onChange={(e) => setFullName(formatFullNameValue(e.target.value))}
                    />
                    {fieldErrors.full_name?.length > 0 && (
                      <div className="contact-field-error" style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                        {fieldErrors.full_name[0]}
                      </div>
                    )}
                  </fieldset>
                  <fieldset className="w-100">
                    <input
                      type="email"
                      autoComplete="abc@xyz.com"
                      name="email"
                      id="email"
                      required
                      placeholder={t.emailPlaceholder}
                    />
                    {fieldErrors.email?.length > 0 && (
                      <div className="contact-field-error" style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                        {fieldErrors.email[0]}
                      </div>
                    )}
                  </fieldset>
                </div>
                <div className="mb_15">
                  <fieldset className="w-100">
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      id="phone"
                      required
                      placeholder={t.phonePlaceholder}
                      value={phoneValue}
                      onChange={(e) => setPhoneValue(formatPhoneValue(e.target.value) || "+90")}
                    />
                    <input type="hidden" name="phone" value={phoneValue} />
                    {fieldErrors.phone?.length > 0 && (
                      <div className="contact-field-error" style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                        {fieldErrors.phone[0]}
                      </div>
                    )}
                  </fieldset>
                </div>
                <div className="mb_15">
                  <textarea
                    placeholder={t.messagePlaceholder}
                    name="message"
                    id="message"
                    required
                    cols={30}
                    rows={10}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={500}
                  />
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: "12px",
                      marginTop: "4px",
                      color: message.length >= 500 ? "#dc3545" : "#666",
                    }}
                  >
                    {message.length}/500
                  </div>
                  {fieldErrors.message?.length > 0 && (
                    <div className="contact-field-error" style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>
                      {fieldErrors.message[0]}
                    </div>
                  )}
                </div>
                {(() => {
                  const hasFieldErrors = Object.values(fieldErrors).some((arr) => arr.length > 0);
                  const showGeneralMessage = (success || !hasFieldErrors) && apiMessage;
                  return showGeneralMessage ? (
                    <div className={`tfSubscribeMsg ${showMessage ? "active" : ""}`}>
                      <p style={{ color: success ? "rgb(52, 168, 83)" : "red" }}>{apiMessage}</p>
                    </div>
                  ) : null;
                })()}
                <div className="send-wrap">
                  <button
                    type="submit"
                    disabled={loading}
                    className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                  >
                    {loading ? t.sendingButton : t.sendButton}
                  </button>
                </div>
              </form>
              <RecaptchaV3
                onVerify={(executeFn) => {
                  executeRecaptchaRef.current = executeFn;
                }}
                action="contact"
              />
            </div>
          </div>
          <div className="tf-content-left">
            <h5 className="mb_20">{t.visitShop}</h5>
            <div className="mb_20">
              <p className="mb_15">
                <strong>{t.address}</strong>
              </p>
              <p>
                {siteConfig.contact.address.street}
                <br></br> {siteConfig.contact.address.district} / {siteConfig.contact.address.city}{" "}
                {siteConfig.contact.address.country} {lang === "tr" ? "Posta Kodu" : "Postal Code"}: {siteConfig.contact.address.postalCode}
              </p>
            </div>
            <div className="mb_20">
              <p className="mb_15">
                <strong>{t.contactNumbers}</strong>
              </p>
              <div className="d-flex flex-column gap-10">
                <div className="d-flex align-items-center gap-10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.28-2.28a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <Link href="tel:+908503466126" className="text-black">
                    +90 850 346 6126 ({t.customerService})
                  </Link>
                </div>
                <div className="d-flex align-items-center gap-10">
                  <i className="icon-whatsapp fs-20" style={{ color: "#25D366" }} />
                  <Link
                    href="https://api.whatsapp.com/send/?phone=%2B905526428208&text&type=phone_number&app_absent=0"
                    target="_blank"
                    className="text-black"
                  >
                    +90 552 642 8208 ({t.whatsappLine})
                  </Link>
                </div>
              </div>
            </div>
            <div className="mb_20">
              <p className="mb_15">
                <strong>{t.emailLabel}</strong>
              </p>
              <div className="d-flex align-items-center gap-10">
                <i className="icon-mail fs-15" />
                <Link href="mailto:destek@simart.me" className="text-black">
                  destek@simart.me
                </Link>
              </div>
            </div>
            <div className="mb_36"></div>
            <div>
              <ul className="tf-social-icon d-flex gap-20 style-default">
                {socialLinksWithBorder.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className={`box-icon link round ${link.className} ${link.borderClass}`}>
                      <i className={`icon ${link.iconSize} ${link.iconClass}`} />
                    </a>
                  </li>
                ))}
            </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
