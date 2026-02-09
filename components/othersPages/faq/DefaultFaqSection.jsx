"use client";

import { useState } from "react";
import Accordion from "@/components/common/Accordion";
import { defaultFaqTabs } from "@/data/faqs";

export default function DefaultFaqSection() {
  const [activeTab, setActiveTab] = useState(0);
  const tab = defaultFaqTabs[activeTab];

  return (
    <div className="sss-default-faq">
      <h5 className="mb_30">Sıkça Sorulan Sorular</h5>

      {/* Tab navigation */}
      <ul className="nav sss-faq-tabs mb_30" role="tablist">
        {defaultFaqTabs.map((t, idx) => (
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
