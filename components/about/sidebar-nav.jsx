"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { getLocalizedUrl } from "@/utils/i18n"

// Icon component'leri - Client component içinde tanımlı
const AboutIcons = {
    BizKimiz: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    ),
    NeYapiyoruz: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    ),
    Hikayemiz: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Sertifikalar: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    Odullerimiz: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
    ),
    Etkinliklerimiz: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
    ),
    Kariyer: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    BasindaBiz: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
    ),
    KilometreTaslari: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0121 18.382V7.618a1 1 0 01-1.447-.894L15 4m0 13V4" />
        </svg>
    ),
}

export function SidebarNav({ items, activeSection, lang = "tr" }) {
    const pathname = usePathname()
    const menuItems = items && items.length > 0 ? items : []

    // Pathname'den aktif section'ı belirle
    const currentSection = activeSection || pathname.split('/').pop() || 'biz-kimiz'

    return (
        <>
            <nav className="sidebar-nav-about">
                <ul className="sidebar-nav-list">
                    {menuItems.map((item) => {
                        const Icon = item.iconId ? AboutIcons[item.iconId] : null
                        const isActive = currentSection === item.id
                        const href = getLocalizedUrl(`/kurumsal/${item.id}`, lang)

                        return (
                            <li key={item.id} className={isActive ? "active" : ""}>
                                <Link
                                    href={href}
                                    className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        textDecoration: 'none',
                                        color: isActive ? 'var(--primary, #3c81b5)' : '#333',
                                        backgroundColor: isActive ? 'rgba(60, 129, 181, 0.1)' : 'transparent',
                                        borderLeft: `4px solid ${isActive ? 'var(--primary, #3c81b5)' : 'transparent'}`,
                                        fontWeight: isActive ? '500' : '400',
                                        borderRadius: '6px',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'rgba(60, 129, 181, 0.08)'
                                            e.currentTarget.style.color = 'var(--primary, #3c81b5)'
                                            const iconSvg = e.currentTarget.querySelector('.sidebar-icon-svg')
                                            if (iconSvg) {
                                                iconSvg.style.stroke = 'var(--primary, #3c81b5)'
                                                iconSvg.style.color = 'var(--primary, #3c81b5)'
                                            }
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'transparent'
                                            e.currentTarget.style.color = '#333'
                                            const iconSvg = e.currentTarget.querySelector('.sidebar-icon-svg')
                                            if (iconSvg) {
                                                iconSvg.style.stroke = '#666'
                                                iconSvg.style.color = '#666'
                                            }
                                        }
                                    }}
                                >
                                    {Icon && (
                                        <span className="sidebar-nav-icon" style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '20px',
                                            height: '20px',
                                            flexShrink: 0,
                                            minWidth: '20px',
                                        }}>
                                            <Icon className="sidebar-icon-svg" style={{
                                                width: '20px',
                                                height: '20px',
                                                stroke: isActive ? 'var(--primary, #3c81b5)' : '#666',
                                                color: isActive ? 'var(--primary, #3c81b5)' : '#666',
                                            }} />
                                        </span>
                                    )}
                                    <span className="sidebar-nav-label" style={{
                                        flex: 1,
                                        lineHeight: '1.4',
                                        whiteSpace: 'nowrap',
                                    }}>{item.label}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>
            <style jsx global>{`
                .sidebar-nav-about {
                    width: 100%;
                    background: #fff;
                    border-radius: 8px;
                    padding: 8px;
                    border: 1px solid #e0e0e0;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }
                
                .sidebar-nav-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .sidebar-nav-list li {
                    margin-bottom: 4px;
                }
                
                .sidebar-nav-list li:last-child {
                    margin-bottom: 0;
                }
                
                .sidebar-nav-item {
                    width: 100%;
                    display: flex !important;
                    align-items: center !important;
                    gap: 12px;
                    padding: 12px 16px;
                    text-align: left;
                    border: none;
                    background: transparent;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: #333;
                    font-size: 14px;
                    font-weight: 400;
                    border-left: 4px solid transparent;
                    text-decoration: none !important;
                }
                
                .sidebar-nav-item:hover {
                    background: #f5f5f5 !important;
                    color: #000 !important;
                }
                
                .sidebar-nav-item.active {
                    background: rgba(60, 129, 181, 0.1) !important;
                    color: var(--primary, #3c81b5) !important;
                    font-weight: 500;
                    border-left-color: var(--primary, #3c81b5) !important;
                }
                
                .sidebar-nav-icon {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 20px;
                    height: 20px;
                    flex-shrink: 0;
                    min-width: 20px;
                }
                
                .sidebar-nav-icon svg,
                .sidebar-icon-svg {
                    width: 20px !important;
                    height: 20px !important;
                    flex-shrink: 0;
                    stroke-width: 2;
                    display: block;
                }
                
                .sidebar-nav-item.active .sidebar-nav-icon svg,
                .sidebar-nav-item.active .sidebar-icon-svg {
                    color: var(--primary, #3c81b5) !important;
                    stroke: var(--primary, #3c81b5) !important;
                }
                
                .sidebar-nav-item:not(.active) .sidebar-nav-icon svg,
                .sidebar-nav-item:not(.active) .sidebar-icon-svg {
                    color: #666 !important;
                    stroke: #666 !important;
                }
                
                .sidebar-nav-item:hover .sidebar-nav-icon svg,
                .sidebar-nav-item:hover .sidebar-icon-svg {
                    color: var(--primary, #3c81b5) !important;
                    stroke: var(--primary, #3c81b5) !important;
                }
                
                .sidebar-nav-item:hover {
                    background: rgba(60, 129, 181, 0.08) !important;
                    color: var(--primary, #3c81b5) !important;
                }
                
                .sidebar-nav-label {
                    flex: 1;
                    line-height: 1.4;
                    white-space: nowrap;
                }
            `}</style>
        </>
    )
}
