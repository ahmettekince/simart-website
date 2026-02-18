import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const encryptedToken = cookieStore.get('_token')?.value;
        const secretKey = process.env.TOKEN_SEC_KEY;
        if (!encryptedToken || !secretKey) {
            return NextResponse.json({ isAuthenticated: false });
        }
        const decoded = Buffer.from(encryptedToken, 'base64');
        if (decoded.length < 28) {
            return NextResponse.json({ isAuthenticated: false });
        }
        const keyBytes = crypto.createHash('sha256').update(secretKey).digest();
        const nonce = decoded.slice(0, 12);
        const tag = decoded.slice(12, 28);
        const ciphertext = decoded.slice(28);
        const decipher = crypto.createDecipheriv('aes-256-gcm', keyBytes, nonce);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(ciphertext, null, 'utf8');
        decrypted += decipher.final('utf8');

        const isAuthenticated = decrypted === 'true';

        return NextResponse.json({ isAuthenticated });
    } catch (e) {
        return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }
}
