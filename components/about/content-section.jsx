"use client"

import Image from "next/image"

// HTML string'i React element'lerine çevir
const parseHTML = (htmlString) => {
    if (!htmlString) return null

    // Eğer zaten <p> tag'i içindeyse, sadece içeriği parse et
    if (htmlString.trim().startsWith('<p>') && htmlString.trim().endsWith('</p>')) {
        const content = htmlString.replace(/^<p>|<\/p>$/g, '')
        const parsedContent = parseInlineHTML(content)

        return (
            <p style={{
                color: '#666',
                lineHeight: '1.75',
                fontSize: '16px',
                marginBottom: '16px',
            }}>
                {parsedContent}
            </p>
        )
    }

    // Birden fazla <p> tag'i varsa
    const pRegex = /<p>(.*?)<\/p>/gs
    const parts = []
    let match
    let keyCounter = 0

    while ((match = pRegex.exec(htmlString)) !== null) {
        const pContent = match[1]
        const parsedContent = parseInlineHTML(pContent)

        parts.push(
            <p key={`p-${keyCounter++}`} style={{
                color: '#666',
                lineHeight: '1.75',
                fontSize: '16px',
                marginBottom: '16px',
            }}>
                {parsedContent}
            </p>
        )
    }

    // Eğer <p> tag'i yoksa, direkt parse et
    if (parts.length === 0) {
        const parsedContent = parseInlineHTML(htmlString)
        return (
            <p style={{
                color: '#666',
                lineHeight: '1.75',
                fontSize: '16px',
                marginBottom: '16px',
            }}>
                {parsedContent}
            </p>
        )
    }

    return parts
}

// Inline HTML tag'lerini parse et (<strong>, <b>)
const parseInlineHTML = (text) => {
    if (!text) return text

    const parts = []
    let currentIndex = 0
    let keyCounter = 0

    // <strong> ve <b> tag'lerini bul
    const tagRegex = /<(strong|b)>(.*?)<\/\1>/g
    let match

    while ((match = tagRegex.exec(text)) !== null) {
        // Tag'den önceki metni ekle
        if (match.index > currentIndex) {
            const beforeText = text.substring(currentIndex, match.index)
            if (beforeText) {
                parts.push(beforeText)
            }
        }

        // Tag içeriğini ekle (kalın)
        parts.push(
            <strong key={`strong-${keyCounter++}`} style={{ color: '#000', fontWeight: 600 }}>
                {match[2]}
            </strong>
        )

        currentIndex = match.index + match[0].length
    }

    // Kalan metni ekle
    if (currentIndex < text.length) {
        const remaining = text.substring(currentIndex)
        if (remaining) {
            parts.push(remaining)
        }
    }

    return parts.length > 0 ? parts : text
}

export function ContentSection({ section }) {

    return (
        <article>
            {/* İçerik Bölümleri */}
            <div>
                {section.contentBlocks ? (
                    // Çoklu alt başlıklı içerik
                    section.contentBlocks.map((block, blockIndex) => (
                        <div key={blockIndex} style={{ marginBottom: blockIndex < section.contentBlocks.length - 1 ? '32px' : '0' }}>
                            {block.subtitle && (
                                <h3 style={{
                                    fontSize: 'clamp(18px, 2vw, 20px)',
                                    fontWeight: 600,
                                    marginBottom: '16px',
                                }}>
                                    {block.subtitle}
                                </h3>
                            )}
                            <div>
                                {block.paragraphs.map((paragraph, pIndex) => (
                                    <div key={pIndex}>
                                        {parseHTML(paragraph)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    // Tek alt başlıklı eski format (geriye uyumluluk)
                    <>
                        {section.subtitle && (
                            <h3 style={{
                                fontSize: 'clamp(18px, 2vw, 20px)',
                                fontWeight: 600,
                                color: '#d97706',
                                marginBottom: '16px',
                            }}>
                                {section.subtitle}
                            </h3>
                        )}
                        <div>
                            {section.content?.map((paragraph, index) => (
                                <div key={index}>
                                    {parseHTML(paragraph)}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Ödüller için özel görsel alanı */}
            {section.awardImage && (
                <div style={{
                    marginTop: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '32px',
                    alignItems: 'flex-start',
                }}
                    className="row"
                >
                    {/* Sol taraf - Yazılar ve arka plan resmi */}
                    <div className="col-12 col-md-6" style={{ position: 'relative' }}>
                        {/* Arka plan A logosu */}
                        {section.awardBackgroundImage && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                left: '-32px',
                                top: '-16px',
                                pointerEvents: 'none',
                            }}>
                                <Image
                                    src={section.awardBackgroundImage || "/placeholder.svg"}
                                    alt=""
                                    width={300}
                                    height={400}
                                    style={{ objectFit: 'contain', opacity: 0.3 }}
                                />
                            </div>
                        )}

                        {/* Yazılar */}
                        <div style={{ position: 'relative', zIndex: 10 }}>
                            {section.awardText && (
                                <div>
                                    {section.awardText.map((text, index) => (
                                        <p key={index} style={{
                                            color: '#666',
                                            lineHeight: '1.75',
                                            marginBottom: '16px',
                                        }}>
                                            {formatText(text)}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {/* A Design Award rozeti */}
                            <div style={{ marginTop: '32px' }}>
                                <p style={{
                                    fontSize: '24px',
                                    fontWeight: 300,
                                    color: 'rgba(102,102,102,0.7)',
                                    letterSpacing: '0.1em',
                                }}>
                                    {"A'DESIGN AWARD"}
                                </p>
                                <p style={{
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    color: 'rgba(102,102,102,0.8)',
                                    letterSpacing: '0.15em',
                                }}>
                                    WINNER 2022
                                </p>
                                <p style={{
                                    fontSize: '20px',
                                    fontWeight: 500,
                                    color: '#d97706',
                                    letterSpacing: '0.2em',
                                }}>
                                    SILVER
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sağ taraf - Ürün görseli */}
                    <div className="col-12 col-md-6" style={{ position: 'relative' }}>
                        <Image
                            src={section.awardImage || "/placeholder.svg"}
                            alt="Ödül görseli"
                            width={500}
                            height={400}
                            style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
                        />
                    </div>
                </div>
            )}
        </article>
    )
}
