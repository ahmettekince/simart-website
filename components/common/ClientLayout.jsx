"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { getCart } from "@/api/cart";
import ShopCart from "@/components/modals/ShopCart";
import AskQuestion from "@/components/modals/AskQuestion";
import SearchModal from "@/components/modals/SearchModal";
import ToolbarBottom from "@/components/modals/ToolbarBottom";
import ToolbarShop from "@/components/modals/ToolbarShop";
import ScrollTop from "@/components/common/ScrollTop";
import CookieConsentBanner from "@/components/common/CookieConsentBanner";
import Analytics from "@/components/common/Analytics";
import GlobalGiftSelectionModal from "@/components/modals/GlobalGiftSelectionModal";
import CampaignTab from "@/components/common/CampaignTab";
import NewsletterModal from "../modals/NewsletterModal";
import ShareModal from "../modals/ShareModal";

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const lastScrollY = useRef(0);
    const lastScrollDirection = useRef("down");
    const [scrollDirection, setScrollDirection] = useState("down");
    const isSynced = useCartStore((state) => state.isSynced);
    const initAuth = useAuthStore((state) => state.initAuth);

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
        const scrollThreshold = 5; // Minimum scroll farkı (px) - küçük değişiklikleri ignore et

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const header = document.querySelector("header");
                    if (header) {
                        if (window.scrollY > 100) {
                            header.classList.add("header-bg");
                        } else {
                            header.classList.remove("header-bg");
                        }
                    }

                    const currentScrollY = window.scrollY;
                    const scrollDifference = Math.abs(currentScrollY - lastScrollY.current);

                    // Sadece yeterli scroll farkı varsa direction'ı güncelle
                    if (scrollDifference >= scrollThreshold) {
                        let newDirection = lastScrollDirection.current;

                        if (currentScrollY > 250) {
                            newDirection = currentScrollY > lastScrollY.current ? "down" : "up";
                        } else {
                            // Scroll 250'den azsa header'ı göster
                            newDirection = "down";
                        }

                        // Sadece direction gerçekten değiştiyse state'i güncelle
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
        document.body.classList.remove("rtl");

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

    // Ödeme sayfasında alt navbar gizle
    useEffect(() => {
        const isOdemePage = pathname === "/odeme";
        if (isOdemePage) {
            document.body.classList.add("odeme-page");
        } else {
            document.body.classList.remove("odeme-page");
        }
        return () => document.body.classList.remove("odeme-page");
    }, [pathname]);

    // Cart'ı API'den sync et (sadece ilk yüklemede)
    useEffect(() => {
        if (typeof window !== "undefined" && !isSynced) {
            const fetchCart = async () => {
                try {
                    const cartData = await getCart();
                    if (cartData) {
                        // syncFromAPI'yı direkt store'dan al (dependency'den çıkar)
                        const { syncFromAPI: syncFn } = useCartStore.getState();
                        syncFn(cartData);
                    }
                } catch (error) {
                    console.error("[ClientLayout] Cart sync error:", error);
                }
            };
            fetchCart();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSynced]); // syncFromAPI'yı dependency'den çıkardık

    return (
        <>
            <div id="wrapper">{children}</div>
            <ShopCart />
            <AskQuestion />
            <SearchModal />
            <ToolbarBottom />
            <ToolbarShop />
            <ShareModal />
            <GlobalGiftSelectionModal />
            <CampaignTab />
            <ScrollTop />
            {/* WhatsApp butonu*/}
            {/* <div className="whatsapp-floating-btn">
                <WhatsappButton />
            </div> */}
            <CookieConsentBanner />
            <Analytics />
        </>
    );
}
