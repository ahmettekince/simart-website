"use client";

/**
 * Medya (foto/video) üzerinde overlay olarak kullanılan CTA butonu.
 * - Desktop: Foto içinde, sağa/sola yaslı
 * - Mobil: Yarısı foto üzerinde, yarısı foto dışında
 *
 * @param {React.ReactNode} children - Buton metni
 * @param {function} onClick - Tıklama handler
 * @param {React.ReactNode} [leftIcon] - Sol ikon (opsiyonel)
 * @param {React.ReactNode} [rightIcon] - Sağ ikon (opsiyonel)
 * @param {string} [ariaLabel] - Erişilebilirlik etiketi
 * @param {string} [className] - Ek CSS sınıfı
 * @param {string} [variant] - "default" | "primary" - gradient varyantı
 * @param {string} [position] - "left" | "right" - konum (varsayılan: right)
 */
export default function OverlayCtaButton({
  children,
  onClick,
  leftIcon = null,
  rightIcon = null,
  ariaLabel = "",
  className = "",
  variant = "default",
  position = "right",
}) {
  return (
    <button
      type="button"
      className={`overlay-cta-btn overlay-cta-btn--${variant} overlay-cta-btn--${position} ${className}`.trim()}
      onClick={onClick}
      aria-label={ariaLabel || (typeof children === "string" ? children : "Detay")}
    >
      {leftIcon && <span className="overlay-cta-btn__icon overlay-cta-btn__icon--left">{leftIcon}</span>}
      <span className="overlay-cta-btn__text">{children}</span>
      {rightIcon && <span className="overlay-cta-btn__icon overlay-cta-btn__icon--right">{rightIcon}</span>}
    </button>
  );
}

/**
 * Varsayılan play ikonu (video butonları için)
 */
export function PlayIcon({ size = 20 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
    </svg>
  );
}

/**
 * Varsayılan ok ikonu
 */
export function ArrowIcon({ size = 18 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
    </svg>
  );
}

/**
 * YouTube ikonu
 */
export function YoutubeIcon({ size = 18 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

/**
 * 3D model ikonu (küp/octahedron)
 */
export function Model3dIcon({ size = 16 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.09 5.1 7.63 12 4.18zM4 8.82l7 3.5v7.36l-7-3.5V8.82zm9 10.86v-7.36l7-3.5v7.36l-7 3.5z" />
    </svg>
  );
}
