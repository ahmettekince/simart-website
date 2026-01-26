"use client";
import Image from "next/image";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import Button from "@/components/common/Button";

export default function Collections({ collections = [] }) {
  // API'den veri gelmezse component render edilmez
  if (!collections || collections.length === 0) {
    return null;
  }

  return (
    <section className="flat-spacing-8 pb_0">
      <div className="container">
        <Swiper
          dir="ltr"
          modules={[Pagination]}
          slidesPerView={2}
          spaceBetween={15}
          breakpoints={{
            1200: { slidesPerView: 2, spaceBetween: 30 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            0: { slidesPerView: 1, spaceBetween: 15 },
          }}
          className="tf-sw-recent"
        >
          {collections.map((collection, index) => {
            const { images, title, subtitle, link, button_text } = collection;
            // Tüm cihazlarda aynı görseli kullan (responsive görsel yok)
            const imageUrl = images?.url || images?.desktop?.url || images?.tablet?.url || images?.mobile?.url;

            if (!imageUrl) return null;

            return (
              <SwiperSlide key={collection.id || index}>
                <div className="collection-item-v4 lg hover-img">
                  <div className="collection-inner">
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
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
