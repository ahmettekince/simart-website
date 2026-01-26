"use client"

import Image from "next/image"

export function PressSection({ items }) {
    return (
        <div className="row g-3">
            {items.map((item) => (
                <div key={item.id} className="col-12 col-md-6">
                    <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            position: 'relative',
                            display: 'block',
                            aspectRatio: '16/9',
                            overflow: 'hidden',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
                            <Image
                                src={item.imageUrl || "/placeholder.svg"}
                                alt={item.title}
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>

                        {/* Gradient Overlay */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.4), rgba(0,0,0,0.1))',
                            zIndex: 1,
                        }} />

                        {/* Title */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '24px',
                            zIndex: 2,
                        }}>
                            <h3 style={{
                                fontSize: 'clamp(18px, 2vw, 24px)',
                                fontWeight: 'bold',
                                color: '#fff',
                                textAlign: 'center',
                                margin: 0,
                                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            }}>
                                {item.title}
                            </h3>
                        </div>

                        {/* Hover overlay */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(var(--primary-rgb, 0, 0, 0), 0.2)',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = 1
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = 0
                            }}
                        />
                    </a>
                </div>
            ))}
        </div>
    )
}
