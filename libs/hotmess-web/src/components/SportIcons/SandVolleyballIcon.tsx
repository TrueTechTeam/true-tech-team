interface Props {
  size?: number;
  className?: string;
}

export function SandVolleyballIcon({ size = 24, className }: Props) {
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
        <clipPath id="sv-clip">
          <circle cx="12" cy="10" r="8.5" />
        </clipPath>
      </defs>
      {/* Sand ground */}
      <path d="M0 20c4-1.5 8-.5 12-1s8 .5 12-.5V24H0z" fill="#fbbf24" opacity="0.3" />
      <path d="M0 21.5c4-1 8 0 12-.5s8 .5 12-.5V24H0z" fill="#f59e0b" opacity="0.2" />
      {/* Ball */}
      <circle cx="12" cy="10" r="8.5" fill="#fefce8" />
      <g clipPath="url(#sv-clip)">
        {/* Volleyball 3-seam pattern */}
        <path d="M12 10a7.5 7.5 0 0 0 7.5 3.8" stroke="#eab308" strokeWidth="0.9" fill="none" />
        <path d="M7.5 11.5a11 11 0 0 0 8 6" stroke="#eab308" strokeWidth="0.9" fill="none" />
        <path d="M12 10a7.5 7.5 0 0 0-7 4.6" stroke="#eab308" strokeWidth="0.9" fill="none" />
        <path d="M13 5.5a11 11 0 0 0-9.2 3.8" stroke="#eab308" strokeWidth="0.9" fill="none" />
        <path d="M12 10a7.5 7.5 0 0 0-.5-8.4" stroke="#eab308" strokeWidth="0.9" fill="none" />
        <path d="M15.2 13a11 11 0 0 0 1.3-10" stroke="#eab308" strokeWidth="0.9" fill="none" />
        {/* Alternating panel fills */}
        <path
          d="M12 10a7.5 7.5 0 0 0 7.5 3.8 8.5 8.5 0 0 0 1-5.3 11 11 0 0 0-4.5-6.8A7.5 7.5 0 0 0 12 10z"
          fill="#eab308"
          opacity="0.15"
        />
        <path
          d="M12 10a7.5 7.5 0 0 0-7 4.6 8.5 8.5 0 0 0 7 3.9 11 11 0 0 0 3.8-1.3A7.5 7.5 0 0 0 12 10z"
          fill="#eab308"
          opacity="0.12"
        />
        <path
          d="M12 10a7.5 7.5 0 0 0-.5-8.4A8.5 8.5 0 0 0 3.5 10c0 .5 0 1 .1 1.4A7.5 7.5 0 0 0 12 10z"
          fill="#eab308"
          opacity="0.12"
        />
      </g>
      {/* Outline */}
      <circle cx="12" cy="10" r="8.5" stroke="#ca8a04" strokeWidth="0.6" fill="none" />
      {/* Shine */}
      <ellipse
        cx="9"
        cy="6.5"
        rx="2.2"
        ry="1"
        transform="rotate(-15 9 6.5)"
        fill="white"
        opacity="0.25"
      />
    </svg>
  );
}
