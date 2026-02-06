"use client";
import React, { useState, useEffect, useRef } from "react";

const VIDEOS = [
  "https://cdn.simart.cloud/uploads/media/2026/02/6985eb44024bb_1770384196.mp4",
  "https://cdn.simart.cloud/uploads/media/2026/02/6985eb446098e_1770384196.mp4",
  "https://cdn.simart.cloud/uploads/media/2026/02/6985eb4367e6b_1770384195.mp4"
];

/**
 * Ürün detay sayfası için basit ve şık video player
 * Sayfa açıldıktan sonra otomatik açılır ve oynatır
 * Birden fazla video desteği (dikey kaydırmalı)
 */
export default function ProductVideoPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Otomatik oynatma için varsayılan sessiz başla
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  // Yüklenen (görüntülenen) videoları takip et: Sadece 0. index ile başla
  const [loadedIndices, setLoadedIndices] = useState([0]);

  const videoRefs = useRef([]);
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Sayfa yüklendikten sonra (biraz gecikmeli) otomatik aç
  useEffect(() => {
    // 2.5 saniye gecikme (istek üzerine artırıldı)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // IntersectionObserver ile aktif videoyu belirle, loop kontrolü ve LAZY LOAD
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index);
            const isClone = entry.target.dataset.clone === "true";

            // LAZY LOAD: Görüntülenen videoyu yüklenenler listesine ekle
            setLoadedIndices(prev => {
              if (prev.includes(index)) return prev;
              return [...prev, index];
            });

            setActiveIndex(index);
          }
        });
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.6,
      }
    );

    const slides = scrollContainerRef.current.querySelectorAll(".video-slide");
    slides.forEach((slide) => observer.observe(slide));

    return () => observer.disconnect();
  }, [isOpen]);

  // Aktif videoyu oynat/durdur ve eventleri yönet
  useEffect(() => {
    if (!isOpen) return;

    // Slide değişince progress'i sıfırla
    setProgress(0);

    // Tüm videoları durdur (aktif hariç)
    videoRefs.current.forEach((vid, idx) => {
      if (vid && idx !== activeIndex) {
        vid.pause();
        vid.currentTime = 0;
      }
    });

    // Aktif videoyu oynat
    const activeVideo = videoRefs.current[activeIndex];
    if (activeVideo) {
      activeVideo.muted = isMuted;

      const playPromise = activeVideo.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.log("Autoplay failed:", error);
            setIsPlaying(false);
            activeVideo.muted = true;
            setIsMuted(true);
            activeVideo.play();
          });
      }

      // Event Listener Ekleme
      const handleTimeUpdate = () => {
        if (activeVideo.duration && activeVideo.duration > 0) {
          const pct = (activeVideo.currentTime / activeVideo.duration) * 100;
          setProgress(pct);
        } else {
          setProgress(0);
        }
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      activeVideo.addEventListener("timeupdate", handleTimeUpdate);
      activeVideo.addEventListener("play", handlePlay);
      activeVideo.addEventListener("pause", handlePause);

      return () => {
        activeVideo.removeEventListener("timeupdate", handleTimeUpdate);
        activeVideo.removeEventListener("play", handlePlay);
        activeVideo.removeEventListener("pause", handlePause);
      };
    }
  }, [activeIndex, isOpen]);

  // Fullscreen değişiminde scroll pozisyonunu koru
  useEffect(() => {
    // Boyut değiştiğinde, aktif videonun ekrana tam oturmasını sağla
    // Kısa bir gecikme DOM update için iyidir
    if (scrollContainerRef.current) {
      const targetIndex = activeIndex;
      // Eğer clone ise 0'a, değilse kendisine
      // Ancak bizim clone mantığımızda en son 'clone' görünüyorsa activeIndex değişmiş olabilir mi?
      // Observer logic clone görünce activeIndex=0 yapıyor.
      // Biz sadece activeIndex'e gitsek yeterli.

      setTimeout(() => {
        const slide = scrollContainerRef.current.querySelector(`.video-slide[data-index="${targetIndex}"]`);
        if (slide) slide.scrollIntoView({ behavior: "auto" });
      }, 100);
    }
  }, [isFullscreen]);

  const handleClose = () => {
    // Tüm videoları durdur
    videoRefs.current.forEach(vid => vid && vid.pause());
    setIsOpen(false);
  };

  const handleToggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    // Tüm videoların mute durumunu güncelle (veya sadece aktif olanı)
    videoRefs.current.forEach(vid => {
      if (vid) vid.muted = newState;
    });
  };

  const handleToggleFullscreen = (e) => {
    if (e) e.stopPropagation();
    // Nativefullscreen yerine CSS fullscreen (state tabanlı)
    setIsFullscreen((prev) => !prev);
  };

  const handleProgressClick = (e) => {
    const activeVideo = videoRefs.current[activeIndex];
    if (!activeVideo) return;

    // Stop propagation handled in parent
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    activeVideo.currentTime = percent * activeVideo.duration;
  };

  const scrollNext = (e) => {
    e.stopPropagation();
    const container = scrollContainerRef.current;
    if (!container) return;

    if (activeIndex < VIDEOS.length - 1) {
      // Normal sonraki
      const nextIndex = activeIndex + 1;
      const slide = container.querySelector(`.video-slide[data-index="${nextIndex}"]`);
      if (slide) slide.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollPrev = (e) => {
    e.stopPropagation();
    const container = scrollContainerRef.current;
    if (!container) return;

    if (activeIndex > 0) {
      const prevIndex = activeIndex - 1;
      const slide = container.querySelector(`.video-slide[data-index="${prevIndex}"]`);
      if (slide) slide.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`product-video-player-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
      <div
        className="product-video-player-container"
        ref={containerRef}
        onClick={handleToggleFullscreen}
        style={{ cursor: "pointer" }}
      >
        {/* Progress Bar (Aktif video için) */}
        <div className="product-video-progress" onClick={(e) => { e.stopPropagation(); handleProgressClick(e); }}>
          <div
            className="product-video-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="product-video-controls" onClick={(e) => e.stopPropagation()}>
          <button
            className="product-video-control-btn"
            onClick={handleToggleFullscreen}
            aria-label="Tam ekran"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
          <button
            className="product-video-control-btn"
            onClick={handleToggleMute}
            aria-label={isMuted ? "Sesi aç" : "Sesi kapat"}
          >
            {isMuted ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
          <button
            className="product-video-control-btn"
            onClick={handleClose}
            aria-label="Kapat"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation Arrows (Right Middle) */}
        <div className="product-video-nav-arrows">
          <button
            className="nav-arrow-btn"
            onClick={scrollPrev}
            aria-label="Önceki video"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
          <button
            className="nav-arrow-btn"
            onClick={scrollNext}
            aria-label="Sonraki video"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Swipe Hint Animation */}
        <div className="swipe-hint-overlay">
          <div className="swipe-hand">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
              <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
          </div>
        </div>

        {/* Video List (Scrollable) */}
        <div className="product-video-scroll-container" ref={scrollContainerRef}>
          {VIDEOS.map((url, index) => (
            <div key={`original-${index}`} className="video-slide" data-index={index}>
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={loadedIndices.includes(index) ? url : undefined}
                className="product-video-element"
                playsInline
                loop
                muted={isMuted}
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .product-video-player-wrapper {
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 9999;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideUpFromBottom 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .product-video-player-wrapper.fullscreen {
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            border-radius: 0 !important;
            z-index: 2147483647; /* Max z-index */
            background: #000;
        }

        .product-video-player-wrapper.fullscreen .product-video-player-container {
             width: 100% !important;
             height: 100% !important;
             max-width: none !important;
             aspect-ratio: unset !important;
             border-radius: 0 !important;
             box-shadow: none;
        }

        @keyframes slideUpFromBottom {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .product-video-player-container {
          position: relative;
          width: 280px;
          max-width: calc(100vw - 40px);
          aspect-ratio: 9 / 16;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        
        .product-video-scroll-container {
            display: flex;
            flex-direction: column;
            gap: 15px;
            width: 100%;
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
            scroll-snap-type: y mandatory;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE */
            overscroll-behavior: contain; /* Prevent parent scroll chaining */
        }
        
        .product-video-scroll-container::-webkit-scrollbar {
            display: none; /* Chrome/Safari */
        }
        
        .video-slide {
            width: 100%;
            height: 100%;
            scroll-snap-align: start;
            scroll-snap-stop: always;
            position: relative;
        }

        .product-video-progress {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          cursor: pointer;
          z-index: 20;
        }

        .product-video-progress-bar {
          height: 100%;
          background: #fff;
          transition: width 0.1s linear;
        }

        .product-video-controls {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
          z-index: 20;
        }

        .product-video-control-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.6);
          border: none;
          border-radius: 6px;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(10px);
        }

        .product-video-control-btn:hover {
          background: rgba(0, 0, 0, 0.8);
          transform: scale(1.05);
        }

        .product-video-control-btn:active {
          transform: scale(0.95);
        }

        .product-video-control-btn svg {
          stroke: #fff;
        }

        .product-video-element {
          width: 100%;
          height: 100%;
          object-fit: contain; /* Fullscreen'de contain iyi, mobilde cover istenebilir ama contain güvenli */
          display: block;
        }
        
        /* Video slide'ı mobilde tam oturtmak için */
        .video-slide {
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000;
        }

        .product-video-nav-arrows {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 25;
            pointer-events: none; /* Allow click through container where buttons aren't */
        }

        .nav-arrow-btn {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            pointer-events: auto;
            backdrop-filter: blur(4px);
            transition: all 0.2s;
        }

        .nav-arrow-btn:hover {
            background: rgba(0, 0, 0, 0.7);
            transform: scale(1.1);
        }

        .nav-arrow-btn.disabled {
            opacity: 0.3;
            cursor: default;
        }

        /* Swipe Hint Animation */
        .swipe-hint-overlay {
            position: absolute;
            inset: 0;
            z-index: 15;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            opacity: 0;
            animation: fadeInOut 2.5s ease-in-out 1 forwards;
            animation-delay: 1s;
        }

        .swipe-hand {
            width: 40px;
            height: 48px;
            animation: swipeUp 1.5s ease-in-out infinite;
        }

        @keyframes fadeInOut {
            0% { opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; display: none; }
        }

        @keyframes swipeUp {
            0% { transform: translateY(10px); opacity: 0.5; }
            50% { transform: translateY(-10px); opacity: 1; }
            100% { transform: translateY(10px); opacity: 0.5; }
        }

        /* Mobilde daha küçük ve toolbar üstünde */
        @media (max-width: 768px) {
          .product-video-player-wrapper {
            bottom: 95px;
            left: 12px;
            right: auto;
          }

          .product-video-player-container {
            width: 45vw;
            max-width: 200px;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
          }

          .product-video-controls {
            top: 4px;
            right: 4px;
            gap: 4px;
            transform: scale(0.8);
            transform-origin: top right;
          }

          .product-video-control-btn {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
}
