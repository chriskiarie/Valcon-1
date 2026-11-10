"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealVariant = "left" | "right" | "below" | "pop" | "clip-line";

type RevealProps = {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
};

export default function Reveal({
  children,
  className = "",
  variant = "below",
}: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      element.classList.add("is-revealed");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("is-revealed");
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const variantClass = `reveal--${variant}`;

  return (
    <div className={`reveal ${className} ${variantClass}`.trim()} ref={elementRef}>
      {children}
    </div>
  );
}