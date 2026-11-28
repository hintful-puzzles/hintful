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
import type { Point, Rect } from "../contract/types.ts";
import type { Mark } from "../hint/candidate-hint.ts";
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
} from "../input/target-verb.ts";
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
}

/**
 * The input of `module`'s board of features, where `cellAt` is the square a
 * press lands on and `slotsOf` where its slots are drawn; `null` where its
 * values are no features.
 */
export function featureInput<C, D extends { readonly tileSize: number }>(
  module: FillModule<C>,
  cellAt: (b: FillBoard<C>, ds: D, p: Point, ui: FillUi) => Point | null,
  slotsOf: ((b: FillBoard<C>, ds: D, c: number) => readonly Rect[]) | null,
): FeatureInput<C, D> | null {
  const names = module.play?.numbers?.features?.names;
  if (names === undefined) return null;
  const of = module.featuresOf;
  if (of === undefined) throw new Error("play numbers features: no featuresOf");
  if (slotsOf === null) throw new Error("play numbers features: no slots drawn");
  const count = names.length;
  const { across, down } = featureGrid(count);

  /** The sets square `c` can be: its value, or its notes. */
  const setsOf = (b: FillBoard<C>, c: number): number =>
    b.values[c] !== 0 ? 1 << b.values[c] : (b.pencil?.[c] ?? 0);
  /** The features every one of the sets `mask` has, and those one has. */
  const agreement = (mask: number): { all: number; any: number } => {
    let all = -1;
    let any = 0;
    for (const d of valuesIn(mask)) {
      all &= of(d);
      any |= of(d);
    }
    return { all: mask === 0 ? 0 : all, any };
  };
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
        const r = slotsOf(b, ds, t.y * b.w + t.x)[t.k];
        return { x: r.x + Math.floor(r.w / 2), y: r.y + Math.floor(r.h / 2) };
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
      // and stop at the board's edge.
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
  };
}
