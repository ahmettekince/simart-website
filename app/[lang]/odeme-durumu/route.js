
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const data = {};
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        // JSON verisini oluştur ve XSS'e karşı sanitize et
        const safeJsonData = JSON.stringify(data).replace(/</g, '\\u003c');

        // Ara katman HTML'i
        const html = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Yönlendiriliyorsunuz...</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; text-align: center; padding-top: 50px; background: #f9fafb; }
          .loader { border: 4px solid #f3f3f3; border-top: 4px solid #000; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          p { color: #666; font-size: 16px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="loader"></div>
        <p>İşleminiz tamamlandı, sonuç sayfasına yönlendiriliyorsunuz...</p>
        <script>
          try {
            // Güvenli veriyi al
            var data = ${safeJsonData};
            // Session Storage'a kaydet
            sessionStorage.setItem('payment_result_storage', JSON.stringify(data));
          } catch (e) {
            console.error('Storage error', e);
          }

          // Yönlendir -> /odeme-sonuc
          setTimeout(function() {
            window.location.href = '/odeme-sonuc';
          }, 300);
        </script>
      </body>
      </html>
    `;

        return new Response(html, {
            headers: { "Content-Type": "text/html; charset=utf-8" }
        });

    } catch (error) {
        console.error("POST Error:", error);
        return new Response(`<h1>Hata Oluştu</h1><p>${error.message}</p>`, {
            status: 500,
            headers: { "Content-Type": "text/html; charset=utf-8" }
        });
    }
}

export async function GET(req) {
    const url = new URL('/odeme-sonuc', req.url);
    return NextResponse.redirect(url);
}
