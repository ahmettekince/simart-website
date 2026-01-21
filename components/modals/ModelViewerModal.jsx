import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ModelViewerModal({ show, onHide, modelSrc }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden'; // Scrollu engelle
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [show]);

    if (!show || !mounted) return null;

    // Portal ile document.body'ye render et
    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 10000,
            backgroundColor: '#3c81b5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <button
                onClick={onHide}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '25px',
                    zIndex: 10000,
                    background: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
            >
                <i className="icon-close" style={{ fontSize: '24px', color: 'black' }}></i>
            </button>

            <div style={{ width: '100%', height: '100%' }}>
                <model-viewer
                    src={modelSrc}
                    camera-controls
                    auto-rotate
                    reveal="auto"
                    style={{ width: '100%', height: '100%' }}
                ></model-viewer>
            </div>
        </div>,
        document.body
    );
}
