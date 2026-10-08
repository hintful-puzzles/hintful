/**
 * The behavioral check behind every declared sweep (`target-verb.ts`): played
 * through the midend, a drag between two targets that hold the same thing
 * leaves both holding the press's result, and one Undo takes the board back to
 * where the press found it.
 *
 * `target-verb-sweep.test.ts` runs it over every game declaring
 * `targetVerbs.sweep`; a game whose drag is declared with `dragMarkVerbs`,
 * beside input that is not target-verb, runs it from its own test on the verbs
 * it exports.
 */

import { expect } from "vitest";
import { UI_UPDATE } from "../game.ts";
import {
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
} from "../pointer.ts";
import type { TargetVerbs } from "../target-verb.ts";
import type { Point } from "../types.ts";
import { type AnyGame, probeBoard } from "./input-probe.ts";

type AnyVerbs = TargetVerbs<unknown, unknown, unknown, unknown, unknown>;

/** How many pairs of targets a button is tried on before the check says no
 * drag works. A pair can fail for the puzzle's own reasons (Tracks refuses a
 * third rail into a square), so the claim is that the nearest pairs include
 * one that works, which a game that drops its drags never meets. */
const PAIRS_TRIED = 40;

/** A target is a plain record, or an object of the game's own that the
 * geometry hands out by identity (Loopy's edges). */
function keyOf(t: unknown): unknown {
  try {
    return JSON.stringify(t);
  } catch {
    return t;
  }
}

/**
 * Assert that `verbs`' sweep is what a drag on `game` does, for each button it
 * names. `verbs` is the game's `targetVerbs`, or the `dragMarkVerbs` of one of
 * its marks.
 */
export function expectDragRepeatsThePress<S, U, D, T, M>(
  game: AnyGame,
  id: string,
  declared: TargetVerbs<S, U, D, T, M>,
  /** Keys pressed on each fresh board before its drag: the notes-mode key,
   * for a mark that exists only there. */
  first: readonly number[] = [],
): void {
  const verbs = declared as unknown as AnyVerbs;
  const sweep = verbs.sweep;
  if (!sweep) throw new Error(`${id} declares no sweep`);
  const { geometry } = verbs;
  const b = probeBoard(game, id);
  const opening = b.live();
  const ds = game.newDrawState(opening.state, b.tileSize);

  // Every target a press reaches, with a point a press addresses it from: its
  // `pointAt`, or for a mark that declares none the sample nearest the middle
  // of where it was found.
  const found = new Map<unknown, { t: unknown; from: Point[] }>();
  const step = Math.max(1, Math.floor(b.tileSize / 8));
  for (let x = 0; x < b.size.w; x += step)
    for (let y = 0; y < b.size.h; y += step) {
      const t = geometry.pointerTarget(opening.state, ds, { x, y }, opening.ui);
      if (t === null) continue;
      const entry = found.get(keyOf(t)) ?? { t, from: [] };
      entry.from.push({ x, y });
      found.set(keyOf(t), entry);
    }
  const middle = (from: Point[]): Point => {
    const cx = from.reduce((sum, p) => sum + p.x, 0) / from.length;
    const cy = from.reduce((sum, p) => sum + p.y, 0) / from.length;
    return from.reduce((best, p) =>
      Math.hypot(p.x - cx, p.y - cy) < Math.hypot(best.x - cx, best.y - cy) ? p : best,
    );
  };
  const targets = [...found.values()].map(({ t, from }) => {
    try {
      return { t, at: geometry.pointAt(opening.state, ds, t, opening.ui) };
    } catch {
      return { t, at: middle(from) };
    }
  });

  const slots = (sweep.buttons ?? (["primary", "secondary"] as const)).filter(
    (s) => verbs[s],
  );
  expect(slots.length, "the sweep names no button with a verb").toBeGreaterThan(0);
  for (const slot of slots) {
    const [down, drag, up] =
      slot === "primary"
        ? [LEFT_BUTTON, LEFT_DRAG, LEFT_RELEASE]
        : [RIGHT_BUTTON, RIGHT_DRAG, RIGHT_RELEASE];
    const verb = verbs[slot];
    if (!verb) continue;
    /** The board after the verb at `t`, or `null` where it marks nothing. */
    const marked = (t: unknown) => {
      const made = verb.apply(opening.state, t, structuredClone(opening.ui));
      return made === null || made === UI_UPDATE
        ? null
        : game.executeMove(opening.state, made);
    };
    /** Whether marking `a` leaves `c` holding what it held: not so for one
     * edge seen from its two sides, or two dominoes sharing a square. */
    const apart = (a: unknown, c: unknown) => {
      const after = marked(a);
      return after !== null && sweep.holds(after, c) === sweep.holds(opening.state, c);
    };
    // Pairs the drag should take, nearest first.
    const all = targets.filter(({ t }) => marked(t) !== null);
    const pairs: { a: (typeof all)[number]; c: (typeof all)[number]; d: number }[] = [];
    for (const a of all)
      for (const c of all) {
        if (a === c) continue;
        if (sweep.holds(opening.state, a.t) !== sweep.holds(opening.state, c.t))
          continue;
        if (!(sweep.reaches?.(opening.state, a.t, c.t) ?? true)) continue;
        if (!apart(a.t, c.t)) continue;
        pairs.push({ a, c, d: Math.hypot(a.at.x - c.at.x, a.at.y - c.at.y) });
      }
    pairs.sort((p, q) => p.d - q.d);
    expect(pairs.length, `${slot}: no two targets a drag could join`).toBeGreaterThan(
      0,
    );

    let worked = false;
    for (const { a, c } of pairs.slice(0, PAIRS_TRIED)) {
      b.reset();
      for (const key of first) b.m.processInput(0, 0, key);
      const before = sweep.holds(b.live().state, a.t);
      b.m.processInput(a.at.x, a.at.y, down);
      const n = Math.max(
        1,
        Math.ceil(Math.hypot(c.at.x - a.at.x, c.at.y - a.at.y) / 4),
      );
      for (let i = 1; i <= n; i++)
        b.m.processInput(
          a.at.x + ((c.at.x - a.at.x) * i) / n,
          a.at.y + ((c.at.y - a.at.y) * i) / n,
          drag,
        );
      b.m.processInput(c.at.x, c.at.y, up);
      const after = b.live().state;
      const painted =
        sweep.holds(after, a.t) !== before &&
        sweep.holds(after, a.t) === sweep.holds(after, c.t);
      if (!painted || b.moves() < 2) continue;
      // The whole drag is one step of Undo, and one of Redo.
      const made = b.moves();
      b.m.undo();
      expect(b.moves(), `${slot}: one Undo left part of the drag`).toBe(0);
      b.m.redo();
      expect(b.moves(), `${slot}: one Redo replayed part of the drag`).toBe(made);
      worked = true;
      break;
    }
    expect(worked, `${slot}: no drag between two like targets marked both`).toBe(true);
  }
  b.reset();
}
