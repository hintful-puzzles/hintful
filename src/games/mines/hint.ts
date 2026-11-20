/**
 * Mines' hint: the compiled ladder's firings (`solver.ts`), played from the
 * player's board, each spoken as a step of `mines.description.yaml`.
 *
 * **Every word that points at the board is a reference to its mark**: the
 * squares a step decides are ringed; the numbers it reasons from, and the
 * mines they already touch, are outlined; and the one set of squares the
 * reasoning treats as a whole (the squares two numbers share, a number's
 * squares beyond another's, the squares a count covers) is striped.
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
 * mine only once a deduction proves one under it (`solver.ts`). Every mine a
 * sentence cites was proved, and flagged by an earlier step of the same plan if
 * the player had not flagged it already.
 */

import { apartByPosition } from "../../engine/apart-by-position.ts";
import type {
  HintResult,
  HintStep,
  HintTrackVerdict,
} from "../../engine/contract/game.ts";
import {
  DEDUCTION_EXHAUSTED,
  puzzleDeadEnd,
} from "../../engine/contract/hint-refusal.ts";
import {
  CELL,
  Narration,
  type Sentence,
  so,
} from "../../engine/contract/hint-words.ts";
import type { Point } from "../../engine/contract/types.ts";
import type { Said, StepClause } from "../../engine/step-voice.ts";
import * as mines from "../../generated/games/mines/mines.compiled.ts";
import { firstOpen } from "./generator.ts";
import {
  type Firing,
  type Group,
  minesWalk,
  type Region,
  type Shown,
  type Side,
} from "./solver.ts";
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

/** What a step rests on: the two openings no number decides, then
 * the ladder's (`solver.ts`). The legs of one firing share its rung. */
export const MINES_RUNGS = [
  "firstClick",
  "satisfied",
  "full",
  "pair",
  "count",
] as const;
export type MinesRung = (typeof MINES_RUNGS)[number];

type Step = HintStep<MinesMove, MinesHint, MinesRung>;
/** A step as following it reads one: whatever its rung. */
type AnyStep = HintStep<MinesMove, MinesHint>;
type Execute = (s: MinesState, m: MinesMove) => MinesState;

/** Said on a board whose last move opened a mine. */
export const DEAD_BOARD = puzzleDeadEnd(
  "You opened a mine. Undo that move to carry on from just before it.",
);

const isOpened = (v: number): boolean => v >= 0 && v <= 8;

/** What `s` shows the ladder: each opened square's number. */
const shownOf = (s: MinesState): Shown => ({
  w: s.w,
  h: s.h,
  n: s.n,
  numbers: Array.from(s.grid, (v) => (isOpened(v) ? v : -1)),
});
const opOf = (kind: MinesHint["kind"]): MineOp["op"] => (kind === "open" ? "O" : "F");

