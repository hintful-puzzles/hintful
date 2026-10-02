/**
 * Mines' hint: the deductions of `deduce.ts`, played from the player's board
 * and narrated by `hint-text.ts`.
 *
 * **The plan is the board's own proof, step by step.** Each firing proves some
 * squares mines and some safe; a step flags the mines not yet flagged and opens
 * the safe squares. Opening reveals numbers, so the plan plays each step on a
 * scratch copy before looking for the next deduction, and a later step can
 * reason from a number an earlier one uncovered. A firing that changes nothing
 * on the board (its mines already flagged) is not shown, but what it proved is
 * kept.
 *
 * **A flag is not a premise until a deduction proves it.** The midend asks only
 * about a board whose flags all sit on mines (`findMistakes`), but a flag
 * placed by a lucky guess is not something the numbers show, so it counts as a
 * mine only once a deduction proves one under it (`deduce.ts`). Every mine a
 * sentence cites was proved, and flagged by an earlier step of the same plan if
 * the player had not flagged it already.
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { DEDUCTION_EXHAUSTED, puzzleDeadEnd } from "../../engine/hint-refusal.ts";
import { CELL, mark, Narration, type Sentence } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { type Firing, learn, nextFiring, type Side } from "./deduce.ts";
import {
  after,
  type Clue,
  conclude,
  numberSide,
  type Premise,
  regionSide,
  type SideWords,
  say,
  sayCount,
  sayPair,
  sayRegion,
  Words,
} from "./hint-text.ts";
import {
  COVERED,
  cloneState,
  FLAG,
  isWon,
  type MineOp,
  type MinesMove,
  type MinesState,
} from "./state.ts";

/** What a step does to its ringed squares. */
export interface MinesHint {
  readonly kind: "open" | "flag";
  readonly targets: readonly Point[];
}

type Step = HintStep<MinesMove, MinesHint>;
type Execute = (s: MinesState, m: MinesMove) => MinesState;

/** Said on a board whose last move opened a mine. */
export const DEAD_BOARD = puzzleDeadEnd(
  "You opened a mine. Undo that move to carry on from just before it.",
);

const isOpened = (v: number): boolean => v >= 0 && v <= 8;
const opOf = (kind: MinesHint["kind"]): MineOp["op"] => (kind === "open" ? "O" : "F");

function stepFor(
  kind: MinesHint["kind"],
  targets: readonly Point[],
  words: Sentence,
  continuesPrevious: boolean,
): Step {
  return {
    move: {
      type: "ops",
      ops: targets.map((t) => ({ op: opOf(kind), x: t.x, y: t.y })),
    },
    explanation: words.text,
    words,
    highlights: { kind, targets },
    ...(continuesPrevious ? { continuesPrevious: true } : {}),
  };
}

interface Leg {
  readonly kind: MinesHint["kind"];
  readonly targets: Point[];
}

/** The moves a firing asks of the board as it stands: flags for the mines not
 * flagged yet, then the safe squares opened, leaving out any that an earlier
 * one's flood will have opened already. No flag sits on a safe square: the
 * midend refuses a hint while one does. */
function legsOf(board: MinesState, f: Firing, execute: Execute): Leg[] {
  const { w } = board;
  const pt = (i: number): Point => ({ x: i % w, y: Math.floor(i / w) });
  const mines = f.rung === "satisfied" ? [] : f.mines;
  const safes = f.rung === "full" ? [] : f.safes;
  const flag = mines.filter((i) => board.grid[i] === COVERED);
  let scratch = board;
  const open: number[] = [];
  for (const i of safes) {
    if (scratch.grid[i] !== COVERED) continue;
    open.push(i);
    scratch = execute(scratch, { type: "ops", ops: [{ op: "O", ...pt(i) }] });
  }
  const legs: Leg[] = [];
  if (flag.length > 0) legs.push({ kind: "flag", targets: flag.map(pt) });
  if (open.length > 0) legs.push({ kind: "open", targets: open.map(pt) });
  return legs;
}

/** The sentence for each leg of one firing: the first carries the reason, and
 * the others say what follows from it. */
