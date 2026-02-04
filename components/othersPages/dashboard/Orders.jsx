"use client";
import React, { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiClient.get("/orders");
        const list = response?.data?.data?.data || [];
        if (isMounted) {
          setOrders(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        if (isMounted) {
          setError("Siparişler alınırken bir hata oluştu.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (createdAt) => {
    if (!createdAt) return "-";
    // API: "2026-02-03 23:59:15" → "03.02.2026"
    const [datePart] = createdAt.split(" ");
    if (!datePart) return createdAt;
    const [y, m, d] = datePart.split("-");
    if (!y || !m || !d) return datePart;
    return `${d}.${m}.${y}`;
  };

  const formatTotal = (total) => {
    if (total == null) return "-";
    const num = Number(total) || 0;
    return `₺${num.toLocaleString("tr-TR")}`;
  };

  const getPaymentStatusClass = (paymentStatusText) => {
    const t = (paymentStatusText || "").toLowerCase();
    if (t.includes("başarısız")) return "order-status-badge--failed";
    if (t.includes("bekleniyor")) return "order-status-badge--pending";
    if (t.includes("başarılı")) return "order-status-badge--success";
    return "";
  };

  const handleCopyOrderNumber = async (orderNumber) => {
    if (!orderNumber || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopiedOrderNumber(orderNumber);
      setTimeout(() => {
        setCopiedOrderNumber((prev) => (prev === orderNumber ? null : prev));
      }, 1500);
    } catch (e) {
      // sessiz geç; zorunlu değil
    }
  };

  const handleViewOrder = async (orderNumber) => {
    if (!orderNumber) return;
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError("");
    setSelectedOrderDetail(null);
    setIsAddressOpen(false);
    setIsLogsOpen(false);

    try {
      const response = await apiClient.post("/orders/by-number", {
        order_number: orderNumber,
      });
      const data = response?.data?.data || null;
      setSelectedOrderDetail(data);
    } catch (err) {
      setDetailError("Sipariş detayı alınırken bir hata oluştu.");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="my-account-content account-order">
      <div className="wrap-account-order">
        <table>
          <thead>
            <tr>
              <th className="fw-6">Sipariş No</th>
              <th className="fw-6">Tarih</th>
              <th className="fw-6">Durum</th>
              <th className="fw-6">Toplam</th>
              <th className="fw-6">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} style={{ padding: "16px", textAlign: "center" }}>
                  Siparişleriniz yükleniyor...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={5} style={{ padding: "16px", textAlign: "center", color: "#dc3545" }}>
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && orders.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "16px", textAlign: "center" }}>
                  Henüz bir siparişiniz bulunmuyor.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              orders.length > 0 &&
              orders.map((order) => (
                <tr className="tf-order-item" key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>{order.status_text}</td>
                  <td>{formatTotal(order.total)}</td>
                  <td>
                    <button
                      type="button"
                      className="tf-btn btn-fill animate-hover-btn rounded-0 justify-content-center"
                      onClick={() => handleViewOrder(order.order_number)}
                    >
                      Görüntüle
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {detailOpen && (
        <div
          className="order-detail-backdrop"
          onClick={() => {
            setDetailOpen(false);
            setSelectedOrderDetail(null);
            setDetailError("");
          }}
        >
          <div
            className="order-detail-modal modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="order-detail-modal-inner">
              <div className="order-detail-header d-flex align-items-center justify-content-between">
                <h5 className="fw-6 mb-0">Sipariş Detayı</h5>
                <button
                  type="button"
                  className="order-detail-close icon-close icon-close-popup"
                  onClick={() => {
                    setDetailOpen(false);
                    setSelectedOrderDetail(null);
                    setDetailError("");
                  }}
                  aria-label="Kapat"
                />
              </div>

              {detailLoading && (
              <div className="order-detail-skeleton">
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line" />
                <div className="skeleton-line" />
                <div className="skeleton-line half" />
                <div className="skeleton-block" />
                <div className="skeleton-block short" />
              </div>
              )}

              {!detailLoading && detailError && (
                <p className="text-center my-3 text-danger">{detailError}</p>
              )}

              {!detailLoading && !detailError && selectedOrderDetail && (
                <div className="order-detail-body">
                  <div className="order-detail-summary">
                    <div className="order-detail-row">
                      <span className="label">Sipariş No</span>
                      <span className="value order-number-copy">
                        {selectedOrderDetail.order_number}
                        <button
                          type="button"
                          className={`order-copy-btn ${
                            copiedOrderNumber === selectedOrderDetail.order_number
                              ? "copied"
                              : ""
                          }`}
                          onClick={() => handleCopyOrderNumber(selectedOrderDetail.order_number)}
                          aria-label={
                            copiedOrderNumber === selectedOrderDetail.order_number
                              ? "Kopyalandı"
                              : "Kopyala"
                          }
                        />
                      </span>
                    </div>
                    <div className="order-detail-row">
                      <span className="label">Durum</span>
                      <span className="value">{selectedOrderDetail.status_text}</span>
                    </div>
                    <div className="order-detail-row">
                      <span className="label">Ödeme Durumu</span>
                      <span
                        className={`value order-status-badge ${getPaymentStatusClass(
                          selectedOrderDetail.payment_status_text
                        )}`}
                      >
                        {selectedOrderDetail.payment_status_text}
                      </span>
                    </div>
                    <div className="order-detail-row total-row">
                      <span className="label">Toplam</span>
                      <span className="value">{formatTotal(selectedOrderDetail.total)}</span>
                    </div>
                    {selectedOrderDetail.installment_count != null && (
                      <div className="order-detail-row">
                        <span className="label">
                          {selectedOrderDetail.installment_count === 1 ? "" : "Taksit"}
                        </span>
                        <span className="value">
                          {selectedOrderDetail.installment_count === 1
                            ? "Tek çekim"
                            : `${selectedOrderDetail.installment_count} taksit`}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedOrderDetail.delivery_address && (
                    <div className="order-detail-section">
                      <button
                        type="button"
                        className="order-section-toggle"
                        onClick={() => setIsAddressOpen((prev) => !prev)}
                      >
                        <span className="fw-6">Teslimat Adresi</span>
                        <span
                          className={`order-section-arrow ${
                            isAddressOpen ? "open" : ""
                          }`}
                        >
                          ▾
                        </span>
                      </button>
                      {isAddressOpen && (
                        <div className="order-detail-address">
                          <div className="name">
                            {selectedOrderDetail.delivery_address.full_name}
                          </div>
                          <div className="phone">
                            {selectedOrderDetail.delivery_address.phone}
                          </div>
                          <div className="address">
                            {(selectedOrderDetail.delivery_address.full_address ||
                              selectedOrderDetail.delivery_address.address_detail ||
                              "").split("\n").map((line, idx) => (
                              <span key={idx}>
                                {line}
                                <br />
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {Array.isArray(selectedOrderDetail.logs) &&
                    selectedOrderDetail.logs.length > 0 && (
                      <div className="order-detail-section">
                        <button
                          type="button"
                          className="order-section-toggle"
                          onClick={() => setIsLogsOpen((prev) => !prev)}
                        >
                          <span className="fw-6">İşlem Geçmişi</span>
                          <span
                            className={`order-section-arrow ${
                              isLogsOpen ? "open" : ""
                            }`}
                          >
                            ▾
                          </span>
                        </button>
                        {isLogsOpen && (
                          <ul className="order-detail-log-list">
                            {selectedOrderDetail.logs.map((log) => (
                              <li key={log.id} className="order-detail-log-item">
                                <div className="log-date">{log.created_at}</div>
                                <div className="log-desc">{log.description}</div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
