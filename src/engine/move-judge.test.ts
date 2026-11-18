/**
 * The judge of a player's last move (`Game.judgeMove`), on Light Up's
 * `describedFiringHint`: a move a deduction makes from the board is named
 * by its technique; a move only a deeper chain reaches says so; a right move
 * nothing decided yet is told apart; and a move that makes nothing a
 * deduction makes is not judged. On Unruly, a move several techniques make
 * from the board names each. And on Tracks, a mark no firing makes
 * (`EdgeHintSpec.holds`): a cross the board already shows says so. The words
 * are `verdictOf`'s table.
 */
import { describe, expect, it } from "vitest";
import { lightupGame } from "../games/lightup/index.ts";
import { answerOf, holdsBulb } from "../games/lightup/solver.ts";
import {
  F_BLACK,
  F_LIGHT,
  idx,
  type LightupParams,
  type LightupState,
} from "../games/lightup/state.ts";
import { tracksGame } from "../games/tracks/index.ts";
import {
  E_NOTRACK,
  E_TRACK,
  S_NOTRACK,
  sEFlags,
  stateToBoard,
  type TracksOp,
  type TracksState,
} from "../games/tracks/state.ts";
import { unrulyGame } from "../games/unruly/index.ts";
import { NAMES } from "../generated/games/lightup/lightup.compiled.ts";
import { NAMES as UNRULY_NAMES } from "../generated/games/unruly/unruly.compiled.ts";
import { verdictOf } from "./move-judge.ts";
import { randomNew } from "./random/index.ts";
import { D, dirX, dirY, L, R, U } from "./square-edges.ts";
import { SYMM_ROT4 } from "./symmetric-blacks.ts";
import { dealt } from "./testing/dealt.ts";

const EASY: LightupParams = { w: 7, h: 7, blackpc: 20, symm: SYMM_ROT4, difficulty: 0 };
const UNREASONABLE: LightupParams = { ...EASY, difficulty: 2 };

const DIRECT = "Your last move follows from ";
const CHAINED = "Your last move follows a few steps on, starting from ";

function fresh(p: LightupParams, seed: string): LightupState {
  const { desc } = lightupGame.newDesc(p, randomNew(seed));
  return lightupGame.newState(p, desc);
}

/** What a player calls the technique of a Light Up step's rung. */
const nameOf = (rung: string): string =>
  NAMES[rung.split(".")[0] as keyof typeof NAMES];

const judge = lightupGame.judgeMove;
if (!judge) throw new Error("Light Up wires no judgeMove");

describe("verdictOf", () => {
  it("names one, two and three techniques, and counts the rest", () => {
    const said = (techniques: readonly string[]): string =>
      verdictOf({ kind: "direct", techniques }).words.text;
    expect(said(["a"])).toBe("Your last move follows from a.");
    expect(said(["a", "b"])).toBe("Your last move follows from a, or b.");
    expect(said(["a", "b", "c"])).toBe("Your last move follows from a, b, or c.");
    expect(said(["a", "b", "c", "d"])).toBe(
      "Your last move follows from a, b, or two more.",
    );
    // Three that run past two lines on a phone are two and one more.
    const long = "a deduction with a long name of its own";
    expect(said([long, long, long])).toBe(
      `Your last move follows from ${long}, ${long}, or one more.`,
    );
  });
});

