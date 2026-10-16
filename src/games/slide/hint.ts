/**
 * Slide's hint.
 *
 * Slide is a search game: no slide is forced by logic, and every slide from a
 * solvable board can still finish, so the hint is the non-deductive kind
 * (docs/hints-search.md § "What every game does") and judges no rivals. It
 * finds a shortest line to the exit (`findExit`) and offers it a chain at a
 * time: the slides up to and including the key block's next one.
 *
 * Each slide says what it is for, read off the line itself: the first later
 * slide that could not be made if the squares this one leaves were still
 * filled (`roomFor`). In a shortest line there always is one, or the slide
 * could be left out. Nearly always it is the very next slide, so a chain reads
 * as one errand run backwards from the key block (`add-slide-hint` design
 * D2).
 *
 * What keeps recomputed plans from cycling: each hinted slide is the first of
 * a shortest line, so it lowers the distance to the exit by one, whatever line
 * the next request picks (docs/hints-search.md § "Recompute-stable plans").
 * A request from a board on the last line takes the rest of it (`lineFrom`).
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { searchRefusal, type Unfinished } from "../../engine/search-outcome.ts";
import type { Point } from "../../engine/types.ts";
import { type Slid, say } from "./hint-text.ts";
import { computeReachable, executeMove } from "./moves.ts";
import { findExit } from "./solver.ts";
import {
  EMPTY,
  isDist,
  MAINANCHOR,
  type SlideMove,
  type SlideState,
  type SlideStep,
  WALL,
} from "./state.ts";

/** What a step rests on, by what the line shows its slide is for. */
export const SLIDE_RUNGS = [
  "makesRoom",
  "makesRoomForKey",
  "movesOn",
  "keyBlock",
  "keyOut",
] as const;
export type SlideRung = (typeof SLIDE_RUNGS)[number];

type Step = HintStep<SlideMove, unknown, SlideRung>;

/** The squares of the block anchored at `anchor`, anchor first. */
export function blockCells(s: SlideState, anchor: number): number[] {
  const out = [anchor];
  const mine = new Set(out);
  for (let j = anchor + 1; j < s.w * s.h; j++)
    if (isDist(s.board[j]) && mine.has(j - s.board[j])) {
      out.push(j);
      mine.add(j);
    }
  return out;
}

const pointOf = (s: SlideState, i: number): Point => ({
  x: i % s.w,
  y: Math.floor(i / s.w),
});

/** Whether `m` can be made on `s` with the squares in `held` filled. */
function canSlide(s: SlideState, m: SlideStep, held: readonly number[]): boolean {
  const board = s.board.slice();
  for (const c of held) if (board[c] === EMPTY) board[c] = WALL;
  const reach = new Uint8Array(s.w * s.h);
  computeReachable({ ...s, board }, m.from, reach);
  return reach[m.to] === 1;
}

/**
 * What slide `i` of `line` is for: the index of the first later slide that
 * could not be made with the squares slide `i` leaves still filled, or of the
 * same block's next slide where that comes first. `boards[k]` is the board
 * before slide `k`.
 */
function roomFor(
  boards: readonly SlideState[],
  line: readonly SlideStep[],
  i: number,
): { at: number; self: boolean } {
  const { from, to } = line[i];
  const after = new Set(blockCells(boards[i + 1], to));
  const left = blockCells(boards[i], from).filter((c) => !after.has(c));
  for (let j = i + 1; j < line.length; j++) {
    if (line[j].from === to) return { at: j, self: true };
    if (!canSlide(boards[j], line[j], left)) return { at: j, self: false };
  }
  // A slide no later slide needs could be left out of the line, which a
  // shortest line never allows.
  throw new Error("slide: a slide of the plan makes room for nothing");
}

/** Where the block that makes slide `at` of `line` stood before slide `i`,
 * following it back through its own earlier slides. */
function anchorBefore(line: readonly SlideStep[], at: number, i: number): number {
  let anchor = line[at].from;
  for (let j = at - 1; j > i; j--) if (line[j].to === anchor) anchor = line[j].from;
  return anchor;
}

/** The last line searched, and the board before each of its slides. */
let last: { boards: readonly SlideState[]; line: readonly SlideStep[] } | null = null;

const sameBoard = (a: SlideState, b: SlideState): boolean =>
  a.forcefield === b.forcefield &&
  a.w === b.w &&
  a.board.every((v, i) => v === b.board[i]);

/**
 * The line from `state`, with the board before each slide: the rest of the
 * last line where `state` is on it, since the rest of a shortest line is a
 * shortest line, and otherwise a fresh search. So a player who follows the
 * hint, or asks again partway through a chain, gets the same chain in the same
 * words, and a search runs only when they leave the line.
 */
function lineFrom(
  state: SlideState,
):
  | { kind: "plan"; boards: readonly SlideState[]; line: readonly SlideStep[] }
  | Unfinished {
  const k = last?.boards.findIndex((b) => sameBoard(b, state)) ?? -1;
  if (last && k >= 0 && k < last.line.length)
    return {
      kind: "plan",
      boards: [state, ...last.boards.slice(k + 1)],
      line: last.line.slice(k),
    };
  const found = findExit(state);
  if (found.kind !== "found") return found;
  const boards = [state];
  for (const m of found.line)
    boards.push(executeMove(boards[boards.length - 1], { kind: "move", ...m }));
  last = { boards, line: found.line };
  return { kind: "plan", ...last };
}

export function hint(state: SlideState): HintResult<SlideMove, unknown, SlideRung> {
  const planned = lineFrom(state);
  if (planned.kind !== "plan") return searchRefusal(planned);
  const { boards, line } = planned;

  const steps: Step[] = [];
  for (let i = 0; i < line.length; i++) {
    const s = boards[i];
    const { from, to } = line[i];
    const key = s.board[from] === MAINANCHOR;
    const slid: Slid = {
      cells: blockCells(s, from).map((c) => pointOf(s, c)),
      into: blockCells(boards[i + 1], to).map((c) => pointOf(s, c)),
      key,
    };
    let said: { rung: SlideRung; words: Sentence };
    if (key) {
      const left = line.length - i - 1;
      said =
        left === 0
          ? { rung: "keyOut", words: say.keyOut(slid) }
          : { rung: "keyBlock", words: say.keyBlock(slid, left) };
    } else {
      const room = roomFor(boards, line, i);
      said = room.self
        ? { rung: "movesOn", words: say.movesOn(slid) }
        : boards[room.at].board[line[room.at].from] === MAINANCHOR
          ? { rung: "makesRoomForKey", words: say.makesRoomForKey(slid) }
          : {
              rung: "makesRoom",
              words: say.makesRoom(
                slid,
                blockCells(s, anchorBefore(line, room.at, i)).map((c) => pointOf(s, c)),
              ),
            };
    }
    steps.push({
      move: { kind: "move", from, to },
      rung: said.rung,
      explanation: said.words.text,
      words: said.words,
    });
    if (key) break;
  }
  return { ok: true, steps };
}

/** The hinted slide completes its step. Anything else, a slide of the same
 * block that stops short included, is off the plan, and the next request plans
 * from wherever the player is. */
export function hintKeepTrack(
  m: SlideMove,
  step: HintStep<SlideMove>,
): HintTrackVerdict {
  const hinted = step.move;
  if (m.kind !== "move" || hinted.kind !== "move") return "off";
  return m.from === hinted.from && m.to === hinted.to ? "completed" : "off";
}
