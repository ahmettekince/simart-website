"use client";

import React from "react";

const MAX_DOTS = 5;

/**
 * Pill-shaped navigation dots (slider/carousel).
 * Max 5 dots; aktif nokta büyük, diğerleri küçük. Active color #3c81b5.
 */
export default function NavDotsPill({
  total = 1,
  activeIndex = 0,
  onDotClick,
  className = "",
  ariaLabel = "Slider sayfaları",
}) {
  if (total <= 0) return null;

  const dotCount = Math.min(total, MAX_DOTS);
  const safeIndex = Math.max(0, Math.min(activeIndex, total - 1));

  // total > 5: map slide index to display index 0..4
  const activeDisplayIndex =
    total <= MAX_DOTS
      ? safeIndex
      : Math.round((safeIndex / (total - 1)) * (dotCount - 1));

  const handleDotClick = (displayIndex) => {
    if (total <= MAX_DOTS) {
      onDotClick?.(displayIndex);
    } else if (dotCount <= 1) {
      onDotClick?.(0);
    } else {
      const slideIndex = Math.round(
        (displayIndex / (dotCount - 1)) * (total - 1)
      );
      onDotClick?.(slideIndex);
    }
  };

  return (
    <div
      className={`nav-dots-pill ${className}`.trim()}
      role="tablist"
      aria-label={ariaLabel}
    >
      <div className="nav-dots-pill__inner">
        {Array.from({ length: dotCount }, (_, i) => (
          <span key={i} className="nav-dots-pill__cell">
            <button
              type="button"
              role="tab"
              aria-selected={i === activeDisplayIndex}
              aria-label={`Slide ${i + 1}`}
              className={`nav-dots-pill__dot ${i !== activeDisplayIndex ? "nav-dots-pill__dot--small" : ""} ${i === activeDisplayIndex ? "nav-dots-pill__dot--active" : ""}`}
              onClick={() => handleDotClick(i)}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
