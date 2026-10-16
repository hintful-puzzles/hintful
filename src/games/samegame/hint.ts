/**
 * Same Game's hint.
 *
 * No removal is forced by logic, so the hint is the searching kind
 * (docs/hints-search.md § "What every game does"). It finds an order of
 * removals that clears the board (`findClearing`) and offers the first, set
 * against the other groups on the board, the choice a player faces
 * (`add-samegame-hint` design D1):
 *
 * 1. a rival that would leave a square the last of its color, or no two
 *    squares of one color side by side, is a reason the player can see, so it
 *    leads;
 * 2. otherwise the rivals are searched, within an allowance per request
 *    (`judgeRivals`), and the groups that can still clear are shown where some
 *    rival cannot;
 * 3. with nothing settled, a square with no partner that the removal brings
 *    one to, else the removal alone.
 *
 * The hint is about clearing the board and never about the score, which it
 * cannot prove anything about. Every removal takes two squares or more, so a
 * plan recomputed after each move cannot cycle (§ "Recompute-stable plans").
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { type MarkedDeadEnd, markedDeadEnd } from "../../engine/hint-refusal.ts";
import { CELL, mark, phrase, type Sentence } from "../../engine/hint-words.ts";
import { judgeRivals } from "../../engine/rival-judging.ts";
import { searchRefusal } from "../../engine/search-outcome.ts";
import type { Point } from "../../engine/types.ts";
import { say } from "./hint-text.ts";
import {
  findClearing,
  type Group,
  groupsOf,
  judge,
  lastOfColor,
  loneSquares,
  removed,
} from "./solver.ts";
import { isStuck, type SamegameMove, type SamegameState } from "./state.ts";

/** What a step rests on, by the branch of {@link hint} that chose it. */
export const SAMEGAME_RUNGS = [
  "last",
  "none",
  "lastOfColor",
  "stuck",
  "only",
  "onlyThese",
  "alsoThese",
  "anyGroup",
  "joins",
  "plain",
] as const;
export type SamegameRung = (typeof SAMEGAME_RUNGS)[number];

type Step = HintStep<SamegameMove, unknown, SamegameRung>;
type Said = { rung: SamegameRung; words: Sentence };

/** Positions the searches of one request may expand between them, and one
 * rival's search alone. Past either a rival is unsettled and the step claims
 * nothing about it (`add-samegame-hint` design D3). */
const ALLOWANCE = 4_000;
const RIVAL_PROOF = 400;

const pointsOf = (s: SamegameState, g: Group): Point[] =>
  g.map((i) => ({ x: i % s.w, y: Math.floor(i / s.w) }));

const pointOf = (s: SamegameState, i: number): Point => ({
  x: i % s.w,
  y: Math.floor(i / s.w),
});

const sameGroup = (a: Group, b: Group) => a[0] === b[0];

/** How far rival `r` lies from the offered group `g`: the nearest two of
 * their squares, in steps along the grid. */
function distance(s: SamegameState, g: Group, r: Group): number {
  let best = Number.POSITIVE_INFINITY;
  for (const i of g)
    for (const j of r)
      best = Math.min(
        best,
        Math.abs((i % s.w) - (j % s.w)) +
          Math.abs(Math.floor(i / s.w) - Math.floor(j / s.w)),
      );
  return best;
}

function step(g: Group, said: Said): Step {
  return {
    move: { type: "remove", tiles: [...g] },
    rung: said.rung,
    explanation: said.words.text,
    words: said.words,
  };
}

/** The trap rival `r` springs, seen on the board it leaves: a square the last
 * of its color, else no group left at all. */
function trapOf(
  s: SamegameState,
  r: Group,
): { kind: "lastOfColor"; victim: number } | { kind: "stuck" } | null {
  const after = removed(s.tiles, s.w, s.h, r);
  const [victim] = lastOfColor(after, s.ncols);
  if (victim !== undefined) {
    // Named where it stands now, before the rival's removal moves it.
    const moved = new Int32Array(s.w * s.h);
    removed(s.tiles, s.w, s.h, r, moved);
    const before = moved.indexOf(victim);
    return { kind: "lastOfColor", victim: before };
  }
  if (after[(s.h - 1) * s.w] !== 0 && groupsOf(after, s.w, s.h).length === 0)
    return { kind: "stuck" };
  return null;
}

/**
 * A square with no square of its color beside it that removing `g` brings
 * one beside, the nearest to `g` first; named where it stands now.
 */
