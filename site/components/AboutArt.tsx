import type { ReactNode } from "react";

/** Line illustrations for the About page. Every stroked shape carries pathLength so it can draw itself in. */
const S = { fill: "none", pathLength: 1 as const };

const JET =
  "M100 14 L107 46 L152 70 L152 78 L108 66 L104 96 L116 106 L116 112 L100 107 L84 112 L84 106 L96 96 L92 66 L48 78 L48 70 L93 46 Z";

function Svg({ viewBox, label, children }: { viewBox: string; label?: string; children: ReactNode }) {
  return (
    <svg className="ab-svg" viewBox={viewBox} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {children}
    </svg>
  );
}

/** A fixed timetable on the left, open routes from Nairobi on the right. */
export function VisionArt({ label }: { label: string }) {
  return (
    <Svg viewBox="0 0 320 220" label={label}>
      <path d="M24 70 H132" {...S} data-draw data-faint strokeDasharray="0.03 0.05" />
      <circle cx="24" cy="70" r="5" {...S} data-draw data-faint />
      <circle cx="132" cy="70" r="5" {...S} data-draw data-faint />
      <path d="M24 150 H132" {...S} data-draw data-faint strokeDasharray="0.03 0.05" />
      <circle cx="24" cy="150" r="5" {...S} data-draw data-faint />
      <circle cx="132" cy="150" r="5" {...S} data-draw data-faint />
      <path d="M200 110 C224 70 250 52 290 44" {...S} data-draw />
      <path d="M200 110 C232 96 262 98 298 104" {...S} data-draw />
      <path d="M200 110 C228 130 256 150 292 170" {...S} data-draw data-accent-line />
      <path d="M200 110 C206 150 214 176 226 200" {...S} data-draw />
      <path d="M200 110 C190 76 190 52 196 24" {...S} data-draw />
      <circle cx="290" cy="44" r="5" {...S} data-draw />
      <circle cx="298" cy="104" r="5" {...S} data-draw />
      <circle cx="292" cy="170" r="5" {...S} data-draw data-accent-line />
      <circle cx="226" cy="200" r="5" {...S} data-draw />
      <circle cx="196" cy="24" r="5" {...S} data-draw />
      <circle data-accent cx="200" cy="110" r="8" />
      <circle className="ab-ripple" cx="200" cy="110" r="8" />
    </Svg>
  );
}

export function PillarIcon({ id }: { id: string }) {
  switch (id) {
    case "reliability":
      return (
        <Svg viewBox="0 0 64 64">
          <path d="M32 8 L52 15 V32 C52 44 43 53 32 57 C21 53 12 44 12 32 V15 Z" {...S} data-draw />
          <path d="M22 32 L29 39 L43 24" {...S} data-draw data-accent-line />
        </Svg>
      );
    case "efficiency":
      return (
        <Svg viewBox="0 0 64 64">
          <path d="M10 44 A22 22 0 0 1 54 44" {...S} data-draw />
          <path d="M32 44 L44 26" {...S} data-draw data-accent-line />
          <path d="M14 44 H20 M44 44 H50 M32 22 V28" {...S} data-draw />
          <circle data-accent cx="32" cy="44" r="3.5" />
        </Svg>
      );
    default:
      return (
        <Svg viewBox="0 0 64 64">
          <path d="M8 32 H24 C34 32 36 14 56 14" {...S} data-draw />
          <path d="M24 32 C34 32 36 50 56 50" {...S} data-draw data-accent-line />
          <path d="M50 8 L57 14 L50 20" {...S} data-draw />
          <path d="M50 44 L57 50 L50 56" {...S} data-draw data-accent-line />
        </Svg>
      );
  }
}

export function ServiceIcon({ id }: { id: string }) {
  switch (id) {
    case "acmi":
      return (
        <Svg viewBox="0 0 200 130">
          <path d={JET} transform="translate(0 0) scale(1)" {...S} data-draw />
          <circle data-accent cx="36" cy="30" r="5" />
          <circle data-accent cx="164" cy="30" r="5" />
          <circle data-accent cx="36" cy="100" r="5" />
          <circle data-accent cx="164" cy="100" r="5" />
          <path d="M42 33 L70 52 M158 33 L130 52 M42 97 L72 82 M158 97 L128 82" {...S} data-draw data-faint />
        </Svg>
      );
    case "charter":
      return (
        <Svg viewBox="0 0 200 130">
          <path d="M28 98 C60 20 140 20 172 98" {...S} data-draw data-accent-line strokeDasharray="0.04 0.05" />
          <circle cx="28" cy="98" r="7" {...S} data-draw />
          <path d="M172 98 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0" {...S} data-draw />
          <path d="M92 52 L108 36 L124 52 L108 48 Z" {...S} data-draw />
          <path d="M20 112 H180" {...S} data-draw data-faint />
        </Svg>
      );
    default:
      return (
        <Svg viewBox="0 0 200 130">
          <path d="M20 104 L72 40 L100 74 L122 50 L180 104 Z" {...S} data-draw />
          <circle cx="146" cy="40" r="22" {...S} data-draw data-accent-line />
          <path d="M146 10 V22 M146 58 V70 M116 40 H128 M164 40 H176" {...S} data-draw data-accent-line />
          <circle data-accent cx="146" cy="40" r="4" />
        </Svg>
      );
  }
}

/** A hub and its connections, drawn once the closing block is in view. */
export function NetworkArt() {
  return (
    <Svg viewBox="0 0 320 240">
      <path d="M160 120 L70 50" {...S} data-draw />
      <path d="M160 120 L250 44" {...S} data-draw />
      <path d="M160 120 L282 138" {...S} data-draw />
      <path d="M160 120 L240 206" {...S} data-draw data-accent-line />
      <path d="M160 120 L96 200" {...S} data-draw />
      <path d="M160 120 L36 126" {...S} data-draw />
      <path d="M70 50 L36 126 M250 44 L282 138 M96 200 L36 126" {...S} data-draw data-faint strokeDasharray="0.03 0.05" />
      {[
        [70, 50],
        [250, 44],
        [282, 138],
        [240, 206],
        [96, 200],
        [36, 126],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="6" {...S} data-draw />
      ))}
      <circle data-accent cx="160" cy="120" r="10" />
      <circle className="ab-ripple" cx="160" cy="120" r="10" />
    </Svg>
  );
}
