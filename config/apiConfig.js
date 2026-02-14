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
    BLOGS: 3600,
    MENUS: 3600,
    PAGES: 0,
    CAMPAIGNS: 60,
    REVIEWS: 3600,
    TOPBAR: 3600,
    FAQ: 3600,
    PRESS: 3600,
    CERTIFICATES: 3600,
    TIMELINE: 3600,
    LOCATIONS: 3600,
    POPUP: 60,
    EVENTS: 3600,
    DEFAULT: 3600,
};
