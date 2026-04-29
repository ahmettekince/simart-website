import { NextResponse } from 'next/server';
import xml2js from 'xml2js';

export async function GET() {
  try {
    const backendUrl = 'https://api.birifix.com';

    let targetUrl = `${backendUrl}/xml/products.xml`;
    if (backendUrl.endsWith('/api')) {
      targetUrl = `${backendUrl.replace('/api', '')}/xml/products.xml`;
    }

    const authHeader = `Basic ${Buffer.from('simart:Simart!!2020').toString('base64')}`;
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
        'Authorization': authHeader,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`XML fetch failed: ${response.status} ${response.statusText}`);
    }
    const rawXmlData = await response.text();

    const parser = new xml2js.Parser({ explicitArray: false });
    const jsonData = await parser.parseStringPromise(rawXmlData);

    let rawItems = [];
    if (jsonData?.rss?.channel?.item) {
      rawItems = Array.isArray(jsonData.rss.channel.item) ? jsonData.rss.channel.item : [jsonData.rss.channel.item];
    } else if (jsonData?.item) {
      rawItems = Array.isArray(jsonData.item) ? jsonData.item : [jsonData.item];
    } else if (jsonData?.items?.item) {
      rawItems = Array.isArray(jsonData.items.item) ? jsonData.items.item : [jsonData.items.item];
    }

    const metaRssData = {
      rss: {
        $: {
          "xmlns:g": "http://base.google.com/ns/1.0",
          "version": "2.0"
        },
        channel: {
          title: "Şımart Teknoloji",
          link: "https://simart.me",
          description: "Şımart Teknoloji Google Merchant Ürün Feed'i",
          item: rawItems.map((item) => {
            const priceVal = item.price || "0.00";
            const salePriceVal = item.discount_price || "";

            let availability = "in stock";
            if (item.stock_quantity === "0" && item.unlimited_stock !== "1" && item.is_pre_order !== "1") {
              availability = "out of stock";
            } else if (item.is_pre_order === "1") {
              availability = "preorder";
            }

            let imageLink = "https://simart.me/images/logo.png";

            if (item.cover_image && typeof item.cover_image === 'string' && item.cover_image.trim() !== '') {
              imageLink = `https://cdn.simart.cloud/uploads/${item.cover_image}`;
            }

            const metaItem = {
              "g:id": item.sku || item.id || "",
              "g:title": item.name || "",
              "g:description": typeof item.short_description === 'string' ? item.short_description.replace(/<[^>]*>?/gm, '') : (item.short_description?._ || "").replace(/<[^>]*>?/gm, ''),
              "g:link": `https://simart.me/magaza/${item.category_slug ? item.category_slug + "/" : ""}${item.slug || ""}`,
              "g:image_link": imageLink,
              "g:brand": "Şımart Teknoloji",
              "g:condition": "new",
              "g:availability": availability,
              "g:price": `${priceVal} TRY`,
            };

            if (salePriceVal && salePriceVal !== "" && salePriceVal !== "0" && salePriceVal !== "0.00") {
              metaItem["g:sale_price"] = `${salePriceVal} TRY`;
            }

            metaItem["g:google_product_category"] = "Electronics > Smart Home";
            metaItem["g:custom_label_0"] = "Made in Turkey";

            return metaItem;
          })
        }
      }
    };
    const builder = new xml2js.Builder({ cdata: false });
    const metaXmlData = builder.buildObject(metaRssData);

    return new NextResponse(metaXmlData, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('XML formatting error:', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><error><message>Hata oluştu, veri formatlanamadı.</message><details>${error.message}</details></error>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
        }
      }
    );
  }
}
