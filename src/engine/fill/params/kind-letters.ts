/** The kinds of clue the player switches on and off, each by its letter
 * after the tier (upstream mathrax.c's). */

import type { ParamConfigItem } from "../../contract/game.ts";
import type { ParamsSegment } from "../../game-id/params-codec.ts";
import type { FillDeal, FillParams } from "../game-id.ts";

/** A kind of clue the player may switch off (`deal.kindLetters`). */
export interface FillKindLetter {
  readonly letter: string;
  readonly kind: string;
  readonly kw: string;
  readonly name: string;
  readonly doc: string;
  /** What a board's name calls the kind, where it says which are on. */
  readonly word: string;
}

/** The kinds of `deal.kindLetters` board `p` deals, in the letters' order:
 * every one where `p` names none. */
export const kindsOn = (deal: FillDeal, p: FillParams): readonly string[] =>
  p.kinds ?? (deal.kindLetters ?? []).map((l) => l.kind);

/** The Custom dialog's check box for each kind of `deal.kindLetters`; the
 * first carries a board name's words for them all: which are on or which
 * are off, whichever list is shorter, and nothing where every one is on. */
export function kindItems(deal: FillDeal): ParamConfigItem<FillParams>[] {
  const letters = deal.kindLetters ?? [];
  const words = (p: FillParams): string | null => {
    const on = new Set(kindsOn(deal, p));
    const said = (yes: boolean) =>
      letters.filter((l) => on.has(l.kind) === yes).map((l) => l.word);
    const [shown, hidden] = [said(true), said(false)];
    if (hidden.length === 0) return null;
    return shown.length <= hidden.length
      ? `only ${shown.join("/")}`
      : `no ${hidden.join("/")}`;
  };
  return letters.map((l, i) => ({
    kw: l.kw,
    name: l.name,
    type: "boolean",
    doc: l.doc,
    ...(i === 0 ? { label: { slot: "tail" as const, words } } : {}),
    get: (p) => kindsOn(deal, p).includes(l.kind),
    set: (p, v) => {
      const on = new Set(kindsOn(deal, p));
      if (v) on.add(l.kind);
      else on.delete(l.kind);
      p.kinds = letters.map((x) => x.kind).filter((k) => on.has(k));
    },
  }));
}

/** The kinds on, each by its letter in the letters' order, which only a
 * full ID carries and only where some kind is off: no letter is every kind
 * (upstream mathrax.c's). */
export function kindLettersSegment(
  letters: readonly FillKindLetter[],
): ParamsSegment<FillParams> {
  return {
    encode: (p, full) => {
      const on = p.kinds ?? letters.map((l) => l.kind);
      if (!full || on.length === letters.length) return "";
      return letters
        .filter((l) => on.includes(l.kind))
        .map((l) => l.letter)
        .join("");
    },
    decode: (s, i, p) => {
      const on: string[] = [];
      for (const l of letters)
        if (s[i] === l.letter) {
          on.push(l.kind);
          i++;
        }
      p.kinds = on.length === 0 ? letters.map((l) => l.kind) : on;
      return i;
    },
  };
}

/** Why a full ID's board `p` deals no clue, or `null`. */
export const kindLettersRefusal = (p: FillParams): string | null =>
  p.kinds?.length === 0 ? "At least one clue type must be enabled." : null;
