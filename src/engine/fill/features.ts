/**
 * How a board whose values are sets of features (`play.numbers.features`,
 * Subsets') is played: a press on a feature's slot of a square says whether
 * the square's set holds it, as upstream subsets.c's press on a letter does,
 * and the arrows walk the slots. The square's notes are the sets it can
 * still hold (kept full, `notes.ts`), so a slot marks its feature by the
 * notes alone: present strikes the half of them that lack it, absent the
 * half that hold it, and undecided gives back the other half that the
 * square's other decided features allow. A square left one set holds it.
 */

import type { UiUpdate } from "../contract/game.ts";
import { joinWith } from "../contract/hint-words.ts";
import type { Point, Rect } from "../contract/types.ts";
import type { Mark } from "../hint/candidate-hint.ts";
import { click, type PointerAction } from "../input/hint-gesture.ts";
import {
  cursorDelta,
  isMouseDown,
  isMouseDrag,
  stripModifiers,
} from "../input/pointer.ts";
import {
  ERASE_KEYS,
  interpretTargetVerbs,
  rulingOut,
  sweepTo,
  type TargetVerbs,
  verbGesture,
} from "../input/target-verb.ts";
import { type BandGrid, enterBand } from "./band.ts";
import { type FillBoard, type FillModule, spaceOf } from "./board.ts";
import type { FillMove } from "./notes.ts";
import type { FillUi } from "./play.ts";
import { featureGrid } from "./render/cell-text.ts";

/** Feature `k`'s slot of the square `(x, y)`. */
export interface FeatureSlot {
  readonly x: number;
  readonly y: number;
  readonly k: number;
}

/** What a square's set is known to do with a feature: hold it, lack it, or
 * either still. */
type Holds = "present" | "absent" | "open";

/** The values whose bits `mask` sets. */
function valuesIn(mask: number): number[] {
  const out: number[] = [];
  for (let v = 1; v < 32; v++) if (mask & (1 << v)) out.push(v);
  return out;
}

/** The sets square `c` can be: its value, or its notes. */
const setsOf = <C>(b: FillBoard<C>, c: number): number =>
  b.values[c] !== 0 ? 1 << b.values[c] : (b.pencil?.[c] ?? 0);

/** The features every one of the sets `mask` has, and those one has, each a
 * mask by `of`. */
export function featureAgreement(
  mask: number,
  of: (d: number) => number,
): { readonly all: number; readonly any: number } {
  let all = -1;
  let any = 0;
  for (const d of valuesIn(mask)) {
    all &= of(d);
    any |= of(d);
  }
  return { all: mask === 0 ? 0 : all, any };
}

/** How a hint says value `d`: its features' `names` in braces ("{A,C}"), or
 * `none` where it has none (Subsets' "the empty set"). */
export function featuresSaid(
  d: number,
  features: { readonly names: string; readonly none?: string },
  of: (d: number) => number,
): string {
  const has = of(d);
  if (has === 0) return features.none ?? "{}";
  return `{${Array.from(features.names)
    .filter((_, k) => has & (1 << k))
    .join(",")}}`;
}

/** The features to mark present and to clear, each a mask, whose slot
 * presses strike exactly the sets `strike` from a square whose sets are
 * `notes`, of `count` features by `of`, the fewest that do; `null` where
 * none do. A press on an undecided slot strikes the half of the square's sets
 * that lack its feature or hold it, so the presses are the halves the strike
 * is the union of. Each half is the strike's, so the presses are made in any
 * order: each strikes a part of it, and leaves the others' slots undecided,
 * as each strikes a set no other does and the sets kept hold every pressed
 * feature and lack every crossed one. */
function featurePresses(
  notes: number,
  strike: number,
  of: (d: number) => number,
  count: number,
  /** Presses to present alone (`true`), or to absent alone (`false`). */
  side: boolean | null = null,
): { readonly present: number; readonly absent: number } | null {
  if (strike === 0 || (strike & ~notes) !== 0) return null;
  // Each slot's half that lies in the strike, by its press: present strikes
  // the sets lacking the feature, absent those holding it.
  const halves: {
    readonly k: number;
    readonly present: boolean;
    readonly sets: number;
  }[] = [];
  for (let k = 0; k < count; k++) {
    let lacking = 0;
    for (const d of valuesIn(notes)) if (!(of(d) & (1 << k))) lacking |= 1 << d;
    const holding = notes & ~lacking;
    if (lacking === 0 || holding === 0) continue;
    if (side !== false && (lacking & ~strike) === 0)
      halves.push({ k, present: true, sets: lacking });
    if (side !== true && (holding & ~strike) === 0)
      halves.push({ k, present: false, sets: holding });
  }
  // The smallest choice of halves whose union is the strike, the first in
  // the slots' order among those as small.
  let best: number | null = null;
  const size = (pick: number): number => {
    let n = 0;
    for (let m = pick; m !== 0; m &= m - 1) n++;
    return n;
  };
  for (let pick = 1; pick < 1 << halves.length; pick++) {
    let union = 0;
    halves.forEach((h, i) => {
      if (pick & (1 << i)) union |= h.sets;
    });
    if (union === strike && (best === null || size(pick) < size(best))) best = pick;
  }
  if (best === null) return null;
  let present = 0;
  let absent = 0;
  halves.forEach((h, i) => {
    if (best !== null && best & (1 << i)) {
      if (h.present) present |= 1 << h.k;
      else absent |= 1 << h.k;
    }
  });
  return { present, absent };
}

