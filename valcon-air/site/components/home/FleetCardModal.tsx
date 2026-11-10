import Image from "next/image";
import { getAircraft } from "@/lib/content";

/* ============ FLEET PAGE ============ */

export default function FleetPage() {
  const aircraft = getAircraft();

  return (
    <div className="fleet-page">
      <h1 className="fleet-page-title">The fleet</h1>

      <ul className="fleet-row">
        {aircraft.map((item) => (
          <li className="fleet-card" key={item.slug}>
            <Image
              alt={item.hero.alt || item.name}
              src={item.hero.desktop}
              fill
              sizes="(min-width: 768px) 33vw, 80vw"
              style={{
                transition: "transform 0.3s ease",
                transform: "rotate(-2deg) translateY(-4px)",
              }}
            />

            <div>
              <h3 className="fleet-name">{item.name}</h3>
              <p className="fleet-meta">
                {item.registrations.length > 0
                  ? item.registrations.join(", ")
                  : "[placeholder] Registration pending"}
              </p>
              <span className="status-pill">
                {item.isPlaceholder ? "Sample" : "Details pending"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}