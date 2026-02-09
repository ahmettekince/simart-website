import React from "react";
import Image from "next/image";
import Header from "@/components/headers/Header";
import { getTimeline } from "@/api/timeline";

export const metadata = {
  title: "Kilometre Taşları",
  description: "Şımart'ın kilometre taşları ve önemli tarihleri",
};

/** Tarih string'inden yıl çıkarır (örn: "1999-01-25" → "1999") */
function formatTimelineDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return "";
  const year = dateStr.split("-")[0];
  return year || dateStr;
}

export default async function KilometreTaslariPage() {
  const items = await getTimeline();

  return (
    <>
      <Header />
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Kilometre Taşları</div>
        </div>
      </div>
      <section className="flat-spacing-12">
        <div className="container">
          <div className="tf-timeline-wrap position-relative">
            <div className="tf-timeline-line" />
            {items.length === 0 ? (
              <div className="text-center py-5 text-muted">
                Henüz kilometre taşı eklenmemiş.
              </div>
            ) : (
              items.map((item, idx) => {
                const media = item?.media;
                const imageUrl =
                  media?.url ||
                  media?.thumbnail_url ||
                  "/images/shop/file/timeline1.jpg";
                const isContentEnd = idx % 2 === 0;
                const dateLabel = formatTimelineDate(item.date);

                return (
                  <div
                    key={item.id ?? idx}
                    className="tf-timeline-item z-2 position-relative"
                  >
                    <div
                      className={`tf-timeline-inner d-flex align-items-center justify-content-between ${isContentEnd ? "tf-timeline-content-end" : ""}`}
                    >
                      <span className="tf-timeline-time">{dateLabel}</span>
                      <div className="tf-timeline-content">
                        <h4 className="tf-timeline-title">{item.title}</h4>
                        <div className="tf-timeline-description">
                          {item.description}
                        </div>
                      </div>
                      <div className="tf-timeline-image">
                        <Image
                          className="lazyload"
                          alt={item.title || "Kilometre taşı"}
                          src={imageUrl}
                          width={800}
                          height={593}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </>
  );
}
