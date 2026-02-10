"use client";
import React from "react";

export default function AskQuestion() {
  return (
    <div
      className="modal modalCentered fade modalDemo tf-product-modal modal-part-content"
      id="ask_question"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <div className="demo-title">Soru Sor</div>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="overflow-y-auto">
            <form onSubmit={(e) => e.preventDefault()} className="" noValidate>
              <fieldset className="">
                <label htmlFor="">Adınız Soyadınız *</label>
                <input
                  type="text"
                  placeholder=""
                  className=""
                  name="text"
                  tabIndex={2}
                  defaultValue=""
                  aria-required="true"
                  required
                />
              </fieldset>
              <fieldset className="">
                <label htmlFor="">E-Posta *</label>
                <input
                  type="email"
                  placeholder=""
                  className=""
                  name="text"
                  tabIndex={2}
                  defaultValue=""
                  aria-required="true"
                  required
                  autoComplete="abc@xyz.com"
                />
              </fieldset>
              <fieldset className="">
                <label htmlFor="">Telefon Numaranız *</label>
                <input
                  type="number"
                  placeholder=""
                  className=""
                  name="text"
                  tabIndex={2}
                  defaultValue=""
                  aria-required="true"
                  required
                />
              </fieldset>
              <fieldset className="">
                <label htmlFor="">Mesajınız *</label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder=""
                  className=""
                  tabIndex={2}
                  aria-required="true"
                  required
                  defaultValue={""}
                />
              </fieldset>
              <button
                type="submit"
                className="tf-btn w-100 btn-fill justify-content-center fw-6 fs-16 flex-grow-1 animate-hover-btn"
              >
                <span>Gönder</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
