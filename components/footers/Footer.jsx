"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import SimartButton from "@/components/common/SimartButton";
import apiClient from "@/utils/apiClient";
import AppStoreButtons from "./AppStoreButtons";

import { getLocalizedUrl } from "@/utils/i18n";

const translations = {
  tr: {
    address: "Adres",
    email: "E-posta",
    phone: "Telefon",
    viewOnMap: "Haritada İncele",
    subscribeTitle: "Abone Olun",
    subscribeDesc: "Yeni gelişmeler, indirimler, özel içeriğe, etkinliklere ve daha fazlasına erişim için abone olun!",
    subscribePlaceholder: "E-posta adresinizi giriniz...",
    subscribeButton: "Abone Ol",
    subscribeSuccess: "Başarıyla abone oldunuz.",
    subscribeError: "Bir hata oluştu.",
    subscribeGeneralError: "Bir hata oluştu. Lütfen tekrar deneyin.",
    copyright: "© 2020-2026 Şımart Teknoloji. Tüm Hakları Saklıdır."
  },
  en: {
    address: "Address",
    email: "E-mail",
    phone: "Phone",
    viewOnMap: "View on Map",
    subscribeTitle: "Subscribe",
    subscribeDesc: "Subscribe to get access to new developments, discounts, special content, events and more!",
    subscribePlaceholder: "Enter your email address...",
    subscribeButton: "Subscribe",
    subscribeSuccess: "Successfully subscribed.",
    subscribeError: "An error occurred.",
    subscribeGeneralError: "An error occurred. Please try again.",
    copyright: "© 2020-2026 Şımart Technology. All Rights Reserved."
  }
};

