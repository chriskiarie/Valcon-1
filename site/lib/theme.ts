export type Theme = "light" | "dark";

export const THEME_KEY = "valcon-theme";

/** Runs in <head> before first paint: sets data-theme to the saved choice, or to the device setting on a first visit. */
export const THEME_INIT_SCRIPT = `(function(){try{var p=null;try{p=localStorage.getItem('${THEME_KEY}')}catch(e){}var d=p==='dark'||(p!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){}})();`;

function saved(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
}

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0e0b17" : "#3F0082");
  window.dispatchEvent(new Event("valcon-theme"));
}

export function setTheme(theme: Theme, origin?: { x: number; y: number }) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* storage blocked: the choice lasts for this visit only */
  }

  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } };
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  root.classList.add("theme-switching");
  const release = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
  if (!doc.startViewTransition || calm || !origin) {
    apply(theme);
    release();
    return;
  }

  // The new theme grows out of the button as a soft-edged wave that sweeps across the page.
  const reach = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y)) * 1.5;
  root.style.setProperty("--theme-x", `${origin.x}px`);
  root.style.setProperty("--theme-y", `${origin.y}px`);
  const transition = doc.startViewTransition(() => apply(theme));
  transition.ready
    .then(() => {
      root.animate(
        { "--theme-r": ["0px", `${reach}px`] },
        { duration: 1100, easing: "cubic-bezier(0.5, 0, 0.2, 1)", fill: "forwards", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {});
  transition.finished.then(release, release);
}

export function subscribe(cb: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  // Until the visitor picks a theme, follow the device.
  const onDevice = () => {
    if (!saved()) apply(mq.matches ? "dark" : "light");
  };
  window.addEventListener("valcon-theme", cb);
  mq.addEventListener("change", onDevice);
  return () => {
    window.removeEventListener("valcon-theme", cb);
    mq.removeEventListener("change", onDevice);
  };
}
