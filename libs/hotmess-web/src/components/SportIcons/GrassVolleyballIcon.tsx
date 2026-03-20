interface Props {
  size?: number;
  className?: string;
}

export function GrassVolleyballIcon({ size = 24, className }: Props) {
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
        <clipPath id="gv-clip">
          <circle cx="12" cy="10" r="8.5" />
        </clipPath>
      </defs>
      {/* Grass ground */}
      <rect x="0" y="20" width="24" height="4" fill="#4ade80" opacity="0.2" />
      {/* Grass blades - simplified */}
      <path d="M2 20l1-2.5 1 2.5" stroke="#22c55e" strokeWidth="0.6" fill="none" />
      <path d="M6 20l1-3 1 3" stroke="#22c55e" strokeWidth="0.6" fill="none" />
      <path d="M10 20l1-2.5 1 2.5" stroke="#22c55e" strokeWidth="0.6" fill="none" />
      <path d="M14 20l1-3 1 3" stroke="#22c55e" strokeWidth="0.6" fill="none" />
      <path d="M18 20l1-2.5 1 2.5" stroke="#22c55e" strokeWidth="0.6" fill="none" />
      <path d="M22 20l1-2 1 2" stroke="#22c55e" strokeWidth="0.6" fill="none" />
      {/* Ball */}
      <circle cx="12" cy="10" r="8.5" fill="#fefce8" />
      <g clipPath="url(#gv-clip)">
        {/* Volleyball 3-seam pattern */}
        <path d="M12 10a7.5 7.5 0 0 0 7.5 3.8" stroke="#65a30d" strokeWidth="0.9" fill="none" />
        <path d="M7.5 11.5a11 11 0 0 0 8 6" stroke="#65a30d" strokeWidth="0.9" fill="none" />
        <path d="M12 10a7.5 7.5 0 0 0-7 4.6" stroke="#65a30d" strokeWidth="0.9" fill="none" />
        <path d="M13 5.5a11 11 0 0 0-9.2 3.8" stroke="#65a30d" strokeWidth="0.9" fill="none" />
        <path d="M12 10a7.5 7.5 0 0 0-.5-8.4" stroke="#65a30d" strokeWidth="0.9" fill="none" />
        <path d="M15.2 13a11 11 0 0 0 1.3-10" stroke="#65a30d" strokeWidth="0.9" fill="none" />
        {/* Alternating panel fills */}
        <path
          d="M12 10a7.5 7.5 0 0 0 7.5 3.8 8.5 8.5 0 0 0 1-5.3 11 11 0 0 0-4.5-6.8A7.5 7.5 0 0 0 12 10z"
          fill="#84cc16"
          opacity="0.2"
        />
        <path
          d="M12 10a7.5 7.5 0 0 0-7 4.6 8.5 8.5 0 0 0 7 3.9 11 11 0 0 0 3.8-1.3A7.5 7.5 0 0 0 12 10z"
          fill="#84cc16"
          opacity="0.15"
        />
        <path
          d="M12 10a7.5 7.5 0 0 0-.5-8.4A8.5 8.5 0 0 0 3.5 10c0 .5 0 1 .1 1.4A7.5 7.5 0 0 0 12 10z"
          fill="#84cc16"
          opacity="0.15"
        />
      </g>
      {/* Outline */}
      <circle cx="12" cy="10" r="8.5" stroke="#65a30d" strokeWidth="0.6" fill="none" />
      {/* Shine */}
      <ellipse cx="9" cy="6.5" rx="2.2" ry="1" transform="rotate(-15 9 6.5)" fill="white" opacity="0.25" />
    </svg>
  );
}
