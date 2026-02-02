import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { log } from "@/utils/logger";

export async function GET() {
    const isDev = process.env.NODE_ENV === "development";
    try {
        const cookieStore = await cookies();
        const encryptedToken = cookieStore.get('_token')?.value;
        const secretKey = process.env.TOKEN_SEC_KEY;

        if (isDev) {
            log("[Auth Check] ---");
            log("[Auth Check] _token var mı:", !!encryptedToken);
            log("[Auth Check] _token uzunluk:", encryptedToken?.length ?? 0);
            log("[Auth Check] TOKEN_SEC_KEY var mı:", !!secretKey);
            log("[Auth Check] Tüm cookie isimleri:", cookieStore.getAll().map(c => c.name).join(", ") || "(boş)");
        }

        if (!encryptedToken || !secretKey) {
            if (isDev) log("[Auth Check] SONUÇ: isAuthenticated=false (token veya secret yok)");
            return NextResponse.json({ isAuthenticated: false });
        }

        // Şifre çözme işlemi (Node.js tarafında crypto modülü ile)
        const decoded = Buffer.from(encryptedToken, 'base64');
        if (decoded.length < 28) {
            if (isDev) log("[Auth Check] SONUÇ: isAuthenticated=false (base64 decode sonrası buffer < 28 byte)");
            return NextResponse.json({ isAuthenticated: false });
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
            log("[Auth Check] Çözülen değer:", JSON.stringify(decrypted));
            log("[Auth Check] SONUÇ: isAuthenticated=", isAuthenticated);
        }

        return NextResponse.json({ isAuthenticated });
    } catch (e) {
        if (isDev) log("[Auth Check] HATA:", e.message, e.stack);
        console.error("Auth check error:", e);
        return NextResponse.json({ isAuthenticated: false }, { status: 500 });
    }
}
