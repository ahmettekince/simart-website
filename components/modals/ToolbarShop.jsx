"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import apiClient from "@/utils/apiClient";

const PLACEHOLDER_IMG = "/images/collections/collection-1.jpg";

function getImageSrc(url) {
  if (!url || typeof url !== "string" || url.trim() === "") return PLACEHOLDER_IMG;
  return url;
}

export default function ToolbarShop() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    apiClient
      .get("/categories")
      .then((res) => {
        if (res?.data?.status === "success" && Array.isArray(res.data.data)) {
          setCategories(res.data.data);
        }
      })
      .catch(() => setCategories([]));
  }, []);

  return (
    <div
      className="offcanvas offcanvas-start canvas-mb toolbar-shop-mobile"
      id="toolbarShopmb"
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
