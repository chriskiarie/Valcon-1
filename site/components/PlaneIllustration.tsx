export function PlaneIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 640 200"
      role="presentation"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="plane-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#f4f7fa" />
          <stop offset="1" stopColor="#bdc9d6" />
        </linearGradient>
        <linearGradient id="plane-wing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8eef4" />
          <stop offset="1" stopColor="#8fa2b6" />
        </linearGradient>
        <linearGradient id="plane-engine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8fafc" />
          <stop offset="0.6" stopColor="#cfd9e4" />
          <stop offset="1" stopColor="#8194a9" />
        </linearGradient>
        <linearGradient id="plane-fin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8fafc" />
          <stop offset="1" stopColor="#b5c3d1" />
        </linearGradient>
      </defs>

      {/* T-tail */}
      <path d="M 52 30 L 184 27 L 178 35 L 64 38 Z" fill="url(#plane-fin)" />
      <path d="M 114 98 L 82 28 L 128 26 L 171 94 Z" fill="url(#plane-fin)" />
      <path d="M 124 28 L 128 26 L 133 30 L 129 92 L 123 92 Z" fill="#dbe4ed" opacity="0.8" />

      {/* Rear fuselage and main body */}
      <path
        d="M 632 95 C 644 98 646 107 636 113 C 625 121 601 127 568 129 L 206 133 C 162 133 127 126 107 114 L 95 106 L 112 95 L 204 85 L 534 81 C 575 81 607 87 632 95 Z"
        fill="url(#plane-body)"
      />

      {/* Belly shadow and livery line */}
      <path
        d="M 112 114 C 128 124 160 130 204 130 L 568 126 C 590 125 608 121 622 116 L 620 121 C 604 127 584 130 566 131 L 206 135 C 160 135 127 127 107 114 Z"
        fill="#7e90a4"
        opacity="0.55"
      />
      <path d="M 118 118 L 610 114" stroke="#0e2a47" strokeWidth="4" strokeLinecap="round" opacity="0.92" />
      <path d="M 122 123 L 604 119" stroke="#c9a25b" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />

      {/* Cabin windows */}
      <g fill="#26384c">
        <rect x="226" y="102" width="10" height="7" rx="3" />
        <rect x="247" y="102" width="10" height="7" rx="3" />
        <rect x="268" y="102" width="10" height="7" rx="3" />
        <rect x="289" y="102" width="10" height="7" rx="3" />
        <rect x="310" y="102" width="10" height="7" rx="3" />
        <rect x="331" y="102" width="10" height="7" rx="3" />
        <rect x="352" y="102" width="10" height="7" rx="3" />
        <rect x="373" y="102" width="10" height="7" rx="3" />
        <rect x="394" y="102" width="10" height="7" rx="3" />
        <rect x="415" y="102" width="10" height="7" rx="3" />
        <rect x="436" y="102" width="10" height="7" rx="3" />
        <rect x="457" y="102" width="10" height="7" rx="3" />
        <rect x="478" y="102" width="10" height="7" rx="3" />
      </g>

      {/* Door */}
      <path d="M 532 98 C 536 98 538 100 538 104 L 538 118 C 538 121 536 123 532 123 L 523 123 L 523 98 Z" fill="#eef3f8" stroke="#93a5b8" strokeWidth="1.2" />

      {/* Cockpit */}
      <path d="M 586 96 C 602 96 617 99 629 104 L 625 109 C 611 106 598 104 585 103 Z" fill="#172b42" />
      <path d="M 589 96 C 601 96 612 98 621 101" stroke="#aebdcc" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 624 103 C 632 104 637 108 636 111 C 634 115 626 117 617 118 L 616 113 C 624 112 629 110 630 108 C 630 106 627 105 623 105 Z" fill="#d7e1eb" />

      {/* Rear engine nacelle */}
      <path
        d="M 178 99 C 199 95 236 95 259 100 L 276 106 C 282 108 282 116 275 120 L 255 128 C 230 133 197 132 178 125 Z"
        fill="url(#plane-engine)"
        stroke="#8295a9"
        strokeWidth="1.2"
      />
      <path d="M 259 100 L 276 106 C 282 108 282 116 275 120 L 255 128 C 261 120 263 109 259 100 Z" fill="#33485f" />
      <path d="M 191 103 C 208 100 232 100 251 104" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
      <path d="M 183 119 C 202 125 231 127 253 122" stroke="#657a90" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

      {/* Swept wing */}
      <path d="M 286 126 L 400 181 L 449 181 L 389 126 Z" fill="url(#plane-wing)" />
      <path d="M 286 126 L 400 181 L 414 181 L 304 126 Z" fill="#c3d0dd" opacity="0.7" />
      <path d="M 389 126 L 449 181 L 456 181 L 402 126 Z" fill="#72869b" opacity="0.55" />

      {/* Small tail bumper and details */}
      <path d="M 106 96 L 118 91 L 119 95 L 109 100 Z" fill="#9cabb9" />
      <path d="M 171 94 L 178 95 L 176 101 L 169 100 Z" fill="#7c8fa3" />
      <circle cx="545" cy="110" r="1.2" fill="#8b9cad" />
      <circle cx="555" cy="110" r="1.2" fill="#8b9cad" />
    </svg>
  );
}
