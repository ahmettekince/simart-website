import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * Auth Debug API - Sadece development ortamında çalışır
 * _token, TOKEN_SEC_KEY varlığı, çözülen değer gibi bilgileri döner
 */
export async function GET() {
    const isDev = process.env.NODE_ENV === "development" || process.env.ENVIRONMENT === "development";
    if (!isDev) {
        return NextResponse.json({ error: "Debug API sadece development ortamında kullanılabilir" }, { status: 403 });
    }

    const debug = {
        timestamp: new Date().toISOString(),
        env: {
            NODE_ENV: process.env.NODE_ENV,
            TOKEN_SEC_KEY_EXISTS: !!process.env.TOKEN_SEC_KEY,
            TOKEN_SEC_KEY_LENGTH: process.env.TOKEN_SEC_KEY ? process.env.TOKEN_SEC_KEY.length : 0,
        },
        cookies: {
            _token_exists: false,
            _token_length: 0,
            _token_preview: null,
            all_cookie_names: [],
        },
        decryption: {
            success: false,
            decrypted_value: null,
            error: null,
        },
        isAuthenticated: false,
    };

    try {
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();
        debug.cookies.all_cookie_names = allCookies.map(c => c.name);

        const encryptedToken = cookieStore.get('_token')?.value;
        const secretKey = process.env.TOKEN_SEC_KEY;

        if (encryptedToken) {
            debug.cookies._token_exists = true;
            debug.cookies._token_length = encryptedToken.length;
            // İlk 15 ve son 10 karakteri göster (güvenlik için tam değer gösterme)
            debug.cookies._token_preview = encryptedToken.length > 30
                ? `${encryptedToken.substring(0, 15)}...${encryptedToken.substring(encryptedToken.length - 10)}`
                : "(çok kısa)";
        }

        if (!encryptedToken || !secretKey) {
            debug.decryption.error = !encryptedToken ? "_token cookie yok" : "TOKEN_SEC_KEY .env'de tanımlı değil";
            return NextResponse.json(debug);
        }

        // Şifre çözme
        const decoded = Buffer.from(encryptedToken, 'base64');
        if (decoded.length < 28) {
            debug.decryption.error = `Base64 decode sonrası buffer çok kısa: ${decoded.length} byte (min 28 gerekli)`;
            return NextResponse.json(debug);
        }

        const keyBytes = crypto.createHash('sha256').update(secretKey).digest();
        const nonce = decoded.slice(0, 12);
        const tag = decoded.slice(12, 28);
        const ciphertext = decoded.slice(28);

        const decipher = crypto.createDecipheriv('aes-256-gcm', keyBytes, nonce);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(ciphertext, null, 'utf8');
        decrypted += decipher.final('utf8');

        debug.decryption.success = true;
        debug.decryption.decrypted_value = decrypted;
        debug.isAuthenticated = decrypted === 'true';

        return NextResponse.json(debug);
    } catch (e) {
        debug.decryption.error = e.message || String(e);
        debug.decryption.success = false;
        return NextResponse.json(debug);
    }
}
