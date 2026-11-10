import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Read a design token at build time. This keeps metadata that cannot accept
 * CSS custom properties (such as the browser theme colour) in sync with
 * styles/tokens.css instead of duplicating brand values in TypeScript.
 */
export function readCssToken(name: string): string {
  const tokensPath = join(process.cwd(), "styles", "tokens.css");
  const css = readFileSync(tokensPath, "utf8");
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escapedName}\\s*:\\s*([^;]+);`));

  if (!match) {
    throw new Error(`Design token ${name} was not found in styles/tokens.css`);
  }

  return match[1].trim();
}
