"use client";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

export default function CategoriesClient({ categories }) {
  return (
    <div className="sw-pagination-wrapper">
      <Swiper
        dir="ltr"
        slidesPerView={4}
        spaceBetween={30}
        breakpoints={{
          1200: { slidesPerView: 4 },
          992: { slidesPerView: 4 },
          768: { slidesPerView: 3 },
          0: { slidesPerView: 1 },
        }}
        loop={false}
        autoplay={false}
        className="tf-sw-collection"
        modules={[Pagination]}
        pagination={{ clickable: true, el: ".spd159" }}
      >
        {categories.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="collection-item-v2 type-small hover-img">
              <Link href={`/magaza/${item.slug || "collection-sub"}`} className="collection-inner">
                <div className="collection-image img-style radius-10">
                  <Image
                    className="lazyload"
                    alt={item.name}
                    src={item.image?.url || "/images/collections/collection-1.jpg"}
                    width={600}
                    height={730}
                  />
                </div>
                <div className="collection-content">
                  <div className="top">
                    <h5 className="heading fw-5">{item.name}</h5>
                    <p className="subheading">
                      <span>{item.product_count || 0} Ürün</span>
                    </p>
                  </div>
                  <div className="bottom">
                    <button className="tf-btn collection-title hover-icon btn-light rounded-full">
                      <span>Şimdi İncele</span>
                      <i className="icon icon-arrow1-top-left" />
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="box-sw-navigation">
        <div className="sw-dots style-2 medium sw-pagination-collection justify-content-center spd159" />
      </div>
    </div>
  );
}
