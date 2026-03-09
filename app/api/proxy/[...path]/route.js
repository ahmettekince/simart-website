import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import crypto from "crypto";
import { log } from "@/utils/logger";

const BACKEND_URL = process.env.BACKEND_URL;

async function handleRequest(request, params, method) {
    const resolvedParams = await params;
    const path = resolvedParams.path.join("/");
    const targetUrl = `${BACKEND_URL}/${path}`;

    const apiKey = process.env.API_KEY || "";
    const securityKey = process.env.SECURITY_KEY || "";

    // GET istekleri için query parametrelerini URL'e ekle
    // POST ve diğer istekler için query parametrelerini body'ye taşı
    const searchParams = new URL(request.url).searchParams;
    let finalUrl = targetUrl;
    let body;
    let bodyStr = "null";

    try {
        if (method === "GET") {
            // GET istekleri için query parametrelerini URL'e ekle
            const queryString = searchParams.toString();
            finalUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;
        } else {
            const reqContentType = request.headers.get("content-type") || "";
            const isMultipart = reqContentType.includes("multipart/form-data");

            if (isMultipart) {
                // FormData: ham body'yi forward et, JSON parse etme
                const clonedRequest = request.clone();
                const arrayBuffer = await clonedRequest.arrayBuffer();
                body = Buffer.from(arrayBuffer);
                bodyStr = "null"; // İmza için multipart'ta body string kullanılmaz
            } else {
                // JSON body
                try {
                    const clonedRequest = request.clone();
                    body = await clonedRequest.json();

                    if (searchParams.toString()) {
                        const queryParams = {};
                        searchParams.forEach((value, key) => {
                            queryParams[key] = value;
                        });
                        body = { ...queryParams, ...body };
                    }
                    bodyStr = JSON.stringify(body);
                } catch (e) {
                    if (searchParams.toString()) {
                        body = {};
                        searchParams.forEach((value, key) => {
                            body[key] = value;
                        });
                        bodyStr = JSON.stringify(body);
                    } else {
                        body = undefined;
                        bodyStr = "null";
                    }
                }
            }
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const dataToSign = `${timestamp}|${bodyStr}`;
        const signature = crypto
            .createHmac("sha256", securityKey)
            .update(dataToSign)
            .digest("hex");

        // Cookie'leri al ve forward et
        const cookieStore = await cookies();
        const cookieHeaders = [];
        let deviceId = null;

        cookieStore.getAll().forEach(cookie => {
            cookieHeaders.push(`${cookie.name}=${cookie.value}`);
            // DEVICE_ID cookie'sini X-Device-ID header'ı olarak ekle
            if (cookie.name === 'DEVICE_ID' || cookie.name === 'device_id') {
                deviceId = cookie.value;
            }
        });
        const cookieHeader = cookieHeaders.join('; ');

        // İstemci bilgilerini yakala ve forward et
        const userAgent = request.headers.get('user-agent') || "Şımart Teknoloji Browser";
        const clientIp = request.headers.get('x-forwarded-for') || "";

        // Doğrulama için terminale log basalım
        log(`\n[Proxy Request] IP: ${clientIp} | UA: ${userAgent.substring(0, 50)}...`);

        // İçerik tipini belirle (multipart veya json)
        const reqContentType = request.headers.get("content-type") || "";
        const isMultipartReq = reqContentType.includes("multipart/form-data");

        const response = await axios({
            method,
            url: finalUrl,
            headers: {
                "X-API-Key": apiKey,
                "Content-Type": isMultipartReq ? reqContentType : "application/json",
                //"X-Signature": signature,
                //"X-Timestamp": timestamp.toString(),
                "User-Agent": userAgent,
                "X-Forwarded-For": clientIp,
                ...(cookieHeader && { "Cookie": cookieHeader }),
                ...(deviceId && { "X-Device-ID": deviceId }),
            },
            data: body,
            // Server-side axios'ta withCredentials gereksiz, cookie'leri zaten manuel gönderiyoruz
            // Ancak response headers'ını tam olarak almak için validateStatus ekleyelim
            validateStatus: () => true, // Tüm status kodlarını kabul et (Set-Cookie header'larını almak için)
        });

        // Backend'den gelen yanıt 200 değilse (400, 404, 500 vb.) terminale detaylı log bas
        if (response.status !== 200) {
            log(`\n--- [Proxy API Error] ---`);
            log(`Path: ${path}`);
            log(`Method: ${method}`);
            log(`Status: ${response.status}`);
            log(`Target URL: ${targetUrl}`);
            log(`Response Data:`, JSON.stringify(response.data, null, 2));
            log(`-------------------------\n`);
        }

        // Backend'den gelen Set-Cookie header'larını NextResponse'a aktar
        const nextResponse = NextResponse.json(response.data, { status: response.status });

        // Set-Cookie header'larını kontrol et ve ekle
        // Axios response headers'ında Set-Cookie'ler lowercase 'set-cookie' olarak gelir ve array olabilir
        const setCookieHeaders = response.headers['set-cookie'];



        if (setCookieHeaders && Array.isArray(setCookieHeaders)) {
            setCookieHeaders.forEach(cookie => {
                // Cookie string'ini parse et ve NextResponse'a ekle
                // Format: "name=value; Path=/; Max-Age=3600; HttpOnly; SameSite=Lax"
                const cookieParts = cookie.split(';');
                const [nameValue] = cookieParts;
                const [name, ...valueParts] = nameValue.split('=');
                const value = valueParts.join('='); // Eğer value'da = varsa

                // Cookie options'ları parse et
                const options = {};
                cookieParts.slice(1).forEach(part => {
                    const trimmed = part.trim();
                    if (trimmed.toLowerCase().startsWith('path=')) {
                        options.path = trimmed.substring(5);
                    } else if (trimmed.toLowerCase().startsWith('max-age=')) {
                        options.maxAge = parseInt(trimmed.substring(8));
                    } else if (trimmed.toLowerCase().startsWith('expires=')) {
                        options.expires = new Date(trimmed.substring(8));
                    } else if (trimmed.toLowerCase() === 'httponly') {
                        options.httpOnly = true;
                    } else if (trimmed.toLowerCase().startsWith('samesite=')) {
                        const sameSiteValue = trimmed.substring(9).toLowerCase();
                        if (sameSiteValue === 'strict' || sameSiteValue === 'lax' || sameSiteValue === 'none') {
                            options.sameSite = sameSiteValue;
                        }
                    } else if (trimmed.toLowerCase() === 'secure') {
                        options.secure = true;
                    }
                });

                // Default değerler
                if (!options.path) options.path = '/';
                if (!options.sameSite) options.sameSite = 'lax';

                nextResponse.cookies.set(name.trim(), value, options);
            });
        } else if (setCookieHeaders) {
            // Tek bir cookie string olarak gelmişse
            const cookieParts = setCookieHeaders.split(';');
            const [nameValue] = cookieParts;
            const [name, ...valueParts] = nameValue.split('=');
            const value = valueParts.join('=');

            const options = {};
            cookieParts.slice(1).forEach(part => {
                const trimmed = part.trim();
                if (trimmed.toLowerCase().startsWith('path=')) {
                    options.path = trimmed.substring(5);
                } else if (trimmed.toLowerCase().startsWith('max-age=')) {
                    options.maxAge = parseInt(trimmed.substring(8));
                } else if (trimmed.toLowerCase() === 'httponly') {
                    options.httpOnly = true;
                } else if (trimmed.toLowerCase().startsWith('samesite=')) {
                    const sameSiteValue = trimmed.substring(9).toLowerCase();
                    if (sameSiteValue === 'strict' || sameSiteValue === 'lax' || sameSiteValue === 'none') {
                        options.sameSite = sameSiteValue;
                    }
                } else if (trimmed.toLowerCase() === 'secure') {
                    options.secure = true;
                }
            });

            if (!options.path) options.path = '/';
            if (!options.sameSite) options.sameSite = 'lax';

            nextResponse.cookies.set(name.trim(), value, options);
        }

        return nextResponse;
    } catch (error) {
        console.error("Proxy Error:", {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: finalUrl,
        });
        return NextResponse.json(
            error.response?.data || { error: "Internal Server Error" },
            { status: error.response?.status || 500 }
        );
    }
}

export async function GET(request, context) {
    return handleRequest(request, context.params, "GET");
}

export async function POST(request, context) {
    return handleRequest(request, context.params, "POST");
}

export async function PUT(request, context) {
    return handleRequest(request, context.params, "PUT");
}

export async function DELETE(request, context) {
    return handleRequest(request, context.params, "DELETE");
}

export async function PATCH(request, context) {
    return handleRequest(request, context.params, "PATCH");
}
