import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = 'https://api.birifix.com';

    // API URL'inden '/api' kısmını atarak ana sunucu köküne erişiyoruz 
    // veya backend yapınıza göre burayı düzenleyebilirsiniz.
    let targetUrl = `${backendUrl}/xml/products.xml`;
    if (backendUrl.endsWith('/api')) {
      targetUrl = `${backendUrl.replace('/api', '')}/xml/products.xml`;
    }

    // Backend'den XML verisini çekiyoruz
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
      },

      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error(`XML fetch failed: ${response.status} ${response.statusText}`);
    }

    const xmlData = await response.text();

    // Çektiğimiz veriyi tarayıcıya XML olarak sunuyoruz
    return new NextResponse(xmlData, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('XML proxy error:', error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><error><message>XML verisi alinmadi</message></error>',
      {
        status: 500,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
        }
      }
    );
  }
}
