/**
 * Sokoban's hint.
 *
 * Sokoban is a search game: no push is forced by logic, so the hint is the
 * non-deductive kind (docs/games/hints.md § "Non-deductive (heuristic)
 * hints"). It finds a line of pushes that finishes and offers one push, set
 * against the other pushes the player could walk to and make, which is what a
 * player has to learn to tell apart:
 *
 * 1. a barrel already stuck for good off every target ends the game, and is
 *    outlined as the reason to undo;
 * 2. a rival push that would leave a barrel stuck for good (in a corner, on a
 *    square no target can be reached from, or jammed) is a reason the player
 *    can see, so it leads;
 * 3. otherwise the rivals are searched, within an allowance per request
 *    (`judgeRivals`), and the pushes that can still finish are shown where
 *    some rival cannot.
 *
 * A request plans one push, and the next request plans from wherever the
 * player is, so what a step says about its rivals is about the board on
 * display. The walk to the push is part of the step: its gesture walks the
 * player there and pushes, and walking on the way keeps the step.
 *
 * **Why the plans cannot cycle.** The search is best-first, not shortest, so
 * the line found after a push need not be the rest of the line found before it,
 * and following first pushes alone once pushed a barrel up and then back down
 * for ever (`judge-rivals-for-search-hints` design D3). So the offered push is one after
 * which the search's line is shorter than it is now: the length of the line
 * the search finds is a potential every hinted push lowers, and walking lowers
 * the distance to the push without changing which push it is.
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { markedDeadEnd, SEARCH_OUT_OF_REACH } from "../../engine/hint-refusal.ts";
import { phrase, type Sentence } from "../../engine/hint-words.ts";
import { judgeRivals, type Verdict } from "../../engine/rival-judging.ts";
import { NO_SOLUTION_FROM_HERE } from "../../engine/solve-failure.ts";
import { type Stuck, say, stuckBarrel } from "./hint-text.ts";
import {
  DIRS,
  PLAN_BUDGET,
  type Position,
  type Push,
  SokobanBoard,
  searchFrom,
} from "./solver.ts";
import {
  moveType,
  type SokobanMove,
  type SokobanPush,
  type SokobanState,
  type SokobanStep,
} from "./state.ts";

type Step = HintStep<SokobanMove>;

/** Positions the rivals' searches of one request may generate between them,
 * and one rival's alone. Past either a rival is unsettled and the step claims
 * nothing about it. */
const ALLOWANCE = 200_000;
const RIVAL_PROOF = 20_000;

const same = (a: Push, b: Push) => a.barrel === b.barrel && a.dir === b.dir;
const keyOf = (p: Push) => `${p.barrel}>${p.dir}`;

/** The square a push moves its barrel into. */
const into = (board: SokobanBoard, p: Push) => board.step(p.barrel, p.dir);

/** Why the barrel at `c` is stuck, in the words' terms. */
function stuckWhy(board: SokobanBoard, p: Position, c: number): Stuck | null {
  const kind = board.stuckKind(p, c);
  if (kind === null) return null;
  return kind === "dead" && board.cornered(c) ? "corner" : kind;
}

/** The line of pushes from `p`, searched to the plan's budget alone, so that
 * its length is a function of the position. */
function planFrom(board: SokobanBoard, p: Position) {
  return searchFrom(board, p, PLAN_BUDGET, { left: Number.POSITIVE_INFINITY });
}

