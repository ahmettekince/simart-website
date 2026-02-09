"use client";

import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { siteConfig } from "@/config/site";

/**
 * Tekil kullanılabilir reCAPTCHA v2 widget.
 * Site key config/site.js veya NEXT_PUBLIC_RECAPTCHA_SITE_KEY ile yönetilir.
 * Doğrulama kullanıcı kutusu işaretleyince yapılır (test key dahil).
 *
 * @param {string} [containerId] - Widget container id (sayfada birden fazla widget varsa benzersiz olmalı)
 * @param {(verified: boolean) => void} onVerifiedChange - Doğrulama durumu değişince çağrılır
 * @param {string} [className] - Dış wrapper için ek class
 * @param {object} [style] - Dış wrapper için ek stil
 */
const RecaptchaWidget = forwardRef(function RecaptchaWidget(
  { containerId = "recaptcha-widget", onVerifiedChange, className = "", style = {} },
  ref
) {
  const recaptchaRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const siteKey = (siteConfig?.site?.recaptchaSiteKey || (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) || "").trim();
  const isEmpty = !siteKey;

  // Key yoksa: widget gösterme, form geçer say (doğrulama atlanır)
  useEffect(() => {
    if (isEmpty) {
      onVerifiedChange?.(true);
      setLoaded(true);
    }
  }, [isEmpty, onVerifiedChange]);

  // Site key varsa (test veya gerçek) Google widget render - kullanıcı kutuya tıklar
  useEffect(() => {
    if (isEmpty) return;

    const checkRecaptcha = () => {
      if (typeof window === "undefined" || !window.grecaptcha?.render) {
        setTimeout(checkRecaptcha, 100);
        return;
      }
      setLoaded(true);
      if (!recaptchaRef.current || recaptchaRef.current.hasChildNodes()) return;

      const widgetId = window.grecaptcha.render(recaptchaRef.current, {
        sitekey: siteKey,
        callback: () => onVerifiedChange?.(true),
        "expired-callback": () => onVerifiedChange?.(false),
        "error-callback": () => onVerifiedChange?.(false),
      });
      widgetIdRef.current = widgetId;
    };

    if (document.readyState === "complete") {
      checkRecaptcha();
    } else {
      window.addEventListener("load", checkRecaptcha);
      return () => window.removeEventListener("load", checkRecaptcha);
    }
  }, [siteKey, isEmpty, onVerifiedChange]);

  useImperativeHandle(ref, () => ({
    reset() {
      if (isEmpty) {
        onVerifiedChange?.(true);
        return;
      }
      if (typeof window !== "undefined" && window.grecaptcha && widgetIdRef.current !== null) {
        window.grecaptcha.reset(widgetIdRef.current);
        onVerifiedChange?.(false);
      }
    },
  }));

  if (isEmpty) {
    return null;
  }

  return (
    <div className={className} style={style}>
      <div ref={recaptchaRef} id={containerId} />
      {!loaded && (
        <div style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
          reCAPTCHA yükleniyor...
        </div>
      )}
      <div className="mt-2" style={{ fontSize: "12px", color: "#666" }}>
        <span>reCAPTCHA</span>
        <span className="mx-1">•</span>
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#666" }}>
          Gizlilik
        </a>
        <span className="mx-1">•</span>
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: "#666" }}>
          Şartlar
        </a>
      </div>
    </div>
  );
});

export default RecaptchaWidget;
