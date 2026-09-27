/**
 * Ascent's explained hint: the claims its narration makes, and what only this
 * game can check.
 *
 * The cross-game guards cover narration form, plan purity, resuming from any
 * position and the overlay reaching the render cache; Ascent joined them by
 * declaring `hint()`. What is left here:
 *
 *  - **Following the hint finishes every board it deals, and every step is
 *    true**: after each one the board has no mistake. The corpus takes every
 *    preset and the custom options no preset has (hidden ends outside Edges,
 *    symmetric clues, no diagonals), because hidden ends are what the dead-end
 *    technique exists for.
 *  - **Every premise, restated from the board alone, singles out its square**:
 *    the reach a sentence names, the one way into a dead end, the numbers that
 *    cannot reach a square.
 *  - **No step uses a technique above its board's tier.**
 *  - **Every technique and every dead-end cause is reached**, the rare ones on
 *    boards pinned as descriptions (docs/games/hints.md § "Census the reasons,
 *    not only the rungs").
 */

import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import { leafPresets } from "../../engine/testing/hint-games.ts";
import {
  type AscentFiring,
  ascentKeepTrack,
  ascentPlan,
  boundsOf,
  type HintReason,
  squaresWithin,
  stepOf,
  techniqueTier,
  whyNotEnd,
} from "./hint.ts";
import { ascentGame } from "./index.ts";
import { executeAscentMove } from "./moves.ts";
import {
  type AscentParams,
  type AscentState,
  fromNumberEdge,
  isEdgeValid,
  isNear,
  isNumberEdge,
  MODE_EDGES,
  MODE_HONEYCOMB,
  MODE_ORTHOGONAL,
  MODE_RECT,
  movementForMode,
  NUMBER_EMPTY,
  newAscentState,
} from "./state.ts";

const custom = (
  w: number,
  h: number,
  diff: number,
  mode: number,
  removeends: boolean,
  symmetrical = false,
): AscentParams => ({ w, h, diff, mode, removeends, symmetrical });

/** Every preset, and at each tier the options no preset carries. */
const SHAPES: AscentParams[] = [
  ...leafPresets(ascentGame.presets()).map((p) => p.params),
  ...[0, 1, 2, 3].flatMap((d) => [
    custom(6, 6, d, MODE_ORTHOGONAL, false),
    custom(7, 7, d, MODE_RECT, true),
    custom(7, 7, d, MODE_RECT, false, true),
  ]),
  ...[1, 2, 3].map((d) => custom(6, 8, d, MODE_HONEYCOMB, true, true)),
];
const SEEDS = ["ah-a", "ah-b"];

/**
 * Boards on which a rare firing happens, pinned as the descriptions the hint
 * reads rather than as seeds, since a seed reaches the hint only through a
 * generator free to stop producing the board. Found by a scan of 30 seeds of
 * each hidden-ends shape; the census below fails if one stops firing.
 */
const PINNED = [
  // route, only, routeOnly
  "6x6mOEdh:j27a36a10b25_3b12m20",
  // a dead end, its other end out of reach
  "6x6mOEdh:a27g18e19i7b14a3c11a",
  // a dead end, its other end placed
  "6x6mOEdh:a13_16a20n8a2c29j",
  // a dead end, its other end's arrow pointing elsewhere
  "5x5mEEdn:1_25_12_14_2_5_11_19e22_4e17_15e3_10e13_9c7a8_21_16_18_23_20_6_24",
  // routeBeside
  "6x6mOEdh:12c16d24c7e28a26k32a34",
  // onlyBeside
  "6x6mOEdh:13a7g2e3k31a24e",
  // Tricky, and needs the last number measured from the one below it ("49 must
  // sit next to 48"): without that the hint reaches for a Hard route.
  "7x7mREdt:b46_39a30a48_44c37a5_43c33c7a25_35c9g10_16_20b13c19_21",
];

interface Board {
  label: string;
  params: AscentParams;
  state: AscentState;
}

function boards(): Board[] {
  const dealt = SHAPES.flatMap((params) =>
    SEEDS.map((seed) => {
      const label = `${ascentGame.encodeParams(params, true)} ${seed}`;
      const { desc } = ascentGame.newDesc(params, randomNew(label));
      return { label, params, state: newAscentState(params, desc) };
    }),
  );
  const pinned = PINNED.map((id) => {
    const [p, desc] = id.split(":");
    const params = ascentGame.decodeParams(p);
    return { label: id, params, state: newAscentState(params, desc) };
  });
  return [...dealt, ...pinned];
}

/** A firing and the board it was shown on, along the whole walk of a board. */
interface Seen {
  board: Board;
  firing: AscentFiring;
}

/** Follow whole plans from each board's start to the end, re-asking when one
 * runs out, and hand back every firing. Computed once for the file. */
