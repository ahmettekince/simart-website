import { webPageSchema } from "@/lib/schema";

export default function Head() {
  const blogJsonLd = webPageSchema({
    name: "Blog - Şımart Teknoloji",
    url: "https://simart.me/blog",
    description:
      "Şımart Teknoloji blog sayfası, akıllı ev sistemleri ve teknolojik yenilikler hakkında en güncel bilgi kaynağınız.",
  });

  return (
    <>
      {/* WebPage JSON-LD (Blog) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
    </>
  );
}

