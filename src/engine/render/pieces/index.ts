/** The painters a description's `paint:` may name, by name. */

import { ground, tent, tree } from "./camp.ts";
import type { Painter } from "./painter.ts";
import { block, disc } from "./pair.ts";
import { cross, shade } from "./stock.ts";

export const PAINTERS = {
  block,
  cross,
  disc,
  ground,
  shade,
  tent,
  tree,
} as const satisfies Record<string, Painter>;

export type PainterName = keyof typeof PAINTERS;

export type { Painter } from "./painter.ts";
