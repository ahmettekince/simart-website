import { NextResponse } from "next/server";

/**
 * CDN'den 3D model dosyasını server-side fetch edip döndürür.
 * CORS sorununu çözmek için kullanılır.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  try {
    // CDN'den dosyayı fetch et
    const response = await fetch(url, {
      headers: {
        "Accept": "model/gltf-binary,application/octet-stream,*/*",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch model: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Blob olarak al
    const blob = await response.blob();

    // CORS header'larını ekle
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": blob.type || "model/gltf-binary",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[Model Proxy] Error:", error);
    return NextResponse.json(
      { error: "Failed to proxy model file" },
      { status: 500 }
    );
  }
}
