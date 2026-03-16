
import Image from "next/image";
import Link from "next/link";
import React from "react";
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
  title: "Sayfa Bulunamadı - Şımart Teknoloji",
  description: "Sayfa bulunamadı. Ana sayfaya dönün ve en son ürünlerimizi görüntüleyin.",
};
export default function notFound() {
  return (
    <>
      <section className="page-404-wrap">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="image">
                <Image
                  alt="image"
                  src="/images/item/404.svg"
                  width="394"
                  height="319"
                />
              </div>
              <div className="title">Bu sayfa bulunamadı.</div>
              <p>
                Üzgünüz, bu sayfa bulunamadı. Ana sayfaya dönün ve en son ürünlerimizi görüntüleyin.
              </p>
              <Link
                href="/"
                className="tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
