/** The painters a description's `paint:` may name, by name. */

import { across, down } from "./bar.ts";
import { ground, tent, tree } from "./camp.ts";
import { hull, sea } from "./fleet.ts";
import { bulb, wall } from "./lamp.ts";
import type { Painter } from "./painter.ts";
import { block, disc } from "./pair.ts";
import { star } from "./star.ts";
import { clear, cross, domino, ring, shade } from "./stock.ts";

export const PAINTERS = {
  across,
  block,
  bulb,
  clear,
  cross,
  disc,
  domino,
  down,
  ground,
  hull,
  ring,
  sea,
  shade,
  star,
  tent,
  tree,
  wall,
} as const satisfies Record<string, Painter>;

export type PainterName = keyof typeof PAINTERS;

export type { Painter } from "./painter.ts";
