import type { ReactNode } from "react";

/**
 * Line illustrations for the About page. Stroked shapes carry pathLength so they can draw themselves in;
 * data-tint and data-disc are soft filled shapes behind the lines. No aircraft are drawn here on purpose.
 */
const S = { fill: "none", pathLength: 1 as const };

function Svg({ viewBox, label, children }: { viewBox: string; label?: string; children: ReactNode }) {
  return (
    <svg
      className="ab-svg"
      viewBox={viewBox}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {children}
    </svg>
  );
}

/** A fixed timetable on the left, open routes from Nairobi on the right. */
export function VisionArt({ label }: { label: string }) {
  return (
    <Svg viewBox="0 0 340 230" label={label}>
      <circle data-tint cx="228" cy="116" r="92" />
      <circle cx="228" cy="116" r="60" {...S} data-draw data-faint strokeDasharray="0.03 0.05" />

      {/* The fixed timetable */}
      <rect data-disc x="12" y="34" width="116" height="160" rx="14" />
      <rect x="12" y="34" width="116" height="160" rx="14" {...S} data-draw data-faint />
      <circle cx="38" cy="62" r="11" {...S} data-draw data-faint />
      <path d="M38 55 V62 L44 66" {...S} data-draw data-faint />
      <path d="M58 62 H108" {...S} data-draw data-faint />
      {[96, 124, 152].map((y) => (
        <g key={y}>
          <rect x="28" y={y - 7} width="14" height="14" rx="4" {...S} data-draw data-faint />
          <path d={`M54 ${y} H112`} {...S} data-draw data-faint />
        </g>
      ))}
      <path d="M24 178 H116" {...S} data-draw data-faint strokeDasharray="0.03 0.05" />

      {/* Open routes from the hub */}
      <path d="M228 116 C252 76 280 56 322 46" {...S} data-draw />
      <path d="M228 116 C262 102 292 104 328 110" {...S} data-draw />
      <path d="M228 116 C258 138 288 158 322 178" {...S} data-draw data-accent-line />
      <path d="M228 116 C234 156 242 184 254 214" {...S} data-draw />
      <path d="M228 116 C216 82 214 56 220 26" {...S} data-draw />
      {[
        [322, 46],
        [328, 110],
        [322, 178],
        [254, 214],
        [220, 26],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle data-disc cx={x} cy={y} r="6.5" />
          <circle cx={x} cy={y} r="6.5" {...S} data-draw data-accent-line={x === 322 && y === 178 ? "" : undefined} />
        </g>
      ))}
      <circle data-accent cx="228" cy="116" r="9" />
      <circle className="ab-ripple" cx="228" cy="116" r="9" />
    </Svg>
  );
}

export function PillarIcon({ id }: { id: string }) {
  switch (id) {
    case "reliability":
      return (
        <Svg viewBox="0 0 64 64">
          <circle data-disc cx="32" cy="32" r="29" />
          <path d="M32 11 L50 17 V32 C50 43 42 51 32 55 C22 51 14 43 14 32 V17 Z" {...S} data-draw />
          <path d="M23 32 L30 39 L42 25" {...S} data-draw data-accent-line />
        </Svg>
      );
    case "efficiency":
      return (
        <Svg viewBox="0 0 64 64">
          <circle data-disc cx="32" cy="32" r="29" />
          <path d="M12 42 A20 20 0 0 1 52 42" {...S} data-draw />
          <path d="M32 42 L43 27" {...S} data-draw data-accent-line />
          <path d="M16 42 H21 M43 42 H48 M32 24 V29 M20 30 L23 33 M44 30 L41 33" {...S} data-draw />
          <circle data-accent cx="32" cy="42" r="3.5" />
        </Svg>
      );
    default:
      return (
        <Svg viewBox="0 0 64 64">
          <circle data-disc cx="32" cy="32" r="29" />
          <path d="M10 32 H24 C34 32 36 18 52 18" {...S} data-draw />
          <path d="M24 32 C34 32 36 46 52 46" {...S} data-draw data-accent-line />
          <path d="M47 12 L53 18 L47 24" {...S} data-draw />
          <path d="M47 40 L53 46 L47 52" {...S} data-draw data-accent-line />
        </Svg>
      );
  }
}

