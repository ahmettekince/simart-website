// About sayfası için veri dosyası
import React from 'react';

// Icon component'leri
export const AboutIcons = {
    BizKimiz: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    ),
    NeYapiyoruz: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    ),
    Hikayemiz: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Sertifikalar: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    Odullerimiz: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
    ),
    Etkinliklerimiz: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
    ),
    Kariyer: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    BasindaBiz: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
    ),
    KilometreTaslari: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0121 18.382V7.618a1 1 0 01-1.447-.894L15 4m0 13V4" />
        </svg>
    ),
}

export const getMenuItems = (lang = "tr") => {
    const isEn = lang === "en";
    return [
        {
            id: "hikayemiz",
            label: isEn ? "Our Story" : "Hikayemiz",
            iconId: "Hikayemiz",
        },
        {
            id: "kilometre-taslari",
            label: isEn ? "Milestones" : "Kilometre Taşları",
            iconId: "KilometreTaslari",
        },
        {
            id: "sertifikalar",
            label: isEn ? "Certificates" : "Sertifikalar",
            iconId: "Sertifikalar",
        },
        {
            id: "odullerimiz",
            label: isEn ? "Our Awards" : "Ödüllerimiz",
            iconId: "Odullerimiz",
        },
        {
            id: "etkinliklerimiz",
            label: isEn ? "Our Events" : "Etkinliklerimiz",
            iconId: "Etkinliklerimiz",
        },
        {
            id: "basinda-biz",
            label: isEn ? "In Press" : "Basında Biz",
            iconId: "BasindaBiz",
        },
        {
            id: "kariyer",
            label: isEn ? "Careers" : "Kariyer",
            iconId: "Kariyer",
        },
    ];
};

// Deprecated: use getMenuItems instead. Keeping for backward compatibility if needed temporarily
export const menuItems = getMenuItems("tr");

