/** The painters a description's `paint:` may name, by name. */

import { ground, tent, tree } from "./camp.ts";
import type { Painter } from "./painter.ts";
import { block, disc } from "./pair.ts";
import { clear, cross, domino, shade } from "./stock.ts";

export const PAINTERS = {
  block,
  clear,
  cross,
  disc,
  domino,
  ground,
  shade,
  tent,
  tree,
} as const satisfies Record<string, Painter>;

export type PainterName = keyof typeof PAINTERS;

export type { Painter } from "./painter.ts";
