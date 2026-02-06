import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function CollectionBanner({ banner = null }) {
  // API'den veri gelmezse component render edilmez
  if (!banner || !banner.images) {
    return null;
  }

  const { images, title, subtitle, description, link, button_text } = banner;

  return (
    <section className="flat-spacing-8 pb_0">
      <div className="container">
        <div className="tf-banner-collection">
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
              loading="lazy"
            />
          </div>
          {/* Tablet Version (768px - 1023px) - Tablet varsa tablet, yoksa desktop */}
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
              loading="lazy"
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
              loading="lazy"
            />
          </div>
          <div className="box-content">
            <div className="container wow fadeInUp" data-wow-delay="0s">
              {subtitle && (
                <div className="sub fw-7 text_white">
                  {subtitle}
                </div>
              )}
              {title && (
                <h2 className="heading fw-6 text_white">{title}</h2>
              )}
              {description && (
                <p className="text_white">{description}</p>
              )}
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
        </div>
      </div>
    </section>
  );
}
