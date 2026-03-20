interface Props {
  size?: number;
  className?: string;
}

export function BowlingIcon({ size = 24, className }: Props) {
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
        <radialGradient id="bwl-grad" cx="0.35" cy="0.35" r="0.65">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0e7490" stopOpacity="0.3" />
        </radialGradient>
      </defs>
      {/* Bowling pin - clean silhouette */}
      <path
        d="M17 3c-.8 0-1.5.7-1.5 1.6 0 .6.3 1.1.7 1.4-.3.3-.5.7-.7 1.2-.3.8-.5 1.8-.5 3 0 1.8.4 3.2.7 4.2.2.6.3 1.2.3 1.6 0 .6.5 1 1 1s1-.4 1-1c0-.4.1-1 .3-1.6.3-1 .7-2.4.7-4.2 0-1.2-.2-2.2-.5-3-.2-.5-.4-.9-.7-1.2.4-.3.7-.8.7-1.4C18.5 3.7 17.8 3 17 3z"
        fill="#f5f5f4"
        stroke="#a8a29e"
        strokeWidth="0.5"
      />
      {/* Pin red stripes */}
      <path
        d="M15.5 7.2c.4-.2.9-.3 1.5-.3s1.1.1 1.5.3"
        stroke="#ef4444"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M15.4 8.2c.4-.2 1-.3 1.6-.3s1.2.1 1.6.3"
        stroke="#ef4444"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bowling ball */}
      <circle cx="8" cy="15" r="6.5" fill="#06b6d4" />
      <circle cx="8" cy="15" r="6.5" fill="url(#bwl-grad)" />
      {/* Finger holes - triangle arrangement */}
      <circle cx="6.2" cy="13" r="1" fill="#0e7490" />
      <circle cx="8.8" cy="12.5" r="1" fill="#0e7490" />
      <circle cx="7" cy="15.2" r="0.9" fill="#0e7490" />
      {/* Ball outline */}
      <circle cx="8" cy="15" r="6.5" stroke="#0891b2" strokeWidth="0.5" fill="none" />
      {/* Ball shine */}
      <ellipse cx="5.5" cy="12" rx="2" ry="1" transform="rotate(-30 5.5 12)" fill="white" opacity="0.2" />
    </svg>
  );
}