export default function Footer({ bgColor = "", footerMenus = null, lang = "tr" }) {
  const t = translations[lang] || translations.tr;

  useEffect(() => {
    const headings = document.querySelectorAll(".footer-heading-moblie");

    const toggleOpen = (event) => {
      const parent = event.target.closest(".footer-col-block");
      parent.classList.toggle("open");
    };

    headings.forEach((heading) => {
      heading.addEventListener("click", toggleOpen);
    });

    return () => {
      headings.forEach((heading) => {
        heading.removeEventListener("click", toggleOpen);
      });
    };
  }, []);

  const formRef = useRef();
  const [success, setSuccess] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [apiMessage, setApiMessage] = useState("");

  const handleShowMessage = () => {
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 5000);
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;

    try {
      const response = await apiClient.post("/newsletter/subscribe", null, {
        params: { email, lang },
      });

      if (response.data && response.data.status === "success") {
        e.target.reset();
        setSuccess(true);
        setApiMessage(response.data.message || t.subscribeSuccess);
        handleShowMessage();
      } else {
        setSuccess(false);
        setApiMessage(response.data?.message || t.subscribeError);
        handleShowMessage();
      }
    } catch (error) {
      console.error("Error:", error.response?.data || "An error occurred");
      setSuccess(false);
      setApiMessage(error.response?.data?.message || t.subscribeGeneralError);
      handleShowMessage();
      e.target.reset();
    }
  };

  return (
    <footer id="footer" className={`footer md-pb-70 ${bgColor}`}>
      <div className="footer-wrap">
        <div className="footer-body">
          <div className="container">
            <div className="row">
              <div className="col-xl-3 col-md-6 col-12">
                <div className="footer-infor">
                  <div className="footer-logo">
                    <Link href={getLocalizedUrl("/", lang)}>
                      <Image
                        alt="logo"
                        src="/images/logo/logo.svg"
                        width={136}
                        height={21}
                        style={{ height: 'auto' }}
                        loading="lazy"
                        fetchPriority="low"
                        unoptimized
                      />
                    </Link>
                  </div>
                  <ul>
                    <li>
                      <p>
                        {t.address}: Yeşilova Mah. 4023 Cad. <br /> Ser Tower Apt. Dış Kapı: 1 G Etimesgut/Ankara
                      </p>
                    </li>
                    <li>
                      <p>
                        {t.email}: <a href="mailto:destek@simart.me">destek@simart.me</a>
                      </p>
                    </li>
                    <li>
                      <p>
                        {t.phone}: <a href="tel:+908503466126">+90 850 346 6126</a>
                      </p>
                    </li>
                  </ul>
                  <Link href={getLocalizedUrl("/iletisim", lang)} className="tf-btn btn-line">
                    {t.viewOnMap}
                    <i className="icon icon-arrow1-top-left" />
                  </Link>
                  <AppStoreButtons lang={lang} />
                </div>
              </div>

              {Array.isArray(footerMenus) &&
                footerMenus.map(
                  (menu) =>
                    menu?.items &&
                    menu.items.length > 0 && (
                      <div key={menu.id || menu.slug} className="col-xl-3 col-md-6 col-12 footer-col-block">
                        <div className="footer-heading footer-heading-desktop">
                          <h6>{menu.name}</h6>
                        </div>
                        <div className="footer-heading footer-heading-moblie">
                          <h6>{menu.name}</h6>
                        </div>
                        <ul className="footer-menu-list tf-collapse-content">
                          {menu.items.map((item) => (
                            <li key={item.id}>
                              <Link href={getLocalizedUrl(item.url, lang) || "#"} className="footer-menu_item" target={item.target || "_self"}>
                                {item.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                )}

              <div className="col-xl-3 col-md-6 col-12 ">
                <div className="footer-newsletter footer-col-block">
                  <div className="footer-heading footer-heading-desktop">
                    <h6>{t.subscribeTitle}</h6>
                  </div>
                  <div className="footer-heading footer-heading-moblie">
                    <h6>{t.subscribeTitle}</h6>
                  </div>
                  <div className="tf-collapse-content">
                    <div className="footer-menu_item">
                      {t.subscribeDesc}
                    </div>
                    <div className={`tfSubscribeMsg ${showMessage ? "active" : ""}`}>
                      <p style={{ color: success ? "rgb(52, 168, 83)" : "red" }}>{apiMessage}</p>
                    </div>
                    <form
                      ref={formRef}
                      onSubmit={sendEmail}
                      className="form-newsletter subscribe-form"
                      action="#"
                      method="post"
                      acceptCharset="utf-8"
                    >
                      <div className="subscribe-content">
                        <fieldset className="email">
                          <input
                            required
                            type="email"
                            name="email"
                            className="subscribe-email"
                            placeholder={t.subscribePlaceholder}
                            tabIndex={0}
                            aria-required="true"
                            autoComplete="abc@xyz.com"
                            style={{ borderRadius: "12px" }}
                          />
                        </fieldset>
                        <div className="button-submit">
                          <SimartButton
                            type="submit"
                            variant="fill"
                            className="subscribe-button"
                          >
                            {t.subscribeButton}
                          </SimartButton>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom" style={{ paddingBottom: "50px" }}>
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="footer-bottom-wrap d-flex gap-20 flex-wrap justify-content-between align-items-center">
                  <div className="d-flex align-items-center flex-wrap gap-20">
                    <div className="footer-menu_item">{t.copyright}</div>
                    <ul className="tf-social-icon d-flex gap-10">
                      {siteConfig.social.map((social) => {
                        if (!social.url) return null;
                        return (
                          <li key={social.name}>
                            <a
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`box-icon w_34 round ${social.className} social-line`}
                            >
                              {social.name === "linkedin" ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: "block" }}>
                                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                              ) : (
                                <i className={`icon ${social.iconSize} ${social.icon}`} />
                              )}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="footer-bottom-right d-flex align-items-center gap-20 flex-wrap">
                    <div className="payment-logos d-flex align-items-center gap-15">
                      <Image
                        src="/iyzico.svg"
                        alt="iyzico"
                        width={64}
                        height={24}
                        style={{ height: "auto" }}
                        loading="lazy"
                      />
                      <Image
                        src="/visa.svg"
                        alt="visa"
                        width={40}
                        height={24}
                        style={{ height: "auto" }}
                        loading="lazy"
                      />
                      <Image
                        src="/mastercard.svg"
                        alt="mastercard"
                        width={32}
                        height={24}
                        style={{ height: "auto" }}
                        loading="lazy"
                      />
                    </div>
                    <div className="etbis-logo">
                      <a
                        href="https://etbis.ticaret.gov.tr/tr/SiteSorgulamaSonuc?siteId=c2f2afe3-b443-4375-8fef-27b0f895293e"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src="/images/etbis/etbis.png"
                          alt="ETBİS"
                          width={70}
                          height={81}
                          style={{ height: 'auto' }}
                          loading="lazy"
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
