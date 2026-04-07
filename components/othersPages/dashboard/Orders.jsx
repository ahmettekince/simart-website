"use client";
import React, { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import SimartButton from "@/components/common/SimartButton";
import { useLangStore } from "@/stores/langStore";

export default function Orders() {
  const lang = useLangStore((s) => s.lang);
  const isEn = lang === "en";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(null);

  const t = {
    tr: {
      orderNo: "Sipariş No",
      date: "Tarih",
      status: "Durum",
      total: "Toplam",
      actions: "İşlemler",
      loading: "Siparişleriniz yükleniyor...",
      error: "Siparişler alınırken bir hata oluştu.",
      noOrders: "Henüz bir siparişiniz bulunmuyor.",
      view: "Görüntüle",
      orderDetail: "Sipariş Detayı",
      close: "Kapat",
      paymentStatus: "Ödeme Durumu",
      subtotal: "Ara Toplam",
      campaignDiscount: "Kampanya İndirimi",
      couponDiscount: "Kupon İndirimi",
      installmentFee: "Taksit Ücreti",
      installment: "Taksit",
      singleInstallment: "Tek çekim",
      installments: (count) => `${count} taksit`,
      payment: "Ödeme",
      orderProducts: "Sipariş Ürünleri",
      deliveryAddress: "Teslimat Adresi",
      invoiceAddress: "Fatura Adresi",
      orderHistory: "İşlem Geçmişi",
      copy: "Kopyala",
      copied: "Kopyalandı",
      product: "Ürün",
      discount: "İndirim",
      taxNo: "Vergi No",
      title: "Ünvan",
      errorDetail: "Sipariş detayı alınırken bir hata oluştu.",
      paymentFailed: "Ödeme Başarısız"
    },
    en: {
      orderNo: "Order No",
      date: "Date",
      status: "Status",
      total: "Total",
      actions: "Actions",
      loading: "Your orders are loading...",
      error: "An error occurred while fetching orders.",
      noOrders: "You don't have any orders yet.",
      view: "View",
      orderDetail: "Order Detail",
      close: "Close",
      paymentStatus: "Payment Status",
      subtotal: "Subtotal",
      campaignDiscount: "Campaign Discount",
      couponDiscount: "Coupon Discount",
      installmentFee: "Installment Fee",
      installment: "Installment",
      singleInstallment: "Single installment",
      installments: (count) => `${count} installments`,
      payment: "Payment",
      orderProducts: "Order Products",
      deliveryAddress: "Delivery Address",
      invoiceAddress: "Invoice Address",
      orderHistory: "Order History",
      copy: "Copy",
      copied: "Copied",
      product: "Product",
      discount: "Discount",
      taxNo: "Tax No",
      title: "Company Title",
      errorDetail: "An error occurred while fetching order details.",
      paymentFailed: "Payment Failed"
    }
  }[lang] || { /* fallback to tr already handled above */ };

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
          setError(t.error);
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
  }, [lang]);

  const formatDate = (createdAt) => {
    if (!createdAt) return "-";
    const [datePart] = createdAt.split(" ");
    if (!datePart) return createdAt;
    const [y, m, d] = datePart.split("-");
    if (!y || !m || !d) return datePart;
    return isEn ? `${m}/${d}/${y}` : `${d}.${m}.${y}`;
  };

  const formatTotal = (total) => {
    if (total == null) return "-";
    const num = Number(total) || 0;
    return `${num.toLocaleString(isEn ? "en-US" : "tr-TR")} ${isEn ? "USD" : "TL"}`; // Note: Currency still TL/USD? User usually wants TL. Let's keep TL but format num.
  };

  // Rest of Total formatting - normally should be dynamic based on shop currency, but for now we format the number.
  const formatCurrency = (val) => {
     if (val == null) return "-";
     const num = Number(val) || 0;
     return `${num.toLocaleString(isEn ? "en-US" : "tr-TR")} TL`;
  };

  const getPaymentStatusClass = (paymentStatusText) => {
    const txt = (paymentStatusText || "").toLowerCase();
    // API returns values like "başarısız", "bekleniyor", "başarılı"
    if (txt.includes("başarısız") || txt.includes("failed")) return "order-status-badge--failed";
    if (txt.includes("bekleniyor") || txt.includes("pending")) return "order-status-badge--pending";
    if (txt.includes("başarılı") || txt.includes("success")) return "order-status-badge--success";
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
    } catch (e) { }
  };

  const handleViewOrder = async (orderNumber) => {
    if (!orderNumber) return;
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError("");
    setSelectedOrderDetail(null);
    setIsAddressOpen(false);
    setIsInvoiceOpen(false);
    setIsLogsOpen(false);

    try {
      const response = await apiClient.post("/orders/by-number", {
        order_number: orderNumber,
      });
      const data = response?.data?.data || null;
      setSelectedOrderDetail(data);
    } catch (err) {
      setDetailError(t.errorDetail);
    } finally {
      setDetailLoading(false);
    }
  };

  const getDisplayStatus = (orderObj) => {
    if (!orderObj) return "-";
    const isPaymentFailed = (orderObj.payment_status_text || "").toLowerCase().includes("başarısız") || (orderObj.payment_status_text || "").toLowerCase().includes("failed");
    
    if (isPaymentFailed) {
      return isEn ? "Payment Failed" : "Ödeme Başarısız";
    }

    let status = orderObj.status_text || "-";
    
    if (isEn) {
      const statusMap = {
        "İptal Edildi": "Cancelled",
        "Bekleniyor": "Pending",
        "Tamamlandı": "Completed",
        "Onaylandı": "Approved",
        "Kargoya Verildi": "Shipped",
        "Teslim Edildi": "Delivered",
        "Hazırlanıyor": "Preparing",
        "Ödeme Bekleniyor": "Awaiting Payment",
        "İade Edildi": "Refunded",
        "Kısmi İade": "Partially Refunded"
      };
      return statusMap[status] || status;
    }
    return status;
  };

  const getDisplayPaymentStatus = (paymentText) => {
    if (!paymentText) return "-";
    if (!isEn) return paymentText;
    
    const txt = paymentText.toLowerCase();
    if (txt.includes("başarısız")) return "Payment Failed";
    if (txt.includes("bekleniyor")) return "Pending";
    if (txt.includes("başarılı") || txt.includes("success")) return "Payment Successful";
    return paymentText;
  };

  return (
    <div className="my-account-content account-order">
      <div className="wrap-account-order border overflow-hidden" style={{ borderRadius: '12px' }}>
        <table className="mb-0">
          <thead>
            <tr>
              <th className="fw-6">{t.orderNo}</th>
              <th className="fw-6">{t.date}</th>
              <th className="fw-6">{t.status}</th>
              <th className="fw-6">{t.total}</th>
              <th className="fw-6">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} style={{ padding: "16px", textAlign: "center" }}>
                  {t.loading}
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
                  {t.noOrders}
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              orders.length > 0 &&
              orders.map((order) => {
                const isPaymentFailed = (order.payment_status_text || "").toLowerCase().includes("başarısız") || (order.payment_status_text || "").toLowerCase().includes("failed");
                const displayStatus = getDisplayStatus(order);

                return (
                  <tr
                    className="tf-order-item"
                    key={order.id}
                    style={isPaymentFailed ? { backgroundColor: "#cc3333", color: "#fff" } : undefined}
                  >
                    <td>{order.order_number}</td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>{displayStatus}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <SimartButton
                        type="button"
                        onClick={() => handleViewOrder(order.order_number)}
                      >
                        {t.view}
                      </SimartButton>
                    </td>
                  </tr>
                );
              })}
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
            <div className="order-detail-modal-inner" style={{ borderRadius: '16px' }}>
              <div className="order-detail-header d-flex align-items-center justify-content-between">
                <h5 className="fw-6 mb-0">{t.orderDetail}</h5>
                <button
                  type="button"
                  className="order-detail-close icon-close icon-close-popup"
                  onClick={() => {
                    setDetailOpen(false);
                    setSelectedOrderDetail(null);
                    setDetailError("");
                  }}
                  aria-label={t.close}
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
                      <span className="label">{t.orderNo}</span>
                      <span className="value order-number-copy">
                        {selectedOrderDetail.order_number}
                        <button
                          type="button"
                          className={`order-copy-btn ${copiedOrderNumber === selectedOrderDetail.order_number
                            ? "copied"
                            : ""
                            }`}
                          onClick={() => handleCopyOrderNumber(selectedOrderDetail.order_number)}
                          aria-label={
                            copiedOrderNumber === selectedOrderDetail.order_number
                              ? t.copied
                              : t.copy
                          }
                        />
                      </span>
                    </div>
                    <div className="order-detail-row">
                      <span className="label">{t.status}</span>
                      <span className="value">{getDisplayStatus(selectedOrderDetail)}</span>
                    </div>
                    <div className="order-detail-row">
                      <span className="label">{t.paymentStatus}</span>
                      <span
                        className={`value order-status-badge ${getPaymentStatusClass(
                          selectedOrderDetail.payment_status_text
                        )}`}
                      >
                        {getDisplayPaymentStatus(selectedOrderDetail.payment_status_text)}
                      </span>
                    </div>
                    {selectedOrderDetail.subtotal != null && (
                      <div className="order-detail-row">
                        <span className="label">{t.subtotal}</span>
                        <span className="value">{formatCurrency(selectedOrderDetail.subtotal)}</span>
                      </div>
                    )}
                    {(selectedOrderDetail.campaign_discount_amount ?? 0) > 0 && (
                      <div className="order-detail-row">
                        <span className="label">{t.campaignDiscount}</span>
                        <span className="value" style={{ color: "#10b981" }}>
                          -{formatCurrency(selectedOrderDetail.campaign_discount_amount)}
                        </span>
                      </div>
                    )}
                    {(selectedOrderDetail.coupon_discount_amount ?? 0) > 0 && (
                      <div className="order-detail-row">
                        <span className="label">{t.couponDiscount}{selectedOrderDetail.coupon_code ? ` (${selectedOrderDetail.coupon_code})` : ""}</span>
                        <span className="value" style={{ color: "#10b981" }}>
                          -{formatCurrency(selectedOrderDetail.coupon_discount_amount)}
                        </span>
                      </div>
                    )}
                    {(selectedOrderDetail.installment_fee ?? 0) > 0 && (
                      <div className="order-detail-row">
                        <span className="label">{t.installmentFee}</span>
                        <span className="value">{formatCurrency(selectedOrderDetail.installment_fee)}</span>
                      </div>
                    )}
                    <div className="order-detail-row total-row">
                      <span className="label">{t.total}</span>
                      <span className="value">{formatCurrency(selectedOrderDetail.total)}</span>
                    </div>
                    {selectedOrderDetail.installment_count != null && (
                      <div className="order-detail-row">
                        <span className="label">{t.installment}</span>
                        <span className="value">
                          {selectedOrderDetail.installment_count === 1
                            ? t.singleInstallment
                            : t.installments(selectedOrderDetail.installment_count)}
                        </span>
                      </div>
                    )}
                    {(selectedOrderDetail.bank_name || selectedOrderDetail.card_brand) && (
                      <div className="order-detail-row">
                        <span className="label">{t.payment}</span>
                        <span className="value">
                          {[selectedOrderDetail.bank_name, selectedOrderDetail.card_brand].filter(Boolean).join(" / ")}
                          {selectedOrderDetail.card_bin && (
                            <span className="text-muted" style={{ fontSize: "12px", marginLeft: "4px" }}>
                              (****{String(selectedOrderDetail.card_bin).slice(-4)})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {Array.isArray(selectedOrderDetail.cart_items) && selectedOrderDetail.cart_items.length > 0 && (
                    <div className="order-detail-section">
                      <div className="fw-6 mb_10" style={{ fontSize: "14px" }}>{t.orderProducts}</div>
                      <ul className="order-detail-product-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {selectedOrderDetail.cart_items.map((item) => (
                          <li key={item.id} className="order-detail-product-item" style={{ padding: "10px 0", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                            <div>
                               <span className="fw-6">{item.product?.name || t.product}</span>
                              <span className="text-muted" style={{ fontSize: "12px", marginLeft: "6px" }}>x{item.quantity}</span>
                              {(item.discount_amount ?? 0) > 0 && (
                                <span className="text-success" style={{ fontSize: "11px", marginLeft: "6px" }}>{t.discount}: -{formatCurrency(item.discount_amount)}</span>
                              )}
                            </div>
                            <span>{formatCurrency(item.total)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedOrderDetail.delivery_address && (
                    <div className="order-detail-section">
                      <button
                        type="button"
                        className="order-section-toggle"
                        onClick={() => setIsAddressOpen((prev) => !prev)}
                      >
                        <span className="fw-6">{t.deliveryAddress}</span>
                        <span
                          className={`order-section-arrow ${isAddressOpen ? "open" : ""
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

                  {selectedOrderDetail.invoice_address && (
                    <div className="order-detail-section">
                      <button
                        type="button"
                        className="order-section-toggle"
                        onClick={() => setIsInvoiceOpen((prev) => !prev)}
                      >
                        <span className="fw-6">{t.invoiceAddress}</span>
                        <span className={`order-section-arrow ${isInvoiceOpen ? "open" : ""}`}>▾</span>
                      </button>
                      {isInvoiceOpen && (
                        <div className="order-detail-address">
                          {selectedOrderDetail.invoice_address.invoice_type === "company" && (
                            <div className="mb_8">
                              <span className="text-muted" style={{ fontSize: "12px" }}>{t.title}: </span>
                              {selectedOrderDetail.invoice_address.company_name}
                            </div>
                          )}
                          {selectedOrderDetail.invoice_address.tax_number && (
                            <div className="mb_8">
                              <span className="text-muted" style={{ fontSize: "12px" }}>{t.taxNo}: </span>
                              {selectedOrderDetail.invoice_address.tax_number}
                            </div>
                          )}
                          <div className="name">{selectedOrderDetail.invoice_address.full_name}</div>
                          <div className="phone">{selectedOrderDetail.invoice_address.phone}</div>
                          <div className="address">
                            {(selectedOrderDetail.invoice_address.full_address ||
                              selectedOrderDetail.invoice_address.address_detail ||
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
                          <span className="fw-6">{t.orderHistory}</span>
                          <span
                            className={`order-section-arrow ${isLogsOpen ? "open" : ""
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

      <style jsx>{`
        .wrap-account-order table thead tr th {
          background-color: #f5f5f5 !important;
          color: #000 !important;
          border: none !important;
          padding: 15px 20px !important;
        }
        .text-success { color: #10b981 !important; }
        .order-status-badge--success {
          background-color: #ecfdf5 !important;
          color: #10b981 !important;
        }
      `}</style>
    </div>
  );
}
