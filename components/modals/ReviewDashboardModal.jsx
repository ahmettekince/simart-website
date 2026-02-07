"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import apiClient from "@/utils/apiClient";
import { useReviewStore } from "@/stores/reviewStore";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function ReviewDashboardModal({ open, onClose, onSuccess, products = [] }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const removeReviewableProduct = useReviewStore((s) => s.removeReviewableProduct);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.size <= MAX_FILE_SIZE && ACCEPTED_TYPES.includes(f.type));
    setImages((prev) => [...prev, ...files].slice(0, MAX_IMAGES));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const resetForm = () => {
    setSelectedProduct(null);
    setRating(0);
    setComment("");
    setImages([]);
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!comment.trim()) {
      setError("Yorumunuzu yazın.");
      return;
    }
    if (rating < 1) {
      setError("Lütfen puan seçin.");
      return;
    }
    const prod = selectedProduct || (products.length === 1 ? products[0] : null);
    if (!prod) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("product_id", prod.id);
      formData.append("rating", rating);
      formData.append("comment", comment.trim());
      formData.append("order_id", prod.order_id);
      images.forEach((file) => formData.append("images[]", file));

      const res = await apiClient.post("/customer/reviews", formData);

      if (res.data?.status === "success") {
        setSuccess(true);
        removeReviewableProduct(prod.id);
        onSuccess?.();
        setTimeout(() => handleClose(), 1500);
      } else {
        setError(res.data?.message || "Yorum gönderilemedi.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const product = selectedProduct || (products.length === 1 ? products[0] : null);
  const showProductSelector = products.length > 1 && !selectedProduct;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        backdropFilter: "blur(2px)",
      }}
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          backgroundColor: "#fff",
          borderRadius: "18px",
          padding: "22px 20px 24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.28)",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <h5 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Yorum Yap</h5>
          <button type="button" onClick={handleClose} aria-label="Kapat" style={{ border: "none", background: "transparent", cursor: "pointer", padding: 4, color: "#666", fontSize: "22px" }}>×</button>
        </div>

        {success ? (
          <p style={{ color: "#0bc15c", fontWeight: 600, margin: 0 }}>Yorumunuz gönderildi. Onaylandıktan sonra görünecektir.</p>
        ) : showProductSelector ? (
          <div>
            <p style={{ fontSize: "13px", color: "#555", marginBottom: "14px" }}>Yorum yapmak istediğiniz ürünü seçin:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProduct(p)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    border: "1px solid #e5e5e5",
                    borderRadius: "10px",
                    background: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {(p.cover_image?.thumbnail_url || p.cover_image?.url) && (
                    <Image src={p.cover_image.thumbnail_url || p.cover_image.url} alt="" width={48} height={48} style={{ objectFit: "cover", borderRadius: "6px" }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "14px" }}>{p.name}</div>
                    <div style={{ fontSize: "12px", color: "#888" }}>Sipariş: {p.order_number}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : product ? (
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px", padding: "10px", backgroundColor: "#f8f8f8", borderRadius: "10px" }}>
              {(product.cover_image?.thumbnail_url || product.cover_image?.url) && (
                <Image src={product.cover_image.thumbnail_url || product.cover_image.url} alt="" width={56} height={56} style={{ objectFit: "cover", borderRadius: "8px" }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>{product.name}</div>
                {product.order_number && (
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>Sipariş: {product.order_number}</div>
                )}
                {products.length > 1 && (
                  <button type="button" onClick={() => setSelectedProduct(null)} style={{ fontSize: "12px", color: "#666", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", marginTop: "4px" }}>
                    Değiştir
                  </button>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "#555" }}>Puanınız</label>
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ background: "none", border: "none", padding: 4, cursor: "pointer", fontSize: "20px" }}
                  >
                    <span style={{ color: (hoverRating || rating) >= star ? "#FFC107" : "#ddd" }}>★</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label htmlFor="review-modal-comment" style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "#555" }}>Yorumunuz</label>
              <textarea
                id="review-modal-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ürün hakkındaki düşüncelerinizi yazın..."
                rows={3}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "#555" }}>Fotoğraf (isteğe bağlı)</label>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleImageChange} style={{ display: "none" }} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="tf-btn btn-line" style={{ fontSize: "13px" }}>Fotoğraf seç</button>
              {images.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {images.map((file, i) => (
                    <div key={i} style={{ position: "relative", width: 56, height: 56 }}>
                      <Image src={URL.createObjectURL(file)} alt="" width={56} height={56} style={{ objectFit: "cover", borderRadius: "6px", border: "1px solid #eee" }} />
                      <button type="button" onClick={() => removeImage(i)} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#333", color: "#fff", border: "none", cursor: "pointer", fontSize: 14 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <div style={{ color: "#dc3545", fontSize: "13px", marginBottom: 10 }}>{error}</div>}
            <button type="submit" className="tf-btn btn-fill" disabled={isSubmitting}>{isSubmitting ? "Gönderiliyor..." : "Yorumu Gönder"}</button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
