"use client";
import { socialLinksWithBorder } from "@/data/socials";
import Link from "next/link";
import React, { useRef, useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";
import { siteConfig } from "@/config/site";
import SearchableSelect from "@/components/common/SearchableSelect";
import PhoneInput from "@/components/common/PhoneInput";

export default function SupportForm() {
  const formRef = useRef();
  const [success, setSuccess] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productsLoading, setProductsLoading] = useState(false);
  const [phone, setPhone] = useState("");

  // Ürünleri API'den çek
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await apiClient.get("/products");
        if (response.data?.status === "success" && response.data?.data) {
          const items = Array.isArray(response.data.data) ? response.data.data : response.data.data?.items || [];
          const options = items.map((p) => ({
            id: p.id,
            name: p.name || p.title || `Ürün #${p.id}`,
          }));
          setProducts(options);
        }
      } catch (error) {
        console.error("Ürünler yüklenirken hata:", error);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

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
    const formData = new FormData(e.target);
    const data = {
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      product_id: formData.get("product_id"),
      message: formData.get("message"),
    };

    try {
      const response = await apiClient.post("/contact", null, { params: data });

      if (response.data.status === "success") {
        setSuccess(true);
        setApiMessage("Mesajınız başarıyla gönderildi.");
        setSelectedProductId("");
        setPhone("");
        setFieldErrors({});
        e.target.reset();
      } else {
        // API status: "error" but HTTP 200 - validasyon hatası
        setSuccess(false);
        setApiMessage(response.data.message || "Bir hata oluştu.");
        setFieldErrors(response.data.errors || {});
      }
    } catch (error) {
      // Axios non-200 responses (422 validasyon vb.)
      setSuccess(false);
      const errorMessage = error.response?.data?.message || "Bir hata oluştu. Lütfen tekrar deneyin.";
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
    <section className="flat-spacing-21 support-form-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6">
            <div className="support-form-inner">
              <h5 className="mb_20">Bizimle iletişime geçin</h5>
              <div>
                <form ref={formRef} onSubmit={sendMail} className="form-contact" id="contactform">
                  <div className="d-flex gap-15 mb_15">
                    <fieldset className="w-100">
                      <input type="text" name="full_name" id="name" required placeholder="İsim Soyisim *" />
                      {fieldErrors.full_name && (
                        <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.full_name[0]}</div>
                      )}
                    </fieldset>
                    <fieldset className="w-100">
                      <input
                        type="email"
                        autoComplete="abc@xyz.com"
                        name="email"
                        id="email"
                        required
                        placeholder="E-Posta *"
                      />
                      {fieldErrors.email && (
                        <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.email[0]}</div>
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
                        placeholder="+90 5XX XXX XX XX"
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
                        placeholder={productsLoading ? "Yükleniyor..." : "Ürün Seçiniz *"}
                        required
                        searchPlaceholder="Ürün ara..."
                      />
                      {fieldErrors.product_id && (
                        <div style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.product_id[0]}</div>
                      )}
                    </fieldset>
                  </div>
                  <div className="mb_15">
                    <fieldset className="w-100">
                      <textarea
                        placeholder="Mesajınız *"
                        name="message"
                        id="message"
                        required
                        cols={30}
                        rows={10}
                        defaultValue={""}
                      />
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
                      {loading ? "Gönderiliyor..." : "Gönder"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
