/** The painters a description's `paint:` may name, by name. */

import { arrowDown, arrowLeft, arrowRight, arrowUp, goal } from "./arrow.ts";
import { across, down } from "./bar.ts";
import { ground, tent, tree } from "./camp.ts";
import { hull, sea } from "./fleet.ts";
import { pink, teal, violet, yellow } from "./four.ts";
import { bulb, wall } from "./lamp.ts";
import {
  fallPiece,
  ghostPiece,
  risePiece,
  vampirePiece,
  zombiePiece,
} from "./monster.ts";
import type { Painter } from "./painter.ts";
import { block, disc } from "./pair.ts";
import { minus, neutral, plus } from "./pole.ts";
import { star } from "./star.ts";
import { clear, cross, domino, ring, shade } from "./stock.ts";

export const PAINTERS = {
  across,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  block,
  bulb,
  clear,
  cross,
  disc,
  domino,
  down,
  fall: fallPiece,
  ghost: ghostPiece,
  goal,
  ground,
  hull,
  minus,
  neutral,
  pink,
  plus,
  rise: risePiece,
  ring,
  sea,
  shade,
  star,
  teal,
  tent,
  tree,
  vampire: vampirePiece,
  violet,
  wall,
  yellow,
  zombie: zombiePiece,
} as const satisfies Record<string, Painter>;

export type PainterName = keyof typeof PAINTERS;

export type { Painter } from "./painter.ts";