export function hint(state: SokobanState): HintResult<SokobanMove> {
  const board = new SokobanBoard(state);
  const here = board.positionOf(state);

  // Sokoban's one verdict a player can see at a glance: a barrel stuck for
  // good off every target, outlined so they can see which.
  for (const c of board.stuckBarrels(here)) {
    const why = stuckWhy(board, here, c);
    const it = stuckBarrel(c);
    if (why === "corner")
      return markedDeadEnd(
        phrase`${it.capitalized()} is wedged in a corner it can never leave. Undo until it is out.`,
      );
    if (why === "dead")
      return markedDeadEnd(
        phrase`No push can bring ${it} to a target. Undo until one can.`,
      );
    if (why === "frozen")
      return markedDeadEnd(
        phrase`${it.capitalized()} is jammed where it can never move again. Undo until it can.`,
      );
  }

  const plan = planFrom(board, here);
  if (plan.kind === "lost") return { ok: false, error: NO_SOLUTION_FROM_HERE };
  if (plan.kind === "out-of-reach" || plan.pushes.length === 0)
    return { ok: false, error: SEARCH_OUT_OF_REACH };
  const length = plan.pushes.length;
  const pushes = board.pushes(here);

  // What judging a rival found, by push, and how long the line after it is.
  const verdicts = new Map<string, Verdict>();
  const lengths = new Map<string, number>();
  const judge = (r: Push, allowance: { left: number }): Verdict => {
    const known = verdicts.get(keyOf(r));
    if (known) return known;
    const after = board.apply(here, r);
    let v: Verdict;
    if (board.stuck(after, into(board, r)) >= 0) v = "lost";
    else {
      const res = searchFrom(board, after, RIVAL_PROOF, allowance);
      if (res.kind === "found") lengths.set(keyOf(r), res.pushes.length);
      v = res.kind === "found" ? "finishes" : res.kind === "lost" ? "lost" : "unknown";
    }
    verdicts.set(keyOf(r), v);
    return v;
  };
  const rivalsOf = (m: Push) => pushes.filter((r) => !same(r, m));

  // The offered push lowers the potential: the plan's own first push where the
  // line after it is shorter, else the rival with the shortest such line.
  let offered = plan.pushes[0];
  const next = planFrom(board, board.apply(here, offered));
  if (length > 1 && (next.kind !== "found" || next.pushes.length >= length)) {
    const allowance = { left: ALLOWANCE };
    for (const r of rivalsOf(offered)) judge(r, allowance);
    const better = rivalsOf(offered)
      .filter((r) => (lengths.get(keyOf(r)) ?? length) < length)
      .sort((a, b) => (lengths.get(keyOf(a)) ?? 0) - (lengths.get(keyOf(b)) ?? 0))[0];
    if (better) {
      // The plan's own first push still finishes, by the rest of the plan.
      verdicts.set(keyOf(offered), "finishes");
      offered = better;
    }
  }

  const words = (): Sentence => {
    const m = offered;
    // The rivals are this barrel's other pushes: which way to push it is the
    // choice the step is about. Some other barrel's bad push is on almost
    // every board (measured: nine steps in ten), and judging every push drew
    // arrows all over a crowded board and taught nothing about this one
    // (`judge-rivals-for-search-hints` design D4).
    const rivals = rivalsOf(m).filter((r) => r.barrel === m.barrel);
    // A trap the player can see leads.
    const trap = rivals
      .map((r) => {
        const after = board.apply(here, r);
        const victim = board.stuck(after, into(board, r));
        const why = victim >= 0 ? stuckWhy(board, after, victim) : null;
        return { r, victim, why };
      })
      .find((t) => t.why !== null);
    if (trap?.why) {
      const own = trap.victim === into(board, trap.r);
      return say.trap(m, trap.r, trap.why, own ? null : trap.victim);
    }

    const c = judgeRivals(rivals, ALLOWANCE, judge).claim;
    if (c.kind === "only") return say.only(m, c.relation);
    if (c.kind === "onlyThese") return say.onlyThese(m, c.goods, c.relation);
    if (c.kind === "alsoThese") return say.alsoThese(m, c.goods, c.relation);
    // With nothing settled to contrast, what the push does, where the board
    // shows it.
    return board.target[into(board, m)] ? say.onTarget(m) : say.plain(m);
  };

  const w = words();
  return {
    ok: true,
    steps: [{ move: pushMove(state.w, offered), explanation: w.text, words: w }],
  };
}

/** A solver's push as the game's move. */
export function pushMove(w: number, p: Push): SokobanPush {
  return { type: "push", x: p.barrel % w, y: Math.floor(p.barrel / w), ...DIRS[p.dir] };
}

// --- walking to the push ---------------------------------------------------

/** The steps that walk the player from where `s` has them to the square behind
 * `push`'s barrel, fewest first, diagonals included, then the push. */
export function routeTo(s: SokobanState, push: SokobanPush): SokobanStep[] {
  const { w, h } = s;
  const { dx, dy } = push;
  const stand = (push.y - dy) * w + (push.x - dx);
  const start = s.py * w + s.px;
  const prev = new Int32Array(w * h).fill(-1);
  const step = new Array<SokobanStep | null>(w * h).fill(null);
  prev[start] = start;
  const queue = [start];
  // Orthogonal steps first, so a route takes a diagonal only where it saves
  // one.
  const moves = [
    [-1, 0],
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  for (let q = 0; q < queue.length && prev[stand] < 0; q++) {
    const c = queue[q];
    const at = { ...s, px: c % w, py: Math.floor(c / w) };
    for (const [mx, my] of moves) {
      if (moveType(at, mx, my) !== "walk") continue;
      const nc = (at.py + my) * w + at.px + mx;
      if (prev[nc] >= 0) continue;
      prev[nc] = c;
      step[nc] = { type: "move", dx: mx, dy: my };
      queue.push(nc);
    }
  }
  if (prev[stand] < 0)
    throw new Error("sokoban: a hinted push the player cannot walk to");
  const route: SokobanStep[] = [];
  for (let c = stand; c !== start; c = prev[c]) route.push(step[c] as SokobanStep);
  route.reverse();
  route.push({ type: "move", dx, dy });
  return route;
}

/**
 * Walking keeps the step, since it changes no barrel and so neither the push
 * nor what was said about its rivals. The push itself completes it; any other
 * push drops it.
 */
export function hintKeepTrack(
  m: SokobanMove,
  step: Step,
  s: SokobanState,
): HintTrackVerdict {
  const want = step.move;
  if (want.type !== "push" || m.type !== "move") return "off";
  const kind = moveType(s, m.dx, m.dy);
  if (kind === "walk") return "onTrack";
  if (kind !== "push") return "off";
  return s.px + m.dx === want.x &&
    s.py + m.dy === want.y &&
    m.dx === want.dx &&
    m.dy === want.dy
    ? "completed"
    : "off";
}
