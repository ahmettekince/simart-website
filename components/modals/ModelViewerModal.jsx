import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ModelViewerModal({ show, onHide, modelSrc }) {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const modelRef = useRef(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
            setLoading(true);
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [show]);

    useEffect(() => {
        if (!show || !modelSrc) return;
        let cleanup = null;
        const id = setTimeout(() => {
            const el = modelRef.current?.querySelector?.('model-viewer');
            if (!el) return;
            const onLoad = () => setLoading(false);
            const onError = () => setLoading(false);
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
    }, [show, modelSrc]);

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
                {loading && (
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
                <model-viewer
                    src={modelSrc}
                    camera-controls
                    auto-rotate
                    reveal="auto"
                    style={{ width: '100%', height: '100%' }}
                />
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
