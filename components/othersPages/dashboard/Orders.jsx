import React from "react";
import Link from "next/link";
export default function Orders() {
  return (
    <div className="my-account-content account-order">
      <div className="wrap-account-order">
        <table>
          <thead>
            <tr>
              <th className="fw-6">Sipariş</th>
              <th className="fw-6">Tarih</th>
              <th className="fw-6">Durum</th>
              <th className="fw-6">Toplam</th>
              <th className="fw-6">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr className="tf-order-item">
              <td>#123</td>
              <td>August 1, 2024</td>
              <td>Beklemede</td>
              <td>₺200.00</td>
              <td>
                <Link
                  href={`/my-account-orders-details`}
                  className="tf-btn btn-fill animate-hover-btn rounded-0 justify-content-center"
                >
                  <span>Görüntüleme</span>
                </Link>
              </td>
            </tr>
            <tr className="tf-order-item">
              <td>#345</td>
              <td>August 2, 2024</td>
              <td>Beklemede</td>
              <td>₺300.00</td>
              <td>
                <Link
                  href={`/my-account-orders-details`}
                  className="tf-btn btn-fill animate-hover-btn rounded-0 justify-content-center"
                >
                  <span>Görüntüleme</span>
                </Link>
              </td>
            </tr>
            <tr className="tf-order-item">
              <td>#567</td>
              <td>August 3, 2024</td>
              <td>Beklemede</td>
              <td>₺400.00</td>
              <td>
                <Link
                  href={`/my-account-orders-details`}
                  className="tf-btn btn-fill animate-hover-btn rounded-0 justify-content-center"
                >
                  <span>Görüntüleme</span>
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
