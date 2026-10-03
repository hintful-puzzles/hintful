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
 *    some rival cannot;
 * 4. otherwise what the push does to the order the barrels go home in, which
 *    is what a player gets wrong: it fills a target that a barrel on another
 *    would wall off (`shutBy`), or it lets a barrel reach a target that could
 *    not while this one stood where it was (`clearedBy`);
 * 5. otherwise a barrel's run of pushes onto a target is one journey
 *    (`runHome`).
 *
 * A request plans one push, or one barrel's run, and the next request plans
 * from wherever the player is, so what a step says is about the board on
 * display. The walk to the push is part of the step: its gesture walks the
 * player there and pushes, and walking on the way keeps the step.
 *
 * **What keeps the plans from cycling.** The search is best-first, not
 * shortest, so the line found after a push need not be the rest of the line
 * found before it, and following first pushes alone has cycled twice: a barrel
 * pushed up and then back down for ever (`judge-rivals-for-search-hints`
 * design D3), and one pushed right and then back left
 * (`teach-sokoban-push-order` design D1). Two rules answer them. The offered
 * push is one after which the search's line is shorter than the plan's, where
 * any push is: the plan's length is then a potential the hinted push lowers.
 * And a line found after a push that comes straight back through this
 * position hands this position its remainder (`planAt`), which is what the
 * second cycle was. Where no push lowers the plan's length the plan's own
 * first push is offered, and nothing proves the walk from there: it has been
 * measured, not shown (`sokoban-hint.test.ts`, "following the hint").
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { markedDeadEnd, SEARCH_OUT_OF_REACH } from "../../engine/hint-refusal.ts";
import { phrase, type Sentence } from "../../engine/hint-words.ts";
import { judgeRivals, type Verdict } from "../../engine/rival-judging.ts";
import { NO_SOLUTION_FROM_HERE } from "../../engine/solve-failure.ts";
import { LONGEST_RUN, type Stuck, say, stuckBarrel } from "./hint-text.ts";
import {
  DIRS,
  type Finish,
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
} from "./state.ts";

type Step = HintStep<SokobanMove>;

/** Positions the rivals' searches of one request may generate between them,
 * and one rival's alone. Past either a rival is unsettled and the step claims
 * nothing about it. */
const ALLOWANCE = 200_000;
const RIVAL_PROOF = 20_000;

/** How many times more of the board a push must open to the player for the
 * hint to say it lets them out: enough that "boxed in" is plainly true of where
 * they were. */
const FREED = 4;

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
function planFrom(board: SokobanBoard, p: Position): Finish {
  return searchFrom(board, p, PLAN_BUDGET, { left: Number.POSITIVE_INFINITY });
}

/**
 * The plan from `here`: the search's line, and the line it finds after that
 * line's first push. A line found after a push that opens by undoing the push
 * passes back through `here`, so the rest of it is a line from `here` too, and
 * where that is the shorter one it is the plan.
 */
function planAt(
  board: SokobanBoard,
  here: Position,
): Finish | { kind: "plan"; line: readonly Push[]; next: Finish } {
  const found = planFrom(board, here);
  if (found.kind !== "found" || found.pushes.length === 0) return found;
  const home = board.key(here);
  let line = found.pushes;
  for (;;) {
    const after = board.apply(here, line[0]);
    const next = planFrom(board, after);
    const back =
      next.kind === "found" &&
      next.pushes.length > 1 &&
      next.pushes.length - 1 < line.length &&
      board.key(board.apply(after, next.pushes[0])) === home;
    if (!back) return { kind: "plan", line, next };
    line = next.pushes.slice(1);
  }
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

  const plan = planAt(board, here);
  if (plan.kind === "lost") return { ok: false, error: NO_SOLUTION_FROM_HERE };
  if (plan.kind !== "plan") return { ok: false, error: SEARCH_OUT_OF_REACH };
  const length = plan.line.length;
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
  let offered = plan.line[0];
  const { next } = plan;
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

  const words = (): Sentence | null => {
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
    // With nothing settled to contrast, what the push does to the order the
    // barrels can go home in, then what it does where the board shows it: a
    // barrel onto a target, or a player let out of a corner of the board
    // barrels had shut them into (owner, 2026-10-03, on a push the hint
    // offered with no reason given).
    const to = into(board, m);
    const after = board.apply(here, m);
    if (board.target[to]) {
      const later = shutBy(board, here, to);
      if (later !== null) return say.fillFirst(m, later);
    }
    const frees = board.region(after).length >= FREED * board.region(here).length;
    if (!frees) {
      const blocked = clearedBy(board, here, after, m.barrel);
      if (blocked !== null) return say.clearsWay(m, blocked);
    }
    if (board.target[to]) return say.onTarget(m);
    if (frees) return say.freesYou(m);
    return null;
  };

  const step = (p: Push, w: Sentence, continues = false): Step => ({
    move: pushMove(state.w, p),
    explanation: w.text,
    words: w,
    ...(continues ? { continuesPrevious: true } : {}),
  });
  const w = words();
  if (w) return { ok: true, steps: [step(offered, w)] };
  // Nothing to say of the push alone. Where the plan goes on pushing this
  // barrel until it stands on a target, the run is told as one journey.
  const run = offered === plan.line[0] ? runHome(board, here, plan.line, next) : null;
  if (!run) return { ok: true, steps: [step(offered, say.plain(offered))] };
  return {
    ok: true,
    steps: run.map((p, i) =>
      i === 0
        ? step(p, say.runFirst(p, run.length))
        : step(p, i < run.length - 1 ? say.runNext(p) : say.runLast(p), true),
    ),
  };
}

