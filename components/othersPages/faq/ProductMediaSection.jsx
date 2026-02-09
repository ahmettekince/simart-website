"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import VideoModal from "@/components/common/VideoModal";
import Accordion from "@/components/common/Accordion";

/**
 * Ürün detayında görsel + YouTube linki + Kullanım kılavuzu kartları.
 * Veriler /api/proxy/products/[slug] üzerinden çekilir.
 */
export default function ProductMediaSection({ product }) {
  const [mediaData, setMediaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDocument, setShowDocument] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const productName = product?.name ?? product?.title ?? "Ürün";

  // Ürün görseli (cover_image, gallery_images veya images dizisinden)
  const rawImage =
    product?.cover_image ||
    (Array.isArray(product?.gallery_images) && product.gallery_images[0]) ||
    (Array.isArray(product?.images) && product.images[0]) ||
    null;

  const imageUrl =
    typeof rawImage === "string"
      ? rawImage
      : rawImage?.url || rawImage?.thumbnail_url || "";

  // Veri çekme işlemi
  useEffect(() => {
    if (product?.slug) {
      setLoading(true);
      fetch(`/api/proxy/products/${product.slug}`)
        .then((res) => res.json())
        .then((res) => {
          if (res?.status === "success" && res?.data) {
            setMediaData(res.data);
          }
        })
        .catch((err) => console.error("Media fetch error:", err))
        .finally(() => setLoading(false));
    }
  }, [product?.slug]);

  const youtubeUrl = mediaData?.video_url || product?.youtube_url || "";
  const manualUrl = mediaData?.document_link || "https://documents.simart.me/katyau/";
  const manualTitle =
    product?.manual_title ?? `${productName} Kılavuzunu görüntüleyin`;

  // Kılavuz görüntüle butonu işlevi
  const handleManualClick = (e) => {
    e.preventDefault();
    if (manualUrl) {
      setShowDocument(!showDocument);
    }
  };

  return (
    <div id="product-media-section" className="product-media-section mb_40">
      <div className="row g-3 align-items-stretch">
        {/* Ürün Görseli */}
        <div className="col-12 col-md-4">
          <div className="product-media-card product-media-card-image d-block">
            <div className="card-inner">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={productName}
                  width={260}
                  height={160}
                  style={{ objectFit: "contain", maxWidth: "100%", height: "auto" }}
                />
              ) : (
                <div className="text-muted small">Görsel bulunamadı</div>
              )}
              {/* <span className="label">Ürün Görseli</span> */}
              <Link
                href={`/magaza/${(() => {
                  // 1. product.category.slug varsa
                  if (product?.category?.slug) return product.category.slug;

                  // 2. product.categories dizisi varsa
                  if (Array.isArray(product?.categories) && product.categories.length > 0) {
                    const cat = product.categories[0];
                    if (cat.slug) return cat.slug;
                    if (cat.name) {
                      return cat.name
                        .toLowerCase()
                        .replace(/ğ/g, "g")
                        .replace(/ü/g, "u")
                        .replace(/ş/g, "s")
                        .replace(/ı/g, "i")
                        .replace(/ö/g, "o")
                        .replace(/ç/g, "c")
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "");
                    }
                  }

                  // 3. Varsayılan
                  return "urunler";
                })()
                  }/${product?.slug}`}
                className="simart-btn simart-btn--outline mt-2"
              >
                Ürünü İncele
              </Link>
            </div>
          </div>
        </div>

        {/* YouTube */}
        {youtubeUrl && (
          <div className="col-12 col-md-4">
            <div className="product-media-card product-media-card-youtube d-block">
              <div className="card-inner">
                <span className="product-media-youtube-icon">
                  <svg
                    width="64"
                    height="44"
                    viewBox="0 0 64 44"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M62.5 6.8C61.4 2.5 58.2 0 53.3 0H10.7C5.8 0 2.6 2.5 1.5 6.8 0 11 .5 22 .5 22s.5 11 1.5 15.2c1.1 4.3 4.3 6.8 9.2 6.8h42.6c4.9 0 8.1-2.5 9.2-6.8 1-4.2 1.5-15.2 1.5-15.2s-.5-11-1.5-15.2z"
                      fill="#FF0000"
                    />
                    <path d="M26 31V13l21 9-21 9z" fill="#fff" />
                  </svg>
                </span>
                <span className="label">Tanıtım Videosu</span>
                <button
                  onClick={() => setShowVideo(true)}
                  className="simart-btn simart-btn--outline mt-2"
                >
                  Videoyu izle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Kullanım Kılavuzu */}
        {manualUrl && (
          <div className="col-12 col-md-4">
            <div className="product-media-card product-media-card-manual d-block">
              <div className="card-inner">
                <span className="icon-pdf">
                  <svg
                    width="48"
                    height="60"
                    viewBox="0 0 48 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 0C3.6 0 0 3.6 0 8v44c0 4.4 3.6 8 8 8h32c4.4 0 8-3.6 8-8V20L28 0H8z"
                      fill="#E53935"
                    />
                    <path d="M28 0v20h20L28 0z" fill="#B71C1C" />
                    <path
                      d="M12 36h8v2h-8v-2zm0 6h12v2H12v-2zm0 6h10v2H12v-2z"
                      fill="#fff"
                    />
                    <path
                      d="M28 38h-4v2h4c2.2 0 4-1.8 4-4s-1.8-4-4-4h-4v2h4c1.1 0 2 .9 2 2s-.9 2-2 2z"
                      fill="#fff"
                    />
                  </svg>
                </span>
                <span className="manual-title">{manualTitle}</span>
                <button
                  onClick={handleManualClick}
                  className="simart-btn simart-btn--outline mt-2"
                >
                  {showDocument ? "Kılavuzu Gizle" : "Kılavuzu Görüntüle"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PDF / Belge Iframe Alanı */}
      {showDocument && manualUrl && (
        <div className="row mt-4 fade-in-up">
          <div className="col-12">
            <div className="ratio ratio-16x9 border rounded shadow-sm" style={{ minHeight: "600px" }}>
              <iframe
                src={manualUrl}
                title="Kullanım Kılavuzu"
                allowFullScreen
                style={{ border: "none", width: "100%", height: "100%" }}
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Sıkça Sorulan Sorular (Accordion) */}
      {mediaData?.faq_data && mediaData.faq_data.length > 0 && (
        <div className="row mt-5">
          <div className="col-12">
            <h5 className="mb-4">Sıkça Sorulan Sorular</h5>
            <div className="accordion-section">
              <Accordion
                faqs={mediaData.faq_data.map(item => ({
                  title: item.question,
                  content: item.answer
                }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reusable Video Modal */}
      <VideoModal
        isOpen={showVideo}
        onClose={() => setShowVideo(false)}
        videoUrl={youtubeUrl}
      />

      <style jsx>{`
        .fade-in-up {
          animation: fadeInUp 0.5s ease-out;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
