/** Head script: show the intro once per session, never for reduced motion. A timeout makes sure it can never stick. */
export const INTRO_INIT_SCRIPT = `(function(){try{var d=document.documentElement;if(!sessionStorage.getItem('valcon-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.dataset.intro='on';setTimeout(function(){delete d.dataset.intro},9000)}}catch(e){}})();`;
