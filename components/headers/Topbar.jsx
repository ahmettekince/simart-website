"use client";
import React from "react";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Topbar({ data = [], isActive = false }) {
  if (!isActive || !data || data.length === 0) return null;

  return (
    <div className="tf-top-bar bg_dark line">
      <div className="container-full px_15 lg-px_40">
        <div className="tf-top-bar_wrap grid-3 gap-30 align-items-center">
          <div className="tf-top-bar_left">
            <div className="d-flex gap-30 text_white fw-5">
            </div>
          </div>
          <div className="text-center overflow-hidden">
            <Swiper
              dir="ltr"
              className="swiper tf-sw-top_bar"
              slidesPerView={1}
              modules={[Autoplay]}
              speed={1000}
              autoplay={{
                delay: 2000,
              }}
              loop={data.length > 1}
            >
              {data.map((item, index) => (
                <SwiperSlide key={index} className="swiper-slide">
                  <p
                    className="top-bar-text fw-5 text_white"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

        </div>
      </div>
    </div>
  );
}
