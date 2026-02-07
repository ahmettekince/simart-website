"use client";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/common/Button";
import { parseVariationTexts, getPositionStyle, getButtonPositionWhenTextsExist, parseCssToStyle, normalizeLineBreaks, ROW_TOP_LEFT, ROW_TOP_CENTER, ROW_TOP_RIGHT, ROW_MID_LEFT, ROW_MID_CENTER, ROW_MID_RIGHT, ROW_BOT_LEFT, ROW_BOT_CENTER, ROW_BOT_RIGHT } from "@/utils/bannerVariations";

export default function Collections({ collections = [] }) {
  if (!collections || collections.length === 0) {
    return null;
  }

  return (
    <section className="flat-spacing-8 pb_0">
      <div className="container">
        <div className="row g-3 g-md-4">
          {collections.map((collection, index) => {
            const { images, title, subtitle, link } = collection;

            if (!images || (!images.desktop?.url && !images.tablet?.url && !images.mobile?.url && !images.url)) {
              return null;
            }

            const fallbackUrl = images.url;
            const variationTexts =
              images?.desktop?.variation_texts ??
              images?.desktop?.variationTexts ??
              images?.mobile?.variation_texts ??
              images?.mobile?.variationTexts ??
              images?.variation_texts ??
              images?.variationTexts ??
              collection?.variation_texts ??
              collection?.variationTexts ??
              [];
            const { btn, texts } = parseVariationTexts(variationTexts);
            const hasVariations = btn || texts.length > 0;

            const ImageWrapper = link ? Link : "div";
            const imageWrapperProps = link ? { href: link } : {};

            return (
              <div key={collection.id || index} className="col-12 col-md-6">
                <div className="collection-item-v4 lg hover-img h-100">
                  <div className="collection-inner h-100 collection-with-overlay">
                    <ImageWrapper
                      {...imageWrapperProps}
                      className={link ? "radius-20 collection-image img-style" : "radius-20 collection-image img-style h-100"}
                    >
                      <div className="d-none d-lg-block w-100">
                        <Image
                          src={images.desktop?.url || fallbackUrl}
                          alt={title || "collection"}
                          width={800}
                          height={600}
                          className="w-100 h-auto"
                          style={{ objectFit: "cover" }}
                          sizes="(min-width: 1024px) 50vw, 100vw"
                          quality={100}
                          loading="lazy"
                        />
                      </div>
                      <div className="d-none d-md-block d-lg-none w-100">
                        <Image
                          src={images.tablet?.url || images.desktop?.url || fallbackUrl}
                          alt={title || "collection"}
                          width={600}
                          height={450}
                          className="w-100 h-auto"
                          style={{ objectFit: "cover" }}
                          sizes="(min-width: 768px) 50vw, 100vw"
                          quality={100}
                          loading="lazy"
                        />
                      </div>
                      <div className="d-block d-md-none w-100">
                        <Image
                          src={images.mobile?.url || images.tablet?.url || images.desktop?.url || fallbackUrl}
                          alt={title || "collection"}
                          width={600}
                          height={450}
                          className="w-100 h-auto"
                          style={{ objectFit: "cover" }}
                          sizes="100vw"
                          quality={100}
                          loading="lazy"
                        />
                      </div>
                    </ImageWrapper>

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
                                fontSize: "20px",
                                textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                                maxWidth: "85%",
                                padding: "0 0.75rem",
                                overflowWrap: "break-word",
                                whiteSpace: "pre-line",
                                lineHeight: 1.4,
                                ...userStyle,
                              }}
                            >
                              {normalizeLineBreaks(t.text ?? "")}
                            </div>
                          );
                        })}
                      </div>
                        {btn && (btn.text || btn.link) && (
                          <div
                            className="collection-overlay-btn"
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
                              <span>{btn.text || "Koleksiyona Git"}</span>
                            </Link>
                          </div>
                        )}
                      </>
                    ) : (
                      <div
                        className="collection-content wow fadeInUp"
                        data-wow-delay="0s"
                      >
                        {subtitle && <p className="subheading">{subtitle}</p>}
                        {title && <h5 className="heading fw-6">{title}</h5>}
                        {link && (
                          <Button href={link} text={"Koleksiyona Git"} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
