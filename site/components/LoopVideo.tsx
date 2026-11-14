"use client";

import { useEffect, useRef } from "react";

/** A silent looping clip with no controls. Plays only while on screen; shows its first frame for reduced motion. */
export function LoopVideo({ src, caption, className }: { src: string; caption?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const poster = src.startsWith("/videos/") ? src.replace(/\.mp4$/, ".jpg") : undefined;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) void video.play().catch(() => undefined);
          else video.pause();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      controlsList="nodownload noremoteplayback nofullscreen"
      aria-label={caption || undefined}
      aria-hidden={caption ? undefined : true}
      tabIndex={-1}
    />
  );
}
