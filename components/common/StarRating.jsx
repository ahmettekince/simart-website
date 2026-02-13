"use client";

import React from "react";

/**
 * Yıldız puanı bileşeni. 0–5 arası rating, isteğe bağlı yorum sayısı.
 * Kullanım: <StarRating rating={4.2} reviewCount={12} />
 */
export default function StarRating({
  rating = 0,
  reviewCount = null,
  maxStars = 5,
  size = "medium",
  className = "",
  showNumber = true,
  showReviewCount = true,
}) {
  const numRating = Number(rating) || 0;


  const numReviews = reviewCount != null ? Number(reviewCount) : 0;

  return (
    <div className={`star-rating star-rating--${size} ${className}`.trim()}>
      <div className="star-rating__wrap">
        {showNumber && (
          <span className="star-rating__num">{numRating.toFixed(1)}</span>
        )}
        <div className="star-rating__stars">
          {[...Array(maxStars)].map((_, i) => {
            const starValue = i + 1;
            const fillPercentage = Math.max(0, Math.min(100, (numRating - i) * 100));
            const isFilled = numRating >= starValue;
            const isPartial = numRating > i && numRating < starValue;

            return (
              <div key={i} className="star-rating__star">
                <i className="icon-star star-rating__empty" aria-hidden />
                {isFilled ? (
                  <i className="icon-star star-rating__filled" aria-hidden />
                ) : isPartial ? (
                  <i
                    className="icon-star star-rating__filled star-rating__partial"
                    style={{ clipPath: `inset(0 ${100 - fillPercentage}% 0 0)` }}
                    aria-hidden
                  />
                ) : null}
              </div>
            );
          })}
        </div>
        {showReviewCount && numReviews > 0 && (
          <span className="star-rating__reviews">({numReviews})</span>
        )}
      </div>
      <style jsx>{`
        .star-rating__wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          line-height: 1;
        }
        .star-rating__num {
          line-height: 1;
          display: inline-flex;
          align-items: center;
        }
        .star-rating__stars {
          display: flex;
          align-items: center;
          gap: 2px;
          line-height: 0;
        }
        .star-rating__star {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 0;
        }
        .star-rating--small .star-rating__star {
          font-size: 11px;
        }
        .star-rating--medium .star-rating__star {
          font-size: 12px;
        }
        .star-rating--large .star-rating__star {
          font-size: 14px;
        }
        .star-rating__empty,
        .star-rating__filled {
          display: block;
          line-height: 1;
        }
        .star-rating__empty {
          color: #ddd;
        }
        .star-rating__filled {
          position: absolute;
          top: 0;
          left: 0;
          color: #FFC107;
          fill: #FFC107;

        }
        .star-rating__partial {
          clip-path: inset(0 0 0 0);
        }
        .star-rating__num {
          font-size: 13px;
          font-weight: 600;
        }
        .star-rating__reviews {
          display: inline-flex;
          align-items: center;
          font-size: 12px;
          color: #777;
          line-height: 1;
        }
        .star-rating--small .star-rating__num {
          font-size: 12px;
        }
        .star-rating--large .star-rating__num {
          font-size: 14px;
        }
        .star-rating--small .star-rating__reviews {
          font-size: 11px;
        }
      `}</style>
    </div>
  );
}
