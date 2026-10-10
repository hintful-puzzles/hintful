/**
 * Net's two tiers: Easy, which the solver and the hint finish, and
 * Unreasonable, a board with one answer that the solver does not reach.
 *
 * The answer counts here come from {@link countNetworks}, which turns the
 * tiles one at a time in reading order, keeping a turning only where it meets
 * the tiles already turned, and reads each finished grid for one network with
 * no loop. It asks nothing of the solver or the search over it, so it can say
 * whether those two are right that a board has one answer. It is for boards
 * of thirty squares or so.
 */
import { describe, expect, it } from "vitest";
import { DIFF_EASY, DIFF_UNREASONABLE } from "../../engine/answer-search.ts";
import { DESC_CONTRADICTORY, DESC_NOT_UNIQUE } from "../../engine/desc-error.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { Midend } from "../../engine/index.ts";
import { paramsError } from "../../engine/params.ts";
import { randomNew, randomUpto } from "../../engine/random/index.ts";
import {
  describeAbsentTiers,
  describeDealtTiers,
} from "../../engine/testing/absent-tiers.ts";
import { itSlow } from "../../engine/testing/slow.ts";
import { encodeWireDesc, growSpanningTree } from "../../engine/wires.ts";
import { netGame } from "./index.ts";
import { answerOf, searchAnswers, solverFinishes } from "./solver.ts";
import {
  LOCKED,
  type NetMove,
  type NetParams,
  type NetState,
  newState,
} from "./state.ts";

const RIGHT = 1;
const UP = 2;
const LEFT = 4;
const DOWN = 8;
const SIDES = [RIGHT, UP, LEFT, DOWN];
const across = (side: number): number =>
  side === RIGHT ? LEFT : side === LEFT ? RIGHT : side === UP ? DOWN : UP;
const quarterTurn = (wires: number): number => ((wires << 1) | (wires >> 3)) & 0xf;

/** The tile over side `side` of tile `i`, round the edge of the grid. */
function over(w: number, h: number, i: number, side: number): number {
  const x = i % w;
  const y = (i - x) / w;
  if (side === RIGHT) return y * w + ((x + 1) % w);
  if (side === LEFT) return y * w + ((x + w - 1) % w);
  if (side === UP) return ((y + h - 1) % h) * w + x;
  return ((y + 1) % h) * w + x;
}

/** How many ways every tile turns so that each wire end meets another across
 * a side with no wall, the wires join every tile, and no loop is closed, as
 * far as `limit`. */
function countNetworks(board: NetState, limit = 2): number {
  const { w, h, barriers } = board;
  const n = w * h;
  const wires = Array.from(board.tiles, (t) => t & 0xf);
  const turnings = wires.map((tile) => {
    const out = [tile];
    for (let t = quarterTurn(tile); t !== tile; t = quarterTurn(t)) out.push(t);
    return out;
  });
  const wired = wires.filter((tile) => tile !== 0).length;
  const ends = wires.reduce(
    (sum, tile) => sum + SIDES.filter((side) => tile & side).length,
    0,
  );
  // Joined tiles with no loop are a tree, which has one join fewer than tiles.
  if (wired > 0 && ends !== 2 * (wired - 1)) return 0;

  const turned = new Uint8Array(n);
  const joinsEvery = (): boolean => {
    const first = turned.findIndex((tile) => tile !== 0);
    if (first < 0) return true;
    const seen = new Uint8Array(n);
    seen[first] = 1;
    const todo = [first];
    let reached = 0;
    for (let i = todo.pop(); i !== undefined; i = todo.pop()) {
      reached++;
      for (const side of SIDES) {
        if (!((turned[i] as number) & side)) continue;
        const j = over(w, h, i, side);
        if (seen[j]) continue;
        seen[j] = 1;
        todo.push(j);
      }
    }
    return reached === wired;
  };

  let count = 0;
  const turn = (i: number): void => {
    if (count >= limit) return;
    if (i === n) {
      if (joinsEvery()) count++;
      return;
    }
    for (const tile of turnings[i] as number[]) {
      const fits = SIDES.every((side) => {
        const wire = (tile & side) !== 0;
        if (wire && (barriers[i] as number) & side) return false;
        const j = over(w, h, i, side);
        if (j === i) return !wire;
        return j > i || wire === (((turned[j] as number) & across(side)) !== 0);
      });
      if (!fits) continue;
      turned[i] = tile;
      turn(i + 1);
    }
  };
  turn(0);
  return count;
}

