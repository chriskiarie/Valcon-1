/** Line illustration for the quote card: a jet climbing along a route above the clouds. */
export function ClosingArt() {
  return (
    <div className="closing__art" aria-hidden="true">
      <svg viewBox="0 0 440 330" className="closing__art-svg" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="318" cy="112" r="92" className="ca-sun" />
        <circle cx="318" cy="112" r="62" className="ca-sun ca-sun--in" />

        {/* route */}
        <path d="M34 262 C110 252 150 120 262 96 S392 72 408 40" className="ca-route" pathLength={1} />
        <circle cx="34" cy="262" r="6" className="ca-stop" />
        <circle cx="408" cy="40" r="6" className="ca-stop ca-stop--end" />

        {/* jet, flying up and right along the route */}
        <g className="ca-jet" transform="translate(228 126) rotate(-14)">
          <path d="M-62 4 C-62 -6 -40 -12 0 -12 L40 -12 C58 -12 70 -4 74 4 C70 12 58 14 40 14 L-40 14 C-56 14 -62 10 -62 4 Z" className="ca-body" />
          <path d="M-58 -2 L-74 -30 L-62 -30 L-38 -8 Z" className="ca-tail" />
          <path d="M-80 -30 L-52 -30" className="ca-line" />
          <path d="M-8 12 L-46 46 L-30 46 L22 14 Z" className="ca-wing" />
          <path d="M-52 4 L-70 6 L-70 14 L-52 14 Z" className="ca-engine" />
          <path d="M42 -8 L60 -6 L66 0 L44 0 Z" className="ca-window" />
          <path d="M-30 -4 H34" className="ca-windows" strokeDasharray="1 6" />
        </g>

        {/* clouds */}
        <g className="ca-clouds">
          <path d="M30 304 H130 M60 292 H150 M20 292 H44" />
          <path d="M270 300 H400 M300 288 H380 M410 300 H430" />
          <path d="M120 60 H190 M140 48 H200" />
        </g>
      </svg>
    </div>
  );
}
