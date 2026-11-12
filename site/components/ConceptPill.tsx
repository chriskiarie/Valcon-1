"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "valcon-concept-note-dismissed";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "1";
  } catch {
    // Storage can be unavailable in private contexts; the note stays visible.
    return true;
  }
}

function getServerSnapshot() {
  return true;
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function ConceptPill({ message }: { message: string }) {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!visible || !message) {
    return null;
  }

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Nothing else to do; the note hides for this visit.
    }
    notify();
  }

  return (
    <aside className="concept-pill" aria-label="Concept preview note">
      <span>{message}</span>
      <button
        className="concept-pill__close"
        type="button"
        aria-label="Dismiss concept note"
        onClick={dismiss}
      >
        &times;
      </button>
    </aside>
  );
}
