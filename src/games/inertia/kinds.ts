import type { MarkKind } from "../../engine/contract/hint-words.ts";

/** The arrow on the ball, by the direction it points. */
export const ARROW: MarkKind<number> = { name: "arrow", key: String };

/** A gem, by its square. */
export const GEM: MarkKind<number> = { name: "gem", key: String };
