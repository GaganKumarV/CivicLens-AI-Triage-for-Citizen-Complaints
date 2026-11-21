import React from "react";

interface AshokaEmblemProps {
  className?: string;
  spin?: boolean;
}

export const AshokaEmblem: React.FC<AshokaEmblemProps> = ({
  className = "w-8 h-8",
  spin = false,
}) => {
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${spin ? "chakra-subtle-spin" : ""}`}
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke="currentColor"
        strokeWidth="3.5"
      />
      <circle
        cx="50"
        cy="50"
        r="39"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.45"
      />
      <circle cx="50" cy="50" r="8.5" fill="currentColor" />
      {spokes.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 50 + Math.cos(rad) * 10;
        const y1 = 50 + Math.sin(rad) * 10;
        const x2 = 50 + Math.cos(rad) * 41;
        const y2 = 50 + Math.sin(rad) * 41;
        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};
