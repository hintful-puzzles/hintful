/**
 * What Net's hint marks besides its tiles: a side between two tiles, which a
 * note step places and a step's fit cites.
 */

import type { MarkKind } from "../../engine/contract/hint-words.ts";
import type { SideNote } from "./state.ts";

/** A side, named as a note move names it (from the tile left of it, `R`, or
 * above it, `D`), with the note a step places or cites there. */
export interface SideMark {
  readonly x: number;
  readonly y: number;
  readonly dir: number;
  readonly note: SideNote;
}

/** A side of the board, keyed by where it is and not by its note. */
export const SIDE: MarkKind<SideMark> = {
  name: "side",
  key: (s) => `${s.x},${s.y},${s.dir}`,
};
