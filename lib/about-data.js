// About sayfası için veri dosyası

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
}

export const menuItems = [
    {
        id: "biz-kimiz",
        label: "Biz Kimiz ?",
        iconId: "BizKimiz",
    },
    {
        id: "neler-yapiyoruz",
        label: "Ne Yapıyoruz ?",
        iconId: "NeYapiyoruz",
    },
    {
        id: "hikayemiz",
        label: "Hikayemiz",
        iconId: "Hikayemiz",
    },
    {
        id: "sertifikalar",
        label: "Sertifikalar",
        iconId: "Sertifikalar",
    },
    {
        id: "odullerimiz",
        label: "Ödüllerimiz",
        iconId: "Odullerimiz",
    },
    {
        id: "etkinliklerimiz",
        label: "Etkinliklerimiz",
        iconId: "Etkinliklerimiz",
    },
    {
        id: "kariyer",
        label: "Kariyer",
        iconId: "Kariyer",
    },
    {
        id: "basinda-biz",
        label: "Basında Biz",
        iconId: "BasindaBiz",
    },
]

export const sections = [
    {
        id: "biz-kimiz",
        title: "BİZ KİMİZ ?",
        contentBlocks: [
            {
                subtitle: "Teknolojik, Yenilikçi Ürünler, 'Akıllı' Çözümler...",
                paragraphs: [
                    "<p>Günlük yaşamınızı iyileştirmek için akıllı ve yenilikçi çözümler üretmeye kendini adamış bir marka olan <strong>ŞIMART</strong>‘a hoş geldiniz. Teknolojinin sürekli geliştiğinin farkındayız ve bu gelişmelerin ön saflarında yer alma tutkusuyla çalışıyoruz. Peki ne yapıyoruz? <strong>ŞIMART</strong> sizlere, hayatınızı daha rahat, daha konforlu ve daha güvenli hale getirmek için tasarlanmış geniş bir ürün yelpazesi sunuyor. Burada çok çeşitli akıllı ev sistemleri, güvenlik sistemleri ve sağlıklı yaşam ürünleri bulacaksınız. Yaptığı işe aşık, donanımlı uzmanlardan oluşan ekibimiz, size en iyi ürünleri sunmak için sürekli son teknolojiyi araştırmaya ve geliştirmeye odaklanmıştır.</p>",
                    "<p><strong>Amacımız çok net:</strong> Günlük rutinlerinize sorunsuz bir şekilde entegre olan, kullanımı kolay ve akıllı çözümler sunarak yaşama şeklinizi kolaylaştırmak istiyoruz. Çünkü biz teknolojinin hayatınızı zorlaştırması değil, kolaylaştırması gerektiğine inanıyoruz. Ayrıca <strong>ŞIMART</strong> olarak müşterilerimize en üst düzeyde müşteri hizmeti sunmayı taahhüt etmekteyiz. Ürünlerimizden tamamen memnun kalmanız ve onlardan en iyi şekilde yararlanabilmeniz için gereken tüm desteği sağlamak istiyoruz. İlginiz için teşekkür ederiz. Bu ilginin karşılığını en güzel şekilde vermek ve sizin de hayatınızı daha akıllı ve kolay hale getirmek için sabırsızlıkla bekliyoruz.",
                ],
            },
        ],
    },
    {
        id: "neler-yapiyoruz",
        title: "NE YAPIYORUZ ?",
        contentBlocks: [
            {
                paragraphs: [
                    "Akıllı ev sistemlerimiz arasında çeşitli akıllı ampuller, akıllı klozet kapağı, akıllı kumanda, akıllı priz, akıllı parmak ve bluetooth ağ geçidi bulunur. <strong>ŞIMART</strong>’ın akıllı ev sistemleri ile evinizin aydınlatmasını, sıcaklığını ve daha fazlasını akıllı telefonunuzdan birkaç dokunuşla kolayca kontrol edebilirsiniz. Güvenlik sistemlerimiz sizi ve ailenizi güvende tutmak için tasarlanmıştır. Akıllı duman, hareket ve kapı pencere sensörleri, yanıcı gaz alarmı, su kaçağı dedektörü ve akıllı kamera sayesinde eviniz her zaman güvende ve koruma altında olur. katya Serisi Akıllı Robot Süpürgelerimiz evinizin temizliğini zahmetsiz ve verimli hale getirir. Sağlıklı bir yaşam tarzı için, kilonuzu ve vücut kompozisyonunuzu takip eden akıllı tartı ile antrenmanınızı izlemenize olanak sağlayan, ayrıca kondisyonunuzu geliştirmenize yardımcı olan akıllı atlama ipi sunuyoruz. <strong>ŞIMART</strong> olarak, müşterilerimize hayatlarını daha rahat, konforlu ve güvenli hale getirmek için en son teknolojiyi sağlamaya kararlıyız. <strong>ŞIMART</strong>’ı seçtiğiniz için teşekkür ederiz.",
                ],
            },
            {
                subtitle: "Güçlü Hedefler, Emin Adımlar​",
                paragraphs: [
                    "<p>Hedefimiz, müşteri beklentilerini karşılamak için ürün yelpazemizi ve hizmetlerimizi sürekli genişletmek, Türk hane yapısına uygun teknolojik ürünler üretmektir. Tasarımı ve üretimi tamamen Türk mühendisler tarafından gerçekleştirilen ürünlerimizi diğer ülkelere ihraç ederek ülke ekonomisine katkıda bulunmayı amaçlıyoruz. Satış ve satış sonrası üst düzey müşteri hizmeti anlayışını esas alıyoruz. Müşterilere en iyi memnuniyeti sunan ürün ve hizmetleri oluşturmakta kararlıyız. Son olarak, içinde yaşadığımız topluma ve çevreye saygılı örnek bir kuruluş, tüketicilerin güvenebileceği, samimi, güvenilir ve şeffaf bir şirket olmak için çalışıyoruz.</p>"
                ]
            },
            {
                subtitle: "Adanmış Bir Topluluk",
                paragraphs: [
                    "<p>Misyonumuz, kullanıcıların hayatlarını zenginleştiren yenilikçi ve verimli çözümler ortaya koymak için en son teknolojiyi kullanarak en üst düzeyde müşteri memnuniyeti sağlamaktır. Türkiye ve dünyadaki dijitalleşme yolculuğunun ayrılmaz bir parçası olmaya kararlıyız ve her adımda müşterilerimizin deneyimlerine değer katmak için çalışıyoruz. Bu sırada da hem yerli ve milli kalkınmaya destek olmaya, hem ülke ekonomisine katma değer sağlamaya devam ediyoruz.</p>"
                ]
            }
        ],
    },
    {
        id: "hikayemiz",
        title: "HİKAYEMİZ",
        contentBlocks: [
            {
                subtitle: "Şirket Hikayesi",
                paragraphs: [
                    "<p>Nesnelerin İnterneti’nin (IoT) ortaya çıkışı, hayatımızı pek çok şekilde değiştirdi. IoT teknolojisi, cihazları birbirine bağlayarak ve iletişim kurmalarını sağlayarak, birkaç yıl önce imkansız olan şeyleri yapmamızı mümkün kıldı. <strong>ŞIMART</strong> olarak hayatınızı kolaylaştırarak daha keyifli hale getiren yenilikçi ve yüksek teknolojili ürünler geliştirmeye adadık.</p>",
                    "<p>Türk mühendisleri olarak IoT sektöründe, gerek hanelerimizde gerekse endüstriyel ve toplu kullanım alanlarında faydalanılacak birbirinden özel teknolojik ürünleri ülkemizde tasarlayıp üreten ilk üretici olma misyonu ve hedefiyle yola çıktık.</p>",
                    "<p>Akıllı ev sistemleri veya otomatik aydınlatma sistemleri gibi kolaylık çözümleri arayan ev sahiplerinden, verimli yönetim araçları arayan işletme sahiplerine kadar ürünlerimizi kullanan herkesin teknolojilerimiz aracılığıyla hayatlarının zenginleştiğini hissetmesini istiyoruz./p>",
                    "<p>Yalnızca en yeni özellikleri sağlamakla kalmıyor, aynı zamanda bunların kullanımının kolay ve sezgisel olmasını sağlıyoruz, bu sayede önceden deneyimi olmayanlar bile bu teknolojik ürünlerden hızla faydalanabiliyor.</p>",
                    "<p><strong>ŞIMART</strong> olarak hedefimiz, yeni teknolojilerin inovasyonu söz konusu olduğunda her zaman ön planda olmak ve bu yolda her adımda üst düzey müşteri hizmetleri sunmaktır. Böylece teknoloji inovasyonunda iş ortağınız olarak bizi seçtiğinizde yenilikçi çözüm ve yüksek kalite elde edeceğinizi bilirsiniz!</p>",
                ],
            },
        ],
    },
    {
        id: "odullerimiz",
        title: "ÖDÜLLERİMİZ",
        contentBlocks: [
            {
                subtitle: "Kazandığımız Ödüller",
                paragraphs: [
                    "<p>Şirketimizin kazandığı ödüller ve başarılar.</p>",
                ],
            },
        ],
    },
    {
        id: "etkinliklerimiz",
        title: "ETKİNLİKLERİMİZ",
        contentBlocks: [
            {
                subtitle: "Etkinlikler",
                paragraphs: [
                    "<p>Düzenlediğimiz ve katıldığımız etkinlikler.</p>",
                ],
            },
        ],
    },
    {
        id: "kariyer",
        title: "KARİYER",
        contentBlocks: [
            {
                subtitle: "Kariyer Fırsatları",
                paragraphs: [
                    "<p>Şirketimizde kariyer fırsatları ve iş imkanları.</p>",
                ],
            },
        ],
    },
]



