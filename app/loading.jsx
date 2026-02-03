/**
 * Anasayfa ve sayfa geçişlerinde hemen görünen iskelet.
 * Görseller yüklenmeden önce sayfa yapısı görünsün diye kullanılır.
 */
export default function Loading() {
  return (
    <div className="color-primary-15 home-loading-skeleton" aria-hidden="true">
      {/* Header alanı */}
      <div className="skeleton-header" style={{ height: 72, background: "#f0f0f0" }} />

      {/* Hero alanı - yüksekliği sabit, layout shift olmasın */}
      <div
        className="skeleton-hero"
        style={{
          minHeight: "clamp(280px, 45vw, 520px)",
          background: "linear-gradient(180deg, #e8e8e8 0%, #f5f5f5 100%)",
        }}
      />

      {/* İçerik blokları */}
      <div className="container py-4">
        <div className="skeleton-line mb-4" style={{ height: 32, width: "40%", background: "#e8e8e8", borderRadius: 4 }} />
        <div className="row g-3 mb-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="col-6 col-md-4 col-lg-2">
              <div style={{ aspectRatio: "3/4", background: "#eee", borderRadius: 12 }} />
            </div>
          ))}
        </div>
        <div className="skeleton-line mb-4" style={{ height: 32, width: "35%", background: "#e8e8e8", borderRadius: 4 }} />
        <div className="row g-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="col-6 col-md-3">
              <div style={{ aspectRatio: "1", background: "#eee", borderRadius: 12 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
