/**
 * API fetch revalidation times (in seconds).
 * Next.js 'next.revalidate' option constants.
 */
export const API_REVALIDATE = {
    // High frequency / No cache
    NONE: 0,
    VERY_FAST: 0,
    FAST: 0,

    // Standard revalidation (1 hour)
    STANDARD: 0,

    // Slow revalidation (1 day)
    SLOW: 0,

    // Module specific mappings
    ONE_MINUTE: 60,
    HOME: 0,
    PRODUCTS: 0,
    BLOGS: 60,
    CATEGORIES: 60,
    MENUS: 0,
    PAGES: 0,
    CAMPAIGNS: 0,
    REVIEWS: 0,
    TOPBAR: 0,
    FAQ: 0,
    PRESS: 0,
    CERTIFICATES: 0,
    TIMELINE: 0,
    LOCATIONS: 0,
    POPUP: 0,
    EVENTS: 0,
    SITEMAPS: 0,
    DEFAULT: 0,
};
