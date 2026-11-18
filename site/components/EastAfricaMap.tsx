import { Container } from "@/components/Container";
import { MapShowcase, type City } from "@/components/MapShowcase";
import cities from "@/content/cities.json";
import map from "@/content/eastafrica-map.json";

type Pt = [number, number];

/** Placeholder destinations, scattered across Kenya, Somalia and Uganda until the real network is set. */
const ROUTES: { id: keyof typeof map.points; label: string; side: 1 | -1; left?: boolean }[] = [
  { id: "mombasa", label: "Mombasa", side: -1 },
  { id: "kisumu", label: "Kisumu", side: 1 },
  { id: "nanyuki", label: "Nanyuki", side: -1 },
  { id: "lodwar", label: "Lodwar", side: 1 },
  { id: "malindi", label: "Malindi", side: 1 },
  { id: "entebbe", label: "Entebbe", side: -1, left: true },
  { id: "gulu", label: "Gulu", side: 1 },
  { id: "kismayo", label: "Kismayo", side: -1 },
  { id: "mogadishu", label: "Mogadishu", side: 1 },
  { id: "baidoa", label: "Baidoa", side: -1 },
  { id: "hargeisa", label: "Hargeisa", side: 1 },
];

function arc(from: Pt, to: Pt, side: 1 | -1): string {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const bend = Math.min(len * 0.28, 90) * side;
  const cx = mx + (-dy / len) * bend;
  const cy = my + (dx / len) * bend;
  return `M${x1} ${y1} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2} ${y2}`;
}

/** East Africa at a glance, with routes fanning out from Nairobi, where flights can depart from Wilson or JKIA. */
export function EastAfricaMap() {
  const wilson = map.points.wilson as Pt;
  const jkia = map.points.jkia as Pt;
  // The two airports are about 11 km apart, so at this scale routes leave from the point between them.
  const hub: Pt = [(wilson[0] + jkia[0]) / 2, (wilson[1] + jkia[1]) / 2];

  return (
    <section className="section eamap" aria-labelledby="eamap-title">
      <Container>
        <span className="eyebrow" data-reveal="below">
          Where we fly
        </span>
        <h2 id="eamap-title" className="section-title" data-reveal="left">
          From Wilson and JKIA, across East Africa.
        </h2>

        <MapShowcase cities={cities as City[]}>
          <svg
            className="eamap__svg"
            viewBox={`0 0 ${map.width} ${map.height}`}
            role="img"
            aria-label="Map of East Africa with flight routes from Wilson Airport and Jomo Kenyatta International Airport, Nairobi, to Kenya, Uganda and Somalia"
          >
            <g className="eamap__land">
              {map.countries.map((country) => (
                <path
                  key={country.name}
                  d={country.d}
                  className={country.hi ? "is-hi" : undefined}
                  {...("cc" in country
                    ? { "data-cc": country.cc, "data-fx": country.fx, "data-fy": country.fy }
                    : {})}
                />
              ))}
            </g>

            <g className="eamap__routes">
              {ROUTES.map((route, index) => {
                const to = map.points[route.id] as Pt;
                const d = arc(hub, to, route.side);
                const delay = `${(index * 0.28).toFixed(2)}s`;
                return (
                  <g key={route.id} className={`eamap__stop eamap__stop--${route.id}`} style={{ ["--d" as string]: delay }}>
                    <path d={d} className="eamap__route" pathLength={1} />
                    <path
                      d="M-7 -4.5 L8 0 L-7 4.5 L-4 0 Z"
                      className="eamap__plane"
                      style={{ offsetPath: `path("${d}")` }}
                    />
                    <circle cx={to[0]} cy={to[1]} r={5} className="eamap__ripple eamap__ripple--a" />
                    <circle cx={to[0]} cy={to[1]} r={5} className="eamap__ripple eamap__ripple--b" />
                    <circle cx={to[0]} cy={to[1]} r={5} className="eamap__dot" />
                    <text
                      x={route.left ? to[0] - 10 : to[0] + 10}
                      y={to[1] + 4}
                      textAnchor={route.left ? "end" : "start"}
                      className="eamap__label"
                    >
                      {route.label}
                    </text>
                  </g>
                );
              })}
            </g>

            <g className="eamap__hub eamap__stop--wilson">
              <circle cx={hub[0]} cy={hub[1]} r={11} className="eamap__pulse" />
              <rect x={hub[0] - 9} y={hub[1] - 6.5} width={18} height={13} rx={6.5} className="eamap__core" />
              <circle cx={wilson[0]} cy={wilson[1]} r={2.4} className="eamap__core-dot" />
              <circle cx={jkia[0]} cy={jkia[1]} r={2.4} className="eamap__core-dot" />
              <text x={hub[0] - 14} y={hub[1] + 26} textAnchor="end" className="eamap__label eamap__label--hub">
                Wilson · JKIA
              </text>
            </g>
          </svg>
        </MapShowcase>
      </Container>
    </section>
  );
}
