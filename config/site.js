/**
 * Site genelinde kullanılan sabit veriler
 * Telefon numaraları, e-posta adresleri, adres bilgileri vb.
 */

export const siteConfig = {
    // İletişim Bilgileri
    contact: {
        phone: {
            customerService: {
                display: "+90 850 346 6126 (Müşteri Hizmetleri)",
                tel: "+908503466126",
                href: "tel:+908503466126",
            },
            whatsapp: {
                display: "+90 552 642 8208 (WhatsApp Hattı)",
                tel: "+905526428208",
                href: "https://api.whatsapp.com/send/?phone=%2B905526428208&text&type=phone_number&app_absent=0",
            },
        },
        email: {
            support: "destek@simart.me",
        },
        address: {
            street: "Yeşilova Mah. 4023 Cad. Ser Tower Apt. Dış Kapı: 1 G",
            city: "Ankara",
            country: "Türkiye",
            postalCode: "06796",
            district: "Etimesgut",
            state: "Ankara",
        },
    },

    // Sosyal Medya - Footer'da gösterilecek sırayla
    social: [
        {
            name: "facebook",
            url: "https://www.facebook.com/simartteknoloji",
            icon: "icon-fb",
            iconSize: "fs-14",
            className: "social-facebook",
        },
        {
            name: "instagram",
            url: "https://www.instagram.com/simartteknoloji/",
            icon: "icon-instagram",
            iconSize: "fs-14",
            className: "social-instagram",
        },
        {
            name: "tiktok",
            url: "",
            icon: "icon-tiktok",
            iconSize: "fs-14",
            className: "social-tiktok",
        },
        {
            name: "pinterest",
            url: "",
            icon: "icon-pinterest-1",
            iconSize: "fs-14",
            className: "social-pinterest",
        },
        {
            name: "youtube",
            url: "https://www.youtube.com/c/ŞımartTeknoloji",
            icon: "icon-youtube",
            iconSize: "fs-14",
            className: "social-youtube",
        },
        {
            name: "twitter",
            url: "https://x.com/simartteknoloji",
            icon: "icon-Icon-x",
            iconSize: "fs-12",
            className: "social-twiter",
        },
        {
            name: "linkedin",
            url: "https://www.linkedin.com/company/şımart-teknoloji/",
            icon: "icon-linkedin",
            iconSize: "fs-14",
            className: "social-linkedin",
        },
    ],

    // Mobil Uygulama Linkleri
    apps: {
        appStore: "https://apps.apple.com/tr/app/şımart/id1583706431?l=tr",
        googlePlay: "https://play.google.com/store/apps/details?id=com.lemo.simarttest&hl=tr&gl=US",
    },

    // Site Bilgileri
    site: {
        name: "Şımart Teknoloji",
        title: "Robot Süpürge ve Akıllı Ev Sistemleri",
        url: "https://simart.me/",
        logo: "https://simart.me/uploads/systems/logo.webp",
        author: "Şımart Teknoloji",
        description: "Şımart Teknoloji, robot süpürgeler, akıllı ev sistemleri ve IoT çözümlerinde öncüdür. Ev otomasyonu ve yaşamı kolaylaştıran teknolojilerle hizmetinizdeyiz.",
        keywords: "Robot süpürge, Şımart Teknoloji",
        recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI", // Google test key - Production için değiştirin

        og: {
            title: "Şımart Teknoloji - Robot Süpürge ve Akıllı Ev Sistemleri",
            description: "Şımart Teknoloji, robot süpürgeler, akıllı ev sistemleri ve IoT çözümlerinde öncüdür. Ev otomasyonu ve yaşamı kolaylaştıran teknolojilerle hizmetinizdeyiz.",
            image: "https://simart.me/og.jpg",
            type: "website",
            locale: "tr_TR",
        },
        twitter: {
            card: "summary_large_image",
            title: "Şımart Teknoloji - Robot Süpürge ve Akıllı Ev Sistemleri",
            description: "Şımart Teknoloji, robot süpürgeler, akıllı ev sistemleri ve IoT çözümlerinde öncüdür. Ev otomasyonu ve yaşamı kolaylaştıran teknolojilerle hizmetinizdeyiz.",
            image: "https://simart.me/og.jpg",
            site: "@simartteknoloji",
            creator: "@simartteknoloji",
        },
        itemprop: {
            name: "Şımart Teknoloji - Robot Süpürge ve Akıllı Ev Sistemleri",
            description: "Şımart Teknoloji, robot süpürgeler, akıllı ev sistemleri ve IoT çözümlerinde öncüdür. Ev otomasyonu ve yaşamı kolaylaştıran teknolojilerle hizmetinizdeyiz.",
            image: "https://simart.me/uploads/systems/seo.jpg",
        },
        tracking: {
            googleAnalytics: "G-GQP4JCTH72",
            metaPixel: "529025925073486",
            tiktokPixel: "CVDS0HRC77UBK4421FCG",
            gtm: "GTM-TKCLRL3",
        }
    },
};

