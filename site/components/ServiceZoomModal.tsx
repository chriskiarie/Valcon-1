"use client";

import { useEffect, useState } from "react";

type ServiceZoomModalProps = {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  title: string;
};

export default function ServiceZoomModal({
  isOpen,
  onClose,
  src,
  alt,
  title,
}: ServiceZoomModalProps) {
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setZoom(false);
      return;
    }
    const timer = setTimeout(() => setZoom(true), 120);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="service-zoom-modal"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(6, 11, 20, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-8)",
      }}
    >
      <div
        className="service-zoom-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "min(80vw, 900px)",
          maxHeight: "min(75svh, 700px)",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          boxShadow: "0 40px 80px -20px rgba(0, 0, 0, 0.6)",
          transform: zoom ? "scale(1)" : "scale(0.92)",
          opacity: zoom ? 1 : 0,
          transition:
            "transform var(--dur-reveal) var(--ease-out), opacity var(--dur-reveal) var(--ease-out)",
        }}
      >
        <button
          className="service-zoom-close"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "var(--space-4)",
            right: "var(--space-4)",
            zIndex: 10,
            width: "var(--tap-min)",
            height: "var(--tap-min)",
            borderRadius: "var(--radius-pill)",
            border: "none",
            background: "rgba(6, 11, 20, 0.6)",
            color: "var(--color-brand-ink)",
            fontSize: "var(--text-lg)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        <div
          className="service-zoom-caption"
          style={{
            position: "absolute",
            bottom: "var(--space-6)",
            left: "var(--space-6)",
            right: "var(--space-6)",
            color: "var(--color-brand-ink)",
            fontFamily: "var(--font-display), var(--font-fallback-display)",
            fontSize: "var(--text-xl)",
            fontWeight: "var(--weight-medium)",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}
