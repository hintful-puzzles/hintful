/**
 * The judge of a player's last move (`Game.hint.judgeMove`), on Light Up's
 * `describedFiringHint`: a move a deduction makes from the board is named
 * by its technique; a move only a deeper chain reaches says so; a right move
 * nothing decided yet is told apart; and a move that makes nothing a
 * deduction makes is not judged. On Unruly, a move several techniques make
 * from the board names each. And on Tracks, a mark no firing makes
 * (`EdgeHintSpec.holds`): a cross the board already shows says so. The words
 * are `verdictOf`'s table.
 */
import { describe, expect, it } from "vitest";
import { lightupGame } from "../../games/lightup/index.ts";
import { answerOf, holdsBulb } from "../../games/lightup/solver.ts";
import {
  F_BLACK,
  F_LIGHT,
  idx,
  type LightupParams,
  type LightupState,
} from "../../games/lightup/state.ts";
import { mapGame } from "../../games/map/index.ts";
import { mathraxGame } from "../../games/mathrax/index.ts";
import { pathGame } from "../../games/path/index.ts";
import { pathWalk } from "../../games/path/solver.ts";
import {
  DIFF_NORMAL,
  MODE_PATH,
  newState as newPathState,
} from "../../games/path/state.ts";
import { tracksGame } from "../../games/tracks/index.ts";
import {
  E_NOTRACK,
  E_TRACK,
  S_NOTRACK,
  sEFlags,
  stateToBoard,
  type TracksOp,
  type TracksState,
} from "../../games/tracks/state.ts";
import { NAMES } from "../../generated/games/lightup/lightup.compiled.ts";
import { NAMES as UNRULY_NAMES } from "../../generated/games/unruly/unruly.compiled.ts";
import { game as unrulyGame } from "../../generated/games/unruly/unruly.game.ts";
import { D, dirX, dirY, L, R, U } from "../board/square-edges.ts";
import { SYMM_ROT4 } from "../generate/symmetric-blacks.ts";
import { randomNew } from "../random/index.ts";
import { CellMarks } from "../solve/cell-marks.ts";
import type { Reads } from "../solve/describe-runtime.ts";
import {
  describedSpace,
  type Fire,
  type GridSpace,
  type Marks,
  PLACE,
} from "../solve/describe-runtime.ts";
import { compiledRung, type LadderEntry, TIERS } from "../solve/ladder-runtime.ts";
import { ladderWalk } from "../solve/ladder-walk.ts";
import { dealt } from "../testing/dealt.ts";
import {
  auditChains,
  type ChainAudit,
  type Judged,
  type Judging,
  judgeByWalk,
  verdictOf,
} from "./move-judge.ts";

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

const judge = lightupGame.hint.judgeMove;
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
      const res = lightupGame.hint.plan(state);
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
      const res = game.hint.plan(state, aux, game.newUi(state));
      if (!res?.ok) break;
      const after = game.executeMove(state, res.steps[0].move);
      const text = game.hint.judgeMove?.(state, after)?.words.text ?? "";
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
      const plan = lightupGame.hint.plan(state);
      if (!plan?.ok) throw new Error("no hint");
      for (const step of plan.steps.slice(0, 6))
        state = lightupGame.executeMove(state, step.move);
      const res = lightupGame.hint.plan(state);
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
      const res = lightupGame.hint.plan(state);
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
    const res = lightupGame.hint.plan(state);
    if (!res?.ok) throw new Error("no hint");
    const marked = lightupGame.executeMove(state, res.steps[0].move);
    // The same toggles again take the marks off.
    const unmarked = lightupGame.executeMove(marked, res.steps[0].move);
    expect(judge(marked, unmarked)).toBeNull();
  });
});

