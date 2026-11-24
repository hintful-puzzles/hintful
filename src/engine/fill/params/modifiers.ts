/** The variations the player may switch on (`play.modifiers`), each by its
 * letter after the size. */

import type { ParamConfigItem } from "../../contract/game.ts";
import { modifierItem } from "../../game-id/modifier.ts";
import { flag, type ParamsSegment } from "../../game-id/params-codec.ts";
import { type FillParams, variationsOf } from "../game-id.ts";
import { beyond, type SizeBounds } from "./bounds.ts";

/** A variation the player may switch on (`play.modifiers`). */
export interface FillModifier {
  readonly letter: string;
  readonly kw: string;
  readonly name: string;
  readonly words: string;
  readonly rule: string;
  readonly note?: string;
  /** The most lines a board 2i squares across may have the other way. */
  readonly most?: readonly number[];
  /** What a board with it on is held to. */
  readonly bounds?: SizeBounds;
}

/** The Custom dialog's check box for each modifier. */
export function modifierItems(
  modifiers: Readonly<Record<string, FillModifier>>,
): ParamConfigItem<FillParams>[] {
  const named = Object.entries(modifiers);
  return named.map(([variation, m]) =>
    modifierItem<FillParams>({
      kw: m.kw,
      name: m.name,
      type: "boolean",
      when: true,
      words: m.words,
      slot: "tail",
      rule: m.rule,
      ...(m.note === undefined ? {} : { note: m.note }),
      get: (p) => variationsOf(p).includes(variation),
      // In the modifiers' order, whichever is set first, after any the
      // sizes put on (dealt blocks), and absent where none is on.
      set: (p, on) => {
        const now = [
          ...variationsOf(p).filter((n) => modifiers[n] === undefined),
          ...named
            .map(([n]) => n)
            .filter((n) => (n === variation ? on : variationsOf(p).includes(n))),
        ];
        if (now.length > 0) p.variations = now;
        else delete p.variations;
      },
    }),
  );
}

/** Each modifier in the params, by its letter. */
export const modifierSegments = (
  config: readonly ParamConfigItem<FillParams>[],
  modifiers: Readonly<Record<string, FillModifier>>,
): ParamsSegment<FillParams>[] =>
  Object.values(modifiers).map((m) => flag(config, m.letter, m.kw));

/** Why board `p` cannot have the modifiers it has on: past one's bounds, or
 * longer than its `most`; `null` where it can. */
export function modifierRefusal(
  modifiers: Readonly<Record<string, FillModifier>>,
  p: FillParams,
): string | null {
  for (const [variation, m] of Object.entries(modifiers)) {
    if (!variationsOf(p).includes(variation)) continue;
    const past = m.bounds === undefined ? null : beyond(m.bounds, p);
    if (past !== null) return `${m.name}: ${past[0].toLowerCase()}${past.slice(1)}.`;
    const { most } = m;
    if (most === undefined) continue;
    for (const [across, along, side, other] of [
      [p.w, p.h, "wide", "high"],
      [p.h, p.w, "high", "wide"],
    ] as const) {
      const bound = most[across / 2];
      if (bound !== undefined && along > bound)
        return `${m.name}: a grid ${across} ${side} can be at most ${bound} ${other}.`;
    }
  }
  return null;
}
