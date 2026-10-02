/**
 * Pegs' hint.
 *
 * Pegs is a search game: no jump is forced by logic, so the hint is the
 * non-deductive kind (docs/games/hints.md § "Non-deductive (heuristic) hints").
 * It finds a line of jumps that leaves one peg (`findFinish`) and offers its
 * first jump, set against the other jumps from the same position, which is
 * what a player has to learn to tell apart (`add-pegs-hint` design D6):
 *
 * 1. a rival jump that cuts a peg off, at once or whatever is jumped next, is
 *    a reason the player can see, so it leads;
 * 2. a plan that starts by clearing a known shape while every other peg ends
 *    where it began is walked as one journey;
 * 3. otherwise the rivals are searched, within an allowance per request, and
 *    the jumps that can still finish are shown where some rival cannot.
 *
 * A request plans one step, or one shape's journey, and the next request plans
 * from wherever the player is, so what a step says about its rivals is always
 * about the board on display. Every jump removes a peg, so the plans cannot
 * cycle (docs/games/hints.md § "Recompute-stable plans").
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { puzzleHintRefusal, SEARCH_OUT_OF_REACH } from "../../engine/hint-refusal.ts";
import type { Narration } from "../../engine/hint-words.ts";
import { NO_SOLUTION_FROM_HERE } from "../../engine/solve-failure.ts";
import { type Marked, type Package, say } from "./hint-text.ts";
import { findFinish, frozenPegs, type Jump, judge, legalJumps } from "./solver.ts";
import {
  GRID_HOLE,
  GRID_PEG,
  type PegsJump,
  type PegsMove,
  type PegsState,
} from "./state.ts";

type Step = HintStep<PegsMove>;

/** Positions the searches of one request may visit between them, and one
 * rival's proof of loss alone. Past either a rival is unsettled and the step
 * claims nothing about it. Measured against the half second a hint may take on
 * 9×9 Cross (`add-pegs-hint` design D7). */
const ALLOWANCE = 400_000;
const RIVAL_PROOF = 10_000;

/** The board after `j`. */
function jumped(s: PegsState, j: Jump): PegsState {
  const grid = new Uint8Array(s.grid);
  grid[j.from] = GRID_HOLE;
  grid[j.over] = GRID_HOLE;
  grid[j.to] = GRID_PEG;
  return { ...s, grid };
}

function toMove(s: PegsState, j: Jump): PegsJump {
  return {
    type: "jump",
    sx: j.from % s.w,
    sy: Math.floor(j.from / s.w),
    tx: j.to % s.w,
    ty: Math.floor(j.to / s.w),
  };
}

const same = (a: Marked, b: Marked) => a.from === b.from && a.to === b.to;

/**
 * The peg rival jump `r` cuts off: one frozen as soon as `r` is made, or else
 * one that every jump after `r` leaves frozen. A board some reply finishes
 * from has no frozen peg, so it is never called a trap.
 */
function cutOff(s: PegsState, r: Jump): { victim: number; soon: boolean } | null {
  const after = jumped(s, r);
  const now = frozenPegs(after);
  if (now.length > 0) return { victim: now[0], soon: false };
  const replies = legalJumps(after);
  if (replies.length === 0) return null;
  let common: number[] | null = null;
  for (const j of replies) {
    const f = frozenPegs(jumped(after, j));
    common = common === null ? f : common.filter((p) => f.includes(p));
    if (common.length === 0) return null;
  }
  return common === null ? null : { victim: common[0], soon: true };
}

/**
 * The package `plan` opens with, if any: three or six jumps whose only effect
 * is to empty a line of three or a two-by-three block.
 */
function packageAt(s: PegsState, plan: readonly Jump[]): Package | null {
  for (const n of [3, 6]) {
    if (plan.length < n) continue;
    let end = s;
    for (const j of plan.slice(0, n)) end = jumped(end, j);
    const pegs: number[] = [];
    let pure = true;
    s.grid.forEach((v, i) => {
      if (end.grid[i] === GRID_PEG && v !== GRID_PEG) pure = false;
      if (v === GRID_PEG && end.grid[i] !== GRID_PEG) pegs.push(i);
    });
    if (!pure || pegs.length !== n) continue;
    const xs = pegs.map((i) => i % s.w);
    const ys = pegs.map((i) => Math.floor(i / s.w));
    const bw = Math.max(...xs) - Math.min(...xs) + 1;
    const bh = Math.max(...ys) - Math.min(...ys) + 1;
    if (n === 3 && bw * bh === 3)
      return { pegs, shape: bh === 1 ? "row" : "column", jumps: 3 };
    if (n === 6 && bw * bh === 6 && Math.min(bw, bh) === 2)
      return { pegs, shape: "block", jumps: 6 };
  }
  return null;
}

function step(s: PegsState, j: Jump, words: Narration, continues = false): Step {
  return {
    move: toMove(s, j),
    explanation: words.text,
    words,
    ...(continues ? { continuesPrevious: true } : {}),
  };
}

