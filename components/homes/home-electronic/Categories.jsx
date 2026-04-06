import React from "react";
import CategoriesClient from "./CategoriesClient";
import { getCategories } from "@/api/home";

export default async function Categories({ lang = "tr" }) {
  const categories = await getCategories(lang);

  if (!categories || categories.length === 0) return null;

  return (
    <section className="flat-spacing-7 pb-0 section-categories-home">
      <div className="container">
        <div className="position-relative">
          <div className="flat-title flex-row justify-content-between px-0">
            <span className="title">
            </span>
          </div>
          <CategoriesClient categories={categories} lang={lang} />
        </div>
      </div>
    </section>
  );
}
