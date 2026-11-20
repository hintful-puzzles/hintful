/**
 * What a Spokes hint's words point at: a spoke, which a step decides and draws
 * as a line or a ring round its rim dot, and a hub, which it reasons from. The
 * words themselves are the description's (`spokes.description.yaml`), spoken
 * by `hint.ts`.
 */

import type { MarkKind } from "../../engine/contract/hint-words.ts";

/** A spoke, by its canonical end (`dir < 4`), so both ends compare equal. */
export interface Spoke {
  readonly index: number;
  readonly dir: number;
}

export const SPOKE: MarkKind<Spoke> = {
  name: "spoke",
  key: (s) => `${s.index}:${s.dir}`,
};

/** A hub, by its cell index. */
export const HUB: MarkKind<number> = { name: "hub", key: String };
