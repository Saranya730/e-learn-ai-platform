import React from 'react';

const StarRating = ({ value, onChange, size = "2rem", readOnly = false }) => {
  return (
    <div style={{ display: "flex", gap: "8px", justifyContent: readOnly ? "flex-start" : "center" }}>
      {[1, 2, 3, 4, 5].map((index) => {
        const full = value >= index;
        const half = value >= index - 0.5 && value < index;
        return (
          <div
            key={index}
            style={{ position: "relative", cursor: readOnly ? "default" : "pointer", width: size, height: size }}
          >
            {!readOnly && (
              <>
                {/* Left Half Hitbox */}
                <div
                  onClick={() => onChange(index - 0.5)}
                  style={{ position: "absolute", left: 0, top: 0, width: "50%", height: "100%", zIndex: 2 }}
                />
                {/* Right Half Hitbox */}
                <div
                  onClick={() => onChange(index)}
                  style={{ position: "absolute", right: 0, top: 0, width: "50%", height: "100%", zIndex: 2 }}
                />
              </>
            )}
            {/* Background (Empty) Star */}
            <svg viewBox="0 0 24 24" style={{ position: "absolute", width: "100%", height: "100%", color: "#d1d5db" }} fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            {/* Filled Star (Full or Half) */}
            <div style={{ 
              position: "absolute", 
              width: full ? "100%" : half ? "50%" : "0%", 
              height: "100%", 
              overflow: "hidden", 
              transition: "0.2s" 
            }}>
              <svg viewBox="0 0 24 24" style={{ width: size, height: size, color: "#fbbf24" }} fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;
