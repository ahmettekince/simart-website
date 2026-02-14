import React from "react";
import Image from "next/image";
export default function BlogDetails({ blog }) {
  return (
    <>
      <div className="blog-detail">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="blog-detail-main">
                <div className="blog-detail-main-heading">
                  {/* {blog.seo?.keywords && (
                    <ul className="tags-lists justify-content-center">
                      <li>
                        <span className="tags-item">
                          {blog.seo.keywords}
                        </span>
                      </li>
                    </ul>
                  )} */}
                  <div className="title">{blog.title}</div>
                  <div className="meta">
                    <span>{new Date(blog.published_at || blog.created_at).toLocaleDateString('tr-TR')}</span> tarihinde yayınlandı
                  </div>
                  {blog.image?.url && typeof blog.image.url === "string" && blog.image.url.trim() !== "" && (
                    <div className="image">
                      <Image
                        className="lazyload"
                        alt={blog.title}
                        src={blog.image.url}
                        width={1100}
                        height={707}
                      />
                    </div>
                  )}
                </div>

                <div
                  className="desc"
                  dangerouslySetInnerHTML={{ __html: String(blog?.content || "") }}
                />
                <style dangerouslySetInnerHTML={{
                  __html: `
                  .desc {
                    font-size: 16px;
                    line-height: 1.8;
                    color: #222;
                  }
                  .desc h1, .desc h2, .desc h3, .desc h4, .desc h5, .desc h6 {
                    margin-top: 32px;
                    margin-bottom: 16px;
                    font-weight: 600;
                    line-height: 1.3;
                    color: #000;
                  }
                  .desc h1 { font-size: 52px; }
                  .desc h2 { font-size: 32px; }
                  .desc h3 { font-size: 26px; }
                  
                  .desc p {
                    margin-bottom: 20px;
                  }
                  .desc ul {
                    list-style-type: disc !important;
                    margin-bottom: 20px;
                    padding-left: 25px !important;
                  }
                  .desc ol {
                    list-style-type: decimal !important;
                    margin-bottom: 20px;
                    padding-left: 25px !important;
                  }
                  .desc li {
                    margin-bottom: 8px;
                    display: list-item !important;
                  }
                  .desc strong {
                    font-weight: 700;
                  }
                  .desc a {
                    color: var(--primary);
                    text-decoration: underline;
                  }
                  .desc img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    margin: 20px 0;
                  }
                  @media (max-width: 768px) {
                    .desc h1 { font-size: 32px; }
                    .desc h2 { font-size: 26px; }
                    .desc h3 { font-size: 22px; }
                    .desc { font-size: 15px; }
                  }
                `}} />

                <div className="bot d-flex justify-content-between flex-wrap align-items-center">
                  <ul className="tags-lists">
                    <li>
                      <a href="#" className="tags-item">
                        <span>Accessories</span>
                      </a>
                    </li>
                  </ul>
                  <div className="d-flex align-items-center gap-20">
                    <p>Share:</p>
                    <ul className="tf-social-icon d-flex style-default">
                      <li>
                        <a
                          href="#"
                          className="box-icon round social-facebook border-line-black"
                        >
                          <i className="icon fs-14 icon-fb" />
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="box-icon round social-twiter border-line-black"
                        >
                          <i className="icon fs-12 icon-Icon-x" />
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="box-icon round social-instagram border-line-black"
                        >
                          <i className="icon fs-14 icon-instagram" />
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="box-icon round social-tiktok border-line-black"
                        >
                          <i className="icon fs-14 icon-tiktok" />
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="box-icon round social-pinterest border-line-black"
                        >
                          <i className="icon fs-14 icon-pinterest-1" />
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="tf-article-navigation">
                  <div className="item position-relative d-flex w-100 prev">
                    <a href="#" className="icon">
                      <i className="icon-arrow-left" />
                    </a>
                    <div className="inner">
                      <a href="#">PREVIOUS</a>
                      <h6>
                        <a href="#">
                          Fashionista editors reveal their designer
                        </a>
                      </h6>
                    </div>
                  </div>
                  <div className="item position-relative d-flex w-100 justify-content-end next">
                    <div className="inner text-end">
                      <a href="#">NEXT</a>
                      <h6>
                        <a href="#">
                          The next generation of leather alternatives
                        </a>
                      </h6>
                    </div>
                    <a href="#" className="icon">
                      <i className="icon-arrow-right" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="btn-sidebar-mobile d-flex">
        <button
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebarmobile"
          aria-controls="offcanvasRight"
        >
          <i className="icon-open" />
        </button>
      </div>
    </>
  );
}
