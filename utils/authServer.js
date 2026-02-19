import { cookies } from "next/headers";
import crypto from "crypto";
import { log } from "./logger";

export async function checkAuthServer() {
    const isDev = process.env.NODE_ENV === "development";
    try {
        const cookieStore = await cookies();
        const encryptedToken = cookieStore.get('_token')?.value;
        const deviceId = cookieStore.get('device_id')?.value || cookieStore.get('DEVICE_ID')?.value;
        const secretKey = process.env.TOKEN_SEC_KEY;



        if (!encryptedToken || !secretKey || !deviceId) {

            return false;
        }

        // Base64 decode et
        const decoded = Buffer.from(encryptedToken, 'base64');
        if (decoded.length < 28) {

            return false;
        }

        // Key'i SHA256 ile hash'le
        const keyBytes = crypto.createHash('sha256').update(secretKey).digest();

        // Nonce (12 byte), tag (16 byte) ve ciphertext'i ayır
        const nonce = decoded.slice(0, 12);
        const tag = decoded.slice(12, 28);
        const ciphertext = decoded.slice(28);

        // Decipher oluştur
        const decipher = crypto.createDecipheriv('aes-256-gcm', keyBytes, nonce);
        decipher.setAuthTag(tag);

        // Şifreyi çöz
        let decrypted = decipher.update(ciphertext, null, 'utf8');
        decrypted += decipher.final('utf8');

        // Şifre çözüldü ama içeriğine bakmadan Backend doğrulamasına geçelim
        // Çünkü bu cookie sadece JS tarafında "true" flag'i tutuyor olabilir.
        // Gerçek session ve token doğrulaması için Backend'e sormak şart.

        const timestamp = Math.floor(Date.now() / 1000);
        const bodyStr = "null"; // GET request body is effectively null/empty
        const securityKey = process.env.SECURITY_KEY || "";
        const apiKey = process.env.API_KEY || "";

        // Proxy imza mantığıyla aynı imza üret
        const dataToSign = `${timestamp}|${bodyStr}`;
        const signature = crypto
            .createHmac("sha256", securityKey)
            .update(dataToSign)
            .digest("hex");

        const backendUrl = process.env.BACKEND_URL;

        // Backend'e doğrulama isteği
        try {
            const authResponse = await fetch(`${backendUrl}/customer/me`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Cookie": cookieStore.toString(),
                    "X-API-Key": apiKey,
                    "X-Timestamp": timestamp.toString(),
                    "X-Signature": signature,
                    "X-Device-ID": deviceId,
                    // User-Agent server tarafında olduğu için node-fetch user-agent'ı gidebilir, sorun değil.
                }
            });

            if (authResponse.ok) {
                // Backend de onayladı
                return true;
            } else {
                if (isDev) log("[AuthServer] Backend reddetti:", authResponse.status);
                return false;
            }
        } catch (apiError) {
            if (isDev) log("[AuthServer] Backend bağlantı hatası:", apiError.message);
            // Backend kapalıysa veya hata varsa güvenli tarafı seçip false dön
            return false;
        }

    } catch (e) {
        if (isDev) log("[AuthServer] HATA:", e.message);
        return false;
    }
}
