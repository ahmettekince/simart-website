"use client";

import { useState } from "react";
import Accordion from "@/components/common/Accordion";
import { defaultFaqTabs, defaultFaqTabsEn } from "@/data/faqs";
import { useLangStore } from "@/stores/langStore";

export default function DefaultFaqSection() {
  const { lang } = useLangStore();
  const [activeTab, setActiveTab] = useState(0);
  
  const currentTabs = lang === "en" ? defaultFaqTabsEn : defaultFaqTabs;
  const tab = currentTabs[activeTab];

  const t = {
    tr: {
      title: "Sıkça Sorulan Sorular"
    },
    en: {
      title: "Frequently Asked Questions"
    }
  }[lang] || { tr: { title: "Sıkça Sorulan Sorular" } }.tr;

  return (
    <div className="sss-default-faq">
      <h5 className="mb_30">{t.title}</h5>

      {/* Tab navigation */}
      <ul className="nav sss-faq-tabs mb_30" role="tablist">
        {currentTabs.map((t, idx) => (
          <li key={t.id} className="nav-item">
            <button
              type="button"
              className={`nav-link ${activeTab === idx ? "active" : ""}`}
              onClick={() => setActiveTab(idx)}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Tab content */}
      <div className="sss-faq-content">
        <div className="flat-accordion style-default has-btns-arrow mb_60">
          <Accordion faqs={tab?.faqs || []} initialIndex={-1} />
        </div>
      </div>

    </div>
  );
}
