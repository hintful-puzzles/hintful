import { html, nothing } from "lit";
import type { HintSpan } from "../engine/contract/types.ts";
import type { Puzzle } from "../puzzle/puzzle.ts";

/**
 * A hint's words, each reference to a mark a control that flashes that mark
 * on the board, so the words lead to it. What follows a reference up to the
 * next space ("'s", ",", ".") is kept on its line, so a line never opens
 * with it. A pill is tinted in its marks' color (`colors`), so the words
 * lead to the marks before any press.
 */
export function renderHintSpans(
  puzzle: Puzzle | null,
  spans: readonly HintSpan[],
  flashing: number | null,
  colors: readonly (string | null)[],
) {
  const glued = (i: number): string => {
    const next = spans[i + 1];
    return next && next.ref === null ? (/^\S*/.exec(next.text)?.[0] ?? "") : "";
  };
  return spans.map(({ text, ref }, i) => {
    if (ref === null)
      return spans[i - 1]?.ref != null ? text.slice(glued(i - 1).length) : text;
    const color = colors[ref];
    return html`<span class="hint-ref-run"><button
        type="button"
        data-ref=${ref}
        style=${color ? `--ref-color: ${color}` : nothing}
        class="hint-ref ${flashing === ref ? "flashing" : ""} ${color ? "colored" : ""}"
        @click=${() => puzzle?.flashHintReference(ref)}
        @pointerenter=${(e: PointerEvent) => {
          if (e.pointerType === "mouse") puzzle?.flashHintReference(ref);
        }}
      >${text}</button>${glued(i)}</span>`;
  });
}