const sized = (
  w: number,
  h: number,
  diff: number,
  wrapping = false,
  barrierProbability = 0,
): NetParams => ({ w, h, wrapping, barrierProbability, diff });

/** A 3x4 wrapping board for each thing a board can be. */
const WRAP = sized(3, 4, DIFF_EASY, true);
/** One answer, which the solver stops short of. */
const NEEDS_SEARCH = "8cec738e1432";
/** One answer, which the solver reaches. */
const SOLVER_FINISHES = "1771e84628b5";
/** A network as it was first drawn, which other turnings join up as well. */
const MANY_ANSWERS = "e21e81374dc1";
/** `NEEDS_SEARCH` with its last dead end made a corner, so that there is one
 * wire end too many for a network with no loop. */
const NO_ANSWER = "8cec738e1436";

describe("the count of a Net board's answers that the tests go by", () => {
  it("counts the boards whose answers are known", () => {
    const count = (desc: string, limit?: number) =>
      countNetworks(newState(WRAP, desc), limit);
    expect(count(SOLVER_FINISHES)).toBe(1);
    expect(count(NEEDS_SEARCH, 100)).toBe(1);
    expect(count(NO_ANSWER)).toBe(0);
    expect(count(MANY_ANSWERS, 100)).toBeGreaterThan(1);
    // Two dead ends side by side face each other one way only.
    expect(countNetworks(newState(sized(2, 1, DIFF_EASY), "11"), 100)).toBe(1);
    // A T between two dead ends and above a third, on a board with a blank
    // corner each side of that: the T's three wires go one way.
    expect(countNetworks(newState(sized(3, 2, DIFF_EASY), "1e4020"), 100)).toBe(1);
    // Four corners in a 2x2 square join up only as a loop.
    expect(countNetworks(newState(sized(2, 2, DIFF_EASY), "9c36"), 100)).toBe(0);
  });
});

