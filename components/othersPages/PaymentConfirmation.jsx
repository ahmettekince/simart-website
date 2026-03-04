import React, { useEffect } from "react";
import Link from "next/link";
import { trackPurchase } from "@/utils/analytics";

export default function PaymentConfirmation() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pendingData = sessionStorage.getItem('pending_purchase');
      if (pendingData) {
        try {
          const orderData = JSON.parse(pendingData);
          trackPurchase(orderData);
          console.log('GTM Purchase tracked from success page:', orderData);
          // Tekrar sayfa yenilendiğinde aynı event gitmesin diye temizliyoruz
          sessionStorage.removeItem('pending_purchase');
        } catch (e) {
          console.error('Failed to track purchase from success page:', e);
        }
      }
    }
  }, []);

  return (
    <section className="flat-spacing-11">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <h5 className="fw-5 mb_20">Payment confirmation</h5>
            <div className="tf-page-cart-checkout">
              <div className="d-flex align-items-center justify-content-between mb_15">
                <div className="fs-18">Date</div>
                <p>01/01/2024</p>
              </div>
              <div className="d-flex align-items-center justify-content-between mb_15">
                <div className="fs-18">Payment method</div>
                <p>Visa</p>
              </div>
              <div className="d-flex align-items-center justify-content-between mb_15">
                <div className="fs-18">Card number</div>
                <p>**** **** **** 9999</p>
              </div>
              <div className="d-flex align-items-center justify-content-between mb_15">
                <div className="fs-18">Cardholder name</div>
                <p>Themesflat</p>
              </div>
              <div className="d-flex align-items-center justify-content-between mb_15">
                <div className="fs-18">Email</div>
                <p>info@fashionshop.com</p>
              </div>
              <div className="d-flex align-items-center justify-content-between mb_15">
                <div className="fs-18">Phone</div>
                <p>(212) 555-1234</p>
              </div>
              <div className="d-flex align-items-center justify-content-between mb_24">
                <div className="fs-22 fw-6">Subtotal</div>
                <span className="total-value">$188.00 USD</span>
              </div>
              <div className="d-flex gap-10">
                <Link
                  href={`/checkout`}
                  className="tf-btn w-100 btn-outline animate-hover-btn rounded-0 justify-content-center"
                >
                  <span>Cancel Payment</span>
                </Link>
                <a
                  href="#"
                  className="tf-btn w-100 btn-fill animate-hover-btn radius-3 justify-content-center"
                >
                  <span>Confirm Payment</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
