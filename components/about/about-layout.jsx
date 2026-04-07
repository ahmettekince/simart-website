"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { SidebarNav } from "./sidebar-nav"
import { getMenuItems } from "@/lib/about-data"
import { getLocalizedUrl } from "@/utils/i18n"
import { useLangStore } from "@/stores/langStore"
import { localizedRoutes } from "@/config/i18n"

// Icon component'leri
const MenuIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
)

const CloseIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
)

export function AboutLayout({ children, currentSectionId, lang = "tr" }) {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { setAlternatePaths } = useLangStore()
    const items = getMenuItems(lang)

    // Pathname'den section ID'yi çıkar
    let sectionId = currentSectionId || pathname.split('/').pop() || 'biz-kimiz'

    // Eğer sectionId bir EN slug ise (örn: our-story), onu orijinal TR ID'sine çevir
    // Bu sayede hem menü aktifliği hem de dil değiştirici yolları doğru çalışır
    if (lang === "en" && !currentSectionId) {
        const foundTrPath = Object.keys(localizedRoutes.en).find(trKey => {
            const enPath = localizedRoutes.en[trKey]
            return enPath === sectionId || enPath.endsWith(`/${sectionId}`)
        })
        if (foundTrPath) {
            sectionId = foundTrPath.split('/').pop()
        }
    }

    const currentLabel = items.find(m => m.id === sectionId)?.label || (lang === "en" ? "Menu" : "Menü")

    // Dil değiştirici için yolları senkronize et
    useEffect(() => {
        const paths = {
            tr: `/kurumsal/${sectionId}`,
            en: `/en/corporate/${sectionId}` // Default fallback
        }

        // Eğer i18n config'de özel bir eşleşme varsa onu kullan
        const trPath = `kurumsal/${sectionId}`
        const enSlug = localizedRoutes.en[trPath]
        
        if (enSlug) {
            paths.en = `/en/${enSlug}`
        }

        setAlternatePaths(paths)
        
        return () => setAlternatePaths({})
    }, [sectionId, setAlternatePaths])

    return (
        <main className="about-page-main" style={{ minHeight: '100vh', padding: '32px 0' }}>
            <div className="container">
                <div className="row">
                    {/* Desktop Sidebar */}
                    <aside className="col-lg-3 d-none d-lg-block">
                        <div className="about-sidebar-wrapper" style={{ position: 'sticky', top: '100px' }}>
                            <SidebarNav
                                items={items}
                                activeSection={sectionId}
                                lang={lang}
                            />
                        </div>
                    </aside>

                    {/* Mobile Menu Button */}
                    <div className="col-12 d-lg-none mb-3">
                        <button
                            type="button"
                            className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            style={{ background: '#fff', border: '1px solid #ddd' }}
                        >
                            <span>{currentLabel}</span>
                            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                        </button>
                    </div>

                    {/* Mobile Sidebar Overlay */}
                    {isMobileMenuOpen && (
                        <div
                            className="mobile-menu-overlay d-lg-none"
                            style={{
                                position: 'fixed',
                                inset: 0,
                                zIndex: 1040,
                                background: 'rgba(0,0,0,0.5)',
                            }}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <div
                                className="mobile-menu-content"
                                style={{
                                    position: 'absolute',
                                    left: '16px',
                                    right: '16px',
                                    top: '80px',
                                    background: '#fff',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    maxHeight: '70vh',
                                    overflowY: 'auto',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <SidebarNav
                                    items={items}
                                    activeSection={sectionId}
                                    lang={lang}
                                />
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="col-lg-9">
                        {children}

                        {/* Quick Navigation Pills for Mobile */}
                        <div className="mt-4 d-lg-none">
                            <div className="d-flex flex-wrap gap-2">
                                {items.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={getLocalizedUrl(`/kurumsal/${item.id}`, lang)}
                                        className={`btn ${sectionId === item.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        style={{ fontSize: '14px', padding: '6px 12px', textDecoration: 'none' }}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