describe("net's search for a board's answers", () => {
  const answers = (desc: string, budget?: number) =>
    searchAnswers(newState(WRAP, desc), budget).kind;

  it("says one, several or none", () => {
    expect(answers(NEEDS_SEARCH)).toBe("one");
    expect(answers(SOLVER_FINISHES)).toBe("one");
    expect(answers(MANY_ANSWERS)).toBe("several");
    expect(answers(NO_ANSWER)).toBe("none");
  });

  it("says neither once its budget is spent", () => {
    // The solver finishes a board in the one position the search starts from.
    expect(answers(SOLVER_FINISHES, 1)).toBe("one");
    expect(answers(NEEDS_SEARCH, 1)).toBe("out-of-reach");
  });

  // Which tile is assumed, and which turning first, is part of the budget: it
  // decides which boards are dealt and which pasted ones open.
  it("takes exactly five positions for a board that needs them", () => {
    expect(answers(NEEDS_SEARCH, 4)).toBe("out-of-reach");
    expect(answers(NEEDS_SEARCH, 5)).toBe("one");
  });

  it("takes the same positions however the board's tiles are turned", () => {
    const board = newState(WRAP, NEEDS_SEARCH);
    const rng = randomNew("turned");
    for (let turn = 0; turn < 8; turn++) {
      const tiles = board.tiles.map((tile) => {
        let t = tile;
        for (let q = randomUpto(rng, 4); q > 0; q--) t = quarterTurn(t);
        return t;
      });
      const turned = { ...board, tiles };
      expect(searchAnswers(turned, 4).kind).toBe("out-of-reach");
      expect(searchAnswers(turned, 5).kind).toBe("one");
    }
  });

  it("calls four corners that can only close a loop no answer", () => {
    const loop = newState(sized(2, 2, DIFF_EASY), "9c36");
    expect(solverFinishes(loop)).toBe(false);
    expect(searchAnswers(loop).kind).toBe("none");
  });

  // The search's "solved" is the solver's verdict checked for one network
  // with no loop, and no grid has been found where the check says no. This is
  // the count behind that: every grid of dead ends, corners, straights and Ts
  // on these shapes that the solver settles.
  it.each([
    [2, 2, false, 4],
    [2, 3, false, 15],
    [3, 3, false, 176],
  ])("every %ix%i grid the solver settles is a network", (w, h, wrapping, settled) => {
    const p = sized(w, h, DIFF_EASY, wrapping);
    const kinds = "1357";
    let count = 0;
    for (let code = 0; code < 4 ** (w * h); code++) {
      let desc = "";
      for (let i = 0, c = code; i < w * h; i++, c >>= 2) desc += kinds[c & 3];
      const grid = newState(p, desc);
      if (!solverFinishes(grid)) continue;
      count++;
      if (countNetworks(grid) !== 1) throw new Error(`${desc} is no network`);
    }
    expect(count).toBe(settled);
  });

  it("takes one position for every Easy board", () => {
    for (const p of [
      sized(5, 5, DIFF_EASY),
      sized(7, 7, DIFF_EASY),
      sized(5, 5, DIFF_EASY, true),
      sized(6, 4, DIFF_EASY, false, 0.5),
    ]) {
      for (let seed = 0; seed < 8; seed++) {
        const { desc } = netGame.newDesc(p, randomNew(`one-position-${seed}`));
        expect(searchAnswers(newState(p, desc), 1).kind, desc).toBe("one");
      }
    }
  });

  it("agrees with the count on boards of every kind", () => {
    // Dealt boards, which have one answer; the same with two tiles swapped,
    // which keeps the wire ends a network needs and often leaves several
    // answers or none; and with a wall taken away or put across a wire.
    const tally = { one: 0, several: 0, none: 0, "out-of-reach": 0 };
    const judge = (board: NetState, label: string): void => {
      const answer = searchAnswers(board);
      tally[answer.kind]++;
      const count = countNetworks(board);
      expect(answer.kind, label).toBe(
        count === 0 ? "none" : count === 1 ? "one" : "several",
      );
    };
    for (const [w, h, wrapping, walls] of [
      [3, 4, true, 0],
      [4, 4, true, 0],
      [4, 4, true, 0.3],
      [5, 5, false, 0],
      [5, 5, false, 0.3],
      [4, 6, false, 0],
    ] as const) {
      for (let seed = 0; seed < 12; seed++) {
        const rng = randomNew(`agree-${w}x${h}-${wrapping}-${walls}-${seed}`);
        const p = sized(
          w,
          h,
          seed % 2 === 0 ? DIFF_EASY : DIFF_UNREASONABLE,
          wrapping,
          walls,
        );
        const dealt = newState(p, netGame.newDesc(p, rng).desc);
        const label = `${netGame.encodeParams(p, true)} seed ${seed}`;
        judge(dealt, label);

        // A network as it is first drawn, with nothing rewired: on a
        // wrapping board most of these have several answers.
        const drawn = new Uint8Array(w * h);
        growSpanningTree(drawn, w, h, wrapping, w >> 1, h >> 1, rng);
        judge(
          newState(p, encodeWireDesc(drawn, new Uint8Array(w * h), w, h, wrapping)),
          `${label}, a network as drawn`,
        );

        const swapped = { ...dealt, tiles: dealt.tiles.slice() };
        const a = randomUpto(rng, w * h);
        const b = (a + 1 + randomUpto(rng, w * h - 1)) % (w * h);
        swapped.tiles[a] = dealt.tiles[b] as number;
        swapped.tiles[b] = dealt.tiles[a] as number;
        judge(swapped, `${label}, tiles ${a} and ${b} swapped`);

        // A wall across the right of one tile, where there was none, or none
        // where there was one. The far side of it is the next tile's left.
        const walled = { ...dealt, barriers: dealt.barriers.slice() };
        const at = randomUpto(rng, w * h);
        const next = over(w, h, at, RIGHT);
        if (next !== at && (wrapping || next === at + 1)) {
          walled.barriers[at] = (walled.barriers[at] as number) ^ RIGHT;
          walled.barriers[next] = (walled.barriers[next] as number) ^ LEFT;
          judge(walled, `${label}, the wall right of tile ${at} changed`);
        }
      }
    }
    expect(tally["out-of-reach"]).toBe(0);
    expect(tally.one).toBeGreaterThan(150);
    expect(tally.several).toBeGreaterThan(15);
    expect(tally.none).toBeGreaterThan(50);
  });
});

/**
 * Every board of a shape: each network that joins all its squares with no
 * loop and, for each, each set of walls on the sides the network leaves
 * without a wire, or with `walls` false the one with no wall. `visit` returns
 * true to stop the walk.
 */
