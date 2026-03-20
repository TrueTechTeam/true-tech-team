interface Props {
  size?: number;
  className?: string;
}

export function DodgeballIcon({ size = 24, className }: Props) {
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
        <radialGradient id="db-g" cx="0.38" cy="0.35" r="0.65">
          <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#450a0a" stopOpacity="0.2" />
        </radialGradient>
        <clipPath id="db-c">
          <circle cx="12" cy="12" r="10" />
        </clipPath>
      </defs>
      {/* Ball base */}
      <circle cx="12" cy="12" r="10" fill="#ef4444" />
      <circle cx="12" cy="12" r="10" fill="url(#db-g)" />
      <g clipPath="url(#db-c)">
        {/* Wide center stripe band - the classic dodgeball look */}
        <rect x="0" y="8.5" width="24" height="7" fill="#2563eb" opacity="0.55" />
        {/* Stripe border lines */}
        <path d="M1 8.5Q6 7.5 12 7.5T23 8.5" stroke="#1e3a8a" strokeWidth="1" fill="none" />
        <path d="M1 15.5Q6 16.5 12 16.5T23 15.5" stroke="#1e3a8a" strokeWidth="1" fill="none" />
        {/* Inner accent stripes within the band */}
        <path d="M1 10Q6 9.2 12 9.2T23 10" stroke="white" strokeWidth="0.35" fill="none" opacity="0.3" />
        <path d="M1 14Q6 14.8 12 14.8T23 14" stroke="white" strokeWidth="0.35" fill="none" opacity="0.3" />
        {/* Pebbled rubber texture */}
        <circle cx="7" cy="6" r="0.35" fill="#991b1b" opacity="0.2" />
        <circle cx="17" cy="6" r="0.35" fill="#991b1b" opacity="0.2" />
        <circle cx="7" cy="18" r="0.35" fill="#991b1b" opacity="0.2" />
        <circle cx="17" cy="18" r="0.35" fill="#991b1b" opacity="0.2" />
      </g>
      {/* Outline */}
      <circle cx="12" cy="12" r="10" stroke="#991b1b" strokeWidth="0.6" fill="none" />
      {/* Shine */}
      <ellipse cx="8" cy="6.5" rx="2.8" ry="1.3" transform="rotate(-25 8 6.5)" fill="white" opacity="0.2" />
    </svg>
  );
}
