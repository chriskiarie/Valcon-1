"use client";

import { useEffect, useRef } from "react";

type Step = { title: string; text: string };

/** A line that fills as you scroll. Each stage lights up, and draws its picture, when the line reaches it. */
export function HowTimeline({ steps, art }: { steps: Step[]; art: React.ReactNode[] }) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = Array.from(list.querySelectorAll<HTMLElement>(".how__step"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => item.classList.add("is-active"));
      list.style.setProperty("--fill", "100%");
      return;
    }

    let frame = 0;
    function update() {
      frame = 0;
      if (!list) return;
      const rect = list.getBoundingClientRect();
      const mark = window.innerHeight * 0.62;
      const px = Math.min(Math.max(mark - rect.top, 0), rect.height);
      list.style.setProperty("--fill", `${px}px`);
      for (const item of items) {
        const node = item.getBoundingClientRect().top + 28;
        item.classList.toggle("is-active", node < mark);
      }
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <ol ref={listRef} className="how__steps">
      <span className="how__line" aria-hidden="true">
        <span className="how__line-fill" />
      </span>
      {steps.map((step, index) => (
        <li key={step.title} className={`how__step${step.title === "Fly" ? " how__step--fly" : ""}`}>
          <span className="how__node" aria-hidden="true" />
          <div className="how__art">{art[index]}</div>
          <div className="how__copy">
            <span className="how__num">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="how__step-title">{step.title}</h3>
            <p className="how__step-text">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
