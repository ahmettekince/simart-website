"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";

const SORT_OPTIONS = [
  { value: "default", label: "Varsayılan" },
  { value: "newest", label: "En yeni değerlendirme" },
  { value: "rating_desc", label: "Puana göre azalan" },
  { value: "rating_asc", label: "Puana göre artan" },
];

export default function ShopDetailsTab({ product }) {
  const [currentTab, setCurrentTab] = useState(1);
  const [filterRating, setFilterRating] = useState(null);
  const [sortOrder, setSortOrder] = useState("default");

  const reviewCount = product?.reviews?.count || product?.reviews_count || product?.review_count || 0;

  const ratingCounts = useMemo(() => {
    const items = product?.reviews?.items || [];
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    items.forEach((r) => {
      const rv = Math.round(r.rating || 0);
      if (rv >= 1 && rv <= 5) counts[rv] = (counts[rv] || 0) + 1;
    });
    return counts;
  }, [product?.reviews?.items]);

  const filteredReviews = useMemo(() => {
    const items = product?.reviews?.items || [];
    if (!filterRating) return items;
    return items.filter((r) => Math.round(r.rating || 0) === filterRating);
  }, [product?.reviews?.items, filterRating]);

  const sortedReviews = useMemo(() => {
    const list = [...filteredReviews];
    if (sortOrder === "default") return list;
    if (sortOrder === "newest") {
      return list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
    if (sortOrder === "rating_desc") {
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    if (sortOrder === "rating_asc") {
      return list.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    }
    return list;
  }, [filteredReviews, sortOrder]);

  const ratingLabels = { 5: "Çok İyi", 4: "İyi", 3: "Orta", 2: "Kötü", 1: "Çok Kötü" };

  const tabs = [
    { title: "Açıklama", active: true },
    { title: reviewCount > 0 ? `Yorumlar (${reviewCount})` : "Yorumlar", active: false },
    { title: "Kargo", active: false },
    { title: "İade Politikası", active: false },
  ];

  const descriptionImagesWidth = "container-fluid";

  return (
    <>
      <section className="pt_0" style={{ paddingBottom: "0px !important" }}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="widget-tabs style-has-border">
                <ul className="widget-menu-tab">
                  {tabs.map((elm, i) => (
                    <li
                      key={i}
                      onClick={() => setCurrentTab(i + 1)}
                      className={`item-title ${currentTab == i + 1 ? "active" : ""
                        } `}
                    >
                      <span className="inner">{elm.title}</span>
                    </li>
                  ))}
                </ul>
                <div className="widget-content-tab">
                  <div
                    className={`widget-content-inner ${currentTab == 1 ? "active pt_0" : ""
                      } `}
                  >
                    {/* Açıklama fotoğrafları Varsa Burası Boş Kalacak, Alt Bölümde Render Olacak */}
                    {(
                      <div className="">
                        {/* Eğer açıklama fotoğrafları yoksa eski içeriği göster */}

                        {!product?.description && (
                          <>
                            <p className="mb_30">
                              Button-up shirt sleeves and a relaxed silhouette. It's
                              tailored with drapey, crinkle-texture fabric that's made
                              from LENZING™ ECOVERO™ Viscose — responsibly sourced
                              wood-based fibres produced through a process that reduces
                              impact on forests, biodiversity and water supply.
                            </p>
                            <div className="tf-product-des-demo">
                              <div className="right">
                                <h3 className="fs-16 fw-5">Features</h3>
                                <ul>
                                  <li>Front button placket</li>
                                  <li>Adjustable sleeve tabs</li>
                                  <li>Babaton embroidered crest at placket and hem</li>
                                </ul>
                                <h3 className="fs-16 fw-5">Materials Care</h3>
                                <ul className="mb-0">
                                  <li>Content: 100% LENZING™ ECOVERO™ Viscose</li>
                                  <li>Care: Hand wash</li>
                                  <li>Imported</li>
                                </ul>
                              </div>
                              <div className="left">
                                <h3 className="fs-16 fw-5">Materials Care</h3>
                                <div className="d-flex gap-10 mb_15 align-items-center">
                                  <div className="icon">
                                    <i className="icon-machine" />
                                  </div>
                                  <span>Machine wash max. 30ºC. Short spin.</span>
                                </div>
                                <div className="d-flex gap-10 mb_15 align-items-center">
                                  <div className="icon">
                                    <i className="icon-iron" />
                                  </div>
                                  <span>Iron maximum 110ºC.</span>
                                </div>
                                <div className="d-flex gap-10 mb_15 align-items-center">
                                  <div className="icon">
                                    <i className="icon-bleach" />
                                  </div>
                                  <span>Do not bleach/bleach.</span>
                                </div>
                                <div className="d-flex gap-10 mb_15 align-items-center">
                                  <div className="icon">
                                    <i className="icon-dry-clean" />
                                  </div>
                                  <span>Do not dry clean.</span>
                                </div>
                                <div className="d-flex gap-10 align-items-center">
                                  <div className="icon">
                                    <i className="icon-tumble-dry" />
                                  </div>
                                  <span>Tumble dry, medium hear.</span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div
                    className={`widget-content-inner ${currentTab == 2 ? "active" : ""
                      } `}
                  >
                    {product?.reviews?.items?.length > 0 ? (
                      <div className="tf-product-reviews">
                        {/* Sıralama dropdown + Yıldız filtreleri */}
                        <div className="d-flex flex-wrap justify-content-between align-items-center mb_20" style={{ gap: "16px" }}>
                          <div className="d-flex flex-wrap align-items-center" style={{ gap: "10px" }}>
                          <button
                            type="button"
                            onClick={() => setFilterRating(null)}
                            style={{
                              padding: "8px 14px",
                              borderRadius: "999px",
                              border: filterRating === null ? "2px solid #f59e0b" : "1px solid #ddd",
                              background: "#fff",
                              color: filterRating === null ? "#b45309" : "#666",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "500",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span>Tümü</span>
                            <span>({reviewCount})</span>
                            {filterRating === null && <i className="icon-check" style={{ color: "#f59e0b", fontSize: "12px" }} />}
                          </button>
                          {[5, 4, 3, 2, 1].map((star) =>
                            ratingCounts[star] > 0 ? (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setFilterRating(filterRating === star ? null : star)}
                                style={{
                                  padding: "8px 14px",
                                  borderRadius: "999px",
                                  border: filterRating === star ? "2px solid #f59e0b" : "1px solid #ddd",
                                  background: "#fff",
                                  color: filterRating === star ? "#b45309" : "#333",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                <i className="icon-star star-filled" style={{ color: "#f59e0b", fontSize: "14px" }} />
                                <span>{star}</span>
                                <span>{ratingLabels[star]}</span>
                                <span>({ratingCounts[star]})</span>
                                {filterRating === star ? (
                                  <i className="icon-check" style={{ color: "#f59e0b", fontSize: "12px" }} />
                                ) : (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#999" }}>
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                )}
                              </button>
                            ) : null
                          )}
                          </div>
                          <div>
                            <select
                              value={sortOrder}
                              onChange={(e) => setSortOrder(e.target.value)}
                              style={{
                                padding: "8px 32px 8px 14px",
                                borderRadius: "8px",
                                border: "1px solid #ddd",
                                background: "#fff",
                                color: "#333",
                                fontSize: "14px",
                                fontWeight: "500",
                                cursor: "pointer",
                                appearance: "none",
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "right 12px center",
                              }}
                            >
                              {SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {sortedReviews.length === 0 ? (
                          <div className="text-center py-4 text-muted fs-14">
                            {filterRating ? `${filterRating} yıldıza ait yorum bulunamadı.` : "Yorum bulunamadı."}
                          </div>
                        ) : (
                        sortedReviews.map((review) => (
                          <div key={review.id} className="review-item mb_30 pb_30" style={{ paddingBottom: "10px", borderBottom: "1px solid #f2f2f2" }}>
                            <div className="d-flex justify-content-between align-items-center mb_15">
                              <div className="review-user-info">
                                <div className="fw-6 fs-16 mb_5">{review.user_name}</div>
                                <div className="d-flex gap-5 align-items-center">
                                  <div className="review-rating d-flex" style={{ gap: "2px" }}>
                                    {[...Array(5)].map((_, i) => {
                                      const starValue = i + 1;
                                      const rating = review.rating || 0;
                                      const isFilled = rating >= starValue;
                                      const isPartial = rating > i && rating < starValue;
                                      const fillPercentage = Math.max(0, Math.min(100, ((rating - i) * 100)));

                                      return (
                                        <div key={i} className="star-wrapper" style={{ position: "relative", display: "inline-block", fontSize: "14px", lineHeight: 1 }}>
                                          <i className="icon-star star-empty" style={{ color: "#ddd" }} />
                                          {isFilled ? (
                                            <i className="icon-star star-filled" style={{ position: "absolute", top: 0, left: 0, color: "#f59e0b" }} />
                                          ) : isPartial ? (
                                            <i
                                              className="icon-star star-filled star-partial"
                                              style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                color: "#f59e0b",
                                                clipPath: `inset(0 ${100 - fillPercentage}% 0 0)`
                                              }}
                                            />
                                          ) : null}
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <span className="text-muted fs-12 ms_10">
                                    {new Date(review.created_at).toLocaleDateString("tr-TR")}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="review-comment mb_20">
                              <p className="fs-14 text_black-2" style={{ lineHeight: "1.6" }}>
                                {review.comment}
                              </p>
                            </div>
                            {review.images?.length > 0 && (
                              <div className="review-images d-flex flex-nowrap gap-10" style={{ overflowX: "auto", paddingBottom: "4px" }}>
                                {review.images.map((img) => (
                                  <div key={img.id} className="review-image-wrapper" style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #eee", flexShrink: 0 }}>
                                    <Image
                                      src={img.thumbnail_url || img.url}
                                      alt="Yorum görseli"
                                      width={80}
                                      height={80}
                                      style={{ objectFit: "cover", cursor: "pointer" }}
                                      className="hover-zoom"
                                      unoptimized
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <i className="icon-star mb_15 d-block opacity-20" style={{ fontSize: "40px" }} />
                        <p className="text-muted">Bu ürün için henüz yorum yapılmamış.</p>
                      </div>
                    )}
                  </div>
                  <div
                    className={`widget-content-inner ${currentTab == 3 ? "active" : ""
                      } `}
                  >
                    <div className="tf-page-privacy-policy">
                      <div className="title">
                        The Company Private Limited Policy
                      </div>
                      <p>
                        The Company Private Limited and each of their respective
                        subsidiary, parent and affiliated companies is deemed to
                        operate this Website ("we" or "us") recognizes that you
                        care how information about you is used and shared. We have
                        created this Privacy Policy to inform you what information
                        we collect on the Website, how we use your information and
                        the choices you have about the way your information is
                        collected and used. Please read this Privacy Policy
                        carefully. Your use of the Website indicates that you have
                        read and accepted our privacy practices, as outlined in
                        this Privacy Policy.
                      </p>
                      <p>
                        Please be advised that the practices described in this
                        Privacy Policy apply to information gathered by us or our
                        subsidiaries, affiliates or agents: (i) through this
                        Website, (ii) where applicable, through our Customer
                        Service Department in connection with this Website, (iii)
                        through information provided to us in our free standing
                        retail stores, and (iv) through information provided to us
                        in conjunction with marketing promotions and sweepstakes.
                      </p>
                      <p>
                        We are not responsible for the content or privacy
                        practices on any websites.
                      </p>
                      <p>
                        We reserve the right, in our sole discretion, to modify,
                        update, add to, discontinue, remove or otherwise change
                        any portion of this Privacy Policy, in whole or in part,
                        at any time. When we amend this Privacy Policy, we will
                        revise the "last updated" date located at the top of this
                        Privacy Policy.
                      </p>
                      <p>
                        If you provide information to us or access or use the
                        Website in any way after this Privacy Policy has been
                        changed, you will be deemed to have unconditionally
                        consented and agreed to such changes. The most current
                        version of this Privacy Policy will be available on the
                        Website and will supersede all previous versions of this
                        Privacy Policy.
                      </p>
                      <p>
                        If you have any questions regarding this Privacy Policy,
                        you should contact our Customer Service Department by
                        email at marketing@company.com
                      </p>
                    </div>
                  </div>
                  <div
                    className={`widget-content-inner ${currentTab == 4 ? "active" : ""
                      } `}
                  >
                    <ul className="d-flex justify-content-center mb_18">

                    </ul>
                    <p className="text-center text-paragraph">
                      LT01: 70% wool, 15% polyester, 10% polyamide, 5% acrylic 900
                      Grms/mt
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Açıklama Fotoğrafları Bölümü - Widgets Tab Altında ve Section Olarak */}
      {currentTab == 1 && (
        <section className="pl_35 pr_35">
          <div className="container">
            <div className="row">
              <div className="col-12" >
                {product?.description && (
                  <div
                    className="product-description-text"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
