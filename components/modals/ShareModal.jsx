"use client";
import React, { useEffect, useMemo, useState } from "react";

export default function ShareModal() {
  const [shareUrl, setShareUrl] = useState("");
  const [shareTitle, setShareTitle] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
      setShareTitle(document.title || "");
    }
  }, []);

  const encodedUrl = useMemo(() => encodeURIComponent(shareUrl || ""), [shareUrl]);
  const encodedTitle = useMemo(() => encodeURIComponent(shareTitle || ""), [shareTitle]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (err) {
      console.error("Link kopyalanamadı:", err);
    }
  };

  return (
    <div className="modal modalCentered fade modalDemo tf-product-modal modal-part-content" id="share_social">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <div className="demo-title">Paylaş</div>
            <span className="icon-close icon-close-popup" data-bs-dismiss="modal" />
          </div>
          <div className="overflow-y-auto">
            <ul className="tf-social-icon d-flex gap-10">
              <li>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="box-icon social-facebook bg_line"
                >
                  <i className="icon icon-fb" />
                </a>
              </li>
              <li>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="box-icon social-twiter bg_line"
                >
                  <i className="icon icon-Icon-x" />
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="box-icon social-instagram bg_line"
                >
                  <i className="icon icon-instagram" />
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="box-icon social-tiktok bg_line"
                >
                  <i className="icon icon-tiktok" />
                </a>
              </li>
              <li>
                <a
                  href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="box-icon social-pinterest bg_line"
                >
                  <i className="icon icon-pinterest-1" />
                </a>
              </li>
            </ul>
            <form onSubmit={(e) => e.preventDefault()} className="form-share" method="post" acceptCharset="utf-8">
              <fieldset>
                <input type="text" value={shareUrl} readOnly tabIndex={0} aria-required="true" />
              </fieldset>
              <div className="button-submit">
                <button
                  className="tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn"
                  type="button"
                  onClick={handleCopy}
                >
                  Copy
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