function eachBoard(
  p: NetParams,
  visit: (board: NetState, desc: string) => boolean,
  walls = true,
): void {
  const { w, h } = p;
  const n = w * h;
  // Each side two different squares share, once.
  const sides: [from: number, to: number, side: number][] = [];
  for (let i = 0; i < n; i++) {
    const x = i % w;
    const y = (i - x) / w;
    if (x + 1 < w || (p.wrapping && w > 2))
      sides.push([i, over(w, h, i, RIGHT), RIGHT]);
    if (y + 1 < h || (p.wrapping && h > 2)) sides.push([i, over(w, h, i, DOWN), DOWN]);
  }
  let stopped = false;
  const wired: number[] = [];
  const emit = (): void => {
    const tiles = new Uint8Array(n);
    const unwired = sides.map((_, k) => k).filter((k) => !wired.includes(k));
    for (const k of wired) {
      const [from, to, side] = sides[k] as [number, number, number];
      tiles[from] = (tiles[from] as number) | side;
      tiles[to] = (tiles[to] as number) | across(side);
    }
    const sets = walls ? 1 << unwired.length : 1;
    for (let set = 0; set < sets && !stopped; set++) {
      const barriers = new Uint8Array(n);
      unwired.forEach((k, bit) => {
        if (!((set >> bit) & 1)) return;
        const [from, to, side] = sides[k] as [number, number, number];
        barriers[from] = (barriers[from] as number) | side;
        barriers[to] = (barriers[to] as number) | across(side);
      });
      const desc = encodeWireDesc(tiles, barriers, w, h, p.wrapping);
      if (visit(newState(p, desc), desc)) stopped = true;
    }
  };
  const root = (group: number[], i: number): number => {
    let r = i;
    while (group[r] !== r) r = group[r] as number;
    return r;
  };
  const choose = (from: number, group: number[]): void => {
    if (stopped) return;
    if (wired.length === n - 1) {
      emit();
      return;
    }
    for (let k = from; k < sides.length && !stopped; k++) {
      const [a, b] = sides[k] as [number, number, number];
      const ra = root(group, a);
      const rb = root(group, b);
      if (ra === rb) continue;
      const joined = group.slice();
      joined[ra] = rb;
      wired.push(k);
      choose(k + 1, joined);
      wired.pop();
    }
  };
  choose(
    0,
    Array.from({ length: n }, (_, i) => i),
  );
}

describe("an Unreasonable Net board", () => {
  it.each([
    sized(3, 4, DIFF_UNREASONABLE, true),
    sized(4, 4, DIFF_UNREASONABLE, true),
    sized(5, 5, DIFF_UNREASONABLE),
    sized(4, 6, DIFF_UNREASONABLE),
    sized(5, 5, DIFF_UNREASONABLE, false, 0.3),
    sized(5, 5, DIFF_UNREASONABLE, true, 0.3),
  ])("%o is dealt with one answer that the solver does not reach", (p) => {
    for (let seed = 0; seed < 3; seed++) {
      const { desc, aux } = netGame.newDesc(p, randomNew(`unreasonable-${seed}`));
      const state = newState(p, desc);
      expect(solverFinishes(state), desc).toBe(false);
      expect(countNetworks(state), desc).toBe(1);
      // The answer Solve and the mistake check go by is that network, and it
      // is the one the board was drawn as.
      const answer = answerOf(state);
      if (answer.kind !== "one") throw new Error(`${desc}: no answer found`);
      expect(Array.from(answer.solution, (t) => t.toString(16)).join("")).toBe(aux);
      const solved = netGame.solve?.(state, state);
      if (!solved?.ok) throw new Error(`${desc}: Solve found no answer`);
      expect(netGame.status(netGame.executeMove(state, solved.move)), desc).toBe(
        "solved",
      );
    }
  });

  // The smallest boards the generator deals at the tier.
  describeDealtTiers(netGame, ["3x4wdu", "4x4wdu", "5x5du", "4x6du"]);
  // The largest preset, and the most walls.
  describeDealtTiers(netGame, ["11x13du", "11x13b0.3du"], { seldom: true });

  /** How many boards of the shape the solver leaves unsettled with exactly
   * one answer, and how many it settles. */
  const needingSearch = (p: NetParams): { found: number; settled: number } => {
    let found = 0;
    let settled = 0;
    eachBoard(p, (board) => {
      if (solverFinishes(board)) settled++;
      else if (countNetworks(board) === 1) found++;
      return false;
    });
    return { found, settled };
  };

  // Each of these is every board of its shape, walls and all, so it is a
  // proof for it. The solver settles every one.
  it.each([
    [1, 2, 1],
    [1, 6, 1],
    [2, 2, 8],
    [2, 3, 60],
    [2, 4, 448],
    [2, 5, 3344],
    [3, 3, 3072],
  ])("no %ix%i board needs a search and has one answer", (w, h, boards) => {
    const { found, settled } = needingSearch(sized(w, h, DIFF_EASY));
    expect(found).toBe(0);
    // The solver settles all of them but the two 3x3 networks with several
    // answers.
    expect(settled).toBe(w === 3 ? boards - 2 : boards);
  });

  itSlow.each([
    [2, 6],
    [3, 4],
  ])("no %ix%i board needs a search and has one answer", (w, h) => {
    expect(needingSearch(sized(w, h, DIFF_EASY)).found).toBe(0);
  });

  it.each([3, 5, 6])("no wrapping strip of %i squares does either", (length) => {
    const { found, settled } = needingSearch(sized(1, length, DIFF_EASY, true));
    expect(found).toBe(0);
    expect(settled).toBeGreaterThan(0);
  });

  // The same walk finds the tier on the smallest wrapping board that has it,
  // so it can see one.
  it("a 3x4 wrapping board can need a search and have one answer", () => {
    let found = "";
    eachBoard(
      sized(3, 4, DIFF_EASY, true),
      (board, desc) => {
        if (solverFinishes(board) || countNetworks(board) !== 1) return false;
        found = desc;
        return true;
      },
      false,
    );
    expect(found).not.toBe("");
  });

  // One budget each: the walks above are what prove these, and a budget here
  // is two million squares of network.
  describeAbsentTiers(netGame, ["1x7du", "1x5wdu", "2x2du", "3x3du", "4x3du"], {
    budgets: 1,
  });
});

