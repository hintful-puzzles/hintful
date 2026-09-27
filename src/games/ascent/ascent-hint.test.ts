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
  firingTier,
  type HintReason,
  moveOf,
  runShortfall,
  runsOf,
  stepOf,
  whyNotEnd,
} from "./hint.ts";
import { ascentGame } from "./index.ts";
import { executeAscentMove } from "./moves.ts";
import { type Placed, readBoard, squaresMeeting } from "./premises.ts";
import {
  type AscentParams,
  type AscentState,
  fromNumberEdge,
  isBorderCell,
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
  stepDistance,
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
  // only, routeOnly
  "6x6mOEdh:j27a36a10b25_3b12m20",
  // route, since a whole run took the one above's
  "8x10mCdh:DhDd30b48Ca18fDa20a23_35b51C11a1b43bDb2c54aC8d40bD6b67_65cCa71a76b61aDc77_80b58D",
  // a dead end, its other end out of reach
  "6x6mOEdn:a35a7b25c5d3b23_28o14",
  // a dead end, its other end placed
  "6x6mOEdn:e1_35g8a20_13a28e29h17a",
  // a dead end, its other end's arrow pointing elsewhere
  "5x5mEEdt:11_19_16_7_8_13_5_2_17d1_20e15_21e14_10e23_9e25_3_22_24_6_4_12_18",
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
        state = executeAscentMove(state, moveOf(firing));
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
    expect(seen.length).toBeGreaterThan(1000);
  });

  it("never uses a technique above its board's tier", () => {
    const over = walk().seen.filter(
      ({ board, firing }) => firingTier(firing, board.params.mode) > board.params.diff,
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

/** The shape of the line `arrow` points along, read off its place on the
 * border: a side's middle squares hold rows or columns, a corner a diagonal. */
function shapeOf(state: AscentState, arrow: number): string {
  const { w, h } = state;
  const [r, c] = [Math.trunc(arrow / w), arrow % w];
  if (r > 0 && r < h - 1) return "row";
  if (c > 0 && c < w - 1) return "column";
  return "diagonal";
}

/** The empty squares on `arrow`'s line (any, at -1) within reach of every bound. */
const squaresWithin = (state: AscentState, bounds: readonly Placed[], arrow: number) =>
  squaresMeeting(readBoard(state), arrow, bounds);

/** The numbers missing from the board. */
function missing(state: AscentState): number[] {
  const placed = new Set(state.grid.filter((v) => v >= 0));
  return Array.from({ length: state.last + 1 }, (_, n) => n).filter(
    (n) => !placed.has(n),
  );
}

/** Whether `m` could stand at `cell` by straight reach and its arrow alone. */
function reaches(state: AscentState, m: number, cell: number): boolean {
  const f: AscentFiring = {
    reason: { kind: "reach" },
    n: m,
    cell,
    before: state,
    joins: false,
  };
  return squaresWithin(state, boundsOf(f), arrowOf(state, m)).includes(cell);
}

describe("every premise, restated from the board, singles out its square", () => {
  const byKind = (...kinds: HintReason["kind"][]) =>
    walk().seen.filter(({ firing }) => kinds.includes(firing.reason.kind));

  it("touch and reach: the reach the sentence names, and the arrow when it is needed", () => {
    const firings = byKind("touch", "reach");
    expect(firings.length).toBeGreaterThan(500);
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
      expect(
        explanation.match(/ on its (row|column|diagonal)\b/)?.[1] ?? null,
        at,
      ).toBe(arrow < 0 ? null : shapeOf(firing.before, arrow));
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
        joins: false,
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
    let fills = 0;
    let stripes = 0;
    for (const { board, firing } of firings) {
      const { before, cell, n } = firing;
      const others = missing(before).filter((m) => m !== n && reaches(before, m, cell));
      expect(others, board.label).toEqual([]);

      const { explanation, highlights } = stepOf(firing);
      const at = `${board.label}: "${explanation}"`;
      // "Only n can fill this square: <the one close rival fails>, and <counts>."
      if (explanation.startsWith(`Only ${n + 1} can fill`)) {
        fills++;
        expect(highlights?.hatch, at).toEqual([]);
        const rivals = runsOf(before)
          .filter((r) => !(r.lo <= n && n <= r.hi))
          .filter((r) => runShortfall(before, r, cell) <= 2);
        expect(rivals.length, at).toBeLessThanOrEqual(1);
        if (rivals.length === 0)
          expect(explanation, at).toContain("no other run comes close");
        else {
          const r = rivals[0];
          const named =
            r.a && r.b
              ? `the run between ${r.a.m + 1} and ${r.b.m + 1}`
              : r.a
                ? `the run after ${r.a.m + 1}`
                : `the run before ${(r.b?.m ?? -1) + 1}`;
          expect(explanation, at).toContain(named);
          // A run of one number fails for a square it cannot touch both ends of.
          if (r.lo === r.hi) expect(explanation, at).toContain("doesn't touch");
          for (const e of [r.a, r.b])
            if (e) expect(highlights?.area, at).toContain(e.cell);
        }
        continue;
      }
      stripes++;
      // The picture: the run's reach striped, exactly, and its ends outlined.
      const run = missing(before).filter((m) => sameRun(before, m, n));
      const lo = Math.min(...run);
      const hi = Math.max(...run);
      const reach = new Set<number>();
      for (let i = 0; i < before.grid.length; i++)
        if (run.some((m) => reaches(before, m, i))) reach.add(i);
      expect(highlights?.hatch, at).toEqual([...reach].sort((a, b) => a - b));
      expect(highlights?.hatch, at).toContain(cell);
      const ends = [lo - 1, hi + 1].filter((m) => m >= 0 && m <= before.last);
      expect(highlights?.area, at).toEqual(ends.map((m) => before.grid.indexOf(m)));
      for (const m of ends) expect(explanation, at).toContain(String(m + 1));
    }
    // Vacuity: both forms were checked.
    expect(fills).toBeGreaterThan(10);
    expect(stripes).toBeGreaterThan(10);
  });

  it("follows a run to its end in one journey, with nothing harder than its start", () => {
    const { seen } = walk();
    let journeys = 0;
    for (let i = 0; i < seen.length; i++) {
      const { board, firing } = seen[i];
      if (!firing.joins) continue;
      const lead = seen.slice(0, i).findLast((s) => !s.firing.joins);
      if (!lead) throw new Error("a joined step with nothing before it");
      const at = `${board.label}: ${firing.reason.kind} after ${lead.firing.reason.kind}`;
      expect(sameRun(lead.firing.before, lead.firing.n, firing.n), at).toBe(true);
      expect(firingTier(firing, board.params.mode), at).toBeLessThanOrEqual(
        firingTier(lead.firing, board.params.mode),
      );
      expect(stepOf(firing).continuesPrevious, at).toBe(true);
      // The journey ends with the run filled.
      const last = seen[i + 1]?.firing.joins !== true;
      if (last) {
        journeys++;
        const after = executeAscentMove(firing.before, {
          kind: "place",
          cell: firing.cell,
          n: firing.n,
        });
        const left = missing(after).filter((m) =>
          sameRun(lead.firing.before, m, lead.firing.n),
        );
        expect(left, at).toEqual([]);
      }
    }
    expect(journeys).toBeGreaterThan(5);
  });

  it("places a whole run at once only along its one route", () => {
    const firings = walk().seen.filter(
      ({ firing }) => firing.reason.kind === "wholeRun",
    );
    expect(firings.length).toBeGreaterThan(20);
    let withMust = 0;
    let withRoom = 0;
    let withArrows = 0;
    for (const { board, firing } of firings) {
      if (firing.reason.kind !== "wholeRun") continue;
      const { before } = firing;
      const { cells, must } = firing.reason;
      const at = `${board.label}: ${cells.map((c) => c.n + 1).join(",")}`;
      // The whole run, in order.
      const run = missing(before).filter((m) => sameRun(before, m, firing.n));
      expect(
        cells.map((c) => c.n),
        at,
      ).toEqual(run);
      // Every square the sentence says no other run reaches: this run's alone.
      const runs = runsOf(before);
      for (const c of must) {
        const reaching = runs.filter((r) => runShortfall(before, r, c) <= 0);
        expect(
          reaching.map((r) => r.lo),
          at,
        ).toEqual([run[0]]);
      }
      if (must.length > 0) withMust++;
      const { room } = firing.reason;
      if (room === null) {
        // It is the only route, counted here independently.
        expect(countRoutes(before, run, must), at).toBe(1);
      } else {
        // Every other route leaves the named run no route in what is left, and
        // this one leaves it one: listed here independently.
        withRoom++;
        const other = missing(before).filter((m) => sameRun(before, m, room));
        const chosen = cells.map((c) => c.cell);
        const routes = listRoutes(before, run, [], 50);
        expect(routes.length, at).toBeLessThan(50);
        expect(
          routes.map((r) => r.join()),
          at,
        ).toContain(chosen.join());
        for (const r of routes) {
          const grid = before.grid.slice();
          r.forEach((c, k) => {
            grid[c] = run[k];
          });
          const fits = listRoutes({ ...before, grid }, other, [], 1).length > 0;
          expect(fits, `${at} via ${r.join()}`).toBe(r.join() === chosen.join());
        }
      }
      expect(stepOf(firing).highlights?.route.length, at).toBeGreaterThan(cells.length);
      // "With each number on its arrow's line": only when, counted here with
      // the arrows ignored, the run has another route; then the run's arrows
      // are outlined.
      const { explanation, highlights } = stepOf(firing);
      const said = /arrow/.test(explanation);
      if (firing.reason.arrows || said) {
        withArrows++;
        // A "must" sentence too long to add the arrows keeps its old words.
        expect(firing.reason.arrows, `${at}: "${explanation}"`).toBe(true);
        if (!said) expect(must.length, `${at}: "${explanation}"`).toBeGreaterThan(0);
        expect(listRoutes(before, run, must, 2, false).length, at).toBe(2);
        for (const m of run) {
          const a = arrowOf(before, m);
          if (a >= 0) expect(highlights?.area, at).toContain(a);
        }
      } else if (board.params.mode === MODE_EDGES && room === null)
        expect(listRoutes(before, run, must, 2, false).length, at).toBe(1);
    }
    expect(withMust).toBeGreaterThan(0);
    expect(withRoom).toBeGreaterThan(0);
    expect(withArrows).toBeGreaterThan(0);
  });

  it("Edges lines: the square is the one on its line near every line and number named", () => {
    const firings = byKind("lines");
    expect(firings.length).toBeGreaterThan(20);
    let lineNamed = 0;
    for (const { board, firing } of firings) {
      if (firing.reason.kind !== "lines") continue;
      expect(board.params.mode, board.label).toBe(MODE_EDGES);
      const { before, cell, n } = firing;
      const { premises } = firing.reason;
      const { explanation, highlights } = stepOf(firing);
      const at = `${board.label}: "${explanation}"`;
      // Restated from the board: each premise's number is as far from `n` in
      // the sequence as it says, placed where it says, or missing with an arrow.
      for (const p of premises) {
        expect(Math.abs(p.m - n), at).toBe(p.d);
        if (p.cell !== null) expect(before.grid[p.cell], at).toBe(p.m);
        else {
          expect(before.grid.includes(p.m), at).toBe(false);
          expect(p.arrow, at).toBe(arrowOf(before, p.m));
          lineNamed++;
        }
        expect(explanation, at).toContain(
          p.arrow === null
            ? String(p.m + 1)
            : `${p.m + 1}'s ${shapeOf(before, p.arrow)}`,
        );
        expect(highlights?.area, at).toContain(p.arrow ?? p.cell);
      }
      expect(
        premises.some((p) => p.arrow !== null),
        at,
      ).toBe(true);
      // Where the arrows' lines cross: exactly the one square.
      expect(squaresNear(before, n, premises), at).toEqual([cell]);
      // The lines named are striped, and nothing else.
      const striped = new Set<number>();
      for (const p of premises)
        if (p.arrow !== null)
          for (let i = 0; i < before.grid.length; i++)
            if (
              !isBorderCell(i, before.w, before.h) &&
              isEdgeValid(p.arrow, i, before.w, before.h)
            )
              striped.add(i);
      expect(
        [...(highlights?.hatch ?? [])].sort((a, b) => a - b),
        at,
      ).toEqual([...striped].sort((a, b) => a - b));
    }
    expect(lineNamed).toBeGreaterThan(20);
  });

  it("Edges pointers: every other missing number that could stand here fails its premise", () => {
    const firings = byKind("pointers");
    expect(firings.length).toBeGreaterThan(10);
    let ruled = 0;
    for (const { board, firing } of firings) {
      if (firing.reason.kind !== "pointers") continue;
      const { before, cell, n } = firing;
      const { ruledOut, tier } = firing.reason;
      const { explanation, highlights } = stepOf(firing);
      const at = `${board.label}: "${explanation}"`;
      // The rivals, found from the board: every missing number whose arrow
      // points at the square, or that has none.
      const rivals = missing(before).filter((m) => {
        const a = arrowOf(before, m);
        return m !== n && (a < 0 || isEdgeValid(a, cell, before.w, before.h));
      });
      expect(
        ruledOut.map((o) => o.m).sort((a, b) => a - b),
        at,
      ).toEqual(rivals);
      for (const o of ruledOut) {
        ruled++;
        expect(Math.abs(o.by.m - o.m), at).toBe(o.by.d);
        expect(squaresNear(before, o.m, [o.by]).includes(cell), at).toBe(false);
        expect(explanation, at).toContain(String(o.m + 1));
      }
      // It stands here by every premise the rivals were measured by.
      expect(squaresNear(before, n, []).includes(cell), at).toBe(true);
      // Tricky only with a placed neighbor, as `single-number`'s simple form asks.
      const beside = [n - 1, n + 1].some((m) => before.grid.includes(m));
      expect(tier, at).toBe(beside ? 2 : 3);
      for (const a of ruledOut.map((o) => arrowOf(before, o.m)).filter((a) => a >= 0))
        expect(highlights?.area, at).toContain(a);
    }
    expect(ruled).toBeGreaterThan(20);
  });

  it("names the run a route step's stripes belong to", () => {
    const firings = byKind("routeBeside", "routeOnly");
    expect(firings.length).toBeGreaterThan(3);
    for (const { board, firing } of firings) {
      const { explanation, highlights } = stepOf(firing);
      // A route reaches no square straight reach does not.
      for (const i of highlights?.hatch ?? [])
        expect(
          missing(firing.before).some(
            (m) => sameRun(firing.before, m, firing.n) && reaches(firing.before, m, i),
          ),
          board.label,
        ).toBe(true);
      expect(highlights?.hatch, explanation).toContain(firing.cell);
      expect(explanation).toMatch(/through empty squares/);
    }
  });
});

/**
 * The routes a run can take, counted by brute force: every assignment of its
 * numbers to distinct empty squares with each next to the one before, the
 * placed ends included, taking in every square of `must`, and in Edges mode
 * on each number's arrow line. Stops counting at two.
 */
function countRoutes(state: AscentState, run: number[], must: number[]): number {
  return listRoutes(state, run, must, 2).length;
}

/** The routes {@link countRoutes} counts, each as its squares in the run's
 * order, up to `cap` of them. */
function listRoutes(
  state: AscentState,
  run: number[],
  must: number[],
  cap: number,
  onArrows = true,
): number[][] {
  const { w, h, grid, mode, last } = state;
  let reversed = false;
  const adj = (a: number, b: number) => isNear(a, b, w, mode);
  const cellOf = (m: number) => grid.indexOf(m);
  const lo = run[0];
  const hi = run[run.length - 1];
  let from = lo > 0 ? cellOf(lo - 1) : -1;
  let to = hi < last ? cellOf(hi + 1) : -1;
  // Walk from a placed end: a route read backwards is the same route.
  if (from < 0) {
    [from, to] = [to, from];
    run = [...run].reverse();
    reversed = true;
  }
  const arrow = (m: number) =>
    grid.findIndex((v) => isNumberEdge(v) && fromNumberEdge(v) === m);
  const empties = [...grid.keys()].filter((i) => grid[i] === NUMBER_EMPTY);
  const out: number[][] = [];
  const used: number[] = [];
  const place = (k: number) => {
    if (out.length >= cap) return;
    if (k === run.length) {
      if (to >= 0 && !adj(used[k - 1], to)) return;
      if (must.every((c) => used.includes(c)))
        out.push(reversed ? [...used].reverse() : [...used]);
      return;
    }
    const prev = k === 0 ? from : used[k - 1];
    for (const c of empties) {
      if (used.includes(c) || (prev >= 0 && !adj(prev, c))) continue;
      if (to >= 0 && stepDistance(c, to, w, mode) > run.length - k) continue;
      const a = onArrows ? arrow(run[k]) : -1;
      if (a >= 0 && !isEdgeValid(a, c, w, h)) continue;
      used.push(c);
      place(k + 1);
      used.pop();
    }
  };
  place(0);
  return out;
}

/**
 * The empty squares on `n`'s arrow line (all of them, when it has none) within
 * `p.d` steps of each premise: of the placed number's square, or of some empty
 * square on the missing number's arrow line.
 */
function squaresNear(
  state: AscentState,
  n: number,
  premises: readonly {
    m: number;
    d: number;
    cell: number | null;
    arrow: number | null;
  }[],
): number[] {
  const { w, h, grid, mode } = state;
  const empties = [...grid.keys()].filter((i) => grid[i] === NUMBER_EMPTY);
  const onLine = (a: number, i: number) => a < 0 || isEdgeValid(a, i, w, h);
  const own = arrowOf(state, n);
  return empties.filter(
    (i) =>
      onLine(own, i) &&
      premises.every((p) =>
        p.cell !== null
          ? stepDistance(i, p.cell, w, mode) <= p.d
          : empties.some(
              (e) => onLine(p.arrow as number, e) && stepDistance(i, e, w, mode) <= p.d,
            ),
      ),
  );
}

/** Whether missing numbers `a` and `b` lie in one run, no placed number between. */
function sameRun(state: AscentState, a: number, b: number): boolean {
  const placed = new Set(state.grid.filter((v) => v >= 0));
  for (let m = Math.min(a, b); m <= Math.max(a, b); m++)
    if (placed.has(m)) return false;
  return true;
}

describe("positions from the owner's playtest", () => {
  /** A Hexagon Hard board with the numbers listed missing and the rest placed. */
  function position(seed: string, missingNumbers: number[]): AscentState {
    const params = ascentGame.decodeParams("7x7mHdh");
    const start = newAscentState(
      params,
      ascentGame.newDesc(params, randomNew(seed)).desc,
    );
    const solved = ascentGame.solve?.(start, start);
    if (!solved?.ok || solved.move.kind !== "solve") throw new Error("unsolvable");
    // The solve move reports only numbers; walls stay the board's own.
    const answer = solved.move.grid;
    const grid = start.grid.map((v, i) =>
      answer[i] >= 0 && !missingNumbers.includes(answer[i] + 1) ? answer[i] : v,
    );
    return { ...start, grid };
  }

  it("places the run between 33 and 37 along the one route that leaves 28 to 33 room", () => {
    const state = position(
      "87afd06a94569a0c5c643d036285edc3",
      [29, 30, 31, 32, 34, 35, 36],
    );
    const [first] = ascentPlan(state);
    const step = stepOf(first);
    expect(step.move.kind).toBe("places");
    expect(step.explanation).toBe(
      "Only one route for the run between 33 and 37 leaves the run between 28 and 33 a way through, so it must take the line.",
    );
  });
});

describe("a sentence names only numbers the player can see", () => {
  it("names placed numbers, arrow clues, and the numbers the step places", () => {
    // A number followed by "step(s)", "of" or "from" is a distance, not a
    // number on the path: "within 2 steps of 8 and 3 of 13".
    const NUMBER = /\b(\d+)\b(?! steps?\b| of\b| from\b)/g;
    let checked = 0;
    for (const { board, firing } of walk().seen) {
      const { grid } = firing.before;
      const visible = new Set<number>();
      for (const v of grid) {
        if (v >= 0) visible.add(v + 1);
        else if (isNumberEdge(v)) visible.add(fromNumberEdge(v) + 1);
      }
      const move = moveOf(firing);
      const placing = move.kind === "places" ? move.cells.map((c) => c.n) : [firing.n];
      for (const n of placing) visible.add(n + 1);
      const { explanation } = stepOf(firing);
      for (const [, digits] of explanation.matchAll(NUMBER)) {
        expect(visible.has(Number(digits)), `${board.label}: "${explanation}"`).toBe(
          true,
        );
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(1000);
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
    wholeRun: true,
    lines: true,
    pointers: true,
  };

  it("fires each technique somewhere in the corpus", () => {
    const kinds = new Set(walk().seen.map(({ firing }) => firing.reason.kind));
    expect([...kinds].sort()).toEqual(Object.keys(KINDS).sort());
  });

  it("reads routes only on Hard boards and in Edges mode", () => {
    const routes = walk().seen.filter(({ firing }) =>
      firing.reason.kind.startsWith("route"),
    );
    // Edges boards read few since the arrows' techniques took most of theirs.
    expect(routes.length).toBeGreaterThan(10);
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
