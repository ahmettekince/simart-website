"use client";

import React, { useEffect } from "react";
import { useLangStore } from "@/stores/langStore";

export default function DynamicPageContent({ htmlContent, title, image, slugs }) {
    const { setAlternatePaths } = useLangStore();

    useEffect(() => {
        if (slugs && typeof slugs === 'object') {
            const paths = {};
            Object.keys(slugs).forEach(key => {
                const prefix = key === 'tr' ? '' : `/${key}`;
                paths[key] = `${prefix}/${slugs[key]}`;
            });
            setAlternatePaths(paths);
        }
        
        // Temizleme: Sayfadan çıkınca alternate paths'i sıfırlayabiliriz (isteğe bağlı)
        // return () => setAlternatePaths({});
    }, [slugs, setAlternatePaths]);

    return (
        <div className="dynamic-page-wrapper">
            <div className="container py-5">
                <div className="row">
                    <div className="col-12">
                        {/* Resim varsa göster */}
                        {image?.url && (
                            <div className="mb-4 text-center">
                                <img
                                    src={image.url}
                                    alt={title || "Görsel"}
                                    className="img-fluid rounded-10"
                                    style={{ objectFit: "cover", width: "100%", height: "auto", maxHeight: "600px" }}
                                />
                            </div>
                        )}

                        {/* Başlık (Resim varsa altında göster) */}
                        {image?.url && title && (
                            <h1 className="mb-4" style={{ fontSize: '32px', fontWeight: '500' }}>{title}</h1>
                        )}

                        {/* İçerik */}
                        {htmlContent && (
                            <div className="page-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .page-content {
          font-size: 16px;
          line-height: 1.8;
          color: #222;
        }
        .page-content h1,
        .page-content h2,
        .page-content h3,
        .page-content h4,
        .page-content h5,
        .page-content h6 {
          margin-top: 32px;
          margin-bottom: 16px;
          font-weight: 600;
          line-height: 1.3;
          color: #000;
        }
        .page-content h2 { font-size: 32px; }
        .page-content h3 { font-size: 26px; }
        .page-content h4 { font-size: 22px; }
        
        .page-content p {
          margin-bottom: 20px;
        }
        .page-content ul {
          list-style-type: disc !important;
          margin-bottom: 20px;
          padding-left: 25px !important;
        }
        .page-content ol {
          list-style-type: decimal !important;
          margin-bottom: 20px;
          padding-left: 25px !important;
        }
        .page-content li {
          margin-bottom: 8px;
          display: list-item !important;
        }
        .page-content strong {
          font-weight: 700;
        }
        .page-content a {
          color: var(--primary);
          text-decoration: underline;
        }
        .page-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 20px 0;
        }

        @media (max-width: 768px) {
          .page-content h2 { font-size: 26px; }
          .page-content h3 { font-size: 22px; }
          .page-content { font-size: 15px; }
        }
      `}} />
        </div>
    );
}
