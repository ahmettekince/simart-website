import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function BlogGrid({ blogs = [] }) {
  // API'den veri gelmezse hiçbir şey gösterme
  if (!blogs || blogs.length === 0) {
    return null;
  }

  return (
    <div className="blog-grid-main">
      <div className="container">
        <div className="row">
          {blogs.map((post, index) => (
            <div className="col-xl-4 col-md-6 col-12" key={index}>
              <div className="blog-article-item">
                <div className="article-thumb" style={{ position: 'relative', aspectRatio: '550/354', overflow: 'hidden' }}>
                  {post.image?.url && typeof post.image.url === "string" && post.image.url.trim() !== "" && (
                    <Link href={`/${post.slug}`}>
                      <Image
                        className="lazyload"
                        alt={post.title}
                        src={post.image.url}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </Link>
                  )}
                  {post.category && (
                    <div className="article-label">
                      <Link
                        href={`/${post.slug}`}
                        className="tf-btn btn-sm radius-3 btn-fill animate-hover-btn"
                      >
                        {post.category}
                      </Link>
                    </div>
                  )}
                </div>
                <div className="article-content">
                  <div className="article-title">
                    <Link href={`/${post.slug}`}>{post.title}</Link>
                  </div>
                  <div className="article-btn">
                    <Link
                      href={`/${post.slug}`}
                      className="tf-btn btn-line fw-6"
                    >
                      Devamını Oku
                      <i className="icon icon-arrow1-top-left" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