export const getSections = (lang = "tr") => {
    const isEn = lang === "en";
    return [
        {
            id: "biz-kimiz",
            title: isEn ? "WHO WE ARE ?" : "BİZ KİMİZ ?",
            contentBlocks: [
                {
                    subtitle: isEn ? "Technological, Innovative Products, 'Smart' Solutions..." : "Teknolojik, Yenilikçi Ürünler, 'Akıllı' Çözümler...",
                    paragraphs: isEn ? [
                        "<p>Welcome to <strong>SIMART</strong>, a brand dedicated to producing smart and innovative solutions to improve your daily life. We recognize that technology is constantly evolving and we work with a passion to be at the forefront of these developments. So what do we do? <strong>SIMART</strong> offers you a wide range of products designed to make your life more comfortable, more convenient and safer.</p>",
                        "<p><strong>Our goal is very clear:</strong> We want to simplify your way of living by offering easy-to-use and smart solutions that integrate seamlessly into your daily routines. Because we believe technology should make your life easier, not harder.</p>"
                    ] : [
                        "<p>Günlük yaşamınızı iyileştirmek için akıllı ve yenilikçi çözümler üretmeye kendini adamış bir marka olan <strong>ŞIMART</strong>‘a hoş geldiniz. Teknolojinin sürekli geliştiğinin farkındayız ve bu gelişmelerin ön saflarında yer alma tutkusuyla çalışıyoruz. Peki ne yapıyoruz? <strong>ŞIMART</strong> sizlere, hayatınızı daha rahat, daha konforlu ve daha güvenli hale getirmek için tasarlanmış geniş bir ürün yelpazesi sunuyor. Burada çok çeşitli akıllı ev sistemleri, güvenlik sistemleri ve sağlıklı yaşam ürünleri bulacaksınız. Yaptığı işe aşık, donanımlı uzmanlardan oluşan ekibimiz, size en iyi ürünleri sunmak için sürekli son teknolojiyi araştırmaya ve geliştirmeye odaklanmıştır.</p>",
                        "<p><strong>Amacımız çok net:</strong> Günlük rutinlerinize sorunsuz bir şekilde entegre olan, kullanımı kolay ve akıllı çözümler sunarak yaşama şeklinizi kolaylaştırmak istiyoruz. Çünkü biz teknolojinin hayatınızı zorlaştırması değil, kolaylaştırması gerektiğine inanıyoruz. Ayrıca <strong>ŞIMART</strong> olarak müşterilerimize en üst düzeyde müşteri hizmeti sunmayı taahhüt etmekteyiz. Ürünlerimizden tamamen memnun kalmanız ve onlardan en iyi şekilde yararlanabilmeniz için gereken tüm desteği sağlamak istiyoruz. İlginiz için teşekkür ederiz. Bu ilginin karşılığını en güzel şekilde vermek ve sizin de hayatınızı daha akıllı ve kolay hale getirmek için sabırsızlıkla bekliyoruz.",
                    ],
                },
            ],
        },
        {
            id: "neler-yapiyoruz",
            title: isEn ? "WHAT WE DO ?" : "NE YAPIYORUZ ?",
            contentBlocks: [
                {
                    paragraphs: isEn ? [
                        "Our smart home systems include various smart bulbs, smart toilet seat, smart remote control, smart plug, smart finger and bluetooth gateway. With <strong>SIMART</strong>‘s smart home systems, you can easily control your home's lighting, temperature and more with a few touches from your smartphone. Our security systems are designed to keep you and your family safe. Our Katya Series Smart Robot Vacuums make your home cleaning effortless and efficient."
                    ] : [
                        "Akıllı ev sistemlerimiz arasında çeşitli akıllı ampuller, akıllı klozet kapağı, akıllı kumanda, akıllı priz, akıllı parmak ve bluetooth ağ geçidi bulunur. <strong>ŞIMART</strong>’ın akıllı ev sistemleri ile evinizin aydınlatmasını, sıcaklığını ve daha fazlasını akıllı telefonunuzdan birkaç dokunuşla kolayca kontrol edebilirsiniz. Güvenlik sistemlerimiz sizi ve ailenizi güvende tutmak için tasarlanmıştır. Akıllı duman, hareket ve kapı pencere sensörleri, yanıcı gaz alarmı, su kaçağı dedektörü ve akıllı kamera sayesinde eviniz her zaman güvende ve koruma altında olur. katya Serisi Akıllı Robot Süpürgelerimiz evinizin temizliğini zahmetsiz ve verimli hale getirir. Sağlıklı bir yaşam tarzı için, kilonuzu ve vücut kompozisyonunuzu takip eden akıllı tartı ile antrenmanınızı izlemenize olanak sağlayan, ayrıca kondisyonunuzu geliştirmenize yardımcı olan akıllı atlama ipi sunuyoruz. <strong>ŞIMART</strong> olarak, müşterilerimize hayatlarını daha rahat, konforlu ve güvenli hale getirmek için en son teknolojiyi sağlamaya kararlıyız. <strong>ŞIMART</strong>’ı seçtiğiniz için teşekkür ederiz.",
                    ],
                }
            ],
        },
        {
            id: "hikayemiz",
            title: isEn ? "OUR STORY" : "HİKAYEMİZ",
            contentBlocks: [
                {
                    subtitle: isEn ? "Company Story" : "Şirket Hikayesi",
                    paragraphs: isEn ? [
                        "<p>The emergence of the Internet of Things (IoT) has changed our lives in many ways. IoT technology has made it possible for us to do things that were impossible a few years ago by connecting devices and enabling them to communicate. As <strong>SIMART</strong>, we are dedicated to developing innovative and high-tech products that make your life easier and more enjoyable.</p>",
                        "<p>As Turkish engineers, we set out with the mission and goal of being the first manufacturer to design and produce various technological products in our country to be used in our households, as well as in industrial and collective use areas in the IoT sector.</p>"
                    ] : [
                        "<p>Nesnelerin İnterneti’nin (IoT) ortaya çıkışı, hayatımızı pek çok şekilde değiştirdi. IoT teknolojisi, cihazları birbirine bağlayarak ve iletişim kurmalarını sağlayarak, birkaç yıl önce imkansız olan şeyleri yapmamızı mümkün kıldı. <strong>ŞIMART</strong> olarak hayatınızı kolaylaştırarak daha keyifli hale getiren yenilikçi ve yüksek teknolojili ürünler geliştirmeye adadık.</p>",
                        "<p>Türk mühendisleri olarak IoT sektöründe, gerek hanelerimizde gerekse endüstriyel ve toplu kullanım alanlarında faydalanılacak birbirinden özel teknolojik ürünleri ülkemizde tasarlayıp üreten ilk üretici olma misyonu ve hedefiyle yola çıktık.</p>",
                        "<p>Akıllı ev sistemleri veya otomatik aydınlatma sistemleri gibi kolaylık çözümleri arayan ev sahiplerinden, verimli yönetim araçları arayan işletme sahiplerine kadar ürünlerimizi kullanan herkesin teknolojilerimiz aracılığıyla hayatlarının zenginleştiğini hissetmesini istiyoruz.</p>",
                        "<p>Yalnızca en yeni özellikleri sağlamakla kalmıyor, aynı zamanda bunların kullanımının kolay ve sezgisel olmasını sağlıyoruz, bu sayede önceden deneyimi olmayanlar bile bu teknolojik ürünlerden hızla faydalanabiliyor.</p>",
                        "<p><strong>ŞIMART</strong> olarak hedefimiz, yeni teknolojilerin inovasyonu söz konusu olduğunda her zaman ön planda olmak ve bu yolda her adımda üst düzey müşteri hizmetleri sunmaktır. Böylece teknoloji inovasyonunda iş ortağınız olarak bizi seçtiğinizde yenilikçi çözüm ve yüksek kalite elde edeceğinizi bilirsiniz!</p>",
                    ],
                },
            ],
        },
    ];
};

export const getCompanyInfo = (lang = "tr") => {
    const isEn = lang === "en";
    return {
        videoUrl: "https://www.youtube.com/embed/Jjlxo4jeONU",
        videoTitle: isEn ? "Şımart Technology" : "Şımart Teknoloji",
        coverImage: "/images/video-cover.jpg",
    };
};

export const getPressItems = (lang = "tr") => {
    const isEn = lang === "en";
    return [
        {
            id: 1,
            title: isEn ? "Web Tekno - Robot Vacuum and Smart Home Systems" : "Web Tekno - Robot Süpürge ve Akıllı Ev Sistemleri",
            link: "https://www.webtekno.com/akilli-ev-teknolojileri-gelistiren-simart-teknoloji-nin-ceo-su-mustafa-emrah-babur-la-teknoloji-konustuk-h146498.html",
            imageUrl: "/images/press/basinda-biz-1.webp",
        },
        // ... (remaining items could be added similarly if needed, but keeping dynamic for now)
    ];
};
