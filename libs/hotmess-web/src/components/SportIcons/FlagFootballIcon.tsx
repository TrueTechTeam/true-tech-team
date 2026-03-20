interface Props {
  size?: number;
  className?: string;
}

export function FlagFootballIcon({ size = 24, className }: Props) {
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
        <radialGradient id="ff-g" cx="0.4" cy="0.35" r="0.65">
          <stop offset="0%" stopColor="#b45309" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#451a03" stopOpacity="0.25" />
        </radialGradient>
        <clipPath id="ff-c">
          <ellipse cx="12" cy="12" rx="9.5" ry="5" transform="rotate(-35 12 12)" />
        </clipPath>
      </defs>
      {/* Flag ribbon - bottom-left (red) - behind football */}
      <path
        d="M7 16.5L3.5 20c-.3.3-.2.6.1.7l1.5.3c.3 0 .5-.1.6-.4L7.5 17z"
        fill="#ef4444"
        stroke="#dc2626"
        strokeWidth="0.4"
      />
      <path
        d="M6.8 16.8L4 21.5c-.2.3 0 .6.3.6l1.5-.1c.3 0 .5-.2.5-.5l1-4z"
        fill="#ef4444"
        stroke="#dc2626"
        strokeWidth="0.4"
      />
      {/* Flag ribbon - top-right (blue) - behind football */}
      <path
        d="M17 7.5l3.5-4c.3-.3.2-.6-.1-.7l-1.5-.3c-.3 0-.5.1-.6.4L16.5 7z"
        fill="#3b82f6"
        stroke="#2563eb"
        strokeWidth="0.4"
      />
      <path
        d="M17.2 7.2L20 2.5c.2-.3 0-.6-.3-.6l-1.5.1c-.3 0-.5.2-.5.5l-1 4z"
        fill="#3b82f6"
        stroke="#2563eb"
        strokeWidth="0.4"
      />
      {/* Football body - classic pointed oval */}
      <ellipse
        cx="12"
        cy="12"
        rx="9.5"
        ry="5"
        transform="rotate(-35 12 12)"
        fill="#92400e"
        stroke="#78350f"
        strokeWidth="0.7"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="9.5"
        ry="5"
        transform="rotate(-35 12 12)"
        fill="url(#ff-g)"
      />
      {/* Laces - center seam line */}
      <g clipPath="url(#ff-c)">
        <line x1="9" y1="14.5" x2="15" y2="9.5" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
        {/* Cross laces - perpendicular to seam */}
        <line x1="9.8" y1="13.2" x2="10.8" y2="12.5" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
        <line x1="10.8" y1="12.8" x2="11.8" y2="12" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
        <line x1="11.8" y1="12.2" x2="12.8" y2="11.4" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
        <line x1="12.8" y1="11.5" x2="13.8" y2="10.7" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
      </g>
      {/* Shine */}
      <ellipse cx="9" cy="9.5" rx="2.5" ry="1" transform="rotate(-35 9 9.5)" fill="white" opacity="0.12" />
    </svg>
  );
}
