"use client";

import React from "react";

/**
 * Hesap sayfası tab component'i (değerlendirmeler, adresler vb.)
 * @param {Object} props
 * @param {Array<{id: string, label: string, count?: number}>} props.tabs - Tab listesi
 * @param {string} props.activeTab - Aktif tab id
 * @param {Function} props.onTabChange - (id) => void
 * @param {string} [props.className] - Ek class
 * @param {Object} [props.style] - Ek inline stil
 */
export default function AccountTabs({ tabs, activeTab, onTabChange, className = "", style = {} }) {
  return (
    <div
      className={`account-tabs ${className}`}
      style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "32px", ...style }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`account-tabs__btn ${activeTab === tab.id ? "active" : ""}`}
        >
          {tab.label}
          {tab.count != null && tab.count > 0 && (
            <span className="account-tabs__count"> ({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}