let WALK: { seen: Seen[]; finished: string[]; unfinished: string[] } | null = null;
function walk(): NonNullable<typeof WALK> {
  if (WALK) return WALK;
  const seen: Seen[] = [];
  const finished: string[] = [];
  const unfinished: string[] = [];
  for (const board of boards()) {
    let state = board.state;
    for (let asks = 0; asks < 300 && !state.completed; asks++) {
      const plan = ascentPlan(state);
      if (plan.length === 0) break;
      for (const firing of plan) {
        seen.push({ board, firing });
        state = executeAscentMove(state, {
          kind: "place",
          cell: firing.cell,
          n: firing.n,
        });
        const mistakes = ascentGame.findMistakes?.(state) ?? [];
        if (mistakes.length > 0)
          throw new Error(
            `${board.label}: ${firing.reason.kind} placed a wrong number`,
          );
      }
    }
    (state.completed ? finished : unfinished).push(board.label);
  }
  WALK = { seen, finished, unfinished };
  return WALK;
}

describe("following the hint", () => {
  it("finishes every board it deals, one true number at a time", () => {
    const { seen, finished, unfinished } = walk();
    expect(unfinished).toEqual([]);
    expect(finished.length).toBe(SHAPES.length * SEEDS.length + PINNED.length);
    expect(seen.length).toBeGreaterThan(2000);
  });

  it("never uses a technique above its board's tier", () => {
    const over = walk().seen.filter(
      ({ board, firing }) =>
        techniqueTier(firing.reason.kind, board.params.mode) > board.params.diff,
    );
    expect(
      over.map(({ board, firing }) => `${board.label}: ${firing.reason.kind}`),
    ).toEqual([]);
  });
});

/** The border square holding `n`'s arrow, or -1. */
function arrowOf(state: AscentState, n: number): number {
  return state.grid.findIndex((v) => isNumberEdge(v) && fromNumberEdge(v) === n);
}

/** The numbers missing from the board. */
function missing(state: AscentState): number[] {
  const placed = new Set(state.grid.filter((v) => v >= 0));
  return Array.from({ length: state.last + 1 }, (_, n) => n).filter(
    (n) => !placed.has(n),
  );
}

/** Whether `m` could stand at `cell` by straight reach and its arrow alone. */
function reaches(state: AscentState, m: number, cell: number): boolean {
  const f: AscentFiring = { reason: { kind: "reach" }, n: m, cell, before: state };
  return squaresWithin(state, boundsOf(f), arrowOf(state, m)).includes(cell);
}

describe("every premise, restated from the board, singles out its square", () => {
  const byKind = (...kinds: HintReason["kind"][]) =>
    walk().seen.filter(({ firing }) => kinds.includes(firing.reason.kind));

  it("touch and reach: the reach the sentence names, and the arrow when it is needed", () => {
    const firings = byKind("touch", "reach");
    expect(firings.length).toBeGreaterThan(1000);
    let arrows = 0;
    for (const { board, firing } of firings) {
      const bounds = boundsOf(firing);
      const without = squaresWithin(firing.before, bounds, -1);
      const arrow = without.length > 1 ? arrowOf(firing.before, firing.n) : -1;
      if (arrow >= 0) arrows++;
      expect(squaresWithin(firing.before, bounds, arrow), board.label).toEqual([
        firing.cell,
      ]);
      // A touch is measured from neighbors in the sequence only.
      if (firing.reason.kind === "touch")
        for (const b of bounds) expect(b.d, board.label).toBe(1);
      // The step says what the premise rests on, and marks it.
      const { explanation, highlights } = stepOf(firing);
      const at = `${board.label}: "${explanation}"`;
      for (const b of bounds) {
        expect(explanation, at).toContain(String(b.m + 1));
        expect(highlights?.area, at).toContain(b.cell);
      }
      expect(explanation.includes("arrow"), at).toBe(arrow >= 0);
      expect((highlights?.hatch.length ?? 0) > 0, at).toBe(arrow >= 0);
    }
    // Vacuity: the arrow branch ran.
    expect(arrows).toBeGreaterThan(10);
  });

  it("a dead end: one way in, and the path's other end ruled out", () => {
    const firings = byKind("deadEnd");
    const causes = new Set<string>();
    for (const { board, firing } of firings) {
      const { before, cell, n } = firing;
      const { grid, last, w, h } = before;
      const placed = new Set(grid.filter((v) => v >= 0));
      const joinsMore = (m: number) =>
        (m > 0 && !placed.has(m - 1)) || (m < last && !placed.has(m + 1));
      const open: number[] = [];
      for (const { dx, dy } of movementForMode(before.mode).dirs) {
        const x = (cell % w) + dx;
        const y = Math.trunc(cell / w) + dy;
        if (x < 0 || x >= w || y < 0 || y >= h) continue;
        const v = grid[y * w + x];
        if (v === NUMBER_EMPTY || (v >= 0 && joinsMore(v))) open.push(y * w + x);
      }
      if (firing.reason.kind !== "deadEnd") throw new Error("unreachable");
      expect(open, board.label).toEqual([firing.reason.open]);
      expect([0, last], board.label).toContain(n);
      const other = n === 0 ? last : 0;
      const why = whyNotEnd(before, other, cell);
      causes.add(why);
      // Restated: placed, else out of straight reach, else off its arrow's line.
      const pseudo: AscentFiring = {
        reason: { kind: "reach" },
        n: other,
        cell,
        before,
      };
      const inReach = squaresWithin(before, boundsOf(pseudo), -1).includes(cell);
      expect(why, board.label).toBe(
        placed.has(other) ? "placed" : inReach ? "arrow" : "reach",
      );
      if (why === "arrow") {
        const arrow = arrowOf(before, other);
        expect(arrow, board.label).toBeGreaterThanOrEqual(0);
        expect(isEdgeValid(arrow, cell, w, h), board.label).toBe(false);
      }
      if (why !== "placed")
        expect(reaches(before, other, cell), board.label).toBe(false);
      const { explanation, highlights } = stepOf(firing);
      expect(highlights?.area, explanation).toEqual(open);
      expect(explanation).toMatch(
        why === "placed" ? /placed/ : why === "reach" ? /can't reach/ : /arrow points/,
      );
    }
    expect([...causes].sort()).toEqual(["arrow", "placed", "reach"]);
  });

  it("only one number can reach the square", () => {
    const firings = byKind("onlyBeside", "only");
    expect(firings.length).toBeGreaterThan(20);
    for (const { board, firing } of firings) {
      const { before, cell, n } = firing;
      const others = missing(before).filter((m) => m !== n && reaches(before, m, cell));
      expect(others, board.label).toEqual([]);
      // "This square is next to m": it is, and m is n's neighbor in the sequence.
      const { explanation, highlights } = stepOf(firing);
      if (firing.reason.kind !== "onlyBeside") continue;
      const [beside] = highlights?.area ?? [];
      expect(isNear(cell, beside, before.w, before.mode), explanation).toBe(true);
      expect(Math.abs(before.grid[beside] - n), explanation).toBe(1);
      expect(explanation).toContain(`next to ${before.grid[beside] + 1},`);
    }
  });
});

