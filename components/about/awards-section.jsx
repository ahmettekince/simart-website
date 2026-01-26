"use client"

import React from "react"
import Image from "next/image"

// HTML string'i React element'lerine çevir
const parseInlineHTML = (htmlString) => {
    if (!htmlString) return null

    const parts = []
    let currentIndex = 0
    let keyCounter = 0

    // <strong> ve <b> tag'lerini bul ve parse et
    const tagRegex = /<(strong|b)>(.*?)<\/\1>/gi
    let match
    let lastIndex = 0

    while ((match = tagRegex.exec(htmlString)) !== null) {
        // Tag'den önceki kısmı ekle
        if (match.index > lastIndex) {
            const beforeText = htmlString.substring(lastIndex, match.index)
            if (beforeText) {
                parts.push(beforeText)
            }
        }

        // Tag içindeki içeriği bold olarak ekle
        parts.push(
            <strong key={`strong-${keyCounter++}`} style={{ color: '#000', fontWeight: 'bold' }}>
                {match[2]}
            </strong>
        )

        lastIndex = tagRegex.lastIndex
    }

    // Kalan kısmı ekle
    if (lastIndex < htmlString.length) {
        const remainingText = htmlString.substring(lastIndex)
        if (remainingText) {
            parts.push(remainingText)
        }
    }

    return parts.length > 0 ? parts : htmlString
}

export function AwardsSection({ awards = [] }) {
    if (!awards || awards.length === 0) {
        return (
            <div>
                <p>Ödül bulunamadı.</p>
            </div>
        )
    }

    return (
        <div className="awards-container">
            {awards.map((award, index) => (
                <div key={index} className="award-item mb-5">
                    <div className="row align-items-center">
                        {/* Yazı Alanı */}
                        <div className="col-lg-7">
                            <div className="award-content-wrapper" style={{
                                position: 'relative',
                                padding: '40px',
                                minHeight: '400px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                            }}>
                                {/* Arka Plan Resmi (Soluk) */}
                                {award.backgroundImage && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        opacity: 0.1,
                                        zIndex: 0,
                                        overflow: 'visible',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <div style={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '100%',
                                        }}>
                                            <Image
                                                src={award.backgroundImage}
                                                alt={award.title || "Ödül"}
                                                fill
                                                style={{
                                                    objectFit: 'contain',
                                                    objectPosition: 'center',
                                                }}
                                                sizes="(max-width: 768px) 100vw, 60vw"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* İçerik */}
                                <div style={{
                                    position: 'relative',
                                    zIndex: 1,
                                }}>
                                    {award.title && (
                                        <h2 style={{
                                            fontSize: '28px',
                                            fontWeight: 'bold',
                                            color: 'var(--primary, #3c81b5)',
                                            marginBottom: '20px',
                                        }}>
                                            {award.title}
                                        </h2>
                                    )}

                                    {award.content && (
                                        <div className="award-content" style={{
                                            fontSize: '16px',
                                            lineHeight: '1.8',
                                            color: '#333',
                                        }}>
                                            {award.content.map((paragraph, pIndex) => {
                                                // Eğer HTML string ise parse et
                                                const isHTML = typeof paragraph === 'string' && (paragraph.includes('<strong>') || paragraph.includes('<b>') || paragraph.includes('<p>'))
                                                
                                                if (isHTML) {
                                                    // <p> tag'lerini kaldır ve parse et
                                                    const cleanText = paragraph.replace(/^<p>|<\/p>$/g, '').replace(/<\/?p>/g, '')
                                                    const parsedContent = parseInlineHTML(cleanText)
                                                    
                                                    return (
                                                        <p key={pIndex} style={{ marginBottom: '16px' }}>
                                                            {parsedContent}
                                                        </p>
                                                    )
                                                }
                                                
                                                return (
                                                    <p key={pIndex} style={{ marginBottom: '16px' }}>
                                                        {paragraph}
                                                    </p>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {award.stats && award.stats.length > 0 && (
                                        <div className="award-stats mt-4" style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '20px',
                                        }}>
                                            {award.stats.map((stat, sIndex) => (
                                                <div key={sIndex} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    padding: '12px 20px',
                                                    background: 'rgba(60, 129, 181, 0.1)',
                                                    borderRadius: '8px',
                                                }}>
                                                    {stat.icon && (
                                                        <span style={{ fontSize: '24px' }}>
                                                            {stat.icon}
                                                        </span>
                                                    )}
                                                    <div>
                                                        <div style={{
                                                            fontSize: '20px',
                                                            fontWeight: 'bold',
                                                            color: 'var(--primary, #3c81b5)',
                                                        }}>
                                                            {stat.value}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '14px',
                                                            color: '#666',
                                                        }}>
                                                            {stat.label}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Fotoğraf Alanı */}
                        <div className="col-lg-5">
                            <div style={{
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                minHeight: '400px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                            }}>
                                {award.image && (
                                    <Image
                                        src={award.image}
                                        alt={award.title || "Ödül"}
                                        fill
                                        style={{
                                            objectFit: 'cover',
                                        }}
                                        sizes="(max-width: 768px) 100vw, 40vw"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
