import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // Form verisini al
        const formData = await request.formData();
        const data = {};

        // FormData'yı objeye çevir
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Konsola logla (Debug için)
        console.log('[Payment Result POST] Received data:', data);

        // URL oluştur
        const url = request.nextUrl.clone();
        url.pathname = '/odeme-sonuc';

        // Response oluştur (Redirect)
        const response = NextResponse.redirect(url, 303); // 303 See Other: POST sonrası GET redirect için ideal

        // Cookie set et (5 dakika geçerli)
        // httpOnly: true -> JavaScript erişemez (Server Component okuyacak)
        // secure: true -> Sadece HTTPS (Localhost'ta sorun olmaz genelde ama production için önemli)
        response.cookies.set('payment_result', JSON.stringify(data), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 300, // 5 dakika
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('[Payment Result POST] Error:', error);
        // Hata durumunda da sayfaya yönlendir ama parametresiz
        const url = request.nextUrl.clone();
        url.pathname = '/odeme-sonuc';
        return NextResponse.redirect(url, 303);
    }
}
