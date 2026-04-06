import React from "react";

export default function Map({ lang = "tr" }) {
  const mapLang = lang === "en" ? "en" : "tr";
  return (
    <div className="w-100">
      <iframe
        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1020.4190711457215!2d32.61659920559623!3d39.968163825556275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d349474a1db167%3A0xcf40f9c1588975d!2s%C5%9E%C4%B1mart%20Teknoloji%20San.%20ve%20Tic.%20A.%C5%9E!5e0!3m2!1s${mapLang}!2s${mapLang}!4v1767370357769!5m2!1s${mapLang}!2s${mapLang}`}
        width="100%"
        height={646}
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
