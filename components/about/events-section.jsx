"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"

// Location Icon SVG
const LocationIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M8 0C4.13401 0 1 3.13401 1 7C1 11.866 8 16 8 16C8 16 15 11.866 15 7C15 3.13401 11.866 0 8 0ZM8 9.5C6.61929 9.5 5.5 8.38071 5.5 7C5.5 5.61929 6.61929 4.5 8 4.5C9.38071 4.5 10.5 5.61929 10.5 7C10.5 8.38071 9.38071 9.5 8 9.5Z" fill="currentColor"/>
    </svg>
)

// Calendar Icon SVG
const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M14 2H13V1C13 0.447715 12.5523 0 12 0C11.4477 0 11 0.447715 11 1V2H5V1C5 0.447715 4.55228 0 4 0C3.44772 0 3 0.447715 3 1V2H2C0.895431 2 0 2.89543 0 4V14C0 15.1046 0.895431 16 2 16H14C15.1046 16 16 15.1046 16 14V4C16 2.89543 15.1046 2 14 2ZM2 4H14V6H2V4ZM14 14H2V8H14V14Z" fill="currentColor"/>
    </svg>
)

export function EventsSection({ events = [] }) {
    if (!events || events.length === 0) {
        return (
            <div>
                <p>Etkinlik bulunamadı.</p>
            </div>
        )
    }

    return (
        <div className="events-container">
            <div className="row g-4">
                {events.map((event, index) => {
                    const hasLink = event.link && event.link.trim() !== ''
                    const EventCard = hasLink ? Link : 'div'
                    const eventProps = hasLink ? { href: event.link } : {}

                    return (
                        <div key={index} className="col-12 col-md-6 col-lg-4">
                            <EventCard
                                {...eventProps}
                                style={event.link ? { textDecoration: 'none', color: 'inherit', display: 'block' } : {}}
                            >
                                <div className="event-card" style={{
                                    background: '#fff',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    ...(hasLink && {
                                        cursor: 'pointer',
                                    })
                                }}
                                onMouseEnter={(e) => {
                                    if (hasLink) {
                                        e.currentTarget.style.transform = 'translateY(-4px)'
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (hasLink) {
                                        e.currentTarget.style.transform = 'translateY(0)'
                                    }
                                }}
                                >
                                    {/* Görsel Alanı */}
                                    <div style={{
                                        position: 'relative',
                                        width: '100%',
                                        paddingBottom: '100%', // 1:1 aspect ratio (kare)
                                        backgroundColor: event.image ? 'transparent' : 'var(--primary, #3c81b5)',
                                        overflow: 'hidden',
                                    }}>
                                        {event.image ? (
                                            <Image
                                                src={event.image}
                                                alt={event.title || "Etkinlik"}
                                                fill
                                                style={{
                                                    objectFit: 'cover',
                                                }}
                                                sizes="(max-width: 768px) 100vw, (max-width: 992px) 50vw, 33vw"
                                            />
                                        ) : null}
                                    </div>

                                    {/* İçerik Alanı */}
                                    <div style={{
                                        padding: '20px',
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}>
                                        {/* Yer Bilgisi */}
                                        {event.location && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '8px',
                                                marginBottom: '12px',
                                            }}>
                                                <span style={{
                                                    color: 'var(--primary, #3c81b5)',
                                                    marginTop: '2px',
                                                }}>
                                                    <LocationIcon />
                                                </span>
                                                <span style={{
                                                    fontSize: '14px',
                                                    color: '#333',
                                                    lineHeight: '1.5',
                                                }}>
                                                    {event.location}
                                                </span>
                                            </div>
                                        )}

                                        {/* Tarih Bilgisi */}
                                        {event.date && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '8px',
                                            }}>
                                                <span style={{
                                                    color: 'var(--primary, #3c81b5)',
                                                    marginTop: '2px',
                                                }}>
                                                    <CalendarIcon />
                                                </span>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: '#333',
                                                    lineHeight: '1.5',
                                                }}>
                                                    {event.eventName && (
                                                        <div style={{ marginBottom: '4px' }}>
                                                            {event.eventName}
                                                        </div>
                                                    )}
                                                    {event.date && (
                                                        <div style={{ fontWeight: '500' }}>
                                                            {event.date}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </EventCard>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
