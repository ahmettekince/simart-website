"use client";
import React, { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import BlogsClient from "./BlogsClient";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await apiClient.get("/blogs?limit=6");
        if (response.data?.status === "success" && response.data.data?.length > 0) {
          setBlogs(response.data.data);
        }
      } catch (error) {
        console.error("Blogs client fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading || blogs.length === 0) {
    return null;
  }

  return <BlogsClient blogs={blogs} />;
}
