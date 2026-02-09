"use client";
import { faqs1 } from "@/data/faqs";
import React, { useEffect, useRef, useState } from "react";

export default function Accordion({ faqs = faqs1, initialIndex = -1 }) {
  const parentRefs = useRef([]);
  const questionRefs = useRef([]);
  const answerRefs = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  useEffect(() => {
    questionRefs.current.forEach((el) => {
      el?.classList.remove("active");
    });
    parentRefs.current.forEach((el) => {
      el?.classList.remove("active");
    });
    answerRefs.current.forEach((el) => {
      if (el) {
        el.style.height = "0px";
        el.style.overflow = "hidden";
        el.style.transition = "all 0.4s ease-in-out";
        el.style.paddingTop = "0px";
        el.style.paddingBottom = "0px";
      }
    });
    if (currentIndex !== -1) {
      const questionEl = questionRefs.current[currentIndex];
      if (questionEl) questionEl.classList.add("active");

      const parentEl = parentRefs.current[currentIndex];
      if (parentEl) parentEl.classList.add("active");

      const element = answerRefs.current[currentIndex];
      if (element) {
        // Padding (22 top + 22 bottom = 44) eklenmeli, yoksa border-box yüzünden içerik kesilir
        element.style.height = (element.scrollHeight + 44) + "px";
        element.style.overflow = "hidden";
        element.style.transition = "all 0.4s ease-in-out";
        element.style.paddingTop = "22px";
        element.style.paddingBottom = "22px";
      }
    }
  }, [currentIndex]);
  return (
    <div className="flat-accordion style-default has-btns-arrow">
      {faqs.map((toggle, index) => (
        <div
          key={index}
          ref={(el) => (parentRefs.current[index] = el)}
          className={`flat-toggle ${currentIndex == index ? "active" : ""}`}
        >
          <div
            className={`toggle-title d-flex justify-content-between align-items-center ${currentIndex == index ? "active" : ""}`}
            ref={(el) => (questionRefs.current[index] = el)}
            onClick={() => {
              setCurrentIndex((pre) => (pre == index ? -1 : index));
            }}
          >
            <span>{toggle.title}</span>
          </div>
          <div
            className="toggle-content"
            style={{ display: "block" }}
            ref={(el) => (answerRefs.current[index] = el)}
          >
            <div dangerouslySetInnerHTML={{ __html: toggle.content }} />
          </div>
        </div>
      ))}
    </div>
  );
}