function joinedBy(s: SamegameState, g: Group): number | null {
  const moved = new Int32Array(s.w * s.h);
  const after = removed(s.tiles, s.w, s.h, g, moved);
  const loneAfter = new Set(loneSquares(after, s.w, s.h));
  const joined = loneSquares(s.tiles, s.w, s.h).filter((p) => !loneAfter.has(moved[p]));
  if (joined.length === 0) return null;
  const near = (p: number) => distance(s, g, [p]);
  return joined.sort((a, b) => near(a) - near(b) || a - b)[0];
}

/**
 * Same Game's verdict a player can see at a glance: a square that is the last
 * of its color, outlined so they can see which. A stuck board is the status
 * line's already, so it is a bare verdict.
 */
export function hasNoSolution(state: SamegameState): boolean | MarkedDeadEnd {
  if (isStuck(state)) return true;
  const last = lastOfColor(state.tiles, state.ncols);
  if (last.length === 0) return false;
  const many = last.length > 1;
  const squares = mark.the(
    "outline",
    CELL,
    last.map((i) => pointOf(state, i)),
    "square",
  );
  return markedDeadEnd(
    phrase`${squares.capitalized()} ${many ? "are each" : "is"} the last of ${many ? "their" : "its"} color, so the board can never be cleared. Undo until ${many ? "each has" : "it has"} another square of its color.`,
  );
}

export function hint(
  state: SamegameState,
): HintResult<SamegameMove, unknown, SamegameRung> {
  const clearing = findClearing(state);
  if (clearing.kind !== "found") return searchRefusal(clearing);
  const [g] = clearing.line;
  const at = pointsOf(state, g);
  if (clearing.line.length === 1)
    return { ok: true, steps: [step(g, { rung: "last", words: say.last(at) })] };

  const rivals = groupsOf(state.tiles, state.w, state.h).filter(
    (r) => !sameGroup(r, g),
  );

  // A trap the player can see leads, the rival nearest the offered group
  // first.
  const traps = rivals
    .map((r) => ({ r, trap: trapOf(state, r) }))
    .filter((t) => t.trap !== null)
    .sort(
      (a, b) =>
        Number(a.trap?.kind === "stuck") - Number(b.trap?.kind === "stuck") ||
        distance(state, g, a.r) - distance(state, g, b.r) ||
        a.r[0] - b.r[0],
    );
  const [first] = traps;
  if (first?.trap) {
    const rival = pointsOf(state, first.r);
    if (first.trap.kind === "lastOfColor") {
      const v = first.trap.victim;
      const words = say.lastOfColor(at, rival, pointOf(state, v), state.tiles[v]);
      return { ok: true, steps: [step(g, { rung: "lastOfColor", words })] };
    }
    return {
      ok: true,
      steps: [step(g, { rung: "stuck", words: say.stuck(at, rival) })],
    };
  }

  const { claim } = judgeRivals(rivals, ALLOWANCE, (r, allowance) =>
    judge(state, removed(state.tiles, state.w, state.h, r), allowance, RIVAL_PROOF),
  );
  const goods = (gs: readonly Group[]) => gs.map((r) => pointsOf(state, r));
  // With nothing settled to contrast, a fact the player can see instead, which
  // claims nothing about clearing.
  const plain = (): Said => {
    const lone = joinedBy(state, g);
    return lone === null
      ? { rung: "plain", words: say.plain(at) }
      : {
          rung: "joins",
          words: say.joins(at, pointOf(state, lone), state.tiles[lone]),
        };
  };
  const said: Said =
    claim.kind === "none"
      ? { rung: "none", words: say.none(at, claim.relation) }
      : claim.kind === "every"
        ? { rung: "anyGroup", words: say.anyGroup(at, claim.relation) }
        : claim.kind === "only"
          ? { rung: "only", words: say.only(at, claim.relation) }
          : claim.kind === "onlyThese"
            ? {
                rung: "onlyThese",
                words: say.onlyThese(at, goods(claim.goods), claim.relation),
              }
            : claim.kind === "alsoThese"
              ? {
                  rung: "alsoThese",
                  words: say.alsoThese(at, goods(claim.goods), claim.relation),
                }
              : plain();
  return { ok: true, steps: [step(g, said)] };
}

/** A removal is settled by the squares it takes, so the step's own removal
 * leaves exactly the board the plan expects; anything else drops the plan. */
export function hintKeepTrack(
  m: SamegameMove,
  step: Step,
  _s: SamegameState,
): HintTrackVerdict {
  const want = step.move;
  if (m.type !== "remove" || want.type !== "remove") return "off";
  const a = [...m.tiles].sort((x, y) => x - y);
  return a.length === want.tiles.length && a.every((t, i) => t === want.tiles[i])
    ? "completed"
    : "off";
}