describe("judgeMove", () => {
  it("names a hint's own move by its technique", () => {
    for (const seed of ["mj-a", "mj-b", "mj-c"]) {
      const state = fresh(EASY, seed);
      const res = lightupGame.hint?.(state);
      if (!res?.ok) throw new Error("no hint");
      const step = res.steps[0];
      const verdict = judge(state, lightupGame.executeMove(state, step.move));
      expect(verdict?.followed).toBe(true);
      const text = verdict?.words.text ?? "";
      expect(text.startsWith(DIRECT)).toBe(true);
      expect(text).toContain(nameOf(step.rung));
    }
  });

  it("names every technique that makes a move from the board", () => {
    // A square both three in a row and a line's full quota decide: the
    // player may have reasoned either way, so both are named.
    const game = unrulyGame;
    const params = game.defaultParams();
    const { desc, aux } = dealt(game, params);
    let state = game.newState(params, desc);
    for (let k = 0; k < 40; k++) {
      const res = game.hint?.(state, aux, game.newUi(state));
      if (!res?.ok) break;
      const after = game.executeMove(state, res.steps[0].move);
      const text = game.judgeMove?.(state, after)?.words.text ?? "";
      if (text.startsWith(DIRECT) && text.includes(", or ")) {
        const named = Object.values(UNRULY_NAMES).filter((n) => text.includes(n));
        expect(named.length, text).toBeGreaterThanOrEqual(2);
        return;
      }
      state = after;
    }
    throw new Error("no move of forty was made by two techniques");
  });

  it("follows a move a later step makes back to the board, in steps", () => {
    let chained = 0;
    for (const seed of ["mj-a", "mj-b", "mj-c"]) {
      // A few moves in, past the steps the bare clues decide.
      let state = fresh(EASY, seed);
      const plan = lightupGame.hint?.(state);
      if (!plan?.ok) throw new Error("no hint");
      for (const step of plan.steps.slice(0, 6))
        state = lightupGame.executeMove(state, step.move);
      const res = lightupGame.hint?.(state);
      if (!res?.ok) continue;
      for (const step of res.steps.slice(1)) {
        const verdict = judge(state, lightupGame.executeMove(state, step.move));
        expect(verdict?.followed).toBe(true);
        const text = verdict?.words.text ?? "";
        if (text.startsWith(CHAINED)) {
          expect(Object.values(NAMES).some((n) => text.includes(n))).toBe(true);
          chained++;
        } else expect(text.startsWith(DIRECT)).toBe(true);
      }
    }
    // A plan's later steps rest on its earlier ones, so some must be chained.
    expect(chained).toBeGreaterThan(0);
  });

  it("tells a right bulb nothing decided from a deduced one", () => {
    let state = fresh(UNREASONABLE, "lh-unreasonable");
    for (let moves = 0; moves < 200; moves++) {
      const res = lightupGame.hint?.(state);
      if (!res?.ok) break;
      state = lightupGame.executeMove(state, res.steps[0].move);
    }
    expect(lightupGame.status(state)).toBe("ongoing");
    const answer = answerOf(state);
    if (answer.kind !== "one") throw new Error("board not uniquely solvable");
    let judged = 0;
    for (let i = 0; i < state.w * state.h; i++) {
      if (state.flags[i] & (F_BLACK | F_LIGHT)) continue;
      if (!holdsBulb(answer.solution, i)) continue;
      const x = i % state.w;
      const y = Math.floor(i / state.w);
      expect(idx(x, y, state.w)).toBe(i);
      const after = lightupGame.executeMove(state, { ops: [{ kind: "light", x, y }] });
      const verdict = judge(state, after);
      expect(verdict?.followed).toBe(false);
      expect(verdict?.words.text).toBe(verdictOf({ kind: "unforced" }).words.text);
      judged++;
    }
    expect(judged).toBeGreaterThan(0);
  });

  it("does not judge a move that takes a mark away", () => {
    const state = fresh(EASY, "mj-a");
    const res = lightupGame.hint?.(state);
    if (!res?.ok) throw new Error("no hint");
    const marked = lightupGame.executeMove(state, res.steps[0].move);
    // The same toggles again take the marks off.
    const unmarked = lightupGame.executeMove(marked, res.steps[0].move);
    expect(judge(marked, unmarked)).toBeNull();
  });
});

describe("judgeMove, a mark no firing makes", () => {
  const tracksJudge = tracksGame.judgeMove;
  if (!tracksJudge) throw new Error("Tracks wires no judgeMove");
  // Tracks' sides a square closes, by its two rails or by holding none, are
  // read off the marks and crossed by no technique.
  const params = tracksGame.defaultParams();
  const { desc, aux } = dealt(tracksGame, params);
  let state = tracksGame.newState(params, desc);
  const path = [state];
  for (let k = 0; k < 300; k++) {
    const res = tracksGame.hint?.(state, aux, tracksGame.newUi(state));
    if (!res?.ok) break;
    state = tracksGame.executeMove(state, res.steps[0].move);
    path.push(state);
  }
  const answer = stateToBoard(state);
  const { w, h } = answer;
  /** The crosses of the answer's open sides not yet marked at `at`, each
   * with whether a square either side already says it. */
  const crosses = (at: TracksState): { op: TracksOp; shown: boolean }[] => {
    const b = stateToBoard(at);
    const rails = (x: number, y: number): number =>
      [R, U, L, D].filter((d) => sEFlags(b, x, y, d) & E_TRACK).length;
    const closes = (x: number, y: number): boolean =>
      (b.sflags[y * w + x] & S_NOTRACK) !== 0 || rails(x, y) === 2;
    const out: { op: TracksOp; shown: boolean }[] = [];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        for (const dir of [R, D]) {
          const [nx, ny] = [x + dirX(dir), y + dirY(dir)];
          if (nx >= w || ny >= h) continue;
          if (sEFlags(answer, x, y, dir) & E_TRACK) continue;
          if (sEFlags(b, x, y, dir) & E_NOTRACK) continue;
          const op = { kind: "edge", x, y, dir, track: false, set: true } as const;
          out.push({ op, shown: closes(x, y) || closes(nx, ny) });
        }
    return out;
  };

  it("names a cross the board already shows as such, and follows the rest", () => {
    let shown = 0;
    let reached = 0;
    for (const at of [path[0], path[Math.floor(path.length / 2)]])
      for (const { op, shown: isShown } of crosses(at)) {
        const after = tracksGame.executeMove(at, { ops: [op] });
        const verdict = tracksJudge(at, after, tracksGame.newUi(at));
        expect(verdict?.followed, JSON.stringify(op)).toBe(true);
        if (isShown) {
          expect(verdict?.words.text).toBe(verdictOf({ kind: "shown" }).words.text);
          shown++;
        } else reached++;
      }
    expect(shown).toBeGreaterThan(0);
    expect(reached).toBeGreaterThan(0);
  });
});
