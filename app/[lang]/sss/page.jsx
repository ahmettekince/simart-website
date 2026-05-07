import React from "react";
import Link from "next/link";


import { defaultFaqTabs, defaultFaqTabsEn } from "@/data/faqs";
import Accordion from "@/components/common/Accordion";
import { getLocalizedUrl } from "@/utils/i18n";

export async function generateMetadata({ params }) {
    const { lang } = params;

    if (lang === "en") {
        return {
            title: "Frequently Asked Questions - Şımart Technology",
            description: "Frequently asked questions and answers about Şımart Technology.",
        };
    }

    return {
        title: "Sıkça Sorulan Sorular - Şımart Teknoloji",
        description: "Şımart Teknoloji hakkında sıkça sorulan sorular ve yanıtları.",
    };
}

export default async function Page({ params: { lang } }) {
    const currentTabs = lang === "en" ? defaultFaqTabsEn : defaultFaqTabs;

    const finalFaqs = currentTabs.map(tab => ({
        id: tab.id,
        slug: tab.id,
        name: tab.label,
        faqs: tab.faqs,
        lang: lang
    }));

    const t = {
        tr: {
            title: "Sıkça Sorulan Sorular",
            contactUs: "Bize Ulaşın",
            noContent: "Henüz SSS içeriği bulunmamaktadır."
        },
        en: {
            title: "Frequently Asked Questions",
            contactUs: "Contact Us",
            noContent: "No FAQ content available yet."
        }
    }[lang] || {
        tr: {
            title: "Sıkça Sorulan Sorular",
            contactUs: "Bize Ulaşın",
            noContent: "Henüz SSS içeriği bulunmamaktadır."
        }
    }.tr;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": finalFaqs.flatMap(item =>
                            item.faqs.map(faq => ({
                                "@type": "Question",
                                "name": faq.title,
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": faq.content
                                }
                            }))
                        )
                    })
                }}
            />
            <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: '0' }}>
                {lang === "en" ? "Şımart Technology Frequently Asked Questions" : "Şımart Teknoloji Sıkça Sorulan Sorular"}
            </h1>
            {/* page-title */}
            <div className="tf-page-title style-2">
                <div className="container-full">
                    <div className="heading text-center">{t.title}</div>
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
                                        <h6 className="fw-5">{t.contactUs}</h6>
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
                                    <p className="text-muted">{t.noContent}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
