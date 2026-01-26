import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * Server-side token decryption
 * Node.js crypto modülünü kullanır
 */
export async function checkAuthServer() {
    try {
        const cookieStore = await cookies();
        const encryptedToken = cookieStore.get('_token')?.value;
        const secretKey = process.env.TOKEN_SEC_KEY;

        if (!encryptedToken || !secretKey) {
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
        
        const isAuthenticated = decrypted === 'true';
        // console.log(`[Server Auth] isAuthenticated: ${isAuthenticated}`);
        return isAuthenticated;
    } catch (e) {
        // console.error("Server Auth check error:", e);
        return false;
    }
}
