"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import apiClient from "@/utils/apiClient";

const PLACEHOLDER_IMG = "/images/item/pr1.jpg";
const OFFCANVAS_ID = "toolbarShopmb";

function getImageSrc(url) {
  if (!url || typeof url !== "string" || url.trim() === "") return PLACEHOLDER_IMG;
  return url;
}

export default function ToolbarShop() {
  const [categories, setCategories] = useState([]);
  const loadedRef = useRef(false);

  // Kategorileri sadece offcanvas (mağaza menüsü) açıldığında yükle; sayfa açılışında istek atma
  useEffect(() => {
    const el = document.getElementById(OFFCANVAS_ID);
    if (!el) return;

    const loadCategories = () => {
      if (loadedRef.current) return;
      loadedRef.current = true;
      apiClient
        .get("/categories")
        .then((res) => {
          if (res?.data?.status === "success" && Array.isArray(res.data.data)) {
            setCategories(res.data.data);
          }
        })
        .catch(() => setCategories([]));
    };

    el.addEventListener("show.bs.offcanvas", loadCategories);
    return () => el.removeEventListener("show.bs.offcanvas", loadCategories);
  }, []);

  return (
    <div
      className="offcanvas offcanvas-start canvas-mb toolbar-shop-mobile"
      id={OFFCANVAS_ID}
    >
      <span
        className="icon-close icon-close-popup"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      />
      <div className="mb-canvas-content">
        <div className="mb-body">
          <ul className="nav-ul-mb" id="wrapper-menu-navigation">
            {categories.map((item, index) => (
              <li key={item.id ?? index} className="nav-mb-item">
                <Link
                  href={`/magaza/${item.slug || "magaza"}`}
                  className="tf-category-link mb-menu-link"
                >
                  <div className="image">
                    <Image
                      alt={item.name || "Kategori"}
                      src={getImageSrc(item.image?.url)}
                      width={40}
                      height={48}
                      unoptimized={getImageSrc(item.image?.url).startsWith('/')}
                    />
                  </div>
                  <span>{item.name || "Kategori"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-bottom">
          <Link href="/magaza" className="tf-btn fw-5 btn-line">
            Tüm koleksiyon
            <i className="icon icon-arrow1-top-left" />
          </Link>
        </div>
      </div>
    </div>
  );
}