function narrate(board: MinesState, f: Firing, legs: readonly Leg[]): Sentence[] {
  const { w } = board;
  const pt = (i: number): Point => ({ x: i % w, y: Math.floor(i / w) });
  const clueOf = (i: number): Clue => ({ at: pt(i), value: board.grid[i] });
  const pts = (cells: readonly number[]): Point[] => cells.map(pt);

  // Every number the sentence will name, so two of one value are told apart.
  const named: number[] = [];
  const nameSide = (s: Side): void => {
    if ("group" in s) named.push(s.group.clue);
    else named.push(s.region.outer.clue, s.region.inner.clue);
  };
  if (f.rung === "satisfied" || f.rung === "full") named.push(f.group.clue);
  if (f.rung === "pair") {
    nameSide(f.heavy);
    nameSide(f.light);
  }
  if (f.rung === "count") for (const m of f.members) nameSide(m);
  const words = new Words(named.map(clueOf));

  let lead: Premise;
  /** The premise a leg after the first rests on, when the firing proves both
   * kinds (rung 2's split): the light side's mines are in the shared squares. */
  let then: Premise | null = null;

  switch (f.rung) {
    case "satisfied":
      lead = say.satisfied(words, clueOf(f.group.clue), pts(f.group.mines));
      break;
    case "full":
      lead = say.full(
        words,
        clueOf(f.group.clue),
        f.group.mines.length > 0,
        f.group.cells.length,
      );
      break;
    case "pair": {
      const regionSides = [f.heavy, f.light].filter((s) => "region" in s);
      const markedRegion = regionSides[0] ?? null;
      const prefix: Narration[] = [];
      for (const s of regionSides)
        if ("region" in s)
          prefix.push(
            sayRegion(
              words,
              clueOf(s.region.outer.clue),
              clueOf(s.region.inner.clue),
              s === markedRegion ? pts(s.region.cells) : null,
              s.region.need,
            ),
          );
      const bothNumbers = regionSides.length === 0;
      const sharedPts = pts(f.shared);
      const shared: Narration = bothNumbers
        ? mark.as("stripes", CELL, sharedPts, (els) =>
            els.length === 1 ? "the striped square" : "the striped squares",
          )
        : Narration.plain("the squares they share");
      const sideWords = (s: Side, inner: boolean): SideWords =>
        "group" in s
          ? numberSide(
              words,
              clueOf(s.group.clue),
              s.group.need,
              s.group.mines.length > 0,
              inner && bothNumbers ? sharedPts : null,
            )
          : regionSide(
              words,
              clueOf(s.region.outer.clue),
              clueOf(s.region.inner.clue),
              pts(s.region.cells),
              s.region.need,
              s === markedRegion,
            );
      const lightNeed = "group" in f.light ? f.light.group.need : f.light.region.need;
      if (f.mines.length > 0 && f.safes.length > 0) {
        const heavy = sideWords(f.heavy, false);
        const light = sideWords(f.light, false);
        const flagsFirst = legs[0]?.kind === "flag";
        lead = after(
          prefix,
          flagsFirst
            ? sayPair.split(heavy, light, lightNeed, shared)
            : sayPair.splitSafeOnly(heavy, light, lightNeed, shared),
        );
        then = sayPair.splitThen(light, lightNeed, shared);
      } else if (f.mines.length === 0) {
        lead = after(
          prefix,
          sayPair.same(sideWords(f.heavy, true), sideWords(f.light, false), lightNeed),
        );
      } else {
        lead = after(
          prefix,
          sayPair.more(sideWords(f.light, true), sideWords(f.heavy, false), lightNeed),
        );
      }
      break;
    }
    case "count": {
      if (f.members.length === 0) {
        lead =
          f.safes.length > 0 ? sayCount.allFound(f.total) : sayCount.allMines(f.left);
        break;
      }
      const prefix: Narration[] = [];
      const numberCells: Point[] = [];
      let need = 0;
      for (const m of f.members) {
        if ("group" in m) {
          numberCells.push(pt(m.group.clue));
          need += m.group.need;
        } else {
          prefix.push(
            sayRegion(
              words,
              clueOf(m.region.outer.clue),
              clueOf(m.region.inner.clue),
              null,
              m.region.need,
            ),
          );
          numberCells.push(pt(m.region.outer.clue));
          need += m.region.need;
        }
      }
      const numbers = mark.as("outline", CELL, numberCells, (els) =>
        els.length === 1 ? "the outlined number" : "the outlined numbers",
      );
      const counted = mark.as("stripes", CELL, pts(f.counted), (els) =>
        els.length === 1 ? "the striped square" : "the striped squares",
      );
      lead = after(
        prefix,
        f.safes.length > 0
          ? sayCount.outsideSafe(f.left, numberCells.length, numbers, counted)
          : sayCount.outsideMines(f.left, need, numberCells.length, numbers, counted),
      );
      break;
    }
  }

  return legs.map((leg, i) =>
    conclude.plain(
      i === 0 ? lead : (then ?? lead),
      leg.targets,
      leg.kind === "flag" ? "mine" : "safe",
    ),
  );
}

