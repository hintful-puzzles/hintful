/** The flags a deal may have the player turn on: the hide flag and the only
 * flag. */

import type { ParamConfigItem } from "../../contract/game.ts";
import { flag, type ParamsSegment } from "../../game-id/params-codec.ts";
import type { FillParams } from "../game-id.ts";

/** A setting the player may turn on, under which the deal hides `kind`
 * too (`deal.hideFlag`), written after the tier by its letter. */
export interface FillHideFlag {
  readonly kind: string;
  readonly letter: string;
  readonly kw: string;
  readonly name: string;
  readonly doc: string;
  /** What a board's name says where it is on. */
  readonly words: string;
}

/** A setting the player may turn on, under which the deal deals `kinds`
 * alone of `deal.oneKind`'s (`deal.onlyFlag`), written after the tier by its
 * letter. */
export interface FillOnlyFlag {
  readonly kinds: readonly string[];
  readonly letter: string;
  readonly kw: string;
  readonly name: string;
  readonly doc: string;
  /** What a board's name says where it is on. */
  readonly words: string;
}

/** A flag's Custom field, on the params' field `field`. */
export const flagItem = (
  f: FillHideFlag | FillOnlyFlag,
  field: "hides" | "only",
): ParamConfigItem<FillParams> => ({
  kw: f.kw,
  name: f.name,
  type: "boolean",
  doc: f.doc,
  label: { slot: "tail", words: (p) => (p[field] === true ? f.words : null) },
  get: (p) => p[field] === true,
  set: (p, v) => {
    p[field] = v;
  },
});

/** A flag in the params, by its letter after the tier: only a full ID
 * carries it. */
export const flagSegment = (
  config: readonly ParamConfigItem<FillParams>[],
  f: FillHideFlag | FillOnlyFlag,
): ParamsSegment<FillParams> => flag(config, f.letter, f.kw, { full: true });
