/**
 * API fetch revalidation times (in seconds).
 * Next.js 'next.revalidate' option constants.
 */
export const API_REVALIDATE = {
    // High frequency / No cache
    NONE: 0,
    VERY_FAST: 60,       // 1 minute
    FAST: 300,           // 5 minutes

    // Standard revalidation (1 hour)
    STANDARD: 3600,

    // Slow revalidation (1 day)
    SLOW: 86400,

    // Module specific mappings
    HOME: 0,
    PRODUCTS: 0,
    BLOGS: 600,
    MENUS: 600,
    PAGES: 0,
    CAMPAIGNS: 5,
    REVIEWS: 60,
    TOPBAR: 60,
    FAQ: 60,
    PRESS: 60,
    CERTIFICATES: 60,
    TIMELINE: 60,
    LOCATIONS: 60,
    POPUP: 60,
    EVENTS: 60,
    DEFAULT: 0,
};