/** The hint plan from `state`, or the reason there is none. `execute` is the
 * game's own `executeMove`, which the plan plays its steps through. */
export function minesHint(
  state: MinesState,
  execute: Execute,
): HintResult<MinesMove, MinesHint> {
  if (state.dead) return { ok: false, error: DEAD_BOARD };
  const { w, h, layout } = state;

  // No board yet: the first square opened is laid out to be safe.
  if (!layout.mines) {
    const at = { x: w >> 1, y: h >> 1 };
    return { ok: true, steps: [stepFor("open", [at], say.firstClick(at), false)] };
  }
  // Undone back to the start of a laid-out board: its first square is safe.
  if (!state.grid.some(isOpened)) {
    const at = { x: layout.startx, y: layout.starty };
    return { ok: true, steps: [stepFor("open", [at], say.restart(at), false)] };
  }

  const known = new Int8Array(w * h);
  const steps: Step[] = [];
  let board = cloneState(state);
  for (let guard = 0; guard < 2 * w * h && !isWon(board); guard++) {
    const f = nextFiring(board, known);
    if (f === null) break;
    learn(known, f);
    const legs = legsOf(board, f, execute);
    if (legs.length === 0) continue;
    const sentences = narrate(board, f, legs);
    legs.forEach((leg, i) => {
      const step = stepFor(leg.kind, leg.targets, sentences[i], i > 0);
      steps.push(step);
      board = execute(board, step.move);
    });
  }
  // Only a board dealt without "Ensure solubility" runs out of deductions.
  if (steps.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  return { ok: true, steps };
}

// --- following a step ---------------------------------------------------

/** Whether `target` holds what the step asks of it. */
function holds(s: MinesState, kind: MinesHint["kind"], t: Point): boolean {
  const v = s.grid[t.y * s.w + t.x];
  if (kind === "flag") return v === FLAG;
  return isOpened(v);
}

/** `step` shrunk to the targets `left`, its words narrowed to match. */
function narrowed(step: Step, left: readonly Point[]): Step {
  const hl = step.highlights as MinesHint;
  const kept = new Set(left.map((p) => CELL.key(p)));
  const words = step.words?.narrow(
    (role, _kind, key) => role !== "ring" || kept.has(key),
  );
  return {
    ...step,
    move: {
      type: "ops",
      ops: left.map((t) => ({ op: opOf(hl.kind), x: t.x, y: t.y })),
    },
    highlights: { kind: hl.kind, targets: left },
    ...(words ? { words, explanation: words.text } : {}),
  };
}

/**
 * Judge a player's move against the step by what it did to the board: every
 * square it changed must have gone the step's way. An open's flood is the one
 * exception, since it opens squares no click names: an open step accepts any
 * squares opened safely alongside a target it asked for.
 */
export function minesHintKeepTrack(
  m: MinesMove,
  step: Step,
  state: MinesState,
  execute: Execute,
): HintTrackVerdict {
  const hl = step.highlights;
  if (!hl || m.type !== "ops") return "off";
  const after = execute(state, m);
  if (after.dead) return "off";
  const targets = new Set(hl.targets.map((t) => t.y * state.w + t.x));
  // A win flags every mine still covered, which the plan may not have proved.
  const won = isWon(after);
  let hitTarget = false;
  for (let i = 0; i < state.grid.length; i++) {
    const before = state.grid[i];
    const now = after.grid[i];
    if (before === now) continue;
    if (targets.has(i)) {
      const t = { x: i % state.w, y: Math.floor(i / state.w) };
      if (!holds(after, hl.kind, t)) return "off";
      hitTarget = true;
    } else if (!(hl.kind === "open" && isOpened(now)) && !(won && now === FLAG)) {
      return "off";
    }
  }
  if (!hitTarget) return "off";
  const left = hl.targets.filter((t) => !holds(after, hl.kind, t));
  if (left.length === 0) return "completed";
  Object.assign(step, narrowed(step, left));
  return "onTrack";
}

/** Drop the targets the board already shows done; `null` once none is left. */
export function minesRefreshHintStep(step: Step, state: MinesState): Step | null {
  const hl = step.highlights;
  if (!hl) return step;
  const left = hl.targets.filter((t) => !holds(state, hl.kind, t));
  if (left.length === 0) return null;
  if (left.length === hl.targets.length) return step;
  return narrowed(step, left);
}
