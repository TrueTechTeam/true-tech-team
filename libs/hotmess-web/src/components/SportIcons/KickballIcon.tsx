interface Props {
  size?: number;
  className?: string;
}

export function KickballIcon({ size = 24, className }: Props) {
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
        <radialGradient id="kb-g" cx="0.38" cy="0.35" r="0.65">
          <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#450a0a" stopOpacity="0.25" />
        </radialGradient>
        <clipPath id="kb-c">
          <circle cx="12" cy="12" r="10" />
        </clipPath>
      </defs>
      {/* Red rubber ball */}
      <circle cx="12" cy="12" r="10" fill="#dc2626" />
      <circle cx="12" cy="12" r="10" fill="url(#kb-g)" />
      <g clipPath="url(#kb-c)">
        {/* Prominent equatorial seam band - THE defining feature of a kickball */}
        <path d="M1 10.5Q6 9 12 9t11 1.5" stroke="#7f1d1d" strokeWidth="1.5" fill="none" />
        <path d="M1 13.5Q6 15 12 15t11-1.5" stroke="#7f1d1d" strokeWidth="1.5" fill="none" />
        {/* Perpendicular seam */}
        <path d="M10.5 1Q9 6 9 12t1.5 11" stroke="#7f1d1d" strokeWidth="1.5" fill="none" />
        <path d="M13.5 1Q15 6 15 12t-1.5 11" stroke="#7f1d1d" strokeWidth="1.5" fill="none" />
        {/* Pebbled rubber texture dots */}
        <circle cx="6" cy="7" r="0.4" fill="#991b1b" opacity="0.25" />
        <circle cx="18" cy="7" r="0.4" fill="#991b1b" opacity="0.25" />
        <circle cx="6" cy="17" r="0.4" fill="#991b1b" opacity="0.25" />
        <circle cx="18" cy="17" r="0.4" fill="#991b1b" opacity="0.25" />
        <circle cx="5" cy="12" r="0.35" fill="#991b1b" opacity="0.2" />
        <circle cx="19" cy="12" r="0.35" fill="#991b1b" opacity="0.2" />
        <circle cx="12" cy="5" r="0.35" fill="#991b1b" opacity="0.2" />
        <circle cx="12" cy="19" r="0.35" fill="#991b1b" opacity="0.2" />
      </g>
      {/* Outline */}
      <circle cx="12" cy="12" r="10" stroke="#991b1b" strokeWidth="0.6" fill="none" />
      {/* Shine */}
      <ellipse
        cx="8"
        cy="7"
        rx="3"
        ry="1.5"
        transform="rotate(-30 8 7)"
        fill="white"
        opacity="0.18"
      />
    </svg>
  );
}
