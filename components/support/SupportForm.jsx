"use client";
import { socialLinksWithBorder } from "@/data/socials";
import Link from "next/link";
import React, { useRef, useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";
import { siteConfig } from "@/config/site";
import SearchableSelect from "@/components/common/SearchableSelect";
import PhoneInput from "@/components/common/PhoneInput";
import RecaptchaV3 from "@/components/common/RecaptchaV3";
import { formatFullNameValue } from "@/utils/inputFormatters";
import { useLangStore } from "@/stores/langStore";

export default function SupportForm() {
  const { lang } = useLangStore();
  const formRef = useRef();
  const executeRecaptchaRef = useRef(null);
  const [success, setSuccess] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productsLoading, setProductsLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");

  const t = {
    tr: {
      contactTitle: "Bizimle iletişime geçin",
      fullName: "İsim Soyisim *",
      phonePlaceholder: "+90 5XX XXX XX XX",
      selectProduct: "Ürün Seçiniz *",
      loading: "Yükleniyor...",
      searchProduct: "Ürün ara...",
      message: "Mesajınız *",
      sending: "Gönderiliyor...",
      send: "Gönder",
      successMsg: "Mesajınız başarıyla gönderildi.",
      errorDefault: "Bir hata oluştu.",
      errorTryAgain: "Bir hata oluştu. Lütfen tekrar deneyin.",
      recaptchaError: "Güvenlik doğrulaması yapılamadı.",
      recaptchaRequired: "Lütfen güvenlik adımını tamamlayın.",
    },
    en: {
      contactTitle: "Contact us",
      fullName: "Full Name *",
      phonePlaceholder: "+90 5XX XXX XX XX",
      selectProduct: "Select Product *",
      loading: "Loading...",
      searchProduct: "Search product...",
      message: "Your Message *",
      sending: "Sending...",
      send: "Send",
      successMsg: "Your message has been sent successfully.",
      errorDefault: "An error occurred.",
      errorTryAgain: "An error occurred. Please try again.",
      recaptchaError: "Security verification failed.",
      recaptchaRequired: "Please complete the security step.",
    }
  }[lang] || {
    tr: {
      contactTitle: "Bizimle iletişime geçin",
      fullName: "İsim Soyisim *",
      phonePlaceholder: "+90 5XX XXX XX XX",
      selectProduct: "Ürün Seçiniz *",
      loading: "Yükleniyor...",
      searchProduct: "Ürün ara...",
      message: "Mesajınız *",
      sending: "Gönderiliyor...",
      send: "Gönder",
      successMsg: "Mesajınız başarıyla gönderildi.",
      errorDefault: "Bir hata oluştu.",
      errorTryAgain: "Bir hata oluştu. Lütfen tekrar deneyin.",
      recaptchaError: "Güvenlik doğrulaması yapılamadı.",
      recaptchaRequired: "Lütfen güvenlik adımını tamamlayın.",
    }
  }.tr;

  // Ürünleri API'den çek
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await apiClient.get("/products", {
            headers: {
                'X-Api-Lang': lang
            }
        });
        if (response.data?.status === "success" && response.data?.data) {
          const items = Array.isArray(response.data.data) ? response.data.data : response.data.data?.items || [];
          const options = items.map((p) => ({
            id: p.id,
            name: p.name || p.title || (lang === 'tr' ? `Ürün #${p.id}` : `Product #${p.id}`),
          }));
          setProducts(options);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [lang]);

  // Hash kontrolü ve otomatik kaydırma
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#destek-formu") {
      const element = document.getElementById("destek-formu");
      if (element) {
        setTimeout(() => {
          const headerOffset = 120; // Sticky header yüksekliği + pay
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }, 100); // Sayfanın tam render olması için kısa bir gecikme
      }
    }
  }, []);

  const [message, setMessage] = useState("");

  const handleMessageChange = (e) => {
    const val = e.target.value;
    if (val.length <= 500) {
      setMessage(val);
    }
  };

  const handleShowMessage = () => {
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 7000);
  };

  const sendMail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    
    const data = {
      full_name: fullName,
      phone: phone,
      product: products.find((p) => String(p.id) === String(selectedProductId))?.name || "",
      message: message,
    };

    // V3: Token al
    let token = null;
    if (executeRecaptchaRef.current) {
      try {
        token = await executeRecaptchaRef.current();
      } catch (e) {
        console.error("reCAPTCHA hatası:", e);
        setSuccess(false);
        setApiMessage(t.recaptchaError);
        handleShowMessage();
        setLoading(false);
        return;
      }
    }

    if (!token) {
      setSuccess(false);
      setApiMessage(t.recaptchaRequired);
      handleShowMessage();
      setLoading(false);
      return;
    }

    // Token ekle
    data["g-recaptcha-response"] = token;

    try {
      const response = await apiClient.post("/support-requests", null, { params: data });

      if (response.data.status === "success") {
        setSuccess(true);
        setApiMessage(response.data.message || t.successMsg);
        setSelectedProductId("");
        setPhone("");
        setFullName("");
        setMessage("");
        setFieldErrors({});
        e.target.reset();
      } else {
        setSuccess(false);
        setApiMessage(response.data.message || t.errorDefault);
        setFieldErrors(response.data.errors || {});
      }
    } catch (error) {
      setSuccess(false);
      const errorMessage = error.response?.data?.message || t.errorTryAgain;
      setApiMessage(errorMessage);
      setFieldErrors(error.response?.data?.errors || {});

      if (error.response?.status !== 429) {
        console.error("Contact Form Error:", error);
      }
    } finally {
      setLoading(false);
      handleShowMessage();
    }
  };

  return (
    <section id="destek-formu" className="flat-spacing-21 support-form-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6">
            <div className="support-form-inner">
              <h5 className="mb_20">{t.contactTitle}</h5>
              <div>
                <form ref={formRef} onSubmit={sendMail} className="form-contact" id="contactform" noValidate>
                  <div className="d-flex gap-15 mb_15">
                    <fieldset className="w-100">
                      <input
                        type="text"
                        name="full_name"
                        id="name"
                        required
                        placeholder={t.fullName}
                        value={fullName}
                        onChange={(e) => setFullName(formatFullNameValue(e.target.value))}
                      />
                      {fieldErrors.full_name && (
                        <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.full_name[0]}</div>
                      )}
                    </fieldset>

                  </div>
                  <div className="mb_15">
                    <fieldset className="w-100">
                      <PhoneInput
                        name="phone"
                        id="phone"
                        value={phone}
                        onChange={setPhone}
                        required
                        placeholder={t.phonePlaceholder}
                      />
                      {fieldErrors.phone && (
                        <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.phone[0]}</div>
                      )}
                    </fieldset>
                  </div>
                  <div className="mb_15">
                    <fieldset className="w-100">
                      <SearchableSelect
                        id="product_id"
                        name="product_id"
                        options={products}
                        value={selectedProductId}
                        onChange={(value) => setSelectedProductId(value || "")}
                        placeholder={productsLoading ? t.loading : t.selectProduct}
                        required
                        searchPlaceholder={t.searchProduct}
                      />
                      {fieldErrors.product_name && (
                        <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.product_name[0]}</div>
                      )}
                    </fieldset>
                  </div>
                  <div className="mb_15">
                    <fieldset className="w-100">
                      <textarea
                        placeholder={t.message}
                        name="message"
                        id="message"
                        required
                        cols={30}
                        rows={10}
                        value={message}
                        onChange={handleMessageChange}
                        maxLength={500}
                      />
                      <div className="text-muted mt-1" style={{ fontSize: '12px', color: '#666', textAlign: 'right' }}>
                        {message.length} / 500
                      </div>
                      {fieldErrors.message && (
                        <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.message[0]}</div>
                      )}
                    </fieldset>
                  </div>
                  <div className={`tfSubscribeMsg ${showMessage ? "active" : ""}`}>
                    {Object.keys(fieldErrors).length === 0 && (
                      <p style={{ color: success ? "rgb(52, 168, 83)" : "red" }}>{apiMessage}</p>
                    )}
                  </div>
                  <div className="send-wrap">
                    <button
                      type="submit"
                      disabled={loading}
                      className="tf-btn w-100 radius-3 btn-fill animate-hover-btn justify-content-center"
                    >
                      {loading ? t.sending : t.send}
                    </button>
                  </div>
                </form>
                {/* reCAPTCHA V3 */}
                <RecaptchaV3
                  onVerify={(executeFn) => {
                    executeRecaptchaRef.current = executeFn;
                  }}
                  action="support"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