/** A hint's strike `marks` on a board `w` wide whose notes are `pencil`,
 * said as its slots' presses where it is from one square and they make it
 * (`pressesSaid`); `null` elsewhere. */
export function strikePressesSaid(
  marks: readonly { readonly x: number; readonly y: number; readonly n: number }[],
  w: number,
  pencil: ArrayLike<number>,
  features: { readonly names: string },
  of: (d: number) => number,
): ReturnType<typeof pressesSaid> {
  const cells = new Set(marks.map((m) => m.y * w + m.x));
  if (cells.size !== 1) return null;
  const [c] = cells;
  let strike = 0;
  for (const m of marks) strike |= 1 << m.n;
  return pressesSaid(pencil[c], strike, features, of);
}

/**
 * A strike from a square of notes `notes` made by pressing only to present,
 * or only to absent, in a hint's words: the features pressed, by their
 * letters of `names` ("A and D"), as the thing pressed, of the live part of
 * the strike, and what the press makes them (`after`, "must be present").
 * `null` where the strike is no such presses. A live part is struck by the
 * same presses less those whose half it has lost: each half lies in the
 * strike, and the sets kept keep every slot pressed undecided.
 */
export function pressesSaid(
  notes: number,
  strike: number,
  features: { readonly names: string },
  of: (d: number) => number,
): { what(values: readonly number[]): string; after: string } | null {
  const count = features.names.length;
  const p = featurePresses(notes, strike, of, count);
  if (p === null || (p.present !== 0 && p.absent !== 0)) return null;
  const present = p.present !== 0;
  return {
    what: (values) => {
      let live = 0;
      for (const v of values) live |= 1 << v;
      const now = featurePresses(notes & ~(strike & ~live), live, of, count, present);
      if (now === null) throw new Error("a live strike's presses are its own");
      const mask = present ? now.present : now.absent;
      return joinWith(Array.from(features.names).filter((_, k) => mask & (1 << k)));
    },
    after: present ? "must be present" : "must be crossed out",
  };
}

/** The slots of square `c`, of `count` features by `of`, that its sets decide
 * against `answer`'s: a feature they all have that it lacks, or that none has
 * and it has. */
export function wrongFeatures<C>(
  b: FillBoard<C>,
  c: number,
  answer: number,
  of: (d: number) => number,
  count: number,
): number {
  const { all, any } = featureAgreement(setsOf(b, c), of);
  const want = of(answer);
  return ((all & ~want) | (~any & want)) & ((1 << count) - 1);
}

/** The features of a board's square that its sets can still be, and its
 * input: the target verbs, and the arm `numbers.ts` hands a button first,
 * which answers `pass` for one it leaves to the rest. */
export interface FeatureInput<C, D> {
  readonly verbs: TargetVerbs<FillBoard<C>, FillUi, D, FeatureSlot, FillMove>;
  interpret(
    board: FillBoard<C>,
    ui: FillUi,
    ds: D,
    p: Point,
    raw: number,
  ): FillMove | UiUpdate | null | "pass";
  /** A hint's strike as slot presses: on each square, an undecided slot
   * pressed to present or absent wherever the half that strikes is all the
   * step's, until its strike is made. */
  gesture(board: FillBoard<C>, ui: FillUi, ds: D, move: FillMove): PointerAction[];
}

/** Where a board of features draws what its input reads: each square's
 * slots, and the band beneath it, `null` where it has none (`band.ts`). */
export interface FeatureSites<C, D> {
  slotsOf(b: FillBoard<C>, ds: D, c: number): readonly Rect[];
  /** Where each slot's letter is drawn, which a press goes to. */
  lettersOf(b: FillBoard<C>, ds: D, c: number): readonly Point[];
  bandGrid(b: FillBoard<C>): BandGrid | null;
  bandPoint(b: FillBoard<C>, ds: D, v: number): Point | null;
  badgePoint(b: FillBoard<C>, ds: D, c: number): Point | null;
}

