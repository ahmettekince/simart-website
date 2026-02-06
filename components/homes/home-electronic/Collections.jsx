"use client";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/common/Button";

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
            
            // Eğer images objesi yoksa veya hiçbir görsel yoksa render etme
            if (!images || (!images.desktop?.url && !images.tablet?.url && !images.mobile?.url && !images.url)) {
              return null;
            }

            // Fallback: eğer images.url varsa (eski format), onu kullan
            const fallbackUrl = images.url;

            return (
              <div key={collection.id || index} className="col-12 col-md-6">
                <div className="collection-item-v4 lg hover-img h-100">
                  <div className="collection-inner h-100">
                    {link ? (
                      <Link
                        href={link}
                        className="radius-20 collection-image img-style"
                      >
                        {/* Desktop Version (>= 1024px) */}
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
                        {/* Tablet Version (768px - 1023px) */}
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
                        {/* Mobile Version (< 768px) */}
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
                      </Link>
                    ) : (
                      <div className="radius-20 collection-image img-style h-100">
                        {/* Desktop Version (>= 1024px) */}
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
                        {/* Tablet Version (768px - 1023px) */}
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
                        {/* Mobile Version (< 768px) */}
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
                      </div>
                    )}
                    <div
                      className="collection-content wow fadeInUp"
                      data-wow-delay="0s"
                    >
                      {subtitle && (
                        <p className="subheading">{subtitle}</p>
                      )}
                      {title && (
                        <h5 className="heading fw-6">{title}</h5>
                      )}
                      {link && (
                        <Button
                          href={link}
                          text={"Koleksiyona Git"}
                        />
                      )}
                    </div>
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
