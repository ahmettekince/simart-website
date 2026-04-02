
import React from "react";
import Link from "next/link";


import { defaultFaqTabs } from "@/data/faqs";
import Accordion from "@/components/common/Accordion";
import { getLocalizedUrl } from "@/utils/i18n";

export const metadata = {
    title: "Sıkça Sorulan Sorular - Şımart Teknoloji",
    description: "Şımart Teknoloji hakkında sıkça sorulan sorular ve yanıtları.",
};

export default async function Page({ params: { lang } }) {
    const finalFaqs = defaultFaqTabs.map(tab => ({
        id: tab.id,
        slug: tab.id,
        name: tab.label,
        faqs: tab.faqs,
        lang: lang // lang bilgisini içeri aktaralım
    }));

    return (
        <>
            {/* page-title */}
            <div className="tf-page-title style-2">
                <div className="container-full">
                    <div className="heading text-center">Sıkça Sorulan Sorular</div>
                </div>
            </div>
            {/* /page-title */}

            {/* FAQ */}
            <section className="flat-spacing-11">
                <div className="container">
                    <div className="tf-accordion-wrap d-flex justify-content-between">

                        <div className="box">
                            <div className="tf-accordion-link-list w-100 sticky-top radius-10 border-line" style={{ top: "100px" }}>
                                {finalFaqs.map((item) => (
                                    <div key={item.slug} className="tf-link-item">
                                        <a
                                            className="d-flex justify-content-between align-items-center line"
                                            href={`#${item.slug}`}
                                        >
                                            <h6 className="fw-5">{item.name}</h6>
                                            <div className="icon">
                                                <i className="icon-arrow1-top-left" />
                                            </div>
                                        </a>
                                    </div>
                                ))}


                                <div className="tf-link-item">
                                    <Link
                                        className="d-flex justify-content-between align-items-center"
                                        href={getLocalizedUrl("/destek#destek-formu", lang)}
                                        scroll={true}
                                    >
                                        <h6 className="fw-5">Bize Ulaşın</h6>
                                        <div className="icon">
                                            <i className="icon-arrow1-top-left" />
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="content">
                            {finalFaqs.length > 0 ? (
                                finalFaqs.map((item) => (
                                    <div key={item.slug} id={item.slug} className="faq-section mb_60">
                                        <h5 className="mb_24">
                                            {item.name}
                                        </h5>
                                        <div className="flat-accordion style-default has-btns-arrow">
                                            <Accordion faqs={item.faqs} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-5">
                                    <p className="text-muted">Henüz SSS içeriği bulunmamaktadır.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
