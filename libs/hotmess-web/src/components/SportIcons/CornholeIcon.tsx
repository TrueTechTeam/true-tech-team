interface Props {
  size?: number;
  className?: string;
}

export function CornholeIcon({ size = 24, className }: Props) {
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
        <linearGradient id="ch-g" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.1" />
          <stop offset="100%" stopColor="black" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      {/* Board - 3/4 top-down perspective showing tilt
           Wider at bottom (closer), narrower at top (farther/raised) */}
      <path
        d="M3 21L6.5 5h11L21 21z"
        fill="#7c3aed"
        stroke="#6d28d9"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path d="M3 21L6.5 5h11L21 21z" fill="url(#ch-g)" />
      {/* Board side thickness - bottom edge */}
      <path
        d="M3 21l-.3 1h18.6l-.3-1z"
        fill="#5b21b6"
      />
      {/* Board raised-end hint - back edge thickness */}
      <path
        d="M6.5 5l.2-1.2h10.6l.2 1.2"
        fill="#4c1d95"
        stroke="#4c1d95"
        strokeWidth="0.3"
        strokeLinejoin="round"
      />
      {/* Hole in upper portion of board */}
      <ellipse
        cx="12"
        cy="10"
        rx="2.8"
        ry="2"
        fill="#1e1b4b"
        stroke="#4c1d95"
        strokeWidth="0.7"
      />
      {/* Board center line decoration */}
      <line x1="12" y1="5.5" x2="12" y2="20" stroke="#6d28d9" strokeWidth="0.4" opacity="0.3" />
      {/* Bean bag on the board surface */}
      <rect
        x="8"
        y="15.5"
        width="3.8"
        height="2.8"
        rx="0.6"
        fill="#fbbf24"
        stroke="#b45309"
        strokeWidth="0.6"
        transform="rotate(-8 9.9 16.9)"
      />
      {/* Bean bag fill texture - subtle stitching */}
      <line x1="8.5" y1="16" x2="11.3" y2="18" stroke="#92400e" strokeWidth="0.35" opacity="0.35" />
      <line x1="11.3" y1="16" x2="8.5" y2="18" stroke="#92400e" strokeWidth="0.35" opacity="0.35" />
      {/* Second bean bag flying toward hole */}
      <rect
        x="14.5"
        y="6.5"
        width="3"
        height="2.2"
        rx="0.5"
        fill="#fb923c"
        stroke="#c2410c"
        strokeWidth="0.5"
        transform="rotate(12 16 7.6)"
      />
    </svg>
  );
}
