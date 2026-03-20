interface Props {
  size?: number;
  className?: string;
}

export function PickleballIcon({ size = 24, className }: Props) {
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
        <linearGradient id="pk-g" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.15" />
          <stop offset="100%" stopColor="black" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {/* Paddle - wide oval face tapering to short handle */}
      {/* Handle */}
      <path
        d="M6.5 19.5l-2.5 2.5c-.4.4-.3 1 .2 1.2l.8.3c.4.1.8-.1 1-.4l2.5-3z"
        fill="#78350f"
        stroke="#451a03"
        strokeWidth="0.5"
      />
      {/* Handle grip */}
      <rect
        x="4.8"
        y="19"
        width="4"
        height="2"
        rx="0.8"
        fill="#92400e"
        stroke="#78350f"
        strokeWidth="0.4"
        transform="rotate(-42 6.8 20)"
      />
      {/* Paddle face - wide oval/egg shape */}
      <ellipse
        cx="11"
        cy="10.5"
        rx="5.5"
        ry="7"
        fill="#16a34a"
        stroke="#15803d"
        strokeWidth="0.9"
        transform="rotate(-8 11 10.5)"
      />
      <ellipse
        cx="11"
        cy="10.5"
        rx="5.5"
        ry="7"
        fill="url(#pk-g)"
        transform="rotate(-8 11 10.5)"
      />
      {/* Paddle edge band */}
      <ellipse
        cx="11"
        cy="10.5"
        rx="4.5"
        ry="6"
        fill="none"
        stroke="#166534"
        strokeWidth="0.35"
        opacity="0.4"
        transform="rotate(-8 11 10.5)"
      />

      {/* Wiffle ball */}
      <circle cx="19.5" cy="7.5" r="3" fill="#fef9c3" stroke="#a16207" strokeWidth="0.6" />
      {/* Ball holes - evenly spaced */}
      <circle cx="18.5" cy="6.5" r="0.6" fill="#a16207" opacity="0.4" />
      <circle cx="20.5" cy="6.5" r="0.6" fill="#a16207" opacity="0.4" />
      <circle cx="18.2" cy="8.3" r="0.6" fill="#a16207" opacity="0.4" />
      <circle cx="19.5" cy="8.5" r="0.6" fill="#a16207" opacity="0.4" />
      <circle cx="20.8" cy="8.3" r="0.6" fill="#a16207" opacity="0.4" />
      <circle cx="19.5" cy="5.8" r="0.5" fill="#a16207" opacity="0.3" />
      {/* Ball shine */}
      <ellipse cx="18.5" cy="6.2" rx="1" ry="0.5" fill="white" opacity="0.3" />
    </svg>
  );
}
