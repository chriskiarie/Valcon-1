"use client";

import { useSyncExternalStore } from "react";
import { currentTheme, setTheme, subscribe, type Theme } from "@/lib/theme";

function Icon({ theme }: { theme: Theme }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  // Shows the mode a click switches to: a sun while dark, a moon while light.
  if (theme === "dark")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

/** Switches between light and dark. "icon" is the round nav button; "row" is the labelled button for the menu and footer. */
export function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "row" }) {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "light" as Theme);
  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = next === "dark" ? "Dark mode" : "Light mode";
  return (
    <button
      type="button"
      className={`theme-toggle theme-toggle--${variant}`}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTheme(next, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      aria-label={`Switch to ${label.toLowerCase()}`}
      title={label}
    >
      <Icon theme={theme} />
      {variant === "row" ? <span>{label}</span> : null}
    </button>
  );
}