export const companyInfo = {
    videoUrl: "https://www.youtube.com/embed/Jjlxo4jeONU",
    videoTitle: "Şımart Teknoloji",
    coverImage: "/images/video-cover.jpg", // Kapak görseli yolu
}

export const pressItems = [
    {
        id: 1,
        title: "Web Tekno - Robot Süpürge ve Akıllı Ev Sistemleri",
        link: "https://www.webtekno.com/akilli-ev-teknolojileri-gelistiren-simart-teknoloji-nin-ceo-su-mustafa-emrah-babur-la-teknoloji-konustuk-h146498.html",
        imageUrl: "/images/press/basinda-biz-1.webp",
    },
    {
        id: 2,
        title: "Onedio - Robot Süpürge ve Akıllı Ev Sistemleri",
        link: "https://onedio.com/haber/evdeki-hicbir-elektronik-cihaza-dokunmayin-1233716",
        imageUrl: "/images/press/basinda-biz-2.webp",
    },
    {
        id: 3,
        title: "Mynet - Robot Süpürge ve Akıllı Ev Sistemleri",
        link: "https://www.mynet.com/turkiye-de-iot-devrimi-akilli-teknolojilerle-gelecege-yolculuk-110107183056",
        imageUrl: "/images/press/basinda-biz-3.webp",
    },
    {
        id: 4,
        title: "Hürriyet Haber - Robot Süpürge ve Akıllı Ev Sistemleri",
        link: "https://www.hurriyet.com.tr/yerel-haberler/ankara/cindeki-basarisini-ankaraya-tasidi-42134059",
        imageUrl: "/images/press/basinda-biz-4.webp",
    },
    {
        id: 5,
        title: "TGRT - Robot Süpürge ve Akıllı Ev Sistemleri",
        link: "https://www.youtube.com/watch?v=Hnx1Q0cFfpg",
        imageUrl: "/images/press/basinda-biz-5.webp",
    },
    {
        id: 6,
        title: "EINPRESSWIRE - Robot Süpürge ve Akıllı Ev Sistemleri",
        link: "https://www.einpresswire.com/article/589570980/award-winning-mart-technology-has-developed-products-with-combined-hardware-and-software-ecosystem",
        imageUrl: "/images/press/basinda-biz-6.webp",
    },
]