describe("every technique is reached", () => {
  const KINDS: Record<HintReason["kind"], true> = {
    touch: true,
    reach: true,
    deadEnd: true,
    onlyBeside: true,
    only: true,
    route: true,
    routeBeside: true,
    routeOnly: true,
  };

  it("fires each technique somewhere in the corpus", () => {
    const kinds = new Set(walk().seen.map(({ firing }) => firing.reason.kind));
    expect([...kinds].sort()).toEqual(Object.keys(KINDS).sort());
  });

  it("reads routes only on Hard boards and in Edges mode", () => {
    const routes = walk().seen.filter(({ firing }) =>
      firing.reason.kind.startsWith("route"),
    );
    expect(routes.length).toBeGreaterThan(20);
    const elsewhere = routes.filter(
      ({ board }) => board.params.diff !== 3 && board.params.mode !== MODE_EDGES,
    );
    expect(elsewhere.map(({ board }) => board.label)).toEqual([]);
  });
});

describe("following a step by hand", () => {
  it("completes on its own number in its own square, however it was entered", () => {
    const { firing } = walk().seen[0];
    const step = stepOf(firing);
    expect(
      ascentKeepTrack({ kind: "place", cell: firing.cell, n: firing.n }, step),
    ).toBe("completed");
    expect(
      ascentKeepTrack({ kind: "place", cell: firing.cell, n: firing.n + 1 }, step),
    ).toBe("off");
    expect(ascentKeepTrack({ kind: "clear", cell: firing.cell }, step)).toBe("off");
  });

  it("ends the plan at a step that fills in more than its own square", () => {
    // A line the player drew from the step's square fills in the next number
    // when the step's number lands; the numbers the line fills are theirs, and
    // the next hint reads them afresh.
    for (const { board, firing } of walk().seen) {
      if (firing.reason.kind !== "touch") continue;
      const { before, cell, n } = firing;
      const next = before.grid.indexOf(n - 1);
      if (next < 0 || before.grid.indexOf(n + 1) >= 0) continue;
      const empty = movementForMode(before.mode)
        .dirs.map(({ dx, dy }) => cell + dy * before.w + dx)
        .find(
          (j) =>
            j >= 0 &&
            j < before.grid.length &&
            before.grid[j] === NUMBER_EMPTY &&
            j !== cell,
        );
      if (empty === undefined) continue;
      const lined = executeAscentMove(before, {
        kind: "line",
        from: cell,
        to: empty,
        erase: false,
      });
      const plan = ascentPlan(lined);
      const at = plan.findIndex((f) => f.cell === cell && f.n === n);
      if (at < 0) continue;
      expect(plan.length, board.label).toBe(at + 1);
      return;
    }
    throw new Error("no touch step with a line to draw beside it");
  });
});
