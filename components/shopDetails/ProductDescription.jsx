"use client";

import React, { memo } from "react";
import { decodeHtmlEntities } from "@/utils/stripHtml";

const ProductDescription = memo(({ product }) => {
    const descVal = product?.description;
    const hasDescription = descVal != null && String(descVal).trim() !== "";

    if (!hasDescription) return null;

    const descriptionContainerClass = product?.description_layout === "full" ? "container-fluid" : "container";

    return (
        <section className="product-description-section" style={{ overflowX: "hidden", paddingTop: "45px" }}>
            <div className={descriptionContainerClass}>
                <div className="row">
                    <div className="col-12">
                        <div
                            className="product-description-text"
                            dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(product.description) }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
});

ProductDescription.displayName = "ProductDescription";

export default ProductDescription;