export function hint(state: PegsState): HintResult<PegsMove> {
  // Pegs' one verdict a player can see at a glance: a peg nothing can reach.
  const frozen = frozenPegs(state);
  if (frozen.length === 1) {
    return {
      ok: false,
      error: puzzleHintRefusal(
        "A peg is cut off, so the game can never finish with one peg. Undo until a peg can still land beside it.",
      ),
    };
  }
  if (frozen.length > 1) {
    return {
      ok: false,
      error: puzzleHintRefusal(
        `${frozen.length} pegs are cut off, so the game can never finish with one peg. Undo until a peg can still land beside each.`,
      ),
    };
  }

  const finish = findFinish(state);
  if (finish.kind === "lost") return { ok: false, error: NO_SOLUTION_FROM_HERE };
  if (finish.kind === "out-of-reach") return { ok: false, error: SEARCH_OUT_OF_REACH };

  const plan = finish.jumps;
  const j = plan[0];
  if (plan.length === 1) return { ok: true, steps: [step(state, j, say.last(j))] };
  const rivals = legalJumps(state).filter((r) => !same(r, j));

  // A trap the player can see leads: a cut-off at once before one a move
  // later, and the rival nearest the suggested jump.
  const dist = (r: Jump) =>
    Math.abs((r.from % state.w) - (j.from % state.w)) +
    Math.abs(Math.floor(r.from / state.w) - Math.floor(j.from / state.w));
  const traps = rivals
    .map((r) => ({ r, cut: cutOff(state, r) }))
    .filter((t) => t.cut !== null)
    .sort((a, b) => Number(a.cut?.soon) - Number(b.cut?.soon) || dist(a.r) - dist(b.r));
  const trap = traps[0];
  if (trap?.cut) {
    const say1 = trap.cut.soon ? say.trapSoon : say.trap;
    return { ok: true, steps: [step(state, j, say1(j, trap.r, trap.cut.victim))] };
  }

  const pkg = packageAt(state, plan);
  if (pkg) {
    const steps: Step[] = [];
    let s = state;
    plan.slice(0, pkg.jumps).forEach((pj, i) => {
      const words =
        i === 0
          ? say.packageStart(pj, pkg)
          : i === pkg.jumps - 1
            ? say.packageEnd(pj, pkg)
            : say.packageNext(pj, pkg);
      steps.push(step(s, pj, words, i > 0));
      s = jumped(s, pj);
    });
    return { ok: true, steps };
  }

  const allowance = { left: ALLOWANCE };
  const verdicts = rivals.map((r) => judge(jumped(state, r), allowance, RIVAL_PROOF));
  const goods = rivals.filter((_, i) => verdicts[i] === "finishes");
  const lost = verdicts.includes("lost");
  const unsettled = verdicts.includes("unknown");
  // With nothing settled to contrast, a fact the player can see instead.
  // First, a peg alone now that this jump lands beside; then a rival that
  // would newly leave a peg with none beside it, where this jump would not.
  // Neither is a proof about winning, and the words do not claim one.
  const plain = (): Narration => {
    const now = new Set(alone(state));
    const mine = new Set(alone(jumped(state, j)));
    const joined = [...now].find((p) => !mine.has(p) && p !== j.from && p !== j.over);
    if (joined !== undefined) return say.joins(j, joined);
    const lone = rivals
      .map((r) => ({
        r,
        p: alone(jumped(state, r)).find(
          (p) =>
            !mine.has(p) && !now.has(p) && p !== r.to && state.grid[p] === GRID_PEG,
        ),
      }))
      .filter((x) => x.p !== undefined)
      .sort((a, b) => dist(a.r) - dist(b.r))[0];
    return lone?.p !== undefined ? say.leavesAlone(j, lone.r, lone.p) : say.plain(j);
  };
  let words: Narration;
  if (rivals.length === 0) words = plain();
  else if (!lost) words = unsettled ? plain() : say.anyJump(j);
  else if (!unsettled) words = goods.length > 0 ? say.onlyThese(j, goods) : say.only(j);
  else words = goods.length > 0 ? say.alsoThese(j, goods) : plain();
  return { ok: true, steps: [step(state, j, words)] };
}

/** The pegs of `s` with no peg in the four squares beside them. */
function alone(s: PegsState): number[] {
  const { w, h, grid } = s;
  const out: number[] = [];
  grid.forEach((v, i) => {
    if (v !== GRID_PEG) return;
    const x = i % w;
    const y = (i - x) / w;
    const peg = (dx: number, dy: number) =>
      x + dx >= 0 &&
      x + dx < w &&
      y + dy >= 0 &&
      y + dy < h &&
      grid[i + dy * w + dx] === GRID_PEG;
    if (!peg(1, 0) && !peg(-1, 0) && !peg(0, 1) && !peg(0, -1)) out.push(i);
  });
  return out;
}

/** A jump is settled by its two ends, so the step's own jump lands exactly the
 * board the plan expects; anything else drops the plan. */
export function hintKeepTrack(
  m: PegsMove,
  step: Step,
  _s: PegsState,
): HintTrackVerdict {
  const want = step.move;
  if (m.type !== "jump" || want.type !== "jump") return "off";
  return m.sx === want.sx && m.sy === want.sy && m.tx === want.tx && m.ty === want.ty
    ? "completed"
    : "off";
}
