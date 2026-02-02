import { cookies } from "next/headers";
import crypto from "crypto";
import { log } from "./logger";

/**
 * Server-side token decryption
 * Node.js crypto modülünü kullanır
 */
export async function checkAuthServer() {
    const isDev = process.env.NODE_ENV === "development";
    try {
        const cookieStore = await cookies();
        const encryptedToken = cookieStore.get('_token')?.value;
        const secretKey = process.env.TOKEN_SEC_KEY;

        if (isDev) {
            log("[AuthServer] --- (hesabım/dashboard sayfa kontrolü)");
            log("[AuthServer] _token var mı:", !!encryptedToken);
            log("[AuthServer] _token uzunluk:", encryptedToken?.length ?? 0);
            log("[AuthServer] TOKEN_SEC_KEY var mı:", !!secretKey);
            log("[AuthServer] Cookie isimleri:", cookieStore.getAll().map(c => c.name).join(", ") || "(boş)");
        }

        if (!encryptedToken || !secretKey) {
            if (isDev) log("[AuthServer] SONUÇ: false (token veya secret yok)");
            return false;
        }

        // Base64 decode et
        const decoded = Buffer.from(encryptedToken, 'base64');
        if (decoded.length < 28) {
            if (isDev) log("[AuthServer] SONUÇ: false (buffer < 28 byte)");
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
        
        const isAuthenticated = decrypted === 'true';
        if (isDev) {
            log("[AuthServer] Çözülen değer:", JSON.stringify(decrypted));
            log("[AuthServer] SONUÇ: isAuthenticated=", isAuthenticated);
        }
        return isAuthenticated;
    } catch (e) {
        if (isDev) log("[AuthServer] HATA:", e.message);
        return false;
    }
}
