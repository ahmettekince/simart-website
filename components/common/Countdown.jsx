"use client";

import { useEffect, useState } from "react";
import Countdown from "react-countdown";

const Completionist = () => <span>Bitti!</span>;

const renderer2 = ({ days, hours, minutes, seconds, completed }) => {
  if (completed) return <Completionist />;
  return (
    <div aria-hidden="true" className="countdown__timer">
      <span className="countdown__item">
        <span className="countdown__value">{days}</span>
        <span className="countdown__label">Gün</span>
      </span>
      <span className="countdown__item">
        <span className="countdown__value">{hours}</span>
        <span className="countdown__label">Saat</span>
      </span>
      <span className="countdown__item">
        <span className="countdown__value">{minutes}</span>
        <span className="countdown__label">Dakika</span>
      </span>
      <span className="countdown__item">
        <span className="countdown__value">{seconds}</span>
        <span className="countdown__label">Saniye</span>
      </span>
    </div>
  );
};

const rendererSoft = ({ days, hours, minutes, seconds, completed, props }) => {
  if (completed) return <Completionist />;
  return (
    <div aria-hidden="true" className="countdown__timer-soft" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      border: '1px solid var(--primary, #3c81b5)',
      borderRadius: '12px',
      width: '100%'
    }}>
      {/* Başlık Grubu - Üstte ve Ortada */}
      {(props.title || props.subtitle) && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', textAlign: 'center' }}>
          <style>{`
            @keyframes shake {
              0% { transform: rotate(0deg); }
              25% { transform: rotate(-10deg); }
              50% { transform: rotate(10deg); }
              75% { transform: rotate(-5deg); }
              100% { transform: rotate(0deg); }
            }
            .alarm-icon-animate {
              animation: shake 0.5s infinite;
              color: #dc2626;
            }
          `}</style>
          <div className="alarm-icon-animate" style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              <path d="M2 8c0-2.2.9-4.2 2.5-5.5"></path>
              <path d="M22 8c0-2.2-.9-4.2-2.5-5.5"></path>
            </svg>
          </div>
          {props.title && <h6 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "#333" }}>{props.title}</h6>}
          {props.subtitle && <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>{props.subtitle}</p>}
        </div>
      )}

      {/* Tüm Sayaç Üniteleri - Tek Sırada ve Ortada */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
        <div className="countdown__item-soft" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div className="countdown__value-box" style={{ background: '#f8f8f8', borderRadius: '8px', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: 'var(--primary, #3c81b5)', border: '1px solid #eee' }}>
            {days}
          </div>
          <span className="countdown__label" style={{ fontSize: '10px', color: '#888', fontWeight: '500' }}>gün</span>
        </div>
        <span className="countdown__separator" style={{ fontWeight: '700', fontSize: '16px', color: '#ccc', marginTop: '-18px' }}>:</span>

        <div className="countdown__item-soft" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div className="countdown__value-box" style={{ background: '#f8f8f8', borderRadius: '8px', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: 'var(--primary, #3c81b5)', border: '1px solid #eee' }}>
            {hours}
          </div>
          <span className="countdown__label" style={{ fontSize: '10px', color: '#888', fontWeight: '500' }}>saat</span>
        </div>
        <span className="countdown__separator" style={{ fontWeight: '700', fontSize: '16px', color: '#ccc', marginTop: '-18px' }}>:</span>

        <div className="countdown__item-soft" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div className="countdown__value-box" style={{ background: '#f8f8f8', borderRadius: '8px', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: 'var(--primary, #3c81b5)', border: '1px solid #eee' }}>
            {minutes}
          </div>
          <span className="countdown__label" style={{ fontSize: '10px', color: '#888', fontWeight: '500' }}>dakika</span>
        </div>
        <span className="countdown__separator" style={{ fontWeight: '700', fontSize: '16px', color: '#ccc', marginTop: '-18px' }}>:</span>

        <div className="countdown__item-soft" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div className="countdown__value-box" style={{ background: '#f8f8f8', borderRadius: '8px', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: 'var(--primary, #3c81b5)', border: '1px solid #eee' }}>
            {seconds}
          </div>
          <span className="countdown__label" style={{ fontSize: '10px', color: '#888', fontWeight: '500' }}>saniye</span>
        </div>
      </div>
    </div>
  );
};

export default function CountdownComponent({
  fullLabel = false,
  labels,
  targetDate = "2026-12-25",
  upperCase = false,
  variant = "soft",
  title,
  subtitle
}) {
  const [showCountdown, setShowCountdown] = useState(false);
  useEffect(() => {
    setShowCountdown(true);
  }, []);

  const rendererDefault = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) return <Completionist />;
    return (
      <div aria-hidden="true" className="countdown__timer">
        <span className="countdown__item">
          <span className="countdown__value">{days} </span>
          <span className="countdown__label">{labels?.split(",")[0] || "d :"}</span>
        </span>
        <span className="countdown__item">
          <span className="countdown__value">{hours} </span>
          <span className="countdown__label">{labels?.split(",")[1] || "h :"}</span>
        </span>
        <span className="countdown__item">
          <span className="countdown__value">{minutes} </span>
          <span className="countdown__label">{labels?.split(",")[2] || "m :"}</span>
        </span>
        <span className="countdown__item">
          <span className="countdown__value">{seconds} </span>
          <span className="countdown__label">{labels?.split(",")[3] || "s"}</span>
        </span>
      </div>
    );
  };

  return (
    <>
      {showCountdown && (
        <Countdown
          date={
            new Date(
              targetDate
                ? targetDate
                : new Date().setDate(
                  new Date().getDate() + Math.floor(Math.random() * 100)
                )
            )
          }
          title={title}
          subtitle={subtitle}
          renderer={(args) => {
            if (variant === "soft") return rendererSoft({ ...args, props: { title, subtitle } });
            if (fullLabel) return renderer2(args);
            return rendererDefault(args);
          }}
        />
      )}
    </>
  );
}
