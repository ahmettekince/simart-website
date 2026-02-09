import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ModelViewerModal({ show, onHide, modelSrc }) {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [proxyUrl, setProxyUrl] = useState(null);
    const modelRef = useRef(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
            setLoading(true);
            setError(null);
        } else {
            document.body.style.overflow = '';
            setError(null);
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [show]);

    // Proxy URL oluştur (CORS sorununu çözmek için)
    useEffect(() => {
        if (!show || !modelSrc) {
            setProxyUrl(null);
            return;
        }

        // Eğer URL zaten aynı origin'deyse direkt kullan
        try {
            const url = new URL(modelSrc);
            const isExternal = url.origin !== window.location.origin;
            
            if (isExternal) {
                // External URL için proxy kullan
                const proxyUrl = `/api/model-proxy?url=${encodeURIComponent(modelSrc)}`;
                setProxyUrl(proxyUrl);
            } else {
                // Aynı origin'deyse direkt kullan
                setProxyUrl(modelSrc);
            }
        } catch (e) {
            // URL parse edilemezse direkt kullan
            setProxyUrl(modelSrc);
        }
    }, [show, modelSrc]);

    // Setup model-viewer event listeners
    useEffect(() => {
        if (!show || !proxyUrl) return;
        let cleanup = null;
        const id = setTimeout(() => {
            const el = modelRef.current?.querySelector?.('model-viewer');
            if (!el) return;
            const onLoad = () => {
                setLoading(false);
                setError(null);
            };
            const onError = () => {
                setLoading(false);
                setError('3D model yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
            };
            el.addEventListener('load', onLoad);
            el.addEventListener('error', onError);
            cleanup = () => {
                el.removeEventListener('load', onLoad);
                el.removeEventListener('error', onError);
            };
        }, 0);
        return () => {
            clearTimeout(id);
            cleanup?.();
        };
    }, [show, proxyUrl]);

    if (!show || !mounted) return null;

    return createPortal(
        <div
            role="button"
            tabIndex={0}
            onClick={onHide}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 10000,
                background: 'rgba(0,0,0,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
            }}
        >
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onHide();
                }}
                style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: 18,
                    cursor: 'pointer',
                    lineHeight: 1,
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                ×
            </button>

            <div
                ref={modelRef}
                onClick={(e) => e.stopPropagation()}
                style={{ width: '100%', height: '100%', cursor: 'default', position: 'relative' }}
            >
                {loading && !error && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 5,
                            background: 'rgba(0,0,0,0.5)',
                        }}
                    >
                        <div style={{ textAlign: 'center', color: '#fff' }}>
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    border: '3px solid rgba(255,255,255,0.3)',
                                    borderTopColor: '#fff',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite',
                                    margin: '0 auto 12px',
                                }}
                            />
                            <span style={{ fontSize: 14 }}>Yükleniyor...</span>
                        </div>
                    </div>
                )}
                {error && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 5,
                            background: 'rgba(0,0,0,0.8)',
                        }}
                    >
                        <div style={{ textAlign: 'center', color: '#fff', padding: '20px', maxWidth: '400px' }}>
                            <div style={{ fontSize: 48, marginBottom: '16px' }}>⚠️</div>
                            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: '8px' }}>Model Yüklenemedi</div>
                            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: '20px' }}>{error}</div>
                            <button
                                onClick={onHide}
                                style={{
                                    padding: '10px 20px',
                                    background: '#fff',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                )}
                {!error && proxyUrl && (
                    <model-viewer
                        src={proxyUrl}
                        camera-controls
                        auto-rotate
                        reveal="auto"
                        style={{ width: '100%', height: '100%' }}
                    />
                )}
            </div>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>,
        document.body
    );
}
