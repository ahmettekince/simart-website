/**
 * Environment-based logger utility
 * Sadece development ortamında logları gösterir
 */

const isDevelopment = process.env.NODE_ENV === "development" ||
    process.env.ENVIRONMENT === "development";

/**
 * Development ortamında console.log çalıştırır
 */
export function log(...args) {
    if (false) {
        console.log(...args);
    }
}



