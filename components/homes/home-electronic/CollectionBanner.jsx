import React from "react";
import Image from "next/image";
import Link from "next/link";
import { parseVariationTexts, getPositionStyle, getButtonPositionWhenTextsExist, parseCssToStyle, normalizeLineBreaks, ROW_TOP_LEFT, ROW_TOP_CENTER, ROW_TOP_RIGHT, ROW_MID_LEFT, ROW_MID_CENTER, ROW_MID_RIGHT, ROW_BOT_LEFT, ROW_BOT_CENTER, ROW_BOT_RIGHT } from "@/utils/bannerVariations";

export default function CollectionBanner({ banner = null }) {
  if (!banner || !banner.images) {
    return null;
  }

  const { images, title, subtitle, description, link, button_text } = banner;

  // variation_texts: desktop varsa desktop, yoksa mobile
  const variationTexts =
    images?.desktop?.variation_texts ||
    images?.mobile?.variation_texts ||
    [];
  const { btn, texts } = parseVariationTexts(variationTexts);

  // variation_texts yoksa fallback: eski alanlar (title, subtitle, link, button_text)
  const hasVariations = btn || texts.length > 0;

  const fallbackContent = !hasVariations && (
    <div className="box-content">
      <div className="container wow fadeInUp" data-wow-delay="0s" suppressHydrationWarning>
        {subtitle && <div className="sub fw-7 text_white">{subtitle}</div>}
        {title && <h2 className="heading fw-6 text_white">{title}</h2>}
        {description && <p className="text_white">{description}</p>}
        {link && (
          <Link
            href={link}
            className="tf-btn btn-primary-main style-3 fw-6 btn-light-icon animate-hover-btn"
            style={{ borderRadius: 12 }}
          >
            <span>{button_text || "Shop Collection"}</span>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <section className="flat-spacing-8 pb_0">
      <div className="container">
        <div className="tf-banner-collection tf-banner-with-variations">
          {/* Desktop Version (>= 1024px) */}
          <div className="d-none d-lg-block w-100">
            <Image
              src={images?.desktop?.url}
              alt={title || "img-banner"}
              width={1400}
              height={532}
              className="w-100 h-auto"
              style={{ objectFit: "cover" }}
              sizes="100vw"
              quality={100}
              priority={true}
              loading="eager"
              fetchPriority="high"
            />
          </div>
          {/* Tablet Version (768px - 1023px) */}
          <div className="d-none d-md-block d-lg-none w-100">
            <Image
              src={images?.tablet?.url || images?.desktop?.url}
              alt={title || "img-banner"}
              width={1024}
              height={400}
              className="w-100 h-auto"
              style={{ objectFit: "cover" }}
              sizes="100vw"
              quality={100}
              priority={true}
              loading="eager"
              fetchPriority="high"
            />
          </div>
          {/* Mobile Version (< 768px) */}
          <div className="d-block d-md-none w-100">
            <Image
              src={images?.mobile?.url || images?.tablet?.url || images?.desktop?.url}
              alt={title || "img-banner"}
              width={600}
              height={400}
              className="w-100 h-auto"
              style={{ objectFit: "cover", maxWidth: "100%" }}
              sizes="100vw"
              quality={100}
              priority={true}
              loading="eager"
              fetchPriority="high"
            />
          </div>

          {hasVariations ? (
            <>
              <div className="d-none d-lg-block" style={{ position: "absolute", inset: 0 }}>
                {texts.map((t, i) => {
                  const rowMap = i === 0 ? { LEFT: ROW_TOP_LEFT, CENTER: ROW_TOP_CENTER, RIGHT: ROW_TOP_RIGHT } : { LEFT: ROW_MID_LEFT, CENTER: ROW_MID_CENTER, RIGHT: ROW_MID_RIGHT };
                  const rowStyle = rowMap[t.align] || (i === 0 ? ROW_TOP_LEFT : ROW_MID_CENTER);
                  const userStyle = parseCssToStyle(t.style);
                  return (
                    <div
                      key={t.key}
                      className={t.class || ""}
                      style={{
                        position: "absolute",
                        ...rowStyle,
                        pointerEvents: "none",
                        color: "#fff",
                        fontSize: "22px",
                        maxWidth: "85%",
                        padding: "0 0.75rem",
                        wordBreak: "break-all",
                        overflowWrap: "break-word",
                        whiteSpace: "pre-line",
                        lineHeight: 1.4,
                        ...userStyle,
                      }}
                    >
                      {normalizeLineBreaks(t.text)}
                    </div>
                  );
                })}
              </div>
              {btn && (btn.text || btn.link) && (
                <div
                  className="banner-overlay-btn"
                  style={{
                    position: "absolute",
                    padding: "0 0.75rem",
                    ...(texts.length > 0
                      ? getButtonPositionWhenTextsExist(btn)
                      : btn.position
                        ? getPositionStyle(btn.position)
                        : ROW_BOT_CENTER),
                  }}
                >
                  <Link
                    href={btn.link || link || "#"}
                    className={`tf-btn btn-primary-main style-3 fw-6 btn-light-icon animate-hover-btn ${btn.class || ""}`.trim()}
                    style={{ borderRadius: 12 }}
                  >
                    <span>{btn.text || button_text || "Shop Collection"}</span>
                  </Link>
                </div>
              )}
            </>
          ) : (
            fallbackContent
          )}
        </div>
      </div>
    </section>
  );
}