describe("judgeMove, where a chain began", () => {
  /** Every chain the judge replays while `run` runs. */
  const heard = (run: () => void): ChainAudit[] => {
    const out: ChainAudit[] = [];
    auditChains((found) => out.push(found));
    try {
      run();
    } finally {
      auditChains(null);
    }
    return out;
  };
  /** The start a replay names: the first candidate tried that the chain
   * cannot reach the move without, where the chain reaches it at all. */
  const namedBy = (a: ChainAudit): string | null =>
    a.whole === null ? (a.tried.find((t) => t.without !== null)?.start ?? null) : null;

  it("names a chain's start only where its replay confirms it", () => {
    // Each of a hint's moves, made alone on the board as dealt: most are a
    // few steps on, and no Unruly technique's graph says what it read, so
    // every earlier firing is a candidate.
    const game = unrulyGame;
    const params = game.defaultParams();
    const { desc, aux } = dealt(game, params);
    const start = game.newState(params, desc);
    const moves: Parameters<typeof game.executeMove>[1][] = [];
    let state = start;
    for (let k = 0; k < 40; k++) {
      const res = game.hint.plan(state, aux, game.newUi(state));
      if (!res?.ok) break;
      moves.push(res.steps[0].move);
      state = game.executeMove(state, res.steps[0].move);
    }
    let named = 0;
    for (const move of moves) {
      let text = "";
      const audits = heard(() => {
        text =
          game.hint.judgeMove?.(start, game.executeMove(start, move))?.words.text ?? "";
      });
      const said = audits.length === 1 ? namedBy(audits[0]) : null;
      if (said === null) expect(text).not.toMatch(CHAINED);
      else {
        expect(text).toBe(`${CHAINED}${said}.`);
        expect(Object.values(UNRULY_NAMES)).toContain(said);
        named++;
      }
    }
    expect(named).toBeGreaterThan(5);
  });

  it("names a notes game's start from the steps' premises, under either reading", () => {
    // Mathrax's candidate plan, each of its hint's moves made alone on the
    // board as dealt. Unlike Unruly's, every firing says what it read (its
    // steps' premise), so the chain is the graph's: a number left alone in its
    // cell rests on every strike there, which several firings made. Under the
    // implicit reading a strike from a cell with no notes places what it
    // leaves, and the replay must place it too.
    const game = mathraxGame;
    const params = game.defaultParams();
    const { desc, aux } = dealt(game, params);
    const start = game.newState(params, desc);
    for (const candidateReading of ["populate", "implicit"] as const) {
      const ui = { ...game.newUi(start), candidateReading };
      const res = game.hint.plan(start, aux, ui);
      if (!res?.ok) throw new Error("no hint on the board as dealt");
      let named = 0;
      for (const step of res.steps) {
        let text = "";
        const audits = heard(() => {
          text =
            game.hint.judgeMove?.(start, game.executeMove(start, step.move), ui)?.words
              .text ?? "";
        });
        if (audits.length === 0) continue;
        const [audit] = audits;
        expect(audit.whole, `${candidateReading}: ${step.explanation}`).toBeNull();
        const said = namedBy(audit);
        expect(text).toBe(
          said === null
            ? verdictOf({ kind: "chained", technique: null }).words.text
            : `${CHAINED}${said}.`,
        );
        if (said !== null) named++;
      }
      expect(named, candidateReading).toBeGreaterThan(10);
    }
  });

  /** A technique that places 1 in square `at` once `ready` holds. */
  const placing = (
    id: string,
    at: number,
    ready: (b: Marks) => boolean = () => true,
  ): LadderEntry => ({
    id,
    name: id,
    tier: 0,
    run: compiledRung(
      (b: Marks, _sp: GridSpace, _cl: null, fire: Fire<object> | null): number => {
        if (b.grid[at] !== 0 || !ready(b)) return 0;
        if (fire === null) b.placeAt(at, 1);
        else fire({}, [PLACE, at, 1]);
        return 1;
      },
      null,
    ),
  });
  /**
   * The verdict on placing 1 in square `at` of a row of `n`, each square 1
   * or 2, by a walk of `entries` taken in their order: each firing shows a
   * step where `shows` says so, and `writes` is what the builder does to the
   * marks after each, as Pearl's step draws a line on. Also the order the
   * walk took them in.
   */
  const judgedBy = (
    n: number,
    at: number,
    entries: readonly LadderEntry[],
    opts: {
      citing?: () => Reads;
      shows?: (id: string) => boolean;
      writes?: (m: CellMarks) => void;
    } = {},
  ): { judged: Judged | null; order: string[] } => {
    const fresh = (): CellMarks =>
      new CellMarks(describedSpace([], n, 1), 0b110, new Uint8Array(n));
    let order: string[] = [];
    const judged = judgeByWalk([{ kind: PLACE, at, value: 1 }], (judging) => {
      const m = fresh();
      const walk = ladderWalk(
        m,
        entries,
        { [TIERS]: 9 },
        () => [],
        opts.citing ? { citing: opts.citing } : {},
      );
      judging.traced = walk.trace(fresh);
      while (!judging.done(m)) {
        const known = walk.graph.facts.length;
        const taken = walk.next();
        if (taken === null || taken === "contradiction") break;
        opts.writes?.(m);
        const { id } = taken.entry;
        judging.took(walk.graph, known, id, opts.shows?.(id) ?? true);
      }
      order = walk.taken.map((t) => t.firing.entry.id);
    });
    return { judged, order };
  };

  it("names no start the move does not rest on, though a later firing does", () => {
    // Three squares: A places the first, B the second once the first is
    // placed, and C the third from the board alone. Without A, B is not
    // offered, but the move, C's square, is still made: by C alone, from the
    // board, though the walk took it last.
    const { judged, order } = judgedBy(3, 2, [
      placing("A", 0),
      placing("B", 1, (b) => b.grid[0] === 1),
      placing("C", 2),
    ]);
    expect(order).toEqual(["A", "B", "C"]);
    expect(judged).toEqual({ kind: "direct", techniques: ["C"] });
  });

  it("looks before the move where the graph says it rests on nothing earlier", () => {
    // Every firing cites nothing, as Loopy's leave out the lines a player
    // sees: the graph is complete and names no parent, yet B is offered only
    // once A has placed.
    const { judged } = judgedBy(
      2,
      1,
      [placing("A", 0), placing("B", 1, (b) => b.grid[0] === 1)],
      { citing: () => ({ cells: [], edges: [] }) },
    );
    expect(judged).toEqual({ kind: "chained", technique: "A" });
  });

  it("finds a start behind more than a dozen it can do without", () => {
    // Fourteen squares placed from the board, then the fifteenth once the
    // last of them is: every one is a candidate, and only the last is needed.
    const firsts = Array.from({ length: 14 }, (_, k) => placing(`P${k}`, k));
    const { judged } = judgedBy(15, 14, [
      ...firsts,
      placing("Q", 14, (b) => b.grid[13] === 1),
    ]);
    expect(judged).toEqual({ kind: "chained", technique: "P13" });
  });

  it("replays what the builder writes beside a firing", () => {
    // After each firing the builder places the square past the one it
    // placed, as Pearl's step carries a line on through a pearl: B needs
    // what it wrote after A, and the move is what it wrote after B, the
    // walk's last firing.
    const { judged } = judgedBy(
      4,
      3,
      [placing("A", 0), placing("B", 2, (b) => b.grid[1] === 1)],
      {
        writes: (m) => {
          for (const c of [0, 2])
            if (m.grid[c] === 1 && m.grid[c + 1] === 0) m.place(c + 1, 1);
        },
      },
    );
    expect(judged).toEqual({ kind: "chained", technique: "A" });
  });

  it("dates a move a firing with no step made to the firing it goes with", () => {
    // B shows no step, and the walk ends on it: its facts are the last
    // firing's, not A's before it.
    const { judged } = judgedBy(
      2,
      1,
      [placing("A", 0), placing("B", 1, (b) => b.grid[0] === 1)],
      { shows: (id) => id === "A" },
    );
    expect(judged).toEqual({ kind: "chained", technique: "A" });
  });

  it("names the start of a move a builder's settle carries (Map)", () => {
    // Map's settle colors what the steps' legs colored, beside the firings:
    // every chained verdict on the board as dealt names its start.
    const game = mapGame;
    const params = game.defaultParams();
    const { desc, aux } = dealt(game, params);
    const start = game.newState(params, desc);
    const res = game.hint.plan(start, aux, game.newUi(start));
    if (!res?.ok) throw new Error("no hint on the board as dealt");
    let chained = 0;
    for (const step of res.steps) {
      const text =
        game.hint.judgeMove?.(start, game.executeMove(start, step.move))?.words.text ??
        "";
      if (!text.includes("a few steps on")) continue;
      chained++;
      expect(text, step.explanation).toMatch(CHAINED);
    }
    expect(chained).toBeGreaterThan(5);
  });

  it("passes over a start a read wider than the premise's would give it", () => {
    // Path's walk, every firing citing the whole board: the graph then says
    // each chain rests on every firing before it, most of which it does not
    // need.
    const p = { w: 7, h: 7, diff: DIFF_NORMAL, mode: MODE_PATH };
    const state = newPathState(p, pathGame.newDesc(p, randomNew("g1")).desc);
    const walked = (judging: Judging, wide: boolean): void => {
      const { marks, entries } = pathWalk(state);
      const all: Reads = {
        cells: [...marks.grid.keys()],
        edges: [...marks.edgeCands.keys()],
      };
      const walk = ladderWalk(marks, entries, { [TIERS]: 99 }, () => [], {
        aim: judging.aim,
        ...(wide ? { citing: () => all } : {}),
      });
      judging.traced = walk.trace(() => pathWalk(state).marks);
      while (!judging.done(marks)) {
        const known = walk.graph.facts.length;
        const taken = walk.next();
        if (taken === null || taken === "contradiction") break;
        judging.took(walk.graph, known, taken.entry.id, true);
      }
    };
    // The facts of the walk's later firings, each judged as a move alone.
    const { marks, entries } = pathWalk(state);
    const walk = ladderWalk(marks, entries, { [TIERS]: 99 }, () => []);
    while (true) {
      const taken = walk.next();
      if (taken === null || taken === "contradiction") break;
    }
    const facts = walk.graph.facts.filter(
      (f) => f.firing > 2 && f.about.space === "cells",
    );
    let refuted = 0;
    for (const f of facts.slice(0, 30)) {
      const moved = [{ kind: f.kind, at: f.about.at, value: f.value }];
      let judged: Judged | null = null;
      const [audit] = heard(() => {
        judged = judgeByWalk(moved, (j) => walked(j, true));
      });
      // A candidate the chain reaches the move without is passed over, and
      // the start named is the first it cannot.
      if (audit === undefined) continue;
      refuted += audit.passed;
      expect(judged).toEqual(
        audit.alone
          ? { kind: "direct", techniques: [expect.any(String)] }
          : { kind: "chained", technique: namedBy(audit) },
      );
    }
    expect(refuted).toBeGreaterThan(0);
    // Read as the premises read them, the same moves name their starts.
    let narrow = 0;
    for (const f of facts.slice(0, 30)) {
      const judged = judgeByWalk(
        [{ kind: f.kind, at: f.about.at, value: f.value }],
        (j) => walked(j, false),
      );
      if (judged?.kind === "chained" && judged.technique !== null) narrow++;
    }
    expect(narrow).toBeGreaterThan(0);
  });
});

describe("judgeMove, a mark no firing makes", () => {
  const tracksJudge = tracksGame.hint.judgeMove;
  if (!tracksJudge) throw new Error("Tracks wires no judgeMove");
  // Tracks' sides a square closes, by its two rails or by holding none, are
  // read off the marks and crossed by no technique.
  const params = tracksGame.defaultParams();
  const { desc, aux } = dealt(tracksGame, params);
  let state = tracksGame.newState(params, desc);
  const path = [state];
  for (let k = 0; k < 300; k++) {
    const res = tracksGame.hint.plan(state, aux, tracksGame.newUi(state));
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
