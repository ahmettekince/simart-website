export async function GET() {
    const robotsText = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
`;

    return new Response(robotsText, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
}
