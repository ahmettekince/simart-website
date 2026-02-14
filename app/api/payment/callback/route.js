import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// POST body'yi parse et
async function parseBody(req) {
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return await req.json();
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await req.formData();
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    return data;
  } else if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    return data;
  } else {
    // Text olarak dene
    try {
      const text = await req.text();
      if (text) {
        try {
          return JSON.parse(text);
        } catch {
          // URL encoded string olabilir
          const params = new URLSearchParams(text);
          const data = {};
          params.forEach((value, key) => {
            data[key] = value;
          });
          return data;
        }
      }
    } catch (e) {
      return {};
    }
  }
  return {};
}

export async function POST(req) {
  try {
    const url = new URL(req.url);
    const payload = {};

    // 1. Query parametrelerini al
    url.searchParams.forEach((value, key) => {
      payload[key] = value;
    });

    // 2. POST body'yi al
    try {
      const bodyData = await parseBody(req);
      Object.assign(payload, bodyData);
    } catch (error) {
      console.error('[Payment Callback] Error parsing body:', error);
    }

    // Bankadan gelen verileri console'a yazdır
    console.log('========================================');
    console.log('[Payment Callback] POST Request received from Bank');
    console.log('Method: POST');
    console.log('URL:', req.url);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    console.log('Query Params:', Object.fromEntries(url.searchParams.entries()));
    console.log('Body Data:', JSON.stringify(payload, null, 2));
    console.log('========================================');

    // Backend'e gönderilecek verileri hazırla (alan adlarını dönüştür)
    const backendPayload = {
      ucd_md: payload.md || payload.ucd_md || '',
      islem_guid: payload.islemGUID || payload.islem_guid || '',
      order_number: payload.orderId || payload.order_number || '',
    };

    console.log('[Payment Callback] Sending to backend:', JSON.stringify(backendPayload, null, 2));

    // Backend'e ödeme tamamlama isteği gönder
    let backendResponse = null;
    try {
      const BACKEND_URL = process.env.BACKEND_URL;
      const securityKey = process.env.SECURITY_KEY || '';
      const timestamp = Math.floor(Date.now() / 1000);
      const bodyStr = JSON.stringify(backendPayload);

      // HMAC Signature oluştur
      const dataToSign = `${timestamp}|${bodyStr}`;
      const signature = crypto
        .createHmac('sha256', securityKey)
        .update(dataToSign)
        .digest('hex');

      const response = await fetch(`${BACKEND_URL}/checkout/complete-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': process.env.API_KEY || '',
          'X-Signature': signature,
          'X-Timestamp': timestamp.toString(),
        },
        body: bodyStr,
      });

      backendResponse = await response.json();
      console.log('[Payment Callback] Backend response:', JSON.stringify(backendResponse, null, 2));
    } catch (error) {
      console.error('[Payment Callback] Backend request error:', error);
      backendResponse = {
        status: 'error',
        message: 'Backend iletişim hatası',
        error: error.message,
      };
    }

    // Backend status'una göre yönlendir
    const backendStatus = backendResponse?.status || 'error';
    const origin = req.headers.get('origin') || req.url.split('/api/payment/callback')[0];

    // Status'a göre doğru sayfaya yönlendir
    const searchParams = new URLSearchParams();
    searchParams.append('status', backendStatus);

    const redirectPath = backendStatus === 'success' ? '/odeme-basarili' : '/odeme-basarisiz';
    const redirectUrl = `${process.env.APP_URL || origin}${redirectPath}?${searchParams.toString()}`;

    console.log('[Payment Callback] Backend status:', backendStatus);
    console.log('[Payment Callback] Redirecting to:', redirectUrl);
    return NextResponse.redirect(redirectUrl, { status: 302 });
  } catch (error) {
    console.error('[Payment Callback] Error processing POST:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const payload = {};

    // Query parametrelerini al
    url.searchParams.forEach((value, key) => {
      payload[key] = value;
    });

    // GET verilerini console'a yazdır
    console.log('========================================');
    console.log('[Payment Callback] GET Request received');
    console.log('Method: GET');
    console.log('URL:', req.url);
    console.log('Query Params:', JSON.stringify(payload, null, 2));
    console.log('========================================');

    // Backend'e gönderilecek verileri hazırla
    const backendPayload = {
      ucd_md: payload.md || payload.ucd_md || '',
      islem_guid: payload.islemGUID || payload.islem_guid || '',
      order_number: payload.orderId || payload.order_number || '',
    };

    // Backend'e ödeme tamamlama isteği gönder
    let backendResponse = null;
    try {
      const BACKEND_URL = process.env.BACKEND_URL;
      const securityKey = process.env.SECURITY_KEY || '';
      const timestamp = Math.floor(Date.now() / 1000);
      const bodyStr = JSON.stringify(backendPayload);

      // HMAC Signature oluştur
      const dataToSign = `${timestamp}|${bodyStr}`;
      const signature = crypto
        .createHmac('sha256', securityKey)
        .update(dataToSign)
        .digest('hex');

      const response = await fetch(`${BACKEND_URL}/checkout/complete-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': process.env.API_KEY || '',
          'X-Signature': signature,
          'X-Timestamp': timestamp.toString(),
        },
        body: bodyStr,
      });

      backendResponse = await response.json();
      console.log('[Payment Callback] Backend response:', JSON.stringify(backendResponse, null, 2));
    } catch (error) {
      console.error('[Payment Callback] Backend request error:', error);
      backendResponse = {
        status: 'error',
        message: 'Backend iletişim hatası',
        error: error.message,
      };
    }

    // Backend status'una göre yönlendir
    const backendStatus = backendResponse?.status || 'error';
    const origin = req.headers.get('origin') || req.url.split('/api/payment/callback')[0];

    // Status'a göre doğru sayfaya yönlendir
    const searchParams = new URLSearchParams();
    searchParams.append('status', backendStatus);

    const redirectPath = backendStatus === 'success' ? '/odeme-basarili' : '/odeme-basarisiz';
    const redirectUrl = `${process.env.APP_URL || origin}${redirectPath}?${searchParams.toString()}`;

    console.log('[Payment Callback] Backend status:', backendStatus);
    console.log('[Payment Callback] Redirecting to:', redirectUrl);
    return NextResponse.redirect(redirectUrl, { status: 302 });
  } catch (error) {
    console.error('[Payment Callback] Error processing GET:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