/**
 * The input of `module`'s board of features, where `cellAt` is the square a
 * press lands on and `sites` where its slots and band are drawn; `null`
 * where its values are no features.
 */
export function featureInput<C, D extends { readonly tileSize: number }>(
  module: FillModule<C>,
  cellAt: (b: FillBoard<C>, ds: D, p: Point, ui: FillUi) => Point | null,
  sites: FeatureSites<C, D> | null,
): FeatureInput<C, D> | null {
  const names = module.play?.numbers?.features?.names;
  if (names === undefined) return null;
  const of = module.featuresOf;
  if (of === undefined) throw new Error("play numbers features: no featuresOf");
  if (sites === null) throw new Error("play numbers features: no slots drawn");
  const { slotsOf } = sites;
  const count = names.length;
  const { across, down } = featureGrid(count);

  const agreement = (mask: number) => featureAgreement(mask, of);
  const holdsAt = (b: FillBoard<C>, t: FeatureSlot): Holds => {
    const { all, any } = agreement(setsOf(b, t.y * b.w + t.x));
    const bit = 1 << t.k;
    return all & bit ? "present" : any & bit ? "open" : "absent";
  };

  /** The move that takes slot `t` from what it holds to `to` of that: the
   * notes struck or given back, or written whole where both, with the value
   * cleared first where the square held one. Nothing on a given square, or
   * where no set would be left. */
  const slotMove =
    (to: (h: Holds) => Holds) =>
    (b: FillBoard<C>, t: FeatureSlot): FillMove | null => {
      const c = t.y * b.w + t.x;
      if (b.fixed[c] || b.pencil === null) return null;
      const now = setsOf(b, c);
      const old = holdsAt(b, t);
      const next = to(old);
      if (next === old) return null;
      const bit = 1 << t.k;
      // The domain's sets that keep the features the square's sets agree on,
      // this one aside, and of them those that hold it or lack it.
      const { all, any } = agreement(now);
      const decided = (all | ~any) & ~bit;
      let holding = 0;
      let lacking = 0;
      for (const d of valuesIn(module.domainOf(spaceOf(module, b), b.dealt, c))) {
        if (((of(d) ^ all) & decided) !== 0) continue;
        if (of(d) & bit) holding |= 1 << d;
        else lacking |= 1 << d;
      }
      let after: number;
      if (next === "open") after = now | (old === "present" ? lacking : holding);
      else {
        const half = next === "present" ? holding : lacking;
        after = (now & half) !== 0 ? now & half : half;
      }
      if (after === 0 || after === now) return null;
      if (b.values[c] !== 0) return { set: [c, 0], notes: [c, after] };
      const marks = (mask: number): Mark[] =>
        valuesIn(mask).map((n) => ({ x: t.x, y: t.y, n }));
      if ((after & ~now) === 0)
        return { type: "pencilStrike", marks: marks(now & ~after) };
      if ((now & ~after) === 0)
        return { type: "pencilAdd", marks: marks(after & ~now) };
      return { notes: [c, after] };
    };

  /** Whether `(x, y)` on the board's grid of slots, `across` by `down` a
   * square, is a slot: the last row of a square may hold fewer. */
  const isSlot = (gx: number, gy: number): boolean =>
    (gy % down) * across + (gx % across) < count;

  const verbs: TargetVerbs<FillBoard<C>, FillUi, D, FeatureSlot, FillMove> = {
    geometry: {
      noun: "letter",
      pointerTarget(b, ds, p, ui) {
        const at = cellAt(b, ds, p, ui);
        if (at === null) return null;
        const k = slotsOf(b, ds, at.y * b.w + at.x).findIndex(
          (r) => p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h,
        );
        return k < 0 ? null : { x: at.x, y: at.y, k };
      },
      pointAt(b, ds, t) {
        const p = sites.lettersOf(b, ds, t.y * b.w + t.x)[t.k];
        return { x: Math.floor(p.x), y: Math.floor(p.y) };
      },
      cursorTarget(b, ui) {
        const { x, y } = ui.cursor;
        return x < 0 || y < 0 || x >= b.w || y >= b.h
          ? null
          : { x, y, k: ui.slot ?? 0 };
      },
      parkCursor(ui, t) {
        ui.cursor.x = t.x;
        ui.cursor.y = t.y;
        ui.slot = t.k;
      },
      // The arrows walk the slots of every square as one grid, past a
      // square's missing ones (upstream subsets.c's cursor, over its gaps),
      // and stop at the board's edge, but for down from its bottom row into
      // the band beneath it, where it has one.
      moveCursor(b, ui, button) {
        const delta = cursorDelta(button);
        if (delta === null) return false;
        const k = ui.slot ?? 0;
        const from = {
          x: ui.cursor.x * across + (k % across),
          y: ui.cursor.y * down + Math.floor(k / across),
        };
        let { x, y } = from;
        do {
          x += delta.dx;
          y += delta.dy;
        } while (
          x >= 0 &&
          y >= 0 &&
          x < b.w * across &&
          y < b.h * down &&
          !isSlot(x, y)
        );
        const moved = x >= 0 && y >= 0 && x < b.w * across && y < b.h * down;
        const grid = sites.bandGrid(b);
        if (!moved && delta.dy > 0 && ui.cursor.visible && grid !== null) {
          enterBand(b, ui, ui.cursor.y * b.w + ui.cursor.x, grid);
          return true;
        }
        const shown = !ui.cursor.visible;
        ui.cursor.visible = true;
        if (!moved) return shown;
        ui.cursor.x = Math.floor(x / across);
        ui.cursor.y = Math.floor(y / down);
        ui.slot = (y % down) * across + (x % across);
        return true;
      },
    },
    primary: {
      does:
        "add it to its square's set; again to rule it out, and a third time to " +
        "leave it undecided",
      apply: slotMove((h) =>
        h === "open" ? "present" : h === "present" ? "absent" : "open",
      ),
    },
    secondary: rulingOut({
      does: "rule it out of its square's set, going round the other way",
      apply: slotMove((h) =>
        h === "open" ? "absent" : h === "absent" ? "present" : "open",
      ),
    }),
    sweep: { holds: holdsAt },
    keyOnly: [
      {
        does: "leave the letter under the cursor undecided",
        keys: ERASE_KEYS,
        apply: slotMove(() => "open"),
        pointer: { kind: "cycle", button: "primary" },
      },
    ],
  };

  return {
    verbs,
    interpret(b, ui, ds, p, raw) {
      const button = stripModifiers(raw);
      // A press off every slot, and a drag another arm began, are the rest's.
      if (isMouseDown(button) && verbs.geometry.pointerTarget(b, ds, p, ui) === null)
        return "pass";
      if (isMouseDrag(button)) return sweepTo(verbs, b, ui, ds, p) ?? "pass";
      return interpretTargetVerbs(verbs, b, ui, ds, p, raw) ?? "pass";
    },
    gesture(b, ui, ds, move) {
      // A set placed is every other set its square holds struck, which
      // leaves the square that one set, and so holding it.
      const marks: readonly Mark[] =
        "type" in move && move.type === "pencilStrike"
          ? move.marks
          : "type" in move && move.type === "set"
            ? valuesIn((b.pencil?.[move.y * b.w + move.x] ?? 0) & ~(1 << move.n)).map(
                (n) => ({ x: move.x, y: move.y, n }),
              )
            : [];
      if (marks.length === 0)
        throw new Error(
          `play numbers features: no gesture for ${JSON.stringify(move)}`,
        );
      const out: PointerAction[] = [];
      let focus = ui.focus ?? -1;
      for (const c of new Set(marks.map((m) => m.y * b.w + m.x))) {
        const x = c % b.w;
        const y = Math.floor(c / b.w);
        let left = 0;
        for (const m of marks) if (m.y * b.w + m.x === c) left |= 1 << m.n;
        // The fewest slot presses that make the strike, which the hint's
        // words name (`featurePresses`).
        const presses = featurePresses(b.pencil?.[c] ?? 0, left, of, count);
        if (presses !== null) {
          for (let k = 0; k < count; k++)
            for (const [mask, button] of [
              [presses.present, "primary"],
              [presses.absent, "secondary"],
            ] as const)
              if (mask & (1 << k))
                out.push(...verbGesture(verbs, b, ds, ui, [{ x, y, k }], button));
          continue;
        }
        // The rest is struck on the band, the square put in focus by its
        // badge first.
        const badge = sites.badgePoint(b, ds, c);
        const values = valuesIn(left);
        const points = values.map((v) => sites.bandPoint(b, ds, v));
        if (badge === null || points.some((p) => p === null))
          throw new Error(
            `play numbers features: square ${c}'s strike of ${values} is no letter's half, and no band's`,
          );
        if (focus !== c) out.push(click(badge));
        focus = c;
        for (const p of points) if (p !== null) out.push(click(p));
      }
      // The focus the player had is given back.
      const had = ui.focus ?? -1;
      if (focus !== had) {
        const back = sites.badgePoint(b, ds, had < 0 ? focus : had);
        if (back !== null) out.push(click(back));
      }
      return out;
    },
  };
}
