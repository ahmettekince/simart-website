import { organizationSchema } from "@/lib/schema";

export default function Head() {
  const organizationJsonLd = organizationSchema();

  return (
    <>
      {/* Organization JSON-LD (site geneli) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
    </>
  );
}

