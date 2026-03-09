import crypto from "crypto";
import { log } from "./logger";
import { API_REVALIDATE } from "@/config/apiConfig";
import { headers as nextHeaders } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

// Response'un JSON olup olmadığını kontrol eder
function isJsonResponse(response) {
    const contentType = response.headers.get("content-type");
    return contentType && contentType.includes("application/json");
}

export async function serverFetch(endpoint, options = {}) {
    // Client bilgilerini al
    let clientUserAgent = "Şımart Teknoloji Browser";
    let clientIp = "";

    try {
        const headerList = await nextHeaders();
        clientUserAgent = headerList.get("user-agent") || clientUserAgent;

        // En yaygın IP header'larını kontrol et
        clientIp = headerList.get("x-forwarded-for") || "";

        // Doğrulama logu
        log(`[serverFetch] IP: ${clientIp} | UA: ${clientUserAgent.substring(0, 50)}...`);
    } catch (e) {
        // Static context veya header olmayan yerlerde hata vermemesi için
    }

    // HMAC Signing Logic
    const securityKey = process.env.SECURITY_KEY || "";
    const timestamp = Math.floor(Date.now() / 1000);

    // Body content for signing
    let bodyStr = "{}";
    if (options.body) {
        if (typeof options.body === "string") {
            bodyStr = options.body;
        } else if (typeof options.body === "object" && options.body !== null) {
            if (Object.keys(options.body).length === 0) {
                bodyStr = "{}";
            } else {
                bodyStr = JSON.stringify(options.body);
            }
        }
    }

    const dataToSign = `${timestamp}|${bodyStr}`;
    const signature = crypto
        .createHmac("sha256", securityKey)
        .update(dataToSign)
        .digest("hex");


    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Accept-Language": options.lang || "tr",
        "X-API-Key": process.env.API_KEY || "",
        //"X-Signature": signature,
        //"X-Timestamp": timestamp.toString(),
        "User-Agent": clientUserAgent,
        "X-Forwarded-For": clientIp,
        ...options.headers,
    };

    const url = `${BACKEND_URL}${endpoint}`;
    const startTime = Date.now();
    const method = options.method || "GET";



    try {
        // Fetch options'ı hazırla
        const fetchOptions = {
            method,
            headers,
        };

        // POST/PUT/PATCH/DELETE için body gönder
        if (method !== "GET" && method !== "HEAD") {
            fetchOptions.body = bodyStr;
        }

        // Next.js cache: production build'de fetch varsayılan cache kullanır.
        // revalidate: 0 veya cache: 'no-store' geçirilmeli, yoksa build anındaki veri kalır.
        // Revalidate yönetimi: options.next yoksa varsayılanı kullan
        if (options.cache === "no-store" || options.next?.revalidate === 0) {
            fetchOptions.cache = "no-store";
        } else if (options.next) {
            fetchOptions.next = options.next;
        } else {
            // Hiçbir şey belirtilmemişse varsayılan revalidate süresini kullan
            fetchOptions.next = { revalidate: API_REVALIDATE.DEFAULT || 3600 };
        }

        if (options.signal) {
            fetchOptions.signal = options.signal;
        }



        const response = await fetch(url, fetchOptions);

        const duration = Date.now() - startTime;

        // Response body'yi oku (hem başarılı hem başarısız durumlar için)
        let responseText = "";
        try {
            responseText = await response.clone().text();
        } catch (e) {
            responseText = "";
        }

        // JSON response kontrolü
        if (!isJsonResponse(response)) {
            log(`[serverFetch] ⚠️  Non-JSON response detected (Content-Type: ${response.headers.get("content-type")})`);

            if (responseText.length > 500) {
                log(`[serverFetch] Response preview: ${responseText.substring(0, 500)}...`);
            } else {
                log(`[serverFetch] Response: ${responseText}`);
            }
        }

        if (!response.ok) {
            log("----------------------------------------------------------------");
            log(`[serverFetch] ERROR DETECTED!`);
            log(`- URL: ${url}`);
            log(`- Status: ${response.status} ${response.statusText}`);
            log(`- Response Body: ${responseText.substring(0, 500)}${responseText.length > 500 ? "..." : ""}`);
            log("----------------------------------------------------------------");
            return null;
        }

        // Eğer raw istenmişse ham metni dön
        if (options.raw) {
            return responseText;
        }

        // JSON parse et
        try {
            const json = JSON.parse(responseText);
            return json;
        } catch (parseError) {
            log("----------------------------------------------------------------");
            log(`[serverFetch] JSON PARSE ERROR!`);
            log(`- URL: ${url}`);
            log(`- Parse Error: ${parseError.message}`);
            log(`- Response Preview: ${responseText.substring(0, 500)}...`);
            log("----------------------------------------------------------------");
            return null;
        }
    } catch (error) {
        const duration = Date.now() - startTime;

        log("----------------------------------------------------------------");
        log(`[serverFetch] CRITICAL/NETWORK ERROR!`);
        log(`- Method/URL: ${method} ${url}`);
        log(`- Duration: ${duration}ms`);
        log(`- Error Message: ${error.message}`);
        if (error.stack) log(`- Stack Trace: ${error.stack.split('\n')[0]}`);
        log("----------------------------------------------------------------");
        return null;
    }
}
