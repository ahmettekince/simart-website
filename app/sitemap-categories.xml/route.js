import { serverFetch } from "@/utils/serverFetch";
import { API_REVALIDATE } from "@/config/apiConfig";

export async function GET() {
    try {
        const xml = await serverFetch("/sitemap-categories.xml", {
            raw: true,
            next: { revalidate: API_REVALIDATE.STANDARD || 3600 }
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
