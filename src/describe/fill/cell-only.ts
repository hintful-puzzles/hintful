/**
 * What a description may say only where the answer's values sit on the cells:
 * each a part the fill engine draws, plays or hints at a cell, which an answer
 * on the edges refuses by name, so that a description is refused before it is
 * dealt rather than drawn wrong.
 */

import { CompileError } from "../compile-sorts.ts";
import { type DescriptionJson, noteMarkOf } from "../description.ts";

/** Each part that assumes a cell: where it is written, why, and whether
 * `json` says it. */
const CELL_ONLY: readonly {
  readonly at: string;
  readonly why: string;
  readonly says: (json: DescriptionJson) => boolean;
}[] = [
  {
    at: "marks",
    why: "candidate notes are a square's",
    says: (json) => noteMarkOf(json) !== null,
  },
  {
    at: "play numbers",
    why: "a number is typed into a square",
    says: (json) => json.play?.numbers !== undefined,
  },
  {
    at: "play links",
    why: "a link runs between two squares' middles",
    says: (json) => json.play?.links !== undefined,
  },
  {
    at: "play wash",
    why: "a wash lies over open squares",
    says: (json) => json.play?.wash !== undefined,
  },
  {
    at: "play covers",
    why: "a piece covers the number on its square",
    says: (json) => json.play?.covers !== undefined,
  },
  {
    at: "given",
    why: "a given is a square dealt holding its value",
    says: (json) => "given" in json && json.given !== undefined,
  },
  {
    at: "play given",
    why: "a given is a square dealt holding its value",
    says: (json) => json.play?.given !== undefined,
  },
  {
    at: "play dealt",
    why: "a square is dealt holding a value",
    says: (json) => json.play?.dealt !== undefined,
  },
  {
    at: "play shape",
    why: "a square is drawn as its piece",
    says: (json) => json.play?.shape !== undefined,
  },
  {
    at: "play gaps",
    why: "a gap between two squares is where an edge's value is drawn",
    says: (json) => json.play?.gaps !== undefined,
  },
  {
    at: "space hexagon",
    why: "the half grid is the square grid's",
    says: (json) => json.space.grid?.hexagon !== undefined,
  },
  {
    at: "play straight",
    why: "a drag along the edges follows them",
    says: (json) => json.play?.straight !== undefined,
  },
  {
    at: "play wrap",
    why: "the cursor wraps on the squares",
    says: (json) => json.play?.wrap !== undefined,
  },
  {
    at: "rulesOut",
    why: "its premise is a placement on a square",
    says: (json) => json.rulesOut !== undefined,
  },
];

/** Refuses, on a fill board (`play:`) whose answer is on the edges, each part
 * of `json` that assumes a cell. */
export function refuseCellOnly(json: DescriptionJson): void {
  if (json.play === undefined || json.answer.value.sort === "cell") return;
  for (const { at, why, says } of CELL_ONLY)
    if (says(json))
      throw new CompileError(`${at}: the answer is on the edges, and ${why}`);
}
