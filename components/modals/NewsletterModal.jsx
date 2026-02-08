"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getPopups } from "@/api/popup";
import Countdown from "@/components/common/Countdown";

const STORAGE_KEY = "simart_popup_shown";
const LOG = "[Popup]";

export default function NewsletterModal() {
  const pathname = usePathname();
  const [queue, setQueue] = useState([]);
  const [popup, setPopup] = useState(null);
  const [visible, setVisible] = useState(false);
  const hasShownRef = useRef(false);

  useEffect(() => {
    let ok = true;
    (async () => {
      console.log(LOG, "1. Fetch başladı, pathname:", pathname);
      try {
        const list = await getPopups();
        console.log(LOG, "2. API yanıtı:", list?.length ?? 0, "adet", list);
        if (!ok || !list?.length) return;
        const sorted = [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        let shownIds = [];
        try {
          shownIds = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
        } catch {}
        const toShow = [];
        for (const p of sorted) {
          const pages = p.show_on_pages || ["all"];
          if (!pages.includes("all")) {
            const path = (pathname || "/").replace(/\/$/, "") || "/";
            const match = pages.some((pg) => {
              const x = String(pg || "").replace(/^\/+|\/+$/g, "");
              if (!x || x === "home") return path === "/" || path === "";
              return path === "/" + x || path.startsWith("/" + x + "/");
            });
            if (!match) continue;
          }
          if (p.display_frequency === "once" && Array.isArray(shownIds) && shownIds.includes(p.id)) continue;
          toShow.push(p);
        }
        console.log(LOG, "6. Gösterilecek popup sayısı:", toShow.length, toShow.map((p) => p.id));
        setQueue(toShow);
      } catch (e) {
        console.error(LOG, "HATA:", e);
      }
    })();
    return () => { ok = false; };
  }, [pathname]);

  useEffect(() => {
    if (queue.length === 0) return;
    setPopup(queue[0]);
  }, [queue]);

  useEffect(() => {
    if (!popup) return;
    const delay = hasShownRef.current ? 300 : 1500;
    hasShownRef.current = true;
    console.log(LOG, "8. Popup set edildi,", delay, "ms sonra gösterilecek:", popup.id);
    const t = setTimeout(() => {
      setVisible(true);
      if (popup.display_frequency === "once") {
        try {
          const ids = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
          if (!ids.includes(popup.id)) ids.push(popup.id);
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
        } catch {}
      }
    }, delay);
    return () => clearTimeout(t);
  }, [popup]);

  useEffect(() => {
    if (queue.length === 0) hasShownRef.current = false;
  }, [queue.length]);

  const close = () => {
    setVisible(false);
    if (queue.length > 1) {
      const next = queue.slice(1);
      setTimeout(() => {
        setQueue(next);
        setPopup(next[0]);
      }, 250);
    } else {
      setQueue([]);
      setPopup(null);
    }
  };

  useEffect(() => {
    if (visible) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [visible]);

  if (!popup) return null;
  const isFull = popup.size === "fullscreen";

  return (
    <>
      {visible && (
        <div
          className="modal-backdrop fade show"
          style={{ position: "fixed", inset: 0, zIndex: 1050 }}
          onClick={close}
        />
      )}
      <div
        className={`modal modalCentered fade modal-newleter ${visible ? "show" : ""}`}
        style={{
          display: visible ? "block" : "none",
          position: "fixed",
          inset: 0,
          zIndex: 1055,
          overflowX: "hidden",
          overflowY: "auto",
        }}
        onClick={close}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{
            maxWidth: isFull ? "calc(100vw - 2.5rem)" : "min(600px, 90vw)",
            width: isFull ? "calc(100vw - 2.5rem)" : undefined,
            margin: isFull ? "1.25rem auto" : undefined,
            maxHeight: isFull ? "calc(100vh - 2.5rem)" : undefined,
            borderRadius: isFull ? "12px" : undefined,
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content" style={isFull ? { maxHeight: "calc(100vh - 2.5rem)", overflowY: "auto" } : undefined}>
            {popup.image && (
              <div className="modal-top">
                <Image
                  src={popup.image}
                  alt=""
                  width={938}
                  height={538}
                  unoptimized
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
                <span
                  className="icon icon-close btn-hide-popup"
                  onClick={close}
                  style={{ cursor: "pointer" }}
                />
              </div>
            )}
            <div className="modal-bottom" style={{ position: "relative" }}>
              {!popup.image && (
                <span
                  className="icon icon-close btn-hide-popup"
                  onClick={close}
                  style={{ cursor: "pointer", position: "absolute", top: 0, right: 0, zIndex: 10 }}
                />
              )}
              {popup.content && (
                <div
                  className="text-center"
                  dangerouslySetInnerHTML={{ __html: popup.content }}
                />
              )}
              {popup.end_date && popup.remaining_seconds > 0 && (
                <div className="text-center mt-3">
                  <Countdown targetDate={popup.end_date} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
