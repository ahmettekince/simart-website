"use client"

import { useState } from "react"
import Image from "next/image"

// Icon component'leri
const CloseIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
)

const ChevronLeftIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '32px', height: '32px' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
)

const ChevronRightIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '32px', height: '32px' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
)

export function CertificatesSection({ certificates }) {
    const [selectedIndex, setSelectedIndex] = useState(null)

    const openLightbox = (index) => {
        setSelectedIndex(index)
    }

    const closeLightbox = () => {
        setSelectedIndex(null)
    }

    const goToPrevious = () => {
        if (selectedIndex === null) return
        setSelectedIndex(selectedIndex === 0 ? certificates.length - 1 : selectedIndex - 1)
    }

    const goToNext = () => {
        if (selectedIndex === null) return
        setSelectedIndex(selectedIndex === certificates.length - 1 ? 0 : selectedIndex + 1)
    }

    return (
        <>
            <div className="row g-3">
                {certificates.map((cert, index) => (
                    <div
                        key={cert.id || index}
                        className="col-12 col-md-6 col-xl-4"
                        style={{ cursor: 'pointer' }}
                        onClick={() => openLightbox(index)}
                        onKeyDown={(e) => e.key === "Enter" && openLightbox(index)}
                        role="button"
                        tabIndex={0}
                        aria-label="Sertifikayı büyüt"
                    >
                        <div className="certificate-card" style={{
                            background: '#fff',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            padding: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            height: '100%',
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div style={{ position: 'relative', width: '100%', paddingBottom: '133.33%', aspectRatio: '3/4' }}>
                                <Image
                                    src={cert.thumbnail_url || cert.url || cert.imageUrl || "/placeholder.svg"}
                                    alt={`Sertifika ${cert.id || index}`}
                                    fill
                                    style={{ objectFit: 'contain', padding: '8px' }}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {selectedIndex !== null && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1050,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(4px)',
                    }}
                    onClick={closeLightbox}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") closeLightbox()
                        if (e.key === "ArrowLeft") goToPrevious()
                        if (e.key === "ArrowRight") goToNext()
                    }}
                >
                    {/* Close Button */}
                    <button
                        type="button"
                        className="btn btn-link"
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            zIndex: 1060,
                            color: '#fff',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onClick={(e) => {
                            e.stopPropagation()
                            closeLightbox()
                        }}
                        aria-label="Kapat"
                    >
                        <CloseIcon />
                    </button>

                    {/* Previous Button */}
                    <button
                        type="button"
                        className="btn btn-link"
                        style={{
                            position: 'absolute',
                            left: '16px',
                            zIndex: 1060,
                            color: '#fff',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onClick={(e) => {
                            e.stopPropagation()
                            goToPrevious()
                        }}
                        aria-label="Önceki"
                    >
                        <ChevronLeftIcon />
                    </button>

                    {/* Image */}
                    <div
                        style={{
                            position: 'relative',
                            maxWidth: '900px',
                            maxHeight: '90vh',
                            width: '100%',
                            height: '100%',
                            margin: '16px',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={certificates[selectedIndex].url || certificates[selectedIndex].imageUrl || "/placeholder.svg"}
                            alt={`Sertifika ${certificates[selectedIndex].id || selectedIndex}`}
                            fill
                            style={{ objectFit: 'contain' }}
                            sizes="100vw"
                            priority
                        />
                    </div>

                    {/* Next Button */}
                    <button
                        type="button"
                        className="btn btn-link"
                        style={{
                            position: 'absolute',
                            right: '16px',
                            zIndex: 1060,
                            color: '#fff',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onClick={(e) => {
                            e.stopPropagation()
                            goToNext()
                        }}
                        aria-label="Sonraki"
                    >
                        <ChevronRightIcon />
                    </button>

                    {/* Counter */}
                    <div style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: '#fff',
                        fontSize: '14px',
                        background: 'rgba(0,0,0,0.5)',
                        padding: '4px 12px',
                        borderRadius: '999px',
                    }}>
                        {selectedIndex + 1} / {certificates.length}
                    </div>
                </div>
            )}
        </>
    )
}
