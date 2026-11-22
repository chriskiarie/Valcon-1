"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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

type Phase = "idle" | "drop" | "hold" | "rise";

/**
 * Switches between light and dark. "icon" is the round button in the header; "row" is the labelled one in the footer.
 * On click the button sinks into the page, the new theme sweeps out from that point, then the button springs back
 * up showing the opposite theme's icon.
 */
export function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "row" }) {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "light" as Theme);
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<number[]>([]);
  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = next === "dark" ? "Dark mode" : "Light mode";

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (phase !== "idle") return;
    const btn = e.currentTarget;
    const r = btn.getBoundingClientRect();
    const origin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm) {
      void setTheme(next);
      return;
    }
    const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
    setPhase("drop");
    later(() => {
      setPhase("hold");
      // Own layer in the transition, so the button stays above the sweeping wave and keeps animating.
      btn.style.setProperty("view-transition-name", "theme-btn");
      void setTheme(next, origin).then(() => btn.style.removeProperty("view-transition-name"));
      later(() => setPhase("rise"), 520);
      later(() => setPhase("idle"), 520 + 700);
    }, 240);
  };

  return (
    <button
      type="button"
      className={`theme-toggle theme-toggle--${variant}`}
      data-phase={phase}
      onClick={toggle}
      aria-label={`Switch to ${label.toLowerCase()}`}
      title={label}
    >
      <span className="theme-toggle__icon">
        <Icon theme={theme} />
      </span>
      {variant === "row" ? <span>{label}</span> : null}
    </button>
  );
}
