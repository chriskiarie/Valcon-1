"use client";

export function PlaneIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 80"
      role="presentation"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fuselageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FEFEFF" stop-opacity="1" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="1" />
        </linearGradient>
        <linearGradient id="fuselageGradDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#3F0082" stop-opacity="0.92" />
          <stop offset="100%" stop-color="#30164A" stop-opacity="0.92" />
        </linearGradient>
        <linearGradient id="windowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.1" />
        </linearGradient>
        <linearGradient id="nacelleHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
        </linearGradient>
      </defs>

      {/* Fuselage - dark mode: navy; light mode: off-white */}
      <path
        d="M20 30 Q 40 30 60 50 Q 80 70 100 70 Q 120 70 140 50 Q 160 30 180 30"
        fill="url(#fuselageGradDark)"
        stroke="#3F0082"
        stroke-width="0.5"
      />
      {/* Fuselage top highlight (light mode) */}
      <path
        d="M20 30 Q 40 28 60 45 Q 80 62 100 62 Q 120 62 140 45 Q 160 30 180 30"
        fill="url(#fuselageGrad)"
        stroke-width="0"
      />
      {/* Cockpit bubble */}
      <ellipse cx="50" cy="38" rx="14" ry="10" fill="#FFFFFF" opacity="0.3" />
      {/* Windshield tint */}
      <ellipse cx="50" cy="38" rx="12" ry="8" fill="#3F0082" opacity="0.15" />
      {/* Window line */}
      <path d="M32 30 L 68 30" stroke="url(#windowGrad)" stroke-width="0.8" fill="none" />
      {/* Window dots */}
      { [...Array(5)].map((_, i) => (
        <circle
          key={i}
          cx={32 + (36 / 4) * i}
          cy="34"
          r="0.4"
          fill="#FFFFFF"
          opacity={0.5}
        />
      )) }
      {/* Wings (swept, plan view) */}
      <path
        d="M55 45 Q 40 48 35 55 Q 30 60 32 68"
        fill="none"
        stroke="#3F0082"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <path
        d="M145 45 Q 160 48 165 55 Q 170 60 172 68"
        fill="none"
        stroke="#3F0082"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      {/* Wing leading-edge highlights */}
      <path d="M55 45 Q 42 46 38 53" fill="#FFFFFF" opacity="0.08" />
      <path d="M145 45 Q 158 46 152 53" fill="#FFFFFF" opacity="0.08" />
      {/* Wing trailing-edge */}
      <path d="M35 55 Q 28 62 22 70 Q 16 75 18 78" fill="none" stroke="#3F0082" stroke-width="0.8" stroke-linejoin="round" />
      <path d="M165 55 Q 172 62 178 70 Q 184 75 182 78" fill="none" stroke="#3F0082" stroke-width="0.8" stroke-linejoin="round" />
      {/* Wing root panel lines */}
      <path d="M55 58 Q 45 62 40 70" fill="none" stroke="#3F0082" stroke-width="0.5" stroke-dasharray="3 3" opacity="0.18" />
      <path d="M145 58 Q 155 62 160 70" fill="none" stroke="#3F0082" stroke-width="0.5" stroke-dasharray="3 3" opacity="0.18" />
      {/* Engines (rear fuselage-mounted) */}
      <path d="M78 52 Q 88 55 95 58 Q 102 62 108 62" fill="url(#fuselageGradDark)" stroke="#3F0082" stroke-width="0.5" />
      <path d="M112 52 Q 122 55 129 58 Q 136 62 142 62" fill="url(#fuselageGradDark)" stroke="#3F0082" stroke-width="0.5" />
      {/* Engine exhaust openings */}
      <rect x="93" y="58" width="8" height="5" fill="#30164A" opacity="0.7" />
      <rect x="138" y="58" width="8" height="5" fill="#30164A" opacity="0.7" />
      {/* Wingtip lights (brand-orange left, green right) */}
      <circle cx="30" cy="50" r="1.5" fill="#EC3A00" opacity="0.9" />
      <circle cx="170" cy="50" r="1.5" fill="#00FF00" opacity="0.9" />
      {/* Tail horizontal stabiliser */}
      <path d="M130 55 Q 145 52 155 58 Q 170 65 175 70" fill="none" stroke="#3F0082" stroke-width="1" stroke-linejoin="round" />
      {/* Tail vertical stabiliser */}
      <path d="M170 55 Q 185 45 195 55 Q 205 65 200 75" fill="none" stroke="#3F0082" stroke-width="1" stroke-linejoin="round" />
      {/* Tail tip light */}
      <circle cx="200" cy="70" r="1" fill="#FFFFFF" opacity="0.8" />
      {/* Wing tip splitter lines */}
      <line x1="32" y1="68" x2="28" y2="78" stroke="#3F0082" stroke-width="0.3" opacity="0.12" />
      <line x1="172" y1="68" x2="178" y2="78" stroke="#3F0082" stroke-width="0.3" opacity="0.12" />
    </svg>
  );
}