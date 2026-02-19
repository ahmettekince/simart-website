"use client";
import React, { useEffect, useState } from "react";
import CategoriesClient from "./CategoriesClient";
import apiClient from "@/utils/apiClient";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get("/categories");
        if (response.data?.status === "success" && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Categories fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="flat-spacing-7 pb-0 section-categories-home">
        <div className="container">
          <div className="position-relative">
            <div className="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="col">
                  <div
                    style={{
                      height: "240px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "12px",
                      border: "1px solid #e5e5e5",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }
  if (categories.length === 0) return null;

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