export function ServiceIcon({ id }: { id: string }) {
  switch (id) {
    case "acmi":
      return (
        <Svg viewBox="0 0 200 130">
          <circle data-tint cx="100" cy="64" r="56" />
          {["A", "C", "M", "I"].map((letter, i) => {
            const x = 16 + i * 46;
            return (
              <g key={letter}>
                <rect data-disc x={x} y="30" width="38" height="38" rx="10" />
                <rect x={x} y="30" width="38" height="38" rx="10" {...S} data-draw />
                <text x={x + 19} y="57" textAnchor="middle" className="ab-letter">
                  {letter}
                </text>
              </g>
            );
          })}
          <path d="M35 84 V94 H165 V84" {...S} data-draw data-accent-line />
          <path d="M100 94 V104" {...S} data-draw data-accent-line />
          <circle data-accent cx="100" cy="110" r="5" />
        </Svg>
      );
    case "charter":
      return (
        <Svg viewBox="0 0 200 130">
          <circle data-tint cx="100" cy="70" r="54" />
          <path d="M28 96 C56 14 144 14 172 96" {...S} data-draw data-accent-line strokeDasharray="0.04 0.05" />
          <circle data-disc cx="28" cy="96" r="9" />
          <circle cx="28" cy="96" r="9" {...S} data-draw />
          <circle data-accent cx="28" cy="96" r="3.5" />
          <circle data-disc cx="172" cy="96" r="9" />
          <circle cx="172" cy="96" r="9" {...S} data-draw />
          <circle data-accent cx="172" cy="96" r="3.5" />
          <rect data-disc x="66" y="66" width="68" height="36" rx="8" />
          <path d="M66 78 H134 M66 90 H134" {...S} data-draw data-faint strokeDasharray="0.03 0.05" />
          <rect x="66" y="66" width="68" height="36" rx="8" {...S} data-draw />
          <path d="M80 84 H108" {...S} data-draw />
          <path d="M116 84 H122" {...S} data-draw data-accent-line />
        </Svg>
      );
    default:
      return (
        <Svg viewBox="0 0 200 130">
          <circle data-disc cx="150" cy="42" r="24" />
          <circle cx="150" cy="42" r="24" {...S} data-draw data-accent-line />
          <path d="M150 10 V22 M150 62 V74 M118 42 H130 M170 42 H182" {...S} data-draw data-accent-line />
          <circle data-accent cx="150" cy="42" r="4.5" />
          <path data-tint d="M14 108 L70 46 L98 80 L122 56 L186 108 Z" />
          <path d="M14 108 L70 46 L98 80 L122 56 L186 108 Z" {...S} data-draw />
          <path d="M70 46 V24" {...S} data-draw />
          <path data-accent d="M70 24 L90 31 L70 38 Z" />
        </Svg>
      );
  }
}

/** A hub and its connections, drawn once the closing block is in view. */
export function NetworkArt() {
  return (
    <Svg viewBox="0 0 340 250">
      <circle data-tint cx="170" cy="124" r="100" />
      <circle cx="170" cy="124" r="64" {...S} data-draw data-faint strokeDasharray="0.03 0.05" />
      <path d="M170 124 L74 52" {...S} data-draw />
      <path d="M170 124 L266 46" {...S} data-draw />
      <path d="M170 124 L302 142" {...S} data-draw />
      <path d="M170 124 L252 214" {...S} data-draw data-accent-line />
      <path d="M170 124 L100 208" {...S} data-draw />
      <path d="M170 124 L38 130" {...S} data-draw />
      <path d="M74 52 L38 130 M266 46 L302 142 M100 208 L38 130 M252 214 L302 142" {...S} data-draw data-faint strokeDasharray="0.03 0.05" />
      {[
        [74, 52],
        [266, 46],
        [302, 142],
        [252, 214],
        [100, 208],
        [38, 130],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle data-disc cx={x} cy={y} r="7" />
          <circle cx={x} cy={y} r="7" {...S} data-draw />
        </g>
      ))}
      <circle data-accent cx="170" cy="124" r="11" />
      <circle className="ab-ripple" cx="170" cy="124" r="11" />
    </Svg>
  );
}
