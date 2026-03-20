interface Props {
  size?: number;
  className?: string;
}

export function IndoorVolleyballIcon({ size = 24, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <clipPath id="iv-clip">
          <circle cx="12" cy="11" r="9" />
        </clipPath>
      </defs>
      {/* Court floor hint */}
      <rect x="1" y="21" width="22" height="3" rx="0.5" fill="#d97706" opacity="0.2" />
      <line x1="1" y1="21" x2="23" y2="21" stroke="#d97706" strokeWidth="0.6" />
      {/* Ball */}
      <circle cx="12" cy="11" r="9" fill="#fefce8" />
      <g clipPath="url(#iv-clip)">
        {/* Volleyball 3-seam pattern based on Tabler reference */}
        {/* Seam 1: from center curving to upper-right */}
        <path d="M12 11a8 8 0 0 0 8 4" stroke="#f97316" strokeWidth="0.9" fill="none" />
        {/* Seam 1 extension: lower-left */}
        <path d="M7.5 12.5a12 12 0 0 0 8.5 6.5" stroke="#f97316" strokeWidth="0.9" fill="none" />
        {/* Seam 2: from center curving to lower-left */}
        <path d="M12 11a8 8 0 0 0-7.5 4.9" stroke="#f97316" strokeWidth="0.9" fill="none" />
        {/* Seam 2 extension: upper-right */}
        <path d="M13 6.4a12 12 0 0 0-9.9 4.1" stroke="#f97316" strokeWidth="0.9" fill="none" />
        {/* Seam 3: from center curving upward */}
        <path d="M12 11a8 8 0 0 0-.5-8.9" stroke="#f97316" strokeWidth="0.9" fill="none" />
        {/* Seam 3 extension: downward */}
        <path d="M15.5 14.1a12 12 0 0 0 1.4-10.6" stroke="#f97316" strokeWidth="0.9" fill="none" />
        {/* Alternating panel fills */}
        <path
          d="M12 11a8 8 0 0 0 8 4 9 9 0 0 0 .5-5.5 12 12 0 0 0-5-7.3A8 8 0 0 0 12 11z"
          fill="#f97316"
          opacity="0.2"
        />
        <path
          d="M12 11a8 8 0 0 0-7.5 4.9A9 9 0 0 0 12 20a12 12 0 0 0 4-1.5A8 8 0 0 0 12 11z"
          fill="#f97316"
          opacity="0.15"
        />
        <path
          d="M12 11a8 8 0 0 0-.5-8.9A9 9 0 0 0 3 11c0 .5 0 1 .1 1.5A8 8 0 0 0 12 11z"
          fill="#f97316"
          opacity="0.15"
        />
      </g>
      {/* Outline */}
      <circle cx="12" cy="11" r="9" stroke="#ea580c" strokeWidth="0.6" fill="none" />
      {/* Shine */}
      <ellipse cx="9" cy="7" rx="2.5" ry="1.2" transform="rotate(-20 9 7)" fill="white" opacity="0.25" />
    </svg>
  );
}
