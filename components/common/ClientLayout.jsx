"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { getCart } from "@/api/cart";
import HomesModal from "@/components/modals/HomesModal";
import Context from "@/context/Context";
import ShopCart from "@/components/modals/ShopCart";
import AskQuestion from "@/components/modals/AskQuestion";
import DeliveryReturn from "@/components/modals/DeliveryReturn";
import SearchModal from "@/components/modals/SearchModal";
import ToolbarBottom from "@/components/modals/ToolbarBottom";
import ToolbarShop from "@/components/modals/ToolbarShop";
import NewsletterModal from "@/components/modals/NewsletterModal";
import ShareModal from "@/components/modals/ShareModal";
import ScrollTop from "@/components/common/ScrollTop";
import WhatsappButton from "@/components/common/WhatsappButton";
import CookieConsentBanner from "@/components/common/CookieConsentBanner";

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const lastScrollY = useRef(0);
    const [scrollDirection, setScrollDirection] = useState("down");
    const syncFromAPI = useCartStore((state) => state.syncFromAPI);
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
        const handleScroll = () => {
            const header = document.querySelector("header");
            if (header) {
                if (window.scrollY > 100) {
                    header.classList.add("header-bg");
                } else {
                    header.classList.remove("header-bg");
                }
            }

            const currentScrollY = window.scrollY;
            if (currentScrollY > 250) {
                if (currentScrollY > lastScrollY.current) {
                    setScrollDirection("down");
                } else {
                    setScrollDirection("up");
                }
            } else {
                setScrollDirection("down");
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll);
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

        // WOW Init
        const WOW = require("@/utils/wow");
        const wow = new WOW.default({ mobile: false, live: false });
        wow.init();
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
        <Context>
            <div id="wrapper">{children}</div>
            <HomesModal />
            <ShopCart />
            <AskQuestion />
            <DeliveryReturn />
            <SearchModal />
            <ToolbarBottom />
            <ToolbarShop />
            <NewsletterModal />
            <ShareModal />
            <ScrollTop />
            {/* WhatsApp butonu*/}
            {/* <div className="whatsapp-floating-btn">
                <WhatsappButton />
            </div> */}
            <CookieConsentBanner />
        </Context>
    );
}
