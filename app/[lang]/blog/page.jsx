import BlogGrid from "@/components/blogs/BlogGrid";

import React from "react";
import Link from "next/link";
import { getBlogs } from "@/api/blogs";
import { webPageSchema } from "@/lib/schema";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const isEn = lang === "en";
  return {
    title: isEn ? "Blog - Şımart Technology" : "Blog - Şımart Teknoloji",
    description: isEn
      ? "Şımart Technology blog page, your most up-to-date source of information about smart home systems and technological innovations."
      : "Şımart Teknoloji blog sayfası, akıllı ev sistemleri ve teknolojik yenilikler hakkında en güncel bilgi kaynağınız.",
    author: "Şımart Teknoloji",
    robots: "index, follow",
  };
}

export default async function page({ params }) {
  const { lang } = await params;
  const isEn = lang === "en";
  const blogs = await getBlogs(lang);

  const blogJsonLd = webPageSchema({
    name: isEn ? "Blog - Şımart Technology" : "Blog - Şımart Teknoloji",
    url: `https://simart.me/${lang}/blog`,
    description: isEn
      ? "Şımart Technology blog page, your most up-to-date source of information about smart home systems and technological innovations."
      : "Şımart Teknoloji blog sayfası, akıllı ev sistemleri ve teknolojik yenilikler hakkında en güncel bilgi kaynağınız.",
  });

  return (
    <>
      {/* WebPage JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: '0' }}>
        {isEn ? "Şımart Technology Blogs" : "Şımart Teknoloji Bloglar"}
      </h1>
      <div className="tf-page-title">
        <div className="container-full">
          <div className="row">
            <div className="col-12">
              <div className="heading text-center">{isEn ? "Şımart Blog" : "Şımart Blog"}</div>
              <ul className="breadcrumbs d-flex align-items-center justify-content-center">
                <li>
                  <Link href={isEn ? "/en" : "/"}>{isEn ? "Home" : "Anasayfa"}</Link>
                </li>
                <li>
                  <i className="icon-arrow-right" />
                </li>
                <li>Blog</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <BlogGrid blogs={blogs} lang={lang} />
    </>
  );
}
