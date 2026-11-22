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

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* storage blocked: the choice lasts for this visit only */
  }
  apply(theme);
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
