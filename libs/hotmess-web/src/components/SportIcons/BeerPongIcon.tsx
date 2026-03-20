interface Props {
  size?: number;
  className?: string;
}

export function BeerPongIcon({ size = 24, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Ping pong ball - bouncing above */}
      <circle cx="17" cy="3" r="2" fill="#fef9c3" stroke="#ca8a04" strokeWidth="0.5" />
      <ellipse cx="16.3" cy="2.5" rx="0.7" ry="0.4" fill="white" opacity="0.35" />
      {/* Ball arc path hint */}
      <path
        d="M17 5c-1 1-2.5 2-4 2.5"
        stroke="#ca8a04"
        strokeWidth="0.3"
        strokeDasharray="0.8 0.8"
        fill="none"
        opacity="0.4"
      />

      {/* Back row - 3 cups */}
      {/* Left back cup */}
      <path d="M2.5 8.5l1 8h3l1-8z" fill="#dc2626" />
      <ellipse cx="5" cy="8.5" rx="2.5" ry="0.9" fill="#ef4444" />
      <ellipse cx="5" cy="9" rx="1.8" ry="0.5" fill="#fbbf24" opacity="0.4" />

      {/* Center back cup */}
      <path d="M8 8.5l1 8h3l1-8z" fill="#dc2626" />
      <ellipse cx="10.5" cy="8.5" rx="2.5" ry="0.9" fill="#ef4444" />
      <ellipse cx="10.5" cy="9" rx="1.8" ry="0.5" fill="#fbbf24" opacity="0.4" />

      {/* Right back cup */}
      <path d="M13.5 8.5l1 8h3l1-8z" fill="#dc2626" />
      <ellipse cx="16" cy="8.5" rx="2.5" ry="0.9" fill="#ef4444" />
      <ellipse cx="16" cy="9" rx="1.8" ry="0.5" fill="#fbbf24" opacity="0.4" />

      {/* Front row - 2 cups */}
      {/* Left front cup */}
      <path d="M5 12l1 8h3l1-8z" fill="#dc2626" />
      <ellipse cx="7.5" cy="12" rx="2.5" ry="0.9" fill="#ef4444" />
      <ellipse cx="7.5" cy="12.5" rx="1.8" ry="0.5" fill="#fbbf24" opacity="0.4" />

      {/* Right front cup */}
      <path d="M10.5 12l1 8h3l1-8z" fill="#dc2626" />
      <ellipse cx="13" cy="12" rx="2.5" ry="0.9" fill="#ef4444" />
      <ellipse cx="13" cy="12.5" rx="1.8" ry="0.5" fill="#fbbf24" opacity="0.4" />

      {/* Front single cup */}
      <path d="M7.5 15.5l1 7h3l1-7z" fill="#dc2626" />
      <ellipse cx="10" cy="15.5" rx="2.5" ry="0.9" fill="#ef4444" />
      <ellipse cx="10" cy="16" rx="1.8" ry="0.5" fill="#fbbf24" opacity="0.4" />
    </svg>
  );
}