describe("a pasted Net board", () => {
  const load = (id: string) => {
    const me = new Midend(netGame);
    const refusal = me.newGameFromId(id);
    return refusal ?? me.getParams();
  };

  it("with one answer that needs search opens as Unreasonable, whatever its ID says", () => {
    expect(load(`3x4w:${NEEDS_SEARCH}`)).toBe("3x4wdu");
    expect(load(`3x4wde:${NEEDS_SEARCH}`)).toBe("3x4wdu");
    expect(load(`3x4wdu:${NEEDS_SEARCH}`)).toBe("3x4wdu");
  });

  it("that the solver finishes opens as Easy", () => {
    expect(load(`3x4w:${SOLVER_FINISHES}`)).toBe("3x4wde");
    expect(load(`3x4wde:${SOLVER_FINISHES}`)).toBe("3x4wde");
  });

  it("with several answers, or none, is refused", () => {
    expect(load(`3x4w:${MANY_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    expect(load(`3x4wdu:${MANY_ANSWERS}`)).toBe(DESC_NOT_UNIQUE);
    // The board `untiered-load.test.ts` held as one deduction does not
    // finish: it has several answers too.
    expect(load("5x5:142c49b8aa4de5acd7b749286")).toBe(DESC_NOT_UNIQUE);
    expect(load(`3x4w:${NO_ANSWER}`)).toBe(DESC_CONTRADICTORY);
    // Four corners that join up only as a loop.
    expect(load("2x2:9c36")).toBe(DESC_CONTRADICTORY);
  });
});

describe("the hint on an Unreasonable Net board", () => {
  it("stops where the solver does, and goes on from a square locked rightly", () => {
    const p = sized(3, 4, DIFF_UNREASONABLE, true);
    const me = new Midend(netGame);
    expect(me.newGameFromId(`3x4wdu:${NEEDS_SEARCH}`)).toBeNull();
    let state = newState(p, NEEDS_SEARCH);
    const answer = answerOf(state);
    if (answer.kind !== "one") throw new Error("no answer found");

    /** Turn the first unlocked square to the answer's turning, or a quarter
     * turn past it, and lock it. */
    const lockFirst = (rightly: boolean): NetMove | null => {
      const i = state.tiles.findIndex((tile) => !(tile & LOCKED));
      if (i < 0) return null;
      const x = i % p.w;
      const y = (i - x) / p.w;
      const want = rightly
        ? (answer.solution[i] as number)
        : quarterTurn(answer.solution[i] as number);
      const ops: { op: "A" | "L"; x: number; y: number }[] = [];
      for (let t = (state.tiles[i] as number) & 0xf; t !== want; t = quarterTurn(t))
        ops.push({ op: "A", x, y });
      ops.push({ op: "L", x, y });
      return { type: "solve", ops };
    };

    /** Follow the hint, on the board and in the midend, as far as it goes. */
    const followHint = (): number => {
      let steps = 0;
      for (let plan = netGame.hint?.(state); plan?.ok; plan = netGame.hint?.(state))
        for (const step of plan.steps) {
          state = netGame.executeMove(state, step.move);
          me.playMoves([step.move]);
          steps++;
        }
      return steps;
    };

    followHint();
    expect(netGame.status(state)).toBe("ongoing");
    expect(netGame.findMistakes?.(state)).toEqual([]);
    // The midend lets the sentence through: this board's tier allows it.
    expect(me.hint()).toBe(DEDUCTION_EXHAUSTED);

    // A square locked wrongly is what the mistake check is there to catch.
    const wrong = lockFirst(false);
    if (!wrong) throw new Error("no unlocked square where the hint stopped");
    const tried = netGame.executeMove(state, wrong);
    expect(netGame.findMistakes?.(tried)?.length).toBeGreaterThan(0);

    // Locking squares rightly, one at a time, the hint finishes the board.
    for (let tries = 0; netGame.status(state) !== "solved"; tries++) {
      expect(tries).toBeLessThan(12);
      const move = lockFirst(true);
      if (!move) break;
      state = netGame.executeMove(state, move);
      me.playMoves([move]);
      followHint();
    }
    expect(netGame.status(state)).toBe("solved");
  });
});

describe("the tier in Net's params", () => {
  const refusal = (id: string) => paramsError(netGame, netGame.decodeParams(id), true);

  it("is written in the full form only, and a string without it is Easy", () => {
    const p = sized(7, 9, DIFF_UNREASONABLE, true, 0.25);
    expect(netGame.encodeParams(p, true)).toBe("7x9wb0.25du");
    expect(netGame.encodeParams(p, false)).toBe("7x9w");
    expect(netGame.decodeParams("7x9wb0.25du")).toEqual(p);
    expect(netGame.decodeParams("7x9wb0.25").diff).toBe(DIFF_EASY);
    // Upstream's letter for an unchecked board is still read past.
    expect(netGame.decodeParams("7x9wb0.25a")).toEqual({ ...p, diff: DIFF_EASY });
    expect(netGame.decodeParams("7x9wadu")).toEqual({ ...p, barrierProbability: 0 });
  });

  it("is refused only where no board has it", () => {
    expect(refusal("5x5du")).toBeNull();
    expect(refusal("4x4du")).toBeNull();
    expect(refusal("3x5du")).toBeNull();
    expect(refusal("2x7du")).toBeNull();
    expect(refusal("3x3wdu")).toBeNull();
    expect(refusal("2x6de")).toBeNull();
    expect(refusal("2x6du")).toBe("No 2x6 puzzle without wrapping is Unreasonable.");
    expect(refusal("4x3du")).toBe("No 4x3 puzzle without wrapping is Unreasonable.");
    expect(refusal("3x4wdu")).toBeNull();
    expect(refusal("1x9du")).toBe("No 1x9 puzzle is Unreasonable.");
    expect(refusal("9x1wdu")).toBe("No 9x1 puzzle is Unreasonable.");
  });

  it("bounds an Unreasonable board by its area, and a wrapping one by its length", () => {
    const area = /at most 900 squares/;
    expect(refusal("30x30du")).toBeNull();
    expect(refusal("3x300du")).toBeNull();
    expect(refusal("31x30du")).toMatch(area);
    expect(refusal("31x30de")).toBeNull();
    expect(refusal("10x80wdu")).toBeNull();
    expect(refusal("10x81wdu")).toMatch(
      /wrapping puzzle must be at most 80 squares long/,
    );
    expect(refusal("10x81du")).toBeNull();
    expect(refusal("4x30wdu")).toBeNull();
    expect(refusal("31x4wdu")).toMatch(
      /wrapping puzzle four squares wide must be at most 30 squares long/,
    );
    expect(refusal("5x31wdu")).toBeNull();
    // A board that arrives with its description is not held to it.
    expect(paramsError(netGame, sized(40, 40, DIFF_UNREASONABLE), false)).toBeNull();
  });

  it("bounds an Unreasonable board's walls", () => {
    expect(refusal("5x5b0.3du")).toBeNull();
    expect(refusal("5x5b0.31du")).toBe(
      "Unreasonable puzzles with a barrier probability over 0.3 are too rare to deal.",
    );
    expect(refusal("5x5b1de")).toBeNull();
  });
});