function stepFor(
  rung: MinesRung,
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
    rung,
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

type Steps = mines.StepsById<Point>;
type Clause<K extends keyof Steps> = StepClause<Steps, K, Point>;
/** A leg's sentence, by the squares it rings. */
type Speak = (ring: readonly Point[]) => Sentence;

/** The sentence for each leg of one firing: the first carries the reason, and
 * the others say what follows from it. */
function narrate(board: MinesState, f: Firing, legs: readonly Leg[]): Sentence[] {
  const { w } = board;
  const pt = (i: number): Point => ({ x: i % w, y: Math.floor(i / w) });
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
  const apart = apartByPosition(named, pt, (i) => String(board.grid[i]));
  /** A number term is the number's square. Where two share a value, their
   * places tell them apart and the outline says which square each is: "the
   * lower 3", not "the lower outlined 3". */
  const speak = mines.voice<Point>({
    kind: CELL,
    value: (i) => {
      const name = apart(i);
      return name === String(board.grid[i]) ? `outlined ${name}` : name;
    },
  });

  let lead: Speak;
  /** What a leg after the first rests on, when the firing proves both kinds
   * (a pair's split): the light side's mines are in the shared squares. */
  let then: Speak | null = null;

  switch (f.rung) {
    case "satisfied": {
      const c = f.group.clue;
      lead = (ring) =>
        speak.sentence("satisfied", {
          ring,
          terms: { c, v: board.grid[c] },
          marks: { outline: { clue: [pt(c)], found: pts(f.group.mines) } },
        });
      break;
    }
    case "full": {
      const c = f.group.clue;
      lead = (ring) =>
        speak.sentence("full", {
          ring,
          terms: { c, n: f.group.cells.length, more: f.group.mines.length > 0 },
          marks: { outline: { clue: [pt(c)] } },
        });
      break;
    }
    case "pair": {
      const regionSides = [f.heavy, f.light].flatMap((s) =>
        "region" in s ? [s.region] : [],
      );
      // The first region is the one the sentence stripes.
      const marked = regionSides[0] ?? null;
      const both = regionSides.length === 0;
      const sharedPts = pts(f.shared);
      const sharedOne = sharedPts.length === 1;
      const prefix = regionSides.map((r) => {
        const striped = r === marked;
        return speak.premise("regionBefore", {
          terms: { o: r.outer.clue, i: r.inner.clue, n: r.need, striped },
          marks: {
            outline: { outer: [pt(r.outer.clue)], inner: [pt(r.inner.clue)] },
            stripes: { region: striped ? pts(r.cells) : [] },
          },
        });
      });
      const numberSaid = (g: Group) => ({
        terms: { c: g.clue, n: g.need, more: g.mines.length > 0 },
        marks: { outline: { clue: [pt(g.clue)] } },
      });
      const regionSaid = (r: Region) => {
        const striped = r === marked;
        return {
          terms: {
            o: r.outer.clue,
            i: r.inner.clue,
            n: r.need,
            striped,
            one: striped && r.cells.length === 1,
          },
          marks: {
            outline: striped
              ? { outer: [], inner: [] }
              : { outer: [pt(r.outer.clue)], inner: [pt(r.inner.clue)] },
            stripes: { region: striped ? pts(r.cells) : [] },
          },
        };
      };
      const needs = (s: Side): Clause<"numberNeeds" | "regionNeeds"> =>
        "group" in s
          ? { step: "numberNeeds", said: numberSaid(s.group) }
          : { step: "regionNeeds", said: regionSaid(s.region) };
      const allows = (s: Side): Clause<"numberAllows" | "regionAllows"> =>
        "group" in s
          ? { step: "numberAllows", said: numberSaid(s.group) }
          : { step: "regionAllows", said: regionSaid(s.region) };
      const minesOf = (s: Side): Clause<"numberMines" | "regionMines"> =>
        "group" in s
          ? { step: "numberMines", said: numberSaid(s.group) }
          : { step: "regionMines", said: regionSaid(s.region) };
      // The inner side's own squares are striped where both sides are
      // numbers: they are all shared.
      const own = (s: Side): Clause<"numberOwn" | "regionOwn"> =>
        "group" in s
          ? {
              step: "numberOwn",
              said: {
                terms: { c: s.group.clue, striped: both, sharedOne },
                marks: {
                  outline: { clue: [pt(s.group.clue)] },
                  stripes: { shared: both ? sharedPts : [] },
                },
              },
            }
          : { step: "regionOwn", said: regionSaid(s.region) };
      // How `inner`'s squares lie inside `s`'s. Only a striped region can
      // be a lone square: a number with one unopened square is decided on
      // its own before any pair is read.
      const around = (
        s: Side,
        inner: Side,
      ): Clause<"numberAround" | "regionAround"> => {
        const lone = "region" in inner && regionSaid(inner.region).terms.one;
        if ("group" in s)
          return {
            step: "numberAround",
            said: { ...numberSaid(s.group), terms: { c: s.group.clue, lone } },
          };
        const r = regionSaid(s.region);
        return { step: "regionAround", said: { ...r, terms: { ...r.terms, lone } } };
      };
      const shared = { both, sharedOne };
      const sharedMarks = { stripes: { shared: both ? sharedPts : [] } };
      /** A pair's sentence, after the sentences saying what its regions hold. */
      const said = <K extends "split" | "splitSafe" | "same" | "more">(
        id: K,
        s: Said<Steps[K], Point>,
      ): Speak => {
        // Every pair step rings squares of one sort, which TypeScript cannot
        // see through the generic `K`.
        const at = (ring: readonly Point[]) =>
          ({ ...s, ring }) as Said<Steps[K], Point>;
        return prefix.length === 0
          ? (ring) => speak.sentence(id, at(ring))
          : (ring) =>
              so({
                look: Narration.join([
                  ...prefix.flatMap((p) => [p, ". "]),
                  speak.premise(id, at(ring)),
                ]),
                move: speak.part(id, "move", at(ring)),
              });
      };
      const lightNeed = "group" in f.light ? f.light.group.need : f.light.region.need;
      if (f.mines.length > 0 && f.safes.length > 0) {
        lead =
          legs[0]?.kind === "flag"
            ? said("split", {
                terms: {
                  heavy: needs(f.heavy),
                  light: allows(f.light),
                  n: lightNeed,
                  ...shared,
                },
                marks: sharedMarks,
              })
            : said("splitSafe", {
                terms: { heavy: needs(f.heavy), light: minesOf(f.light), ...shared },
                marks: sharedMarks,
              });
        const light = minesOf(f.light);
        then = (ring) =>
          speak.sentence("splitThen", {
            ring,
            terms: { light, ...shared },
            marks: sharedMarks,
          });
      } else if (f.mines.length === 0) {
        lead = said("same", {
          terms: { inner: own(f.heavy), outer: around(f.light, f.heavy), n: lightNeed },
        });
      } else {
        lead = said("more", {
          terms: { outer: needs(f.heavy), inner: own(f.light), n: lightNeed },
        });
      }
      break;
    }
    case "count": {
      if (f.members.length === 0) {
        lead =
          f.safes.length > 0
            ? (ring) => speak.sentence("allFound", { ring, terms: { total: f.total } })
            : (ring) => speak.sentence("allMines", { ring, terms: { left: f.left } });
        break;
      }
      const need = f.members.reduce((sum, m) => sum + m.group.need, 0);
      const marks = {
        outline: { numbers: f.members.map((m) => pt(m.group.clue)) },
        stripes: { counted: pts(f.counted) },
      };
      const one = f.counted.length === 1;
      lead =
        f.safes.length > 0
          ? (ring) =>
              speak.sentence("outsideSafe", {
                ring,
                terms: { left: f.left, one },
                marks,
              })
          : (ring) =>
              speak.sentence("outsideMines", {
                ring,
                terms: { left: f.left, need, one },
                marks,
              });
      break;
    }
  }

  return legs.map((leg, i) => (i === 0 ? lead : (then ?? lead))(leg.targets));
}

/** The hint plan from `state`, or the reason there is none. `execute` is the
 * game's own `executeMove`, which the plan plays its steps through. */
export function minesHint(
  state: MinesState,
  execute: Execute,
): HintResult<MinesMove, MinesHint, MinesRung> {
  if (state.dead) return { ok: false, error: DEAD_BOARD };
  const { w, h } = state;

  // No board yet: the first square opened is laid out to be safe.
  if (!state.mines) {
    const at = { x: w >> 1, y: h >> 1 };
    const words = mines
      .voice<Point>({ kind: CELL, value: String })
      .sentence("firstClick", { ring: [at] });
    const step = stepFor("firstClick", "open", [at], words, false);
    return { ok: true, steps: [{ ...step, move: firstOpen(state, at) }] };
  }

  const steps: Step[] = [];
  let board = cloneState(state);
  const walk = minesWalk(shownOf(board));
  for (let guard = 0; guard < 2 * w * h && !isWon(board); guard++) {
    const f = walk.next();
    if (f === null) break;
    const legs = legsOf(board, f, execute);
    if (legs.length === 0) continue;
    const sentences = narrate(board, f, legs);
    legs.forEach((leg, i) => {
      const step = stepFor(f.rung, leg.kind, leg.targets, sentences[i], i > 0);
      steps.push(step);
      board = execute(board, step.move);
    });
    // The squares it opened show their numbers, which the next firing reads.
    walk.reveal(shownOf(board));
  }
  // Reached only on a board the ladder cannot finish, which loading turns
  // away (`finishesByDeduction`) and the generator never deals: it certifies
  // each board on this ladder (`solver.ts`).
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
function narrowed<S extends AnyStep>(step: S, left: readonly Point[]): S {
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
  step: AnyStep,
  state: MinesState,
  execute: Execute,
): HintTrackVerdict {
  const hl = step.highlights;
  if (!hl || m.type === "solve") return "off";
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
export function minesRefreshHintStep<S extends AnyStep>(
  step: S,
  state: MinesState,
): S | null {
  const hl = step.highlights;
  if (!hl) return step;
  const left = hl.targets.filter((t) => !holds(state, hl.kind, t));
  if (left.length === 0) return null;
  if (left.length === hl.targets.length) return step;
  return narrowed(step, left);
}
