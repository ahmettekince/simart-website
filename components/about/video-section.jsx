"use client"

import { useState } from "react"
import Image from "next/image"

// play icon svg 
const PlayIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '40px', height: '40px' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
)

//video alanı componenti 
export function VideoSection() {
    const [isPlaying, setIsPlaying] = useState(false)

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16/9',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            background: '#fff',
        }}>
            {!isPlaying ? (
                <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '16px',
                        cursor: 'pointer',
                        border: 'none',
                        background: 'transparent',
                        zIndex: 2,
                    }}
                    aria-label="Videoyu oynat"
                >
                    {/* Kapak Görseli */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0,
                    }}>
                        <Image
                            src="/images/about-us-video.png"
                            alt="Şımart Teknoloji Tanıtım Filmi"
                            fill
                            style={{
                                objectFit: 'cover',
                            }}
                            sizes="100vw"
                        />
                    </div>

                    {/* Light overlay for better contrast */}
                    <div style={{
                        position: 'absolute',
                        inset: '0 0 0 30px',
                        background: 'rgba(0,0,0,0.3)',
                        zIndex: 1,
                        transition: 'background 0.3s ease',
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0,0,0,0.2)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0,0,0,0.3)'
                        }}
                    />

                    {/* Play button - Centered */}
                    <div style={{
                        position: 'relative',
                        zIndex: 10,
                        width: 'clamp(64px, 10vw, 80px)',
                        height: 'clamp(64px, 10vw, 80px)',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(4px)',
                        border: '2px solid rgba(255,255,255,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        color: 'var(--primary, #000)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--primary, #000)'
                            e.currentTarget.style.borderColor = 'var(--primary, #000)'
                            e.currentTarget.style.color = '#fff'
                            e.currentTarget.style.transform = 'scale(1.1)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.9)'
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
                            e.currentTarget.style.color = 'var(--primary, #000)'
                            e.currentTarget.style.transform = 'scale(1)'
                        }}
                    >
                        <PlayIcon />
                    </div>
                </button>
            ) : (
                <iframe
                    src={`https://www.youtube.com/embed/Jjlxo4jeONU?autoplay=1&rel=0`}
                    title="Şımart Teknoloji Tanıtım Filmi"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                    }}
                />
            )}
        </div>
    )
}
