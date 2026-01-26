"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { SidebarNav } from "./sidebar-nav"
import { menuItems } from "@/lib/about-data"

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

export function AboutLayout({ children, currentSectionId }) {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Pathname'den section ID'yi çıkar
    const sectionId = currentSectionId || pathname.split('/').pop() || 'biz-kimiz'
    const currentLabel = menuItems.find(m => m.id === sectionId)?.label || "Menü"

    return (
        <main className="about-page-main" style={{ minHeight: '100vh', padding: '32px 0' }}>
            <div className="container">
                <div className="row">
                    {/* Desktop Sidebar */}
                    <aside className="col-lg-3 d-none d-lg-block">
                        <div className="about-sidebar-wrapper" style={{ position: 'sticky', top: '100px' }}>
                            <SidebarNav
                                items={menuItems}
                                activeSection={sectionId}
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
                                    items={menuItems}
                                    activeSection={sectionId}
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
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/kurumsal/${item.id}`}
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
