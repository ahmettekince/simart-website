import React from "react";
import Image from "next/image";

import { getTimeline } from "@/api/timeline";
import { AboutLayout } from "@/components/about/about-layout";
import { VideoSection } from "@/components/about/video-section";


export async function generateMetadata({ params }) {
  const { lang } = await params;
  const isEn = lang === "en";
  return {
    title: isEn ? "Milestones - Şımart Technology" : "Kilometre Taşları - Şımart Teknoloji",
    description: isEn ? "Şımart's milestones and important dates" : "Şımart'ın kilometre taşları ve önemli tarihleri",
  };
}
/** Tarih string'inden yıl çıkarır (örn: "1999-01-25" → "1999") */
function formatTimelineDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return "";
  const year = dateStr.split("-")[0];
  return year || dateStr;
}

export default async function KilometreTaslariPage({ params }) {
  const { lang } = await params;
  const isEn = lang === "en";
  const items = await getTimeline(lang);

  return (
    <>
      <AboutLayout currentSectionId="kilometre-taslari" lang={lang}>
        {/* Section Title */}
        <div className="mb-4">
          <h1
            className="about-section-title"
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "var(--primary, #3c81b5)",
              borderBottom: "3px solid var(--primary, #3c81b5)",
              display: "inline-block",
              paddingBottom: "8px",
              textTransform: "uppercase",
              marginBottom: "24px",
            }}
          >
            {isEn ? "MILESTONES" : "KİLOMETRE TAŞLARI"}
          </h1>
        </div>

        <div className="tf-timeline-wrap position-relative">
          <div className="tf-timeline-line" />
          {items.length === 0 ? (
            <div className="text-center py-5 text-muted">
              {isEn ? "No milestones added yet." : "Henüz kilometre taşı eklenmemiş."}
            </div>
          ) : (
            items.map((item, idx) => {
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
                      <h4
                        className="tf-timeline-title"
                        dangerouslySetInnerHTML={{ __html: item.title }}
                      />
                      <div
                        className="tf-timeline-description"
                        dangerouslySetInnerHTML={{ __html: item.description }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}

        </div>
        <div className="mt-5">
          <div className="row justify-content-end">
            <div className="col-12">
              <div className="text-center mb-3">
                <h4 className="fw-bold">{isEn ? "Şımart Introduction Video" : "Şımart Tanıtım Filmi"}</h4>
              </div>
              <VideoSection lang={lang} />
            </div>
          </div>
        </div>
      </AboutLayout>

    </>
  );
}
