import React from "react";
import CategoriesClient from "./CategoriesClient";

export default function Categories({ categories = [] }) {
  return (
    <section className="flat-spacing-7 pb-0 section-categories-home">
      <div className="container">
        <div className="position-relative">
          <div className="flat-title flex-row justify-content-between px-0">
            <span className="title">
            </span>
          </div>
          <CategoriesClient categories={categories} />
        </div>
      </div>
    </section>
  );
}
