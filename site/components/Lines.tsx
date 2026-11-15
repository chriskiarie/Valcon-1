import { Fragment } from "react";

/**
 * Renders copy with the line breaks written by the editor.
 * A newline in the content files (or in Studio) becomes a hard break, so a
 * headline can keep its first phrase on one line and start the next on its own.
 */
export function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, index) => (
        <Fragment key={index}>
          {index > 0 ? <br /> : null}
          {line}
        </Fragment>
      ))}
    </>
  );
}
