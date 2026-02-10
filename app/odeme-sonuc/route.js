
export async function POST(req) {
    try {
        const formData = await req.formData();
        const data = {};
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        // debug için log
        console.log("BANK POST DATA:", data);

        // HTML'e çevir
        const rows = Object.entries(data)
            .map(([k, v]) => `<tr><td><b>${k}</b></td><td>${v}</td></tr>`)
            .join("");

        return new Response(`
      <!DOCTYPE html>
      <html lang="tr">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Ödeme Sonucu</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
              padding: 40px; 
              max-width: 800px; 
              margin: 0 auto; 
              background-color: #f9fafb;
              color: #111827;
            }
            h2 { 
              color: #1f2937; 
              border-bottom: 2px solid #e5e7eb; 
              padding-bottom: 10px;
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              background: white; 
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); 
              border-radius: 8px;
              overflow: hidden;
            }
            td { 
              border: 1px solid #e5e7eb; 
              padding: 12px 16px; 
              font-size: 14px;
            }
            tr:nth-child(even) { background-color: #f9fafb; }
            tr:hover { background-color: #f3f4f6; }
            b { color: #4b5563; }
            .btn {
              display: inline-block;
              margin-top: 20px;
              padding: 10px 20px;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
            }
            .btn:hover { background-color: #1d4ed8; }
          </style>
        </head>
        <body>
          <h2>Bankadan Gelen POST Verileri</h2>
          <table>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <br/>
          <a href="/" class="btn">Ana Sayfaya Dön</a>
        </body>
      </html>
    `, {
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

// GET isteği gelirse de boş bir mesaj gösterelim (debug kolaylığı için)
export async function GET(req) {
    return new Response(`
        <html>
            <body style="font-family: sans-serif; padding: 50px; text-align: center;">
                <h1>Ödeme Sonucu Sayfası</h1>
                <p>Bu sayfa bankadan gelecek POST isteğini beklemektedir.</p>
                <p>Henüz bir veri yok. (GET Request)</p>
                <a href="/">Ana Sayfa</a>
            </body>
        </html>
    `, {
        headers: { "Content-Type": "text/html; charset=utf-8" }
    });
}
