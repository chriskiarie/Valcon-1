"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

type Variant = "left" | "right" | "below" | "pop";

function initialFor(variant: Variant) {
  switch (variant) {
    case "left":
      return { x: -60, y: 0, scale: 1 };
    case "right":
      return { x: 60, y: 0, scale: 1 };
    case "pop":
      return { x: 0, y: 24, scale: 0.9 };
    default:
      return { x: 0, y: 48, scale: 1 };
  }
}

export function ScrollChoreography() {
  const pathname = usePathname();

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (elements.length === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      elements.forEach((element) => {
        element.style.opacity = "1";
        element.style.transform = "none";
      });
      return;
    }

    elements.forEach((element) => {
      const variant = (element.dataset.reveal || "below") as Variant;
      gsap.set(element, { opacity: 0, ...initialFor(variant) });
    });

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const duration = isMobile ? 0.5 : 0.85;

    const observer = new IntersectionObserver(
      (entries) => {
        const entering = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort((a, b) => elements.indexOf(a) - elements.indexOf(b));

        entering.forEach((element) => {
          observer.unobserve(element);
          const variant = (element.dataset.reveal || "below") as Variant;
          const delay = Math.min(elements.indexOf(element) * 0.06, 0.24);

          gsap.to(element, {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration,
            delay,
            ease: variant === "pop" ? "back.out(1.4)" : "power2.out",
            overwrite: "auto",
          });
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -10% 0px" },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
