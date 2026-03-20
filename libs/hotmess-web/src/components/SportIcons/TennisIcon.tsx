interface Props {
  size?: number;
  className?: string;
}

export function TennisIcon({ size = 24, className }: Props) {
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
        <clipPath id="tn-clip">
          <ellipse cx="11.5" cy="10" rx="6" ry="7.5" transform="rotate(-45 11.5 10)" />
        </clipPath>
      </defs>
      {/* Racquet handle */}
      <rect
        x="0.5"
        y="18"
        width="6"
        height="2.2"
        rx="1"
        fill="#78716c"
        stroke="#57534e"
        strokeWidth="0.4"
        transform="rotate(-45 3.5 19.1)"
      />
      {/* Racquet shaft */}
      <line x1="5" y1="17" x2="7.5" y2="14.5" stroke="#a8a29e" strokeWidth="1.2" strokeLinecap="round" />
      {/* Racquet head frame */}
      <ellipse
        cx="11.5"
        cy="10"
        rx="6"
        ry="7.5"
        transform="rotate(-45 11.5 10)"
        fill="none"
        stroke="#14b8a6"
        strokeWidth="1.4"
      />
      {/* String grid - clipped to racquet head */}
      <g clipPath="url(#tn-clip)" opacity="0.4">
        {/* Diagonal strings (one direction) */}
        <line x1="6" y1="6" x2="16" y2="16" stroke="#14b8a6" strokeWidth="0.35" />
        <line x1="4.5" y1="7.5" x2="14.5" y2="17.5" stroke="#14b8a6" strokeWidth="0.35" />
        <line x1="7.5" y1="4.5" x2="17.5" y2="14.5" stroke="#14b8a6" strokeWidth="0.35" />
        <line x1="9" y1="3" x2="19" y2="13" stroke="#14b8a6" strokeWidth="0.35" />
        <line x1="3" y1="9" x2="13" y2="19" stroke="#14b8a6" strokeWidth="0.35" />
        {/* Diagonal strings (other direction) */}
        <line x1="6" y1="16" x2="16" y2="6" stroke="#14b8a6" strokeWidth="0.35" />
        <line x1="4.5" y1="14.5" x2="14.5" y2="4.5" stroke="#14b8a6" strokeWidth="0.35" />
        <line x1="7.5" y1="17.5" x2="17.5" y2="7.5" stroke="#14b8a6" strokeWidth="0.35" />
        <line x1="3" y1="13" x2="13" y2="3" stroke="#14b8a6" strokeWidth="0.35" />
        <line x1="9" y1="19" x2="19" y2="9" stroke="#14b8a6" strokeWidth="0.35" />
      </g>
      {/* Tennis ball */}
      <circle cx="19.5" cy="5" r="3.2" fill="#ccff00" stroke="#a3cc00" strokeWidth="0.6" />
      {/* Ball seam curves - characteristic S-curve */}
      <path
        d="M17.3 3.2c.6 1.5.6 2.8 0 4.2"
        stroke="white"
        strokeWidth="0.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M21.7 3.2c-.6 1.5-.6 2.8 0 4.2"
        stroke="white"
        strokeWidth="0.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
