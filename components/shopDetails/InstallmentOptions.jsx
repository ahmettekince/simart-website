"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getInstallmentOptions } from "@/api/installment";

/**
 * Taksit seçenekleri component'i
 * Mobilde alt alta, tablette 2 yan yana, PC'de 4 yan yana gösterir
 * Filtreleme: Rate 0 olanları gösterir, ama installment_count: 1 ve rate > 0 olanları göstermez
 */
export default function InstallmentOptions({ productSlug }) {
  const [loading, setLoading] = useState(false);
  const [installmentData, setInstallmentData] = useState(null);
  const [error, setError] = useState(null);

  // Slug'ı temizle
  const cleanSlug = React.useMemo(() => {
    if (!productSlug || typeof productSlug !== "string") return null;
    const trimmed = productSlug.trim();
    return trimmed === "" ? null : trimmed;
  }, [productSlug]);

  // Taksit seçeneklerini yükle - tab açıldığında otomatik yükle
  useEffect(() => {
    if (!cleanSlug || installmentData) return;

    const fetchInstallments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getInstallmentOptions(cleanSlug);
        if (data) {
          // Filtreleme: Rate 0 olanları göster, ama installment_count: 1 ve rate > 0 olanları gösterme
          const filteredData = {
            ...data,
            banks: data.banks.map((bank) => {
              const filteredOptions = bank.options.filter((option) => {
                // Rate 0 olanları göster
                const rate = parseFloat(option.rate || 0);
                if (rate === 0) return true;
                // Rate > 0 ve installment_count === 1 olanları gösterme
                if (option.installment_count === 1 && rate > 0) return false;
                // Diğer rate'li taksitleri göster
                return true;
              });
              return {
                ...bank,
                options: filteredOptions,
              };
            }),
          };
          setInstallmentData(filteredData);
        } else {
          setError("Taksit seçenekleri yüklenemedi");
        }
      } catch (err) {
        setError("Bir hata oluştu");
        console.error("[InstallmentOptions] Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstallments();
  }, [cleanSlug, installmentData]);

  if (!cleanSlug) return null;

  const formatPrice = (price) => {
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="tf-installment-options">
      <div className="tf-installment-content">
        {loading && (
          <div className="tf-installment-loading">
            <p>Yükleniyor...</p>
          </div>
        )}

        {error && (
          <div className="tf-installment-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && installmentData && installmentData.banks && (
          <div className="tf-installment-banks">
            {installmentData.banks.map((bank) => (
              <div key={bank.bank_id} className="tf-installment-bank-card">
                {/* Banka Header */}
                <div className="tf-installment-bank-header">
                  {bank.bank_image_url && (
                    <Image
                      src={bank.bank_image_url}
                      alt={bank.bank_name}
                      width={120}
                      height={40}
                      style={{ objectFit: "contain", maxHeight: "40px" }}
                    />
                  )}
                  {!bank.bank_image_url && (
                    <h4 className="tf-installment-bank-name">{bank.bank_name}</h4>
                  )}
                </div>

                {/* Taksit Tablosu */}
                <div className="tf-installment-table-wrapper">
                  <table className="tf-installment-table">
                    <thead>
                      <tr>
                        <th>Taksit</th>
                        <th>Taksit Tutarı</th>
                        <th>Toplam Tutar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bank.options
                        .filter((opt) => opt.is_available)
                        .map((option, idx) => (
                          <tr
                            key={`${bank.bank_id}-${option.installment_count}-${idx}`}
                            className={
                              option.campaign_applied ? "campaign-applied" : ""
                            }
                          >
                            <td>{option.installment_count}</td>
                            <td>
                              {formatPrice(option.monthly_payment)}
                              <span style={{ marginLeft: "4px" }}>TL</span>
                            </td>
                            <td>
                              <span className="total-amount">
                                {formatPrice(option.total_payment)}
                                <span style={{ marginLeft: "4px" }}>TL</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .tf-installment-options {
          margin: 0;
        }

        .tf-installment-content {
          padding: 0;
        }

        .tf-installment-loading,
        .tf-installment-error {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .tf-installment-banks {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4px;
        }

        .tf-installment-bank-card {
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
        }

        .tf-installment-bank-header {
          padding: 8px 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50px;
        }

        .tf-installment-bank-name {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
        }

        .tf-installment-table-wrapper {
          overflow-x: auto;
        }

        .tf-installment-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .tf-installment-table thead {
          background: #f9f9f9;
        }

        .tf-installment-table th {
          padding: 12px 6px;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #e5e5e5;
        }

        .tf-installment-table th:nth-child(2),
        .tf-installment-table th:nth-child(3) {
          text-align: right;
        }

        .tf-installment-table td {
          padding: 10px 6px;
          border-bottom: 1px solid #f0f0f0;
          color: #555;
        }

        .tf-installment-table td:nth-child(2),
        .tf-installment-table td:nth-child(3) {
          text-align: right;
        }

        .tf-installment-table tbody tr:hover {
          background: #f9f9f9;
        }

        .tf-installment-table tbody tr.campaign-applied {
          background: #dcfce7;
        }

        .total-amount {
          font-weight: 600;
          color: #111;
        }

        /* Tablet: 2 yan yana */
        @media (min-width: 768px) {
          .tf-installment-banks {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* PC: 4 yan yana */
        @media (min-width: 1024px) {
          .tf-installment-banks {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
