"use client";

import { useEffect, useRef } from "react";
import { Container } from "@/components/Container";
import type { Home } from "@/lib/types";

/** A row of upright looping clips. No controls: they play quietly while on screen. */
export function VideoGallery({ copy }: { copy: Home["gallery"] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const videos = Array.from(track.querySelectorAll("video"));
    if (calm) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) void video.play().catch(() => undefined);
          else video.pause();
        }
      },
      { threshold: 0.25 },
    );
    videos.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, [copy.videos.length]);

  if (copy.videos.length === 0) return null;

  return (
    <section className="section video-gallery" aria-labelledby="gallery-title">
      <Container>
        <div className="video-gallery__head" data-reveal="left">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h2 id="gallery-title" className="video-gallery__title">
            {copy.heading}
          </h2>
        </div>
        <div ref={trackRef} className="video-gallery__track" data-reveal="below">
          {copy.videos.map((video) => (
            <figure key={video.src} className="video-gallery__item">
              <video
                src={video.src}
                muted
                loop
                playsInline
                preload="metadata"
                disablePictureInPicture
                controlsList="nodownload noremoteplayback nofullscreen"
                aria-label={video.caption || undefined}
                aria-hidden={video.caption ? undefined : true}
                tabIndex={-1}
              />
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
