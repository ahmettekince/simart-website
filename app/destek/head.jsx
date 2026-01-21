import { webPageSchema } from "@/lib/schema";

export default function Head() {
  const supportJsonLd = webPageSchema({
    name: "Destek - Şımart Teknoloji",
    url: "https://simart.me/destek",
    description:
      "Şımart Teknoloji Destek sayfasında akıllı ev sistemleri ürün açıklamaları, kullanım videoları ve teknik destek bilgilerine ulaşın. Şımart Teknoloji ile hayatınızı kolaylaştırın",
  });

  return (
    <>
      {/* WebPage JSON-LD (Destek) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(supportJsonLd) }}
      />
    </>
  );
}

