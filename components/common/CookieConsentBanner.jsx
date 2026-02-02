"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const COOKIE_NAME = "cookie_consent";
const COOKIE_EXPIRY = 365;

export default function CookieConsentBanner() {
    const [visible, setVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const consent = Cookies.get(COOKIE_NAME);
        if (!consent) {
            setVisible(true);
        }
    }, []);

    const accept = () => {
        Cookies.set(COOKIE_NAME, "accepted", { expires: COOKIE_EXPIRY });
        setVisible(false);
    };

    const decline = () => {
        Cookies.set(COOKIE_NAME, "declined", { expires: COOKIE_EXPIRY });
        setVisible(false);
    };

    const openSettings = () => {
        Cookies.set(COOKIE_NAME, "declined", { expires: COOKIE_EXPIRY });
        setVisible(false);
        router.push("/gizlilik-politikasi#cerez-ayarlari");
    };

    if (!visible) return null;

    return (
        <div className="cookie-banner-simart">
            <div className="cookie-banner-inner">
                <div className="cookie-banner-content">
                    <h3 className="cookie-banner-title">Sana Özel Bir Deneyim Sunuyoruz</h3>
                    <p className="cookie-banner-text">
                        Sitenin temel görevlerinin çalışması, kampanya ve duyurulardan haberdar olmanız için çerezler kullanıyoruz.
                        Tümünü reddet&apos;i seçerseniz bazı özelliklerden yararlanamayabilirsiniz.
                        {" "}
                        <Link href="/gizlilik-politikasi" className="cookie-banner-link">
                            Gizlilik Politikası
                        </Link>
                    </p>
                </div>
                <div className="cookie-banner-buttons">
                    <button type="button" onClick={decline} className="cookie-btn cookie-btn-decline">
                        Tümünü Reddet
                    </button>
                    <button type="button" onClick={openSettings} className="cookie-btn cookie-btn-settings">
                        Çerez Ayarları
                    </button>
                    <button type="button" onClick={accept} className="cookie-btn cookie-btn-accept">
                        Tümünü Kabul Et
                    </button>
                </div>
            </div>
        </div>
    );
}
