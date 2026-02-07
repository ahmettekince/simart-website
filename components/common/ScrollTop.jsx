"use client";
import React, { useEffect, useState } from "react";

export default function ScrollTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrolled, setScrolled] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(1);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // You can use 'auto' or 'instant' as well
    });
  };

  const handleScroll = () => {
    const currentScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const totalScrollHeight = Math.max(
      1,
      document.documentElement.scrollHeight - document.documentElement.clientHeight
    );
    setScrolled(currentScroll);
    setShowScrollTop(window.scrollY >= window.innerHeight);
    setScrollHeight(totalScrollHeight);
  };

  useEffect(() => {
    handleScroll(); // İlk yüklemede scrollHeight hesapla
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Sayfa viewport'a sığıyorsa (scroll yok) butonu gösterme
  const hasScrollableContent = scrollHeight > 1;
  if (!hasScrollableContent) return null;

  return (
    <div
      className={`progress-wrap ${scrolled > 150 ? "active-progress" : ""}`}
      onClick={() => scrollToTop()}
    >
      <svg
        className="progress-circle svg-content"
        width="100%"
        height="100%"
        viewBox="-1 -1 102 102"
      >
        <path
          d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"
          style={{
            strokeDasharray: "307.919, 307.919",
            strokeDashoffset: 307.919 - (scrolled / scrollHeight) * 307.919,
          }}
        />
      </svg>
    </div>
  );
}
