"use client";

import { useSyncExternalStore } from "react";
import { readPref, setPref, subscribe, type ThemePref } from "@/lib/theme";

const ORDER: ThemePref[] = ["system", "light", "dark"];
const LABEL: Record<ThemePref, string> = { system: "Match device", light: "Light", dark: "Dark" };

function Icon({ pref }: { pref: ThemePref }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (pref === "light")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
      </svg>
    );
  if (pref === "dark")
    return (
      <svg {...common}>
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
    );
  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

/** Cycles Match device → Light → Dark. "icon" is the round nav button; "row" is the labelled button for the menu and footer. */
export function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "row" }) {
  const pref = useSyncExternalStore(subscribe, readPref, () => "system" as ThemePref);
  const next = ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length];
  return (
    <button
      type="button"
      className={`theme-toggle theme-toggle--${variant}`}
      onClick={() => setPref(next)}
      aria-label={`Theme: ${LABEL[pref]}. Switch to ${LABEL[next]}`}
      title={`Theme: ${LABEL[pref]}`}
    >
      <Icon pref={pref} />
      {variant === "row" ? <span>Theme: {LABEL[pref]}</span> : null}
    </button>
  );
}
