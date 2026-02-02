"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

import { paymentImages } from "@/data/footerLinks";
import { siteConfig } from "@/config/site";
import Logo from "@/components/common/Logo";
import apiClient from "@/utils/apiClient";

export default function Footer({ bgColor = "", footerMenus = null }) {
  useEffect(() => {
    const headings = document.querySelectorAll(".footer-heading-moblie");

    const toggleOpen = (event) => {
      const parent = event.target.closest(".footer-col-block");

      parent.classList.toggle("open");
    };

    headings.forEach((heading) => {
      heading.addEventListener("click", toggleOpen);
    });

    // Clean up event listeners when the component unmounts
    return () => {
      headings.forEach((heading) => {
        heading.removeEventListener("click", toggleOpen);
      });
    };
  }, []); // Empty dependency array means this will run only once on mount

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
    e.preventDefault(); // Prevent default form submission behavior
    const email = e.target.email.value;

    try {
      const response = await apiClient.post("/newsletter/subscribe", null, {
        params: { email },
      });

      if (response.data && response.data.status === "success") {
        e.target.reset(); // Reset the form
        setSuccess(true); // Set success state
        setApiMessage(response.data.message || "Başarıyla abone oldunuz.");
        handleShowMessage();
      } else {
        setSuccess(false); // Handle unexpected responses
        setApiMessage(response.data?.message || "Bir hata oluştu.");
        handleShowMessage();
      }
    } catch (error) {
      console.error("Error:", error.response?.data || "An error occurred");
      setSuccess(false); // Set error state
      setApiMessage(error.response?.data?.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
      handleShowMessage();
      e.target.reset(); // Reset the form
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
                    <Link href={`/`}>
                      <Image
                        alt="image"
                        src="/images/logo/logo.svg"
                        width={136}
                        height={21}
                        loading="lazy"
                        fetchPriority="low"
                        unoptimized
                      />
                    </Link>
                  </div>
                  <ul>
                    <li>
                      <p>
                        Adres: Yeşilova Mah. 4023 Cad. <br /> Ser Tower Apt. Dış Kapı: 1 G Etimesgut/Ankara
                      </p>
                    </li>
                    <li>
                      <p>
                        Email: <a href="mailto:destek@simart.me">destek@simart.me</a>
                      </p>
                    </li>
                    <li>
                      <p>
                        Phone: <a href="tel:+908503466126">+90 850 346 6126</a>
                      </p>
                    </li>
                  </ul>
                  <Link href={`/iletisim`} className="tf-btn btn-line">
                    Haritada İncele
                    <i className="icon icon-arrow1-top-left" />
                  </Link>
                  <ul className="tf-social-icon d-flex gap-10">
                    {siteConfig.social.facebook && (
                      <li>
                        <a
                          href={siteConfig.social.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="box-icon w_34 round social-facebook social-line"
                        >
                          <i className="icon fs-14 icon-fb" />
                        </a>
                      </li>
                    )}
                    {siteConfig.social.twitter && (
                      <li>
                        <a
                          href={siteConfig.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="box-icon w_34 round social-twiter social-line"
                        >
                          <i className="icon fs-12 icon-Icon-x" />
                        </a>
                      </li>
                    )}
                    {siteConfig.social.instagram && (
                      <li>
                        <a
                          href={siteConfig.social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="box-icon w_34 round social-instagram social-line"
                        >
                          <i className="icon fs-14 icon-instagram" />
                        </a>
                      </li>
                    )}
                    {siteConfig.social.tiktok && (
                      <li>
                        <a
                          href={siteConfig.social.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="box-icon w_34 round social-tiktok social-line"
                        >
                          <i className="icon fs-14 icon-tiktok" />
                        </a>
                      </li>
                    )}
                    {siteConfig.social.pinterest && (
                      <li>
                        <a
                          href={siteConfig.social.pinterest}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="box-icon w_34 round social-pinterest social-line"
                        >
                          <i className="icon fs-14 icon-pinterest-1" />
                        </a>
                      </li>
                    )}
                    {siteConfig.social.youtube && (
                      <li>
                        <a
                          href={siteConfig.social.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="box-icon w_34 round social-youtube social-line"
                        >
                          <i className="icon fs-14 icon-youtube" />
                        </a>
                      </li>
                    )}
                    {siteConfig.social.linkedin && (
                      <li>
                        <a
                          href={siteConfig.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="box-icon w_34 round social-linkedin social-line"
                        >
                          <i className="icon fs-14 icon-linkedin" />
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              {/* Footer menüleri - slug'a göre dinamik olarak render edilir */}
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
                              <Link href={item.url || "#"} className="footer-menu_item" target={item.target || "_self"}>
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
                    <h6>Abone Olun</h6>
                  </div>
                  <div className="footer-heading footer-heading-moblie">
                    <h6>Abone Olun</h6>
                  </div>
                  <div className="tf-collapse-content">
                    <div className="footer-menu_item">
                      Yeni gelişmeler, indirimler, özel içeriğe, etkinliklere ve daha fazlasına erişim için abone olun!
                    </div>
                    <div className={`tfSubscribeMsg ${showMessage ? "active" : ""}`}>
                      {success ? (
                        <p style={{ color: "rgb(52, 168, 83)" }}>{apiMessage || "Başarıyla abone oldunuz."}</p>
                      ) : (
                        <p style={{ color: "red" }}>{apiMessage || "Bir hata oluştu"}</p>
                      )}
                    </div>
                    <form
                      ref={formRef}
                      onSubmit={sendEmail}
                      className="form-newsletter subscribe-form"
                      action="#"
                      method="post"
                      acceptCharset="utf-8"
                      data-mailchimp="true"
                    >
                      <div className="subscribe-content">
                        <fieldset className="email">
                          <input
                            required
                            type="email"
                            name="email"
                            className="subscribe-email"
                            placeholder="E-posta adresinizi giriniz..."
                            tabIndex={0}
                            aria-required="true"
                            autoComplete="abc@xyz.com"
                          />
                        </fieldset>
                        <div className="button-submit">
                          <button
                            className="subscribe-button tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn"
                            type="submit"
                          >
                            Abone Ol
                            <i className="icon icon-arrow1-top-left" />
                          </button>
                        </div>
                      </div>
                      <div className="subscribe-msg" />
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="footer-bottom-wrap d-flex gap-20 flex-wrap justify-content-between align-items-center">
                  <div className="footer-menu_item">© 2020-2026 Şımart Teknoloji. Tüm Hakları Saklıdır.</div>
                  <div className="tf-payment">
                    {paymentImages.map((image, index) => (
                      <Image key={index} src={image.src} width={image.width} height={image.height} alt={image.alt} />
                    ))}
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
