export type Theme = "light" | "dark";

export const THEME_KEY = "valcon-theme";

/** Runs in <head> before first paint: light is the default; dark only when the visitor has chosen it. */
export const THEME_INIT_SCRIPT = `(function(){try{var p=null;try{p=localStorage.getItem('${THEME_KEY}')}catch(e){}document.documentElement.dataset.theme=p==='dark'?'dark':'light';}catch(e){}})();`;

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0e0b17" : "#3F0082");
  window.dispatchEvent(new Event("valcon-theme"));
}

/** Switches theme. With an origin point the new theme sweeps out from it; resolves once any transition has finished. */
export function setTheme(theme: Theme, origin?: { x: number; y: number }): Promise<void> {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* storage blocked: the choice lasts for this visit only */
  }

  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
  };
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  root.classList.add("theme-switching");
  const release = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));

  if (!doc.startViewTransition || calm || !origin) {
    apply(theme);
    release();
    return Promise.resolve();
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
  return transition.finished.then(
    () => undefined,
    () => undefined,
  );
}

export function subscribe(cb: () => void) {
  window.addEventListener("valcon-theme", cb);
  return () => window.removeEventListener("valcon-theme", cb);
}

/** Head script: show the intro once per session, never for reduced motion. A timeout makes sure it can never stick. */
export const INTRO_INIT_SCRIPT = `(function(){try{var d=document.documentElement;if(!sessionStorage.getItem('valcon-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.dataset.intro='on';setTimeout(function(){delete d.dataset.intro},9000)}}catch(e){}})();`;
