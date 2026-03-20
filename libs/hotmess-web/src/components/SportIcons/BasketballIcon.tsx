interface Props {
  size?: number;
  className?: string;
}

export function BasketballIcon({ size = 24, className }: Props) {
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
        <radialGradient id="bb-grad" cx="0.35" cy="0.35" r="0.65">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0.3" />
        </radialGradient>
        <clipPath id="bb-clip">
          <circle cx="12" cy="12" r="10" />
        </clipPath>
      </defs>
      {/* Ball */}
      <circle cx="12" cy="12" r="10" fill="#f59e0b" />
      <circle cx="12" cy="12" r="10" fill="url(#bb-grad)" />
      <g clipPath="url(#bb-clip)">
        {/* Horizontal seam */}
        <line x1="2" y1="12" x2="22" y2="12" stroke="#78350f" strokeWidth="0.8" />
        {/* Vertical seam */}
        <line x1="12" y1="2" x2="12" y2="22" stroke="#78350f" strokeWidth="0.8" />
        {/* Left curve */}
        <path
          d="M7 2.5C5 5.5 4 8.5 4 12c0 3.5 1 6.5 3 9.5"
          stroke="#78350f"
          strokeWidth="0.8"
          fill="none"
        />
        {/* Right curve */}
        <path
          d="M17 2.5c2 3 3 6 3 9.5 0 3.5-1 6.5-3 9.5"
          stroke="#78350f"
          strokeWidth="0.8"
          fill="none"
        />
      </g>
      {/* Outline */}
      <circle cx="12" cy="12" r="10" stroke="#92400e" strokeWidth="0.6" fill="none" />
      {/* Shine */}
      <ellipse cx="8.5" cy="7.5" rx="3" ry="1.5" transform="rotate(-30 8.5 7.5)" fill="white" opacity="0.18" />
    </svg>
  );
}
