import type { ReactNode } from "react";

/** One small line drawing per stage. Every shape carries pathLength so it can draw itself in. */
const S = { fill: "none", pathLength: 1 as const };

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg className="how__svg" viewBox="0 0 200 130" role="img" aria-hidden="true">
      {children}
    </svg>
  );
}

function Enquire() {
  return (
    <Frame>
      <rect data-draw x="22" y="22" width="112" height="66" rx="14" {...S} />
      <path data-draw d="M52 88 L44 108 L72 88" {...S} />
      <path data-draw d="M40 44 H110" {...S} />
      <path data-draw d="M40 58 H94" {...S} />
      <path data-draw d="M40 72 H78" {...S} />
      <circle data-accent cx="158" cy="40" r="7" />
      <path data-draw data-accent-line d="M158 54 V96" {...S} strokeDasharray="0.04 0.06" />
    </Frame>
  );
}

function Plan() {
  return (
    <Frame>
      <rect data-draw x="20" y="18" width="98" height="94" rx="12" {...S} />
      <path data-draw d="M36 44 H84" {...S} />
      <path data-draw d="M36 60 H100" {...S} />
      <path data-draw d="M36 76 H70" {...S} />
      <path data-draw data-accent-line d="M104 100 C136 100 128 52 160 52 C176 52 178 74 188 86" {...S} />
      <circle data-accent cx="104" cy="100" r="6" />
      <circle data-draw cx="188" cy="86" r="6" {...S} />
    </Frame>
  );
}

function Confirm() {
  return (
    <Frame>
      <path data-draw d="M44 16 H116 L146 46 V114 H44 Z" {...S} />
      <path data-draw d="M116 16 V46 H146" {...S} />
      <path data-draw d="M62 66 H128" {...S} />
      <path data-draw d="M62 82 H110" {...S} />
      <circle data-draw data-accent-line cx="150" cy="96" r="22" {...S} />
      <path data-draw data-accent-line d="M139 96 L148 105 L163 88" {...S} />
    </Frame>
  );
}

function Prepare() {
  return (
    <Frame>
      <rect data-draw x="30" y="42" width="92" height="66" rx="12" {...S} />
      <path data-draw d="M62 42 V30 a6 6 0 0 1 6 -6 H84 a6 6 0 0 1 6 6 V42" {...S} />
      <path data-draw d="M30 70 H122" {...S} />
      <path data-draw d="M52 108 V114 M100 108 V114" {...S} />
      <rect data-draw x="140" y="28" width="38" height="80" rx="8" {...S} />
      <path data-draw data-accent-line d="M149 48 L154 53 L164 42" {...S} />
      <path data-draw data-accent-line d="M149 68 L154 73 L164 62" {...S} />
      <path data-draw d="M149 90 H168" {...S} />
    </Frame>
  );
}

/** The flight plan: a simple arc from departure to arrival, with the aircraft travelling along it. */
function Fly() {
  return (
    <Frame>
      <path data-draw d="M14 104 H186" {...S} />
      <path data-draw data-accent-line d="M34 104 C58 14 142 14 166 104" {...S} strokeDasharray="0.025 0.03" />
      <circle data-accent cx="34" cy="104" r="6" />
      <circle data-draw cx="166" cy="104" r="6" {...S} />
      <path data-draw d="M100 104 V112" {...S} />
      <text x="34" y="124" textAnchor="middle" className="how__svg-label">
        DEPART
      </text>
      <text x="166" y="124" textAnchor="middle" className="how__svg-label">
        ARRIVE
      </text>
      <g className="how__flyer">
        <path d="M13 0 c1.4.3 1.4 1.9 0 2.1 l-9.4 1.5 -7.3 5.2 -2.1 -.3 3.7 -4.7 -8.7 .7 -3 2 -1.7 -.3 1.5 -2.8 -1.5 -2.8 1.7 -.3 3 2 8.7 .7 -3.7 -4.7 2.1 -.3 7.3 5.2z" transform="translate(-2 -3)" />
      </g>
    </Frame>
  );
}

function FollowUp() {
  return (
    <Frame>
      <path data-draw d="M40 16 H132 V108 L118 100 L104 108 L90 100 L76 108 L62 100 L48 108 L40 100 Z" {...S} />
      <path data-draw d="M58 44 H112" {...S} />
      <path data-draw d="M58 60 H100" {...S} />
      <path data-draw d="M58 76 H84" {...S} />
      <path
        data-draw
        data-accent-line
        d="M158 40 l7 14 15 2 -11 10 3 15 -14 -8 -14 8 3 -15 -11 -10 15 -2z"
        {...S}
      />
    </Frame>
  );
}

export const HOW_ART = [Enquire, Plan, Confirm, Prepare, Fly, FollowUp];
