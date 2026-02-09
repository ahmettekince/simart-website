"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * YouTube video URL'lerini embed formatına çeviren yardımcı fonksiyon
 */
export const getEmbedUrl = (url) => {
  if (!url) return "";
  // Zaten embed ise dokunma
  if (url.includes("/embed/")) return url;

  // watch?v=ID formatı
  const vMatch = url.match(/[?&]v=([^&]+)/);
  if (vMatch && vMatch[1]) {
    // autoplay=1: Otomatik oynat
    // rel=0: İlgili videoları gösterme
    // playsinline=1: Mobilde tam ekran yerine inline oynat (Hata önleyici)
    return `https://www.youtube.com/embed/${vMatch[1]}?autoplay=1&rel=0&playsinline=1`;
  }

  // youtu.be/ID formatı
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&rel=0&playsinline=1`;
  }

  return url;
};

/**
 * VideoModal Bileşeni
 *
 * @param {boolean} isOpen - Modalın açık olup olmadığını belirler.
 * @param {function} onClose - Modalı kapatmak için tetiklenecek fonksiyon.
 * @param {string} videoUrl - Oynatılacak videonun URL'i.
 */
export default function VideoModal({ isOpen, onClose, videoUrl }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Modal kapalıysa veya videoUrl yoksa render etme
  if (!isOpen || !videoUrl) return null;

  // Sadece client tarafında portal (body) ile render et
  // (Next.js SSR hatasını önlemek ve z-index sorunu yaşamamak için)
  if (!mounted) return null;

  const embedUrl = getEmbedUrl(videoUrl);

  const modalContent = (
    <>
      <div className="video-modal-overlay" onClick={onClose}>
        <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="video-modal-close" onClick={onClose}>
            &times;
          </button>
          <div className="ratio ratio-16x9">
            <iframe
              src={embedUrl}
              title="Video Oynatıcı"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              style={{ border: "none", width: "100%", height: "100%" }}
            ></iframe>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Video Modal Styles */
        .video-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999; /* Çok yüksek z-index */
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
          backdrop-filter: blur(5px);
        }

        .video-modal-content {
          position: relative;
          width: 100%;
          max-width: 900px;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          animation: scaleUp 0.3s ease-out;
        }

        .video-modal-close {
          position: absolute;
          top: -40px;
          right: 0;
          background: none;
          border: none;
          color: white;
          font-size: 32px;
          cursor: pointer;
          line-height: 1;
          padding: 0 10px;
          z-index: 10000;
          transition: transform 0.2s;
        }

        .video-modal-close:hover {
            transform: scale(1.1);
        }

        @media (min-width: 768px) {
          .video-modal-close {
            top: 15px;
            right: 15px;
            background: rgba(0, 0, 0, 0.6);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .video-modal-close:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleUp {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );

  return createPortal(modalContent, document.body);
}
