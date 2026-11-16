/** Simple flat flags (3:2) for the countries the map can highlight. Drawn as SVG so they render everywhere. */
function star(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? r : r * 0.382;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return pts.join(" ");
}

export function Flag({ code }: { code: string }) {
  switch (code) {
    case "ke":
      return (
        <>
          <rect width="30" height="20" fill="#fff" />
          <rect width="30" height="5" fill="#000" />
          <rect y="6" width="30" height="8" fill="#bb0000" />
          <rect y="15" width="30" height="5" fill="#006600" />
          <ellipse cx="15" cy="10" rx="3.2" ry="5.4" fill="#bb0000" stroke="#fff" strokeWidth="0.8" />
          <ellipse cx="15" cy="10" rx="1" ry="3.6" fill="#fff" />
        </>
      );
    case "ug": {
      const colours = ["#000", "#fcdc04", "#d90000", "#000", "#fcdc04", "#d90000"];
      return (
        <>
          {colours.map((fill, i) => (
            <rect key={i} y={(20 / 6) * i} width="30" height={20 / 6 + 0.05} fill={fill} />
          ))}
          <circle cx="15" cy="10" r="3.6" fill="#fff" />
          <circle cx="15" cy="10" r="1.7" fill="#555" />
        </>
      );
    }
    case "so":
      return (
        <>
          <rect width="30" height="20" fill="#4189dd" />
          <polygon points={star(15, 10.4, 5.6)} fill="#fff" />
        </>
      );
    case "tz":
      return (
        <>
          <rect width="30" height="20" fill="#1eb53a" />
          <polygon points="30,0 30,20 0,20" fill="#00a3dd" />
          <line x1="-1" y1="21" x2="31" y2="-1" stroke="#fcd116" strokeWidth="6.4" />
          <line x1="-1" y1="21" x2="31" y2="-1" stroke="#000" strokeWidth="4" />
        </>
      );
    case "et":
      return (
        <>
          <rect width="30" height="6.7" fill="#078930" />
          <rect y="6.65" width="30" height="6.7" fill="#fcdd09" />
          <rect y="13.3" width="30" height="6.7" fill="#da121a" />
          <circle cx="15" cy="10" r="4.4" fill="#0f47af" />
          <polygon points={star(15, 10.2, 3.1)} fill="#fcdd09" />
        </>
      );
    case "ss":
      return (
        <>
          <rect width="30" height="20" fill="#fff" />
          <rect width="30" height="6" fill="#000" />
          <rect y="7" width="30" height="6" fill="#da121a" />
          <rect y="14" width="30" height="6" fill="#078930" />
          <polygon points="0,0 13,10 0,20" fill="#0f47af" />
          <polygon points={star(4.3, 10.2, 2.6)} fill="#fcdd09" />
        </>
      );
    case "dj":
      return (
        <>
          <rect width="30" height="10" fill="#6ab2e7" />
          <rect y="10" width="30" height="10" fill="#12ad2b" />
          <polygon points="0,0 15,10 0,20" fill="#fff" />
          <polygon points={star(4.6, 10.2, 2.4)} fill="#d7141a" />
        </>
      );
    default:
      return null;
  }
}

export const FLAG_CODES = ["ke", "ug", "so", "tz", "et", "ss", "dj"];
