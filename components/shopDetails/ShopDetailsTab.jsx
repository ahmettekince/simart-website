"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { decodeHtmlEntities } from "@/utils/stripHtml";
import Accordion from "@/components/common/Accordion";
import BirlikteAlNew from "@/components/shopDetails/BirlikteAlNew";

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
  const [previewImage, setPreviewImage] = useState(null);
  const [specCategoryIndex, setSpecCategoryIndex] = useState(0);

  useEffect(() => {
    if (!previewImage) return;
    const handleKeydown = (e) => {
      if (e.key === "Escape") {
        setPreviewImage(null);
        return;
      }
      if (previewImage.urls?.length <= 1) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIdx = previewImage.index <= 0 ? previewImage.urls.length - 1 : previewImage.index - 1;
        setPreviewImage((p) => ({ ...p, url: p.urls[prevIdx], index: prevIdx }));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextIdx = previewImage.index >= previewImage.urls.length - 1 ? 0 : previewImage.index + 1;
        setPreviewImage((p) => ({ ...p, url: p.urls[nextIdx], index: nextIdx }));
      }
    };
    document.addEventListener("keydown", handleKeydown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = "";
    };
  }, [previewImage]);

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

  // API: faq_data[] -> { question, answer } -> Accordion: { title, content }
  const faqList = useMemo(() => {
    const raw = product?.faq_data || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => ({
      title: item.question ?? item.title ?? "",
      content: item.answer ?? item.content ?? "",
    })).filter((f) => f.title || f.content);
  }, [product?.faq_data]);

  const hasFaq = faqList.length > 0;

  const techSpecs = product?.technical_specifications || [];
  const hasTechSpecs = Array.isArray(techSpecs) && techSpecs.length > 0;

  // Açıklama tab bar'da yok; içerik varsa yukarıda (tab'ların üstünde) render edilir
  const descVal = product?.description;
  const hasDescription = descVal != null && String(descVal).trim() !== "";

  // Birlikte Al (Alternatifler) - sadece mobilde, açıklama ve tablar arasında
  const hasVariations = product && Array.isArray(product.variations) && product.variations.length > 0;
  const categorySlugForVariations =
    product?.primary_category?.slug ||
    (Array.isArray(product?.categories) && product.categories[0]?.slug) ||
    "urunler";
  const baseVariation = hasVariations && product ? {
    name: product.name || product.title || "",
    slug: product.slug || "",
    category_slug: categorySlugForVariations,
    is_in_stock: product.is_in_stock,
    is_pre_order: product.is_pre_order,
    price: product.price,
    discount_price: product.discount_price,
    cover_image: product.images?.[0] || product.gallery_images?.[0] || null,
  } : null;
  const allVariations = useMemo(() => {
    if (!hasVariations || !product) return [];
    const list = [];
    if (baseVariation?.slug) list.push(baseVariation);
    product.variations.forEach((v) => {
      if (!v) return;
      const slug = v.slug || "";
      const cat = v.category_slug || baseVariation?.category_slug || "urunler";
      if (baseVariation && slug === baseVariation.slug && cat === baseVariation.category_slug) return;
      list.push({ ...v, slug, category_slug: cat });
    });
    return list;
  }, [product, baseVariation, hasVariations]);

  // Sıra: Değerlendirmeler, (varsa) Teknik, (varsa) SSS, Kargo, İade. Açıklama tab'ı yok.
  const tabIds = [
    "reviews",
    ...(hasTechSpecs ? ["tech"] : []),
    ...(hasFaq ? ["faq"] : []),
    "kargo",
    "return",
  ];
  const tabs = [
    { title: reviewCount > 0 ? `Değerlendirmeler (${reviewCount})` : "Değerlendirmeler", active: false },
    ...(hasTechSpecs ? [{ title: "Teknik Özellikler", active: false }] : []),
    ...(hasFaq ? [{ title: "Sıkça Sorulan Sorular", active: false }] : []),
    { title: "Kargo", active: false },
    { title: "İade Politikası", active: false },
  ];

  const indexOf = (id) => { const i = tabIds.indexOf(id); return i >= 0 ? i + 1 : null; };
  const reviewsTabIndex = indexOf("reviews");
  const techSpecsTabIndex = indexOf("tech");
  const faqTabIndex = indexOf("faq");
  const kargoTabIndex = indexOf("kargo");
  const returnTabIndex = indexOf("return");

  // Hash #product-reviews gelince Değerlendirmeler sekmesine geç
  useEffect(() => {
    const checkHash = () => {
      if (typeof window !== "undefined" && window.location.hash === "#product-reviews") {
        setCurrentTab(reviewsTabIndex ?? 1);
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [reviewsTabIndex]);

  const descriptionContainerClass = product?.description_layout === "full" ? "container-fluid" : "container";

  return (
    <>
      {/* Açıklama bölümü - tab bar'da yok, sadece yukarıda gösterilir */}
      {hasDescription && (
        <section className="" style={{ overflowX: "hidden", paddingTop: "15px" }}>
          <div className={descriptionContainerClass}>
            <div className="row">
              <div className="col-12" >
                {product?.description && (
                  <div
                    className="product-description-text"
                    dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(product.description) }}
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      )}
      {/* Birlikte Al - sadece mobilde, açıklamanın altında tabların üstünde (araya) */}
      {hasVariations && allVariations.length > 0 && (
        <div className="container d-md-none" style={{ marginTop: 0, marginBottom: 24 }}>
          <BirlikteAlNew
            variations={allVariations}
            currentSlug={product.slug}
            currentCategorySlug={categorySlugForVariations}
          />
        </div>
      )}

      <section id="product-reviews" className="pt_0" style={{ paddingBottom: "0px !important" }}>
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
                    className={`widget-content-inner ${currentTab === reviewsTabIndex ? "active" : ""
                      } `}
                  >
                    {product?.reviews?.items?.length > 0 ? (
                      <div className="tf-product-reviews">
                        {/* Sıralama dropdown + Yıldız filtreleri */}
                        <div className="d-flex flex-wrap justify-content-between align-items-center mb_20" style={{ gap: "16px" }}>
                          <div
                            className="d-flex flex-nowrap align-items-center hide-scrollbar"
                            style={{
                              gap: "8px",
                              overflowX: "auto",
                              overflowY: "hidden",
                              minWidth: 0,
                              flex: "1 1 0",
                              WebkitOverflowScrolling: "touch",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setFilterRating(null)}
                              style={{
                                padding: "6px 11px",
                                borderRadius: "999px",
                                border: filterRating === null ? "2px solid #f59e0b" : "1px solid #ddd",
                                background: "#fff",
                                color: filterRating === null ? "#b45309" : "#666",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "500",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                flexShrink: 0,
                              }}
                            >
                              <span>Tümü</span>
                              <span>({reviewCount})</span>
                              {filterRating === null && <i className="icon-check" style={{ color: "#f59e0b", fontSize: "10px" }} />}
                            </button>
                            {[5, 4, 3, 2, 1].map((star) =>
                              ratingCounts[star] > 0 ? (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setFilterRating(filterRating === star ? null : star)}
                                  style={{
                                    padding: "6px 11px",
                                    borderRadius: "999px",
                                    border: filterRating === star ? "2px solid #f59e0b" : "1px solid #ddd",
                                    background: "#fff",
                                    color: filterRating === star ? "#b45309" : "#333",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    flexShrink: 0,
                                  }}
                                >
                                  <i className="icon-star star-filled" style={{ color: "#f59e0b", fontSize: "12px" }} />
                                  <span>{star}</span>
                                  <span>{ratingLabels[star]}</span>
                                  <span>({ratingCounts[star]})</span>
                                  {filterRating === star ? (
                                    <i className="icon-check" style={{ color: "#f59e0b", fontSize: "10px" }} />
                                  ) : (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#999" }}>
                                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                  )}
                                </button>
                              ) : null
                            )}
                          </div>
                          <div style={{ flexShrink: 0 }}>
                            <select
                              value={sortOrder}
                              onChange={(e) => setSortOrder(e.target.value)}
                              style={{
                                padding: "6px 26px 6px 10px",
                                borderRadius: "6px",
                                border: "1px solid #ddd",
                                background: "#fff",
                                color: "#333",
                                fontSize: "12px",
                                fontWeight: "500",
                                cursor: "pointer",
                                appearance: "none",
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "right 8px center",
                                maxWidth: "100px",
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
                            <div key={review.id} className="review-item mb_30 pb_30" style={{ paddingTop: "14px", borderTop: "1px solid #eee" }}>
                              {/* Önce yıldızlar; ortalaması yazılmaz */}
                              <div className="review-rating d-flex" style={{ gap: "2px", marginBottom: "6px" }}>
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
                              {/* İsim ve tarih yıldızın altında */}
                              <div className="review-user-info mb_10" style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                <span className="text_black-2" style={{ fontWeight: 600 }}>{review.user_name}</span>
                                <span style={{ color: "#888", fontSize: "12px" }}>·</span>
                                <span style={{ fontSize: "13px", color: "#666" }}>
                                  {new Date(review.created_at).toLocaleDateString("tr-TR")}
                                </span>
                              </div>
                              <div className="review-comment mb_10">
                                <p className="fs-14" style={{ lineHeight: "1.6", color: "#333" }}>
                                  {review.comment}
                                </p>
                              </div>
                              {product?.bundle_items?.length > 0 && (review.product_name || review.product_title) && (
                                <div className="review-product-ref fs-12 text-muted mb_15" style={{ fontStyle: "italic" }}>
                                  (Bu yorum <strong>{review.product_name || review.product_title}</strong> ürününe aittir.)
                                </div>
                              )}
                              {review.images?.length > 0 && (
                                <div className="review-images d-flex flex-nowrap gap-10 hide-scrollbar" style={{ overflowX: "auto", paddingBottom: "4px" }}>
                                  {review.images.map((img, imgIdx) => {
                                    const imgUrl = img.url || img.thumbnail_url;
                                    const thumbUrl = img.thumbnail_url || img.url;
                                    const allUrls = review.images.map((i) => i.url || i.thumbnail_url);
                                    return (
                                      <button
                                        key={img.id}
                                        type="button"
                                        onClick={() =>
                                          setPreviewImage({
                                            url: imgUrl,
                                            urls: allUrls,
                                            index: imgIdx,
                                          })
                                        }
                                        className="review-image-wrapper"
                                        style={{
                                          borderRadius: "8px",
                                          overflow: "hidden",
                                          border: "1px solid #eee",
                                          flexShrink: 0,
                                          cursor: "pointer",
                                          padding: 0,
                                          background: "none",
                                        }}
                                      >
                                        <Image
                                          src={thumbUrl}
                                          alt="Yorum görseli"
                                          width={80}
                                          height={80}
                                          style={{ objectFit: "cover", display: "block" }}
                                          className="hover-zoom"
                                          unoptimized
                                        />
                                      </button>
                                    );
                                  })}
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
                    className={`widget-content-inner ${currentTab === kargoTabIndex ? "active" : ""}`}
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
                    className={`widget-content-inner ${currentTab === returnTabIndex ? "active" : ""}`}
                  >
                    <ul className="d-flex justify-content-center mb_18">

                    </ul>
                    <p className="text-center text-paragraph">
                      LT01: 70% wool, 15% polyester, 10% polyamide, 5% acrylic 900
                      Grms/mt
                    </p>
                  </div>
                  {hasFaq && (
                    <div
                      className={`widget-content-inner ${currentTab === faqTabIndex ? "active" : ""}`}
                    >
                      <div className="flat-accordion style-default has-btns-arrow">
                        <Accordion faqs={faqList} initialIndex={-1} />
                      </div>
                    </div>
                  )}
                  {hasTechSpecs && (
                    <div
                      className={`widget-content-inner ${currentTab === techSpecsTabIndex ? "active" : ""}`}
                    >
                      <div className="tf-technical-specs">
                        <div className="tf-technical-specs-tabs d-flex flex-wrap gap-2 mb-4">
                          {techSpecs.map((group, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setSpecCategoryIndex(i)}
                              className={`tf-btn btn-outline rounded ${specCategoryIndex === i ? "active" : ""}`}
                              style={{
                                padding: "8px 16px",
                                fontSize: "14px",
                                borderWidth: "2px",
                                borderColor: specCategoryIndex === i ? "var(--primary, #3c81b5)" : "#ddd",
                                color: specCategoryIndex === i ? "var(--primary, #3c81b5)" : "#333",
                                background: specCategoryIndex === i ? "rgba(60, 129, 181, 0.08)" : "transparent",
                              }}
                            >
                              {group.title || `Özellikler ${i + 1}`}
                            </button>
                          ))}
                        </div>
                        <div className="tf-technical-specs-content">
                          {techSpecs[specCategoryIndex] && (
                            <div className="tf-spec-table-wrap">
                              <table className="tf-spec-table table table-borderless mb-0">
                                <tbody>
                                  {(techSpecs[specCategoryIndex].specs || []).map((row, ri) => (
                                    <tr key={ri} className={ri % 2 === 0 ? "tf-spec-row-even" : "tf-spec-row-odd"}>
                                      <td className="tf-spec-name text-secondary py-3 pe-3">{row.name}</td>
                                      <td className="tf-spec-value fw-6 py-3">{row.value}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Yorum fotoğrafı preview lightbox */}
      {previewImage && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImage(null);
            }}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
              fontSize: 18,
              cursor: "pointer",
              lineHeight: 1,
              zIndex: 10,
            }}
          >
            ×
          </button>
          {previewImage.urls?.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const prevIdx = previewImage.index <= 0 ? previewImage.urls.length - 1 : previewImage.index - 1;
                  setPreviewImage((p) => ({ ...p, url: p.urls[prevIdx], index: prevIdx }));
                }}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontSize: 18,
                  cursor: "pointer",
                  zIndex: 10,
                }}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextIdx = previewImage.index >= previewImage.urls.length - 1 ? 0 : previewImage.index + 1;
                  setPreviewImage((p) => ({ ...p, url: p.urls[nextIdx], index: nextIdx }));
                }}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontSize: 18,
                  cursor: "pointer",
                  zIndex: 10,
                }}
              >
                ›
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImage.url}
            alt="Yorum görseli"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90%",
              maxHeight: "90vh",
              objectFit: "contain",
              position: "relative",
              zIndex: 1,
            }}
          />
        </div>
      )}
    </>
  );
}
