import { serverFetch } from "@/utils/serverFetch";

export async function GET() {
    try {
        const xml = await serverFetch("/sitemap-contents.xml", {
            raw: true,
            next: { revalidate: 1 }
        });

        if (!xml) {
            return new Response("Sitemap not found", { status: 404 });
        }

        return new Response(xml, {
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
            },
        });
    } catch (error) {
        console.error("Sitemap fetch error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
