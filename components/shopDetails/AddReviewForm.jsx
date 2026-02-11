"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/stores/authStore";
import apiClient from "@/utils/apiClient";

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function AddReviewForm({ product, onReviewAdded, orderId }) {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const productSlug = product?.slug || product?.id;
  const productId = product?.id;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) => {
      if (f.size > MAX_FILE_SIZE) return false;
      if (!ACCEPTED_TYPES.includes(f.type)) return false;
      return true;
    });
    const newImages = [...images, ...validFiles].slice(0, MAX_IMAGES);
    setImages(newImages);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
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

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("product_id", productId || "");
      formData.append("rating", rating);
      formData.append("comment", comment.trim());
      formData.append("order_id", orderId ?? "");
      images.forEach((file) => formData.append("images[]", file));

      const response = await apiClient.post("/customer/reviewable-products", formData);

      if (response.data?.status === "success") {
        setSuccess(true);
        setComment("");
        setRating(0);
        setImages([]);
        onReviewAdded?.();
      } else {
        setError(response.data?.message || "Yorum gönderilemedi.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Bir hata oluştu.";
      setError(msg);
      if (err.response?.status === 401) {
        setError("Yorum yazmak için giriş yapmanız gerekiyor.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Giriş yapmamış: login isteği
  if (isInitialized && !isAuthenticated) {
    const returnUrl = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search || ""}#product-reviews` : "/";
    return (
      <div className="add-review-login-prompt" style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eee" }}>
        <p style={{ margin: "0 0 8px", color: "#666", fontSize: "13px" }}>
          Yorum yazmak için giriş yapın.
        </p>
        <Link href={`/giris-yap?returnUrl=${encodeURIComponent(returnUrl)}`} className="tf-btn btn-fill" style={{ display: "inline-block", padding: "8px 16px", fontSize: "13px" }}>
          Giriş Yap
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="add-review-success" style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eee", color: "#2e7d32", fontSize: "13px" }}>
        <p style={{ margin: 0 }}>Yorumunuz gönderildi. Onaylandıktan sonra görünecektir.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="add-review-form" style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eee", maxWidth: "480px" }} noValidate>
      <div style={{ marginBottom: "14px" }}>
        <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "#555" }}>Puanınız</label>
        <div className="d-flex" style={{ gap: "4px" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              style={{ background: "none", border: "none", padding: "4px", cursor: "pointer", fontSize: "20px", lineHeight: 1 }}
            >
              <i
                className={`icon-star ${(hoverRating || rating) >= star ? "star-filled" : "star-empty"}`}
                style={{ color: (hoverRating || rating) >= star ? "#FFC107" : "#ddd" }}
              />
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "14px" }}>
        <label htmlFor="review-comment" style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "#555" }}>
          Yorumunuz
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ürün hakkındaki düşüncelerinizi buraya yazın..."
          rows={3}
          style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }}
        />
      </div>

      <div style={{ marginBottom: "14px" }}>
        <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "#555" }}>
          Fotoğraf ekle (isteğe bağlı)
        </label>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleImageChange} style={{ display: "none" }} />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="tf-btn btn-line" style={{ fontSize: "13px" }}>
          Fotoğraf seç
        </button>
        {images.length > 0 && (
          <div className="d-flex flex-wrap gap-2" style={{ marginTop: "8px" }}>
            {images.map((file, i) => (
              <div key={i} className="position-relative" style={{ width: 56, height: 56 }}>
                <Image src={URL.createObjectURL(file)} alt="" width={56} height={56} style={{ objectFit: "cover", borderRadius: "6px", border: "1px solid #eee" }} />
                <button type="button" onClick={() => removeImage(i)} style={{ position: "absolute", top: "-6px", right: "-6px", width: 20, height: 20, borderRadius: "50%", background: "#333", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <div style={{ color: "#c62828", fontSize: "13px", marginBottom: "8px" }}>{error}</div>}

      <button type="submit" className="tf-btn btn-fill" disabled={isSubmitting}>
        {isSubmitting ? "Gönderiliyor..." : "Yorumu Gönder"}
      </button>
    </form>
  );
}
