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
            const imageUrl = images?.url || images?.desktop?.url || images?.tablet?.url || images?.mobile?.url;

            if (!imageUrl) return null;

            return (
              <div key={collection.id || index} className="col-12 col-md-6">
                <div className="collection-item-v4 lg hover-img h-100">
                  <div className="collection-inner h-100">
                    {link ? (
                      <Link
                        href={link}
                        className="radius-20 collection-image img-style"
                      >
                        <Image
                          className="lazyload"
                          data-src={imageUrl}
                          alt={title || "collection"}
                          src={imageUrl}
                          width={600}
                          height={400}
                        />
                      </Link>
                    ) : (
                      <div className="radius-20 collection-image img-style">
                        <Image
                          className="lazyload"
                          data-src={imageUrl}
                          alt={title || "collection"}
                          src={imageUrl}
                          width={600}
                          height={400}
                        />
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
                          text={"shop now"}
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
