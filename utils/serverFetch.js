import { cookies } from "next/headers";
import crypto from "crypto";
import { log } from "./logger";

const BACKEND_URL = process.env.BACKEND_URL;
const MAX_RETRIES = 3;
const RETRY_DELAY = 100; // 0.1 saniye

/**
 * Response'un JSON olup olmadığını kontrol eder
 */
function isJsonResponse(response) {
    const contentType = response.headers.get("content-type");
    return contentType && contentType.includes("application/json");
}

export async function serverFetch(endpoint, options = {}) {
    const retries = options.retries !== undefined ? options.retries : MAX_RETRIES;
    let lastError = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
        // HMAC Signing Logic
        const securityKey = process.env.SECURITY_KEY || "";
        const timestamp = Math.floor(Date.now() / 1000);

        // Body content for signing
        let bodyStr = "null";
        if (options.body) {
            bodyStr = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
        }

        const dataToSign = `${timestamp}|${bodyStr}`;
        const signature = crypto
            .createHmac("sha256", securityKey)
            .update(dataToSign)
            .digest("hex");

        const defaultUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
        const userAgent = process.env.USER_AGENT || defaultUserAgent;

        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.9",
            "X-API-Key": process.env.API_KEY || "",
            "User-Agent": userAgent,
            "X-Signature": signature,
            "X-Timestamp": timestamp.toString(),
            ...options.headers,
        };

        const url = `${BACKEND_URL}${endpoint}`;
        const startTime = Date.now();
        const method = options.method || "GET";

        if (attempt === 1) {
            log(`[serverFetch] FETCH START: ${method} ${url}`);
        } else {
            log(`[serverFetch] RETRY ${attempt}/${retries}: ${method} ${url}`);
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

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

                // 4xx hataları için retry yapma
                if (response.status >= 400 && response.status < 500) {
                    return null;
                }

                // 5xx hataları için retry yap
                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
                    continue;
                }

                return null;
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

                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
                    continue;
                }

                return null;
            }
        } catch (error) {
            lastError = error;
            const duration = Date.now() - startTime;

            if (attempt < retries) {
                log(`[serverFetch] Network error (attempt ${attempt}/${retries}): ${error.message}. Retrying...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
                continue;
            }

            log("----------------------------------------------------------------");
            log(`[serverFetch] CRITICAL/NETWORK ERROR!`);
            log(`- Method/URL: ${method} ${url}`);
            log(`- Duration: ${duration}ms`);
            log(`- Error Message: ${error.message}`);
            if (error.stack) log(`- Stack Trace: ${error.stack.split('\n')[0]}`);
            log(`- All ${retries} retry attempts exhausted`);
            log("----------------------------------------------------------------");
            return null;
        }
    }

    return null;
}
