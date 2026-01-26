/**
 * Token'ı çöz (true veya false döner)
 */
export async function decryptToken(encryptedToken, secretKey) {
    if (!encryptedToken || !secretKey) return null;
    
    try {
        // Base64 decode et
        const decoded = atob(encryptedToken);
        
        if (!decoded || decoded.length < 28) {
            return null;
        }
        
        // Key'i SHA256 ile hash'le
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secretKey);
        const keyHashBuffer = await crypto.subtle.digest('SHA-256', keyData);
        const keyBytes = new Uint8Array(keyHashBuffer);
        
        // Nonce (12 byte), tag (16 byte) ve ciphertext'i ayır
        const nonce = new Uint8Array(decoded.slice(0, 12).split('').map(c => c.charCodeAt(0)));
        const tag = new Uint8Array(decoded.slice(12, 28).split('').map(c => c.charCodeAt(0)));
        const ciphertext = new Uint8Array(decoded.slice(28).split('').map(c => c.charCodeAt(0)));
        
        // CryptoKey oluştur
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyBytes,
            { name: 'AES-GCM' },
            false,
            ['decrypt']
        );
        
        // Ciphertext + tag birleştir (Web Crypto API için tag ciphertext'in sonuna eklenir)
        const ciphertextWithTag = new Uint8Array(ciphertext.length + tag.length);
        ciphertextWithTag.set(ciphertext);
        ciphertextWithTag.set(tag, ciphertext.length);
        
        // Şifreyi çöz
        const decrypted = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: nonce,
                tagLength: 128 // 16 byte = 128 bit
            },
            cryptoKey,
            ciphertextWithTag
        );
        
        // String'e çevir
        const decoder = new TextDecoder();
        const decryptedText = decoder.decode(decrypted);
        
        // Bool'a çevir
        if (decryptedText === 'true') {
            return true;
        } else if (decryptedText === 'false') {
            return false;
        }
        
        return null;
    } catch (e) {
        console.error("Token decryption error:", e);
        return null;
    }
}

/**
 * Cookie değerini al
 */
export function getCookie(name) {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}