/**
 * An empty target that would shut `target` off: with a barrel standing on it,
 * no barrel could be pushed onto `target` from any square, even with the rest
 * of the board empty. Only where every target has to be filled, so that one
 * will be.
 */
function shutBy(board: SokobanBoard, p: Position, target: number): number | null {
  if (!board.exact) return null;
  for (let x = 0; x < board.n; x++) {
    if (x === target || !board.target[x] || p.barrels[x]) continue;
    const from = board.pushDistances(target, "to", x);
    if (from.every((d, c) => c === target || d < 0)) return x;
  }
  return null;
}

/**
 * A barrel off its target that the barrel at `a` stands in the way of: it
 * cannot be pushed to an empty target while the others stand where they are
 * in `here`, could with that barrel lifted off the board, and can in `after`,
 * the push made. The nearest such barrel, or null.
 */
function clearedBy(
  board: SokobanBoard,
  here: Position,
  after: Position,
  a: number,
): number | null {
  if (!board.tight) return null;
  const home = (p: Position, b: number): boolean => {
    const reached = board.routes(p, b);
    return reached.some((r, c) => r === 1 && board.target[c] === 1 && !p.barrels[c]);
  };
  const lifted: Position = { ...here, barrels: here.barrels.slice() };
  lifted.barrels[a] = 0;
  const { w } = board;
  const far = (b: number) =>
    Math.abs((b % w) - (a % w)) + Math.abs(Math.floor(b / w) - Math.floor(a / w));
  const others: number[] = [];
  for (let b = 0; b < board.n; b++)
    if (here.barrels[b] && !board.target[b] && b !== a) others.push(b);
  others.sort((x, y) => far(x) - far(y) || x - y);
  return (
    others.find((b) => !home(here, b) && home(lifted, b) && home(after, b)) ?? null
  );
}

/**
 * The pushes `line` opens with that take one barrel to a target, when there
 * are at least two and each lowers the potential: the line the search finds
 * after it is shorter than the one before. `next` is the line after the first.
 */
function runHome(
  board: SokobanBoard,
  here: Position,
  line: readonly Push[],
  next: Finish,
): readonly Push[] | null {
  let at = line[0].barrel;
  let p = here;
  let length = line.length;
  for (let i = 0; i < line.length && i < LONGEST_RUN; i++) {
    if (line[i].barrel !== at) return null;
    p = board.apply(p, line[i]);
    at = into(board, line[i]);
    const found = i === 0 ? next : planFrom(board, p);
    if (found.kind !== "found" || found.pushes.length >= length) return null;
    length = found.pushes.length;
    if (board.target[at]) return i > 0 ? line.slice(0, i + 1) : null;
  }
  return null;
}

/** A solver's push as the game's move. */
export function pushMove(w: number, p: Push): SokobanPush {
  return {
    type: "push",
    x: p.barrel % w,
    y: Math.floor(p.barrel / w),
    ...DIRS[p.dir],
    n: 1,
  };
}

/**
 * Walking keeps the step, since it changes no barrel and so neither the push
 * nor what was said about its rivals: a tap's walk, or a key's step that
 * pushes nothing. The push itself completes it, made by a drag or by a key;
 * any other push drops it, a longer one included, since the step was judged
 * one square at a time.
 */
export function hintKeepTrack(
  m: SokobanMove,
  step: Step,
  s: SokobanState,
): HintTrackVerdict {
  const want = step.move;
  if (want.type !== "push") return "off";
  if (m.type === "walk") return "onTrack";
  if (m.type === "push") {
    const same =
      m.x === want.x &&
      m.y === want.y &&
      m.dx === want.dx &&
      m.dy === want.dy &&
      m.n === want.n;
    return same ? "completed" : "off";
  }
  if (m.type !== "move") return "off";
  const kind = moveType(s, m.dx, m.dy);
  if (kind === "walk") return "onTrack";
  if (kind !== "push") return "off";
  const same =
    s.px + m.dx === want.x &&
    s.py + m.dy === want.y &&
    m.dx === want.dx &&
    m.dy === want.dy;
  return same && want.n === 1 ? "completed" : "off";
}
