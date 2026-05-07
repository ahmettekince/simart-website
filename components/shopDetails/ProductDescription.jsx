"use client";

import React, { memo } from "react";
import { decodeHtmlEntities } from "@/utils/stripHtml";

const ProductDescription = memo(({ product, pageKeywords }) => {
    const descVal = product?.description;
    const hasDescription = descVal != null && String(descVal).trim() !== "";

    const processedDescription = React.useMemo(() => {
        if (!hasDescription) return "";
        const decoded = decodeHtmlEntities(descVal);
        const pName = product.name || product.title || "";
        const dynamicAlt = pName 
            ? (pageKeywords ? `${pName} - ${pageKeywords}` : `${pName} - Şımart Teknoloji`)
            : "Şımart Teknoloji";

        // img etiketlerine dinamik alt text ekle/güncelle
        return decoded.replace(/<img\s([^>]*)\/?>/gi, (match, attrs) => {
            // Mevcut alt attribute'larını temizle ve yenisini ekle
            const cleanAttrs = attrs
                .replace(/\balt="[^"]*"/gi, '')
                .replace(/\balt='[^']*'/gi, '')
                .replace(/\s+/g, ' ')
                .trim();
            
            return `<img ${cleanAttrs} alt="${dynamicAlt}" />`;
        });
    }, [descVal, hasDescription, product.name, product.title, pageKeywords]);

    if (!hasDescription) return null;

    const descriptionContainerClass = product?.description_layout === "full" ? "container-fluid" : "container";

    return (
        <section className="product-description-section" style={{ overflowX: "hidden", paddingTop: "45px" }}>
            <div className={descriptionContainerClass}>
                <div className="row">
                    <div className="col-12">
                        <div
                            className="product-description-text"
                            dangerouslySetInnerHTML={{ __html: processedDescription }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
});

ProductDescription.displayName = "ProductDescription";

export default ProductDescription;

