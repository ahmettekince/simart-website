"use client";
import React, { useState, useEffect } from "react";

/**
 * Minimalist Bilgi Kaydırağı (Info Ticker)
 * @param {Array} messages - [{message: string, ...}] formatında mesaj dizisi
 * @param {number} interval - Değişim süresi (ms), varsayılan 4000
 */
export default function InfoTicker({ messages = [], interval = 4000 }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [prevIndex, setPrevIndex] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (!messages || messages.length <= 1) {
            setCurrentIndex(0);
            setPrevIndex(null);
            return;
        }

        const timer = setInterval(() => {
            setPrevIndex(currentIndex);
            setCurrentIndex((prev) => (prev + 1) % messages.length);
            setIsAnimating(true);

            // Animasyon süresi sonrası durumu temizle (0.6s snappier feel)
            setTimeout(() => {
                setIsAnimating(false);
            }, 600);

        }, interval);

        return () => clearInterval(timer);
    }, [messages, interval, currentIndex]);

    if (!messages || messages.length === 0) return null;

    return (
        <div
            className="simart-info-ticker"
            style={{
                height: "24px",
                overflow: "hidden",
                position: "relative",
                width: "100%"
            }}
        >
            {messages.map((msg, idx) => {
                const isCurrent = idx === currentIndex;
                const isPrevious = idx === prevIndex;

                let translateY = "100%";
                let opacity = 0;

                if (isCurrent) {
                    translateY = "0%";
                    opacity = 1;
                } else if (isPrevious && isAnimating) {
                    translateY = "-100%";
                    opacity = 0;
                }

                return (
                    <div
                        key={idx}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            opacity: opacity,
                            transform: `translateY(${translateY})`,
                            transition: isCurrent || (isPrevious && isAnimating)
                                ? "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
                                : "none",
                            pointerEvents: isCurrent ? "auto" : "none"
                        }}
                    >
                        <span
                            style={{
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#1e3a8a",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}
                        >
                            {msg.message}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
