export type ThemePref = "system" | "light" | "dark";

export const THEME_KEY = "valcon-theme";

/** Runs in <head> before first paint: sets data-theme to the saved choice, or the device setting. */
export const THEME_INIT_SCRIPT = `(function(){try{var p=null;try{p=localStorage.getItem('${THEME_KEY}')}catch(e){}var d=p==='dark'||(p!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){}})();`;

export function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "dark" || v === "light" ? v : "system";
  } catch {
    return "system";
  }
}

export function resolve(pref: ThemePref): "light" | "dark" {
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(pref: ThemePref) {
  document.documentElement.dataset.theme = resolve(pref);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", resolve(pref) === "dark" ? "#0e0b17" : "#3F0082");
}

export function setPref(pref: ThemePref) {
  try {
    if (pref === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, pref);
  } catch {
    /* storage blocked: the choice lasts for this visit only */
  }
  applyTheme(pref);
  window.dispatchEvent(new Event("valcon-theme"));
}

export function subscribe(cb: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystem = () => {
    if (readPref() === "system") applyTheme("system");
    cb();
  };
  window.addEventListener("valcon-theme", cb);
  window.addEventListener("storage", onSystem);
  mq.addEventListener("change", onSystem);
  return () => {
    window.removeEventListener("valcon-theme", cb);
    window.removeEventListener("storage", onSystem);
    mq.removeEventListener("change", onSystem);
  };
}
