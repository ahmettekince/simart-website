"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { getCart } from "@/api/cart";
import dynamic from "next/dynamic";
import { i18n } from "@/config/i18n";

// Modalları ve ağır bileşenleri dinamik (lazy) olarak yüklüyoruz. 
// ssr: false sayesinde sunucu yükü azalır ve tarayıcı açıldığı an arka planda yüklenirler.
const ShopCart = dynamic(() => import("@/components/modals/ShopCart"), { ssr: false });
const SearchModal = dynamic(() => import("@/components/modals/SearchModal"), { ssr: false });
const ToolbarBottom = dynamic(() => import("@/components/modals/ToolbarBottom"), { ssr: false });
const ToolbarShop = dynamic(() => import("@/components/modals/ToolbarShop"), { ssr: false });
const GlobalGiftSelectionModal = dynamic(() => import("@/components/modals/GlobalGiftSelectionModal"), { ssr: false });
const CookieConsentBanner = dynamic(() => import("@/components/common/CookieConsentBanner"), { ssr: false });
const CampaignTab = dynamic(() => import("@/components/common/CampaignTab"), { ssr: false });
const ScrollTop = dynamic(() => import("@/components/common/ScrollTop"), { ssr: false });
const Analytics = dynamic(() => import("@/components/common/Analytics"), { ssr: false });

import { useLangStore } from "@/stores/langStore";

export default function ClientLayout({ children, lang }) {
    const pathname = usePathname();
    const lastScrollY = useRef(0);
    const lastScrollDirection = useRef("down");
    const [scrollDirection, setScrollDirection] = useState("down");
    const isSynced = useCartStore((state) => state.isSynced);
    const initAuth = useAuthStore((state) => state.initAuth);
    const setLang = useLangStore((state) => state.setLang);

    useEffect(() => {
        if (lang) {
            setLang(lang);
        }
    }, [lang, setLang]);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            import("bootstrap/dist/js/bootstrap.esm").then(() => { });
        }
    }, []);

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;

                    // Background kontrolü (body üzerinden)
                    if (currentScrollY > 20) {
                        document.body.classList.add("is-scrolled");
                    } else {
                        document.body.classList.remove("is-scrolled");
                    }

                    // Görünürlük (Sticky/Hide) kontrolü
                    const scrollDifference = Math.abs(currentScrollY - lastScrollY.current);
                    if (scrollDifference >= 5) {
                        let newDirection = lastScrollDirection.current;

                        if (currentScrollY > 250) {
                            newDirection = currentScrollY > lastScrollY.current ? "down" : "up";
                        } else {
                            newDirection = "up"; // Üst kısımlarda her zaman göster
                        }

                        if (lastScrollDirection.current !== newDirection) {
                            lastScrollDirection.current = newDirection;
                            setScrollDirection(newDirection);
                        }
                        lastScrollY.current = currentScrollY;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Header scroll: inline style yerine body class kullan (hydration mismatch önlemi)
    useEffect(() => {
        if (scrollDirection === "up") {
            document.body.classList.remove("header-scroll-hide");
        } else {
            document.body.classList.add("header-scroll-hide");
        }
        return () => document.body.classList.remove("header-scroll-hide");
    }, [scrollDirection]);

    useEffect(() => {
        // Close any open modal/offcanvas on route change
        const bootstrap = require("bootstrap");
        const modalElements = document.querySelectorAll(".modal.show");
        modalElements.forEach((modal) => {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) modalInstance.hide();
        });

        const offcanvasElements = document.querySelectorAll(".offcanvas.show");
        offcanvasElements.forEach((offcanvas) => {
            const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvas);
            if (offcanvasInstance) offcanvasInstance.hide();
        });

        // HATA ÖNLEME: Eğer Bootstrap temizleyemezse manuel olarak temizle
        if (typeof document !== "undefined") {
            const backdrops = document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop');
            backdrops.forEach(el => el.remove());
            document.body.classList.remove('modal-open', 'offcanvas-open');
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        }

        // Drift zoom overlay'leri kaldır (ürün detaydan çıkınca kare ekranda kalmasın)
        if (typeof document !== "undefined") {
            document.querySelectorAll(".drift-zoom-pane, .drift-bounding-box").forEach((el) => el.remove());
            document.querySelectorAll(".section-image-zoom").forEach((el) => el.classList.remove("zoom-active"));
        }

        // WOW Init - hydration sonrası çalışsın (SSR/client mismatch önlemi)
        const runWow = () => {
            const WOW = require("@/utils/wow");
            const wow = new WOW.default({ mobile: false, live: false });
            wow.init();
        };
        const timer = setTimeout(runWow, 0);
        return () => clearTimeout(timer);
    }, [pathname]);

    useEffect(() => {
        // Her zaman LTR kullan
        document.documentElement.dir = "ltr";

        const preloader = document.getElementById("preloader");
        if (preloader) preloader.classList.add("disabled");
    }, []);

    // Ürün detay sayfasında body class (scroll-to-top butonu sticky bar üstünde olsun)
    useEffect(() => {
        const parts = pathname.split("/").filter(Boolean);
        const isProductDetail = pathname.startsWith("/magaza") && parts.length === 3;
        if (isProductDetail) {
            document.body.classList.add("product-detail-page");
        } else {
            document.body.classList.remove("product-detail-page");
        }
        return () => document.body.classList.remove("product-detail-page");
    }, [pathname]);

    // Ödeme sayfasında, 3D sayfasında ve QR sayfalarında alt navbar gizle
    useEffect(() => {
        const parts = pathname.split("/").filter(Boolean);
        // Dil önekini temizleyip temiz yolu alalım (ör: /tr/qr-genar -> /qr-genar)
        const cleanPath = (parts.length > 0 && i18n.locales.includes(parts[0]))
            ? "/" + parts.slice(1).join("/")
            : pathname;

        const isHideToolbarPage =
            cleanPath === "/odeme" ||
            cleanPath === "/checkout" ||
            cleanPath === "/3d" ||
            cleanPath.startsWith("/qr") ||
            cleanPath.startsWith("/odeme-") ||
            cleanPath.startsWith("/payment-");

        if (isHideToolbarPage) {
            document.body.classList.add("odeme-page");
        } else {
            document.body.classList.remove("odeme-page");
        }
        return () => document.body.classList.remove("odeme-page");
    }, [pathname]);

    // Cart'ı API'den sync et (İlk yüklemede VE her dil değişiminde)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const { fetchCart: fetchCartAction } = useCartStore.getState();
            fetchCartAction();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lang]); // Dil her değiştiğinde (ve ilk yüklemede) sepeti API'den tazele


    return (
        <>
            <div id="wrapper">{children}</div>
            <ShopCart key={lang} />
            <SearchModal />
            <ToolbarBottom />
            <ToolbarShop />
            <GlobalGiftSelectionModal />
            <CampaignTab />
            <ScrollTop />
            <CookieConsentBanner />
            <Analytics />
        </>
    );
}
