/**
 * What a Range hint's words point at that is not a square: a number, redrawn
 * in the action color. The words themselves are the description's
 * (`range.description.yaml`), spoken by `hint.ts`.
 */

import type { MarkKind } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** A clue's number, an element apart from its square, whose outline is the line
 * of sight's: a number lies inside the squares it sees. */
export const CLUE: MarkKind<Point> = { name: "clue", key: (p) => `${p.x},${p.y}` };
