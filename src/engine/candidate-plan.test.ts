import { describe, expect, it } from "vitest";
import type { CandidateHighlights } from "./candidate-hint.ts";
import {
  type CandidatePlan,
  type DupReason,
  type Firing,
  runCandidatePlan,
  runLatinCandidatePlan,
} from "./candidate-plan.ts";
import type { DeductionRecord } from "./deduction-record.ts";
import type { HintStep } from "./game.ts";
import { type RowColRegion, rowColRegions, type SingleReason } from "./latin-hint.ts";
import type { Point } from "./types.ts";

type Reason = { kind: string; near?: Point } | DupReason;
type Move = { type: string; [k: string]: unknown };
type Step = HintStep<Move, CandidateHighlights>;
type Plan = CandidatePlan<
  Move,
  CandidateHighlights,
  DeductionRecord,
  Reason,
  RowColRegion
>;
type Legs = Firing<Move, CandidateHighlights, Reason>;

/** Bitmask of candidates `ns` (bit `1 << n`). */
const bits = (...ns: number[]): number => ns.reduce((m, n) => m | (1 << n), 0);

const place = (x: number, y: number, n: number): DeductionRecord => ({
  kind: "place",
  x,
  y,
  n,
  reason: { kind: "clue" },
  group: 0,
});

/** Walk a plan whose words name the reason, the cell and whether the leg
 * continues; `over` supplies the board and whatever else the case needs. */
function walk(
  over: Partial<Plan> & Pick<Plan, "w" | "grid" | "pencil" | "steps">,
): void {
  const area = (r: Reason): Point[] => ("near" in r && r.near ? [r.near] : []);
  runCandidatePlan<Move, CandidateHighlights, DeductionRecord, Reason, RowColRegion>({
    autoClean: false,
    label: "test plan",
    record: () => [],
    regionsOf: (x, y) => rowColRegions(x, y, over.w),
    singleReason: (_n, why) => ({ kind: why.kind }),
    placeWords: (m, r, continues) => ({
      explanation: `${r.kind} ${m.x},${m.y}${continues ? " (cont)" : ""}`,
      area: area(r),
    }),
    strikeWords: (marks, r, continues) => ({
      explanation: `${r.kind} strike ${marks.length}${continues ? " (cont)" : ""}`,
      area: area(r),
    }),
    setUp: { done: () => true, step: () => false },
    ...over,
  });
}

describe("runCandidatePlan", () => {
  /** A 4×1 board whose solver records a clue placement in every cell, so the
   * ladder's last rung places them one by one, and whose own rung places cell
   * 0 with no notes. */
  function phases(opts: { setUpSteps: number; stuckAt?: number }): string[] {
    const steps: Step[] = [];
    const grid = new Uint8Array(4);
    let setUps = 0;
    walk({
      w: 4,
      steps,
      grid,
      pencil: new Int32Array(4),
      record: () =>
        [0, 1, 2, 3]
          .filter((x) => x < (opts.stuckAt ?? 4))
          .map((x) => place(x, 0, x + 1)),
      rungs: [
        () =>
          grid[0]
            ? []
            : [[{ place: { x: 0, y: 0, n: 1 }, reason: { kind: "opening" } }]],
      ],
      setUp: {
        done: () => setUps >= opts.setUpSteps,
        step: () => {
          setUps++;
          steps.push({ move: { type: "none" }, explanation: "setUp" });
          return true;
        },
      },
      stuck: () => steps.push({ move: { type: "none" }, explanation: "stuck" }),
    });
    return steps.map((s) => s.explanation);
  }

  it("takes the note-free rungs, then sets up, then the whole ladder", () => {
    expect(phases({ setUpSteps: 2 })).toEqual([
      "opening 0,0",
      "setUp",
      "setUp",
      "clue 1,0",
      "clue 2,0",
      "clue 3,0",
    ]);
  });

  it("goes straight to the ladder when there is nothing to set up", () => {
    expect(phases({ setUpSteps: 0 })[0]).toBe("opening 0,0");
  });

  it("calls stuck when nothing fires on an unfinished board", () => {
    expect(phases({ setUpSteps: 0, stuckAt: 2 })).toEqual([
      "opening 0,0",
      "clue 1,0",
      "stuck",
    ]);
  });

  /** A 3×3 board noting 1–3 everywhere, whose solver's one deduction places 1
   * in the corner. */
  function corner(autoClean: boolean): { steps: Step[]; pencil: Int32Array } {
    const steps: Step[] = [];
    const pencil = new Int32Array(9).fill(bits(1, 2, 3));
    let recorded = false;
    walk({
      w: 3,
      steps,
      grid: new Uint8Array(9),
      pencil,
      autoClean,
      record: () => {
        if (recorded) return [];
        recorded = true;
        return [place(0, 0, 1)];
      },
    });
    return { steps, pencil };
  }

  it("teaches a placement's row and column cull as a leg of its journey", () => {
    const { steps, pencil } = corner(false);
    expect(steps.map((s) => s.explanation)).toEqual([
      "clue 0,0",
      "dup strike 4 (cont)",
    ]);
    expect(steps[0].move).toEqual({
      type: "set",
      x: 0,
      y: 0,
      n: 1,
      pencil: false,
      autoElim: false,
    });
    expect(steps[1].continuesPrevious).toBe(true);
    expect(steps[1].highlights?.targets).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
    ]);
    expect(pencil[1] & bits(1)).toBe(0);
    expect(pencil[4]).toBe(bits(1, 2, 3));
  });

  it("culls silently under auto-pencil, which the move carries", () => {
    const { steps, pencil } = corner(true);
    expect(steps.map((s) => s.explanation)).toEqual(["clue 0,0"]);
    expect(steps[0].move).toMatchObject({ type: "set", autoElim: true });
    expect(pencil[3] & bits(1)).toBe(0);
  });

  /** One firing striking 2 and 3 from (1,0) and 2 from (2,0), leaving neither
   * down to one note. */
  function cage(axis?: (op: DeductionRecord) => unknown): {
    steps: Step[];
    pencil: Int32Array;
  } {
    const steps: Step[] = [];
    const pencil = Int32Array.from([0, bits(1, 2, 3, 4), bits(1, 2, 4), bits(1, 2)]);
    const elim = (x: number, n: number): DeductionRecord => ({
      kind: "elim",
      x,
      y: 0,
      n,
      reason: { kind: "cage" },
      group: 0,
    });
    walk({
      w: 4,
      steps,
      grid: Uint8Array.from([3, 0, 0, 0]),
      pencil,
      strikeAxis: axis,
      record: () => [elim(1, 2), elim(1, 3), elim(2, 2)],
    });
    return { steps, pencil };
  }

  it("splits a firing's strikes on the game's axis, the later legs continuing", () => {
    const { steps, pencil } = cage((op) => op.x);
    expect(steps.map((s) => s.explanation)).toEqual([
      "cage strike 2",
      "cage strike 1 (cont)",
    ]);
    expect(steps[0].continuesPrevious).toBeUndefined();
    expect(steps[1].continuesPrevious).toBe(true);
    expect(steps[0].highlights?.targets).toEqual([{ x: 1, y: 0 }]);
    expect(pencil[1]).toBe(bits(1, 4));
    expect(pencil[2]).toBe(bits(1, 4));
  });

  it("keeps a firing whole without an axis, each cell a target once", () => {
    const { steps } = cage();
    expect(steps.map((s) => s.explanation)).toEqual(["cage strike 3"]);
    expect(steps[0].highlights?.targets).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
  });

  describe("under the implicit reading", () => {
    const elim = (x: number, y: number, n: number, near?: Point): DeductionRecord => ({
      kind: "elim",
      x,
      y,
      n,
      reason: { kind: "pair", near },
      group: 0,
    });
    const notes = {
      populate: "populate",
      cleanObvious: "clean",
      note: (c: Point, values: number[], every: boolean) =>
        `note ${c.x},${c.y} ${values.join("")}${every ? " every" : ""}`,
    };
    /** Walk a 3×3 board whose solver's one firing is `ops`. */
    function implicitWalk(grid: Uint8Array, ops: DeductionRecord[]): Step[] {
      const steps: Step[] = [];
      let recorded = false;
      walk({
        w: 3,
        steps,
        grid,
        pencil: new Int32Array(9),
        reading: "implicit",
        setUp: undefined,
        notes,
        record: () => {
          if (recorded) return [];
          recorded = true;
          return ops;
        },
      });
      return steps;
    }

    it("writes a struck cell's candidates first, as a leg of the same journey", () => {
      // (0,0)'s row holds a 2, so it reads as 1 or 3 with no notes written.
      const steps = implicitWalk(Uint8Array.from([0, 2, 0, 0, 0, 0, 0, 0, 0]), [
        elim(0, 0, 3),
      ]);
      // The strike is the firing's own first leg, so it speaks in full; it
      // still continues the journey the note leg opened.
      expect(steps.slice(0, 3).map((s) => s.explanation)).toEqual([
        "note 0,0 13",
        "pair strike 1",
        "naked 0,0",
      ]);
      expect(steps[0].move).toEqual({
        type: "pencilAdd",
        marks: [
          { x: 0, y: 0, n: 1 },
          { x: 0, y: 0, n: 3 },
        ],
      });
      // A note step names its cell and draws no struck marks.
      expect(steps[0].highlights?.targets).toEqual([{ x: 0, y: 0 }]);
      expect(steps[0].highlights?.marks).toEqual([]);
      expect(steps[1].continuesPrevious).toBe(true);
    });

    it("notes a blank cell the firing outlines, but not a filled one", () => {
      const blank = implicitWalk(new Uint8Array(9), [elim(0, 0, 3, { x: 1, y: 1 })]);
      expect(blank.slice(0, 3).map((s) => s.explanation)).toEqual([
        "note 1,1 123 every",
        "note 0,0 123 every",
        "pair strike 1",
      ]);
      expect(blank.slice(1, 3).every((s) => s.continuesPrevious)).toBe(true);
      const filled = new Uint8Array(9);
      filled[4] = 2;
      expect(implicitWalk(filled, [elim(0, 0, 3, { x: 1, y: 1 })])[0].explanation).toBe(
        "note 0,0 123 every",
      );
    });

    it("notes the cells a step reads beyond its outline, as a cage deduction does", () => {
      const steps: Step[] = [];
      let recorded = false;
      walk({
        w: 3,
        steps,
        grid: new Uint8Array(9),
        pencil: new Int32Array(9),
        reading: "implicit",
        setUp: undefined,
        notes,
        record: () => {
          if (recorded) return [];
          recorded = true;
          return [elim(0, 0, 3)];
        },
        strikeWords: (marks, r) => ({
          explanation: `${r.kind} strike ${marks.length}`,
          area: [],
          hatch: [{ x: 1, y: 0 }],
          reads: [{ x: 1, y: 0 }],
        }),
      });
      expect(steps.slice(0, 3).map((s) => s.explanation)).toEqual([
        "note 1,0 123 every",
        "note 0,0 123 every",
        "pair strike 1",
      ]);
      // Read, not drawn: nothing the game did not mark is outlined, and the
      // read cells ride on the step as data a guard can check.
      expect(steps[2].highlights?.area).toEqual([]);
      expect(steps[2].highlights?.reads).toEqual([{ x: 1, y: 0 }]);
    });

    it("places a cell its regions have narrowed to one with no notes at all", () => {
      const steps = implicitWalk(Uint8Array.from([0, 2, 3, 0, 0, 0, 0, 0, 0]), []);
      expect(steps[0].explanation).toBe("regionsFull 0,0");
      expect(steps.some((s) => s.move.type === "pencilAll")).toBe(false);
    });

    it("leaves the populate reading as it was: a note-less cell is no single", () => {
      const steps: Step[] = [];
      walk({
        w: 3,
        steps,
        grid: Uint8Array.from([0, 2, 3, 0, 0, 0, 0, 0, 0]),
        pencil: new Int32Array(9),
        setUp: undefined,
        notes,
      });
      expect(steps[0].explanation).toBe("populate");
    });

    it("refuses a setup of the game's own, which it could not leave out", () => {
      expect(() =>
        walk({
          w: 3,
          steps: [],
          grid: new Uint8Array(9),
          pencil: new Int32Array(9),
          reading: "implicit",
        }),
      ).toThrow(/implicit reading/);
    });
  });

  it("continues from the evidence a firing shades, not only the cells it acts on", () => {
    // After the first placement, at (0,0), two firings compete. The rung order
    // prefers "far"; "near" acts on a cell as distant, but shades (0,0).
    const steps: Step[] = [];
    const grid = new Uint8Array(9);
    const at = (x: number, y: number, kind: string, near?: Point): Legs =>
      grid[y * 3 + x] ? [] : [{ place: { x, y, n: 1 }, reason: { kind, near } }];
    walk({
      w: 3,
      steps,
      grid,
      pencil: new Int32Array(9),
      finished: () => steps.length >= 3,
      rungs: [
        () =>
          (grid[0]
            ? [at(2, 2, "far"), at(2, 1, "near", { x: 0, y: 0 })]
            : [at(0, 0, "first")]
          ).filter((f) => f.length > 0),
      ],
    });
    expect(steps.map((s) => s.explanation)).toEqual([
      "first 0,0",
      "near 2,1",
      "far 2,2",
    ]);
  });
});

describe("runLatinCandidatePlan", () => {
  /** A reason union of the shape the preset requires: it can hold every arm of
   * a {@link SingleReason}. */
  type LatinReason = SingleReason | DupReason;
  type LatinStep = HintStep<Move, CandidateHighlights>;

  /** Walk a 3×3 plan through the preset. The game supplies its solver and its
   * words; it passes no regions, no single-reason function and no evidence for
   * a hidden single, because a row/column square cannot answer those
   * differently. */
  function latinWalk(over: {
    grid: Uint8Array;
    pencil: Int32Array;
    record: () => readonly DeductionRecord[];
  }): LatinStep[] {
    const steps: LatinStep[] = [];
    runLatinCandidatePlan<Move, CandidateHighlights, DeductionRecord, LatinReason>({
      w: 3,
      steps,
      autoClean: false,
      label: "latin test plan",
      ...over,
      placeWords: (m, r) => ({ explanation: `${r.kind} ${m.x},${m.y}`, area: [] }),
      strikeWords: (marks, r) => ({
        explanation: `${r.kind} strike ${marks.length}`,
        area: [],
      }),
      notes: { noun: "number", placedVerb: "standing" },
    });
    return steps;
  }

  it("classifies and hatches a hidden single with nothing from the game", () => {
    // 1 is noted only at (0,0) in row 0, so placing it there is a hidden single
    // in that row — and (0,0) still shows a second candidate, so it is not a
    // naked one. Nothing below names a row.
    const pencil = new Int32Array(9).fill(bits(2, 3));
    pencil[0] = bits(1, 2);
    const steps = latinWalk({
      grid: new Uint8Array(9),
      pencil,
      record: () => [
        { kind: "place", x: 0, y: 0, n: 1, reason: { kind: "single" }, group: 0 },
      ],
    });
    expect(steps[0].explanation).toBe("hiddenSingle 0,0");
    // "In this row" is the hatch; nothing is outlined, since no particular
    // cell is the reason.
    expect(steps[0].highlights?.hatch).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
    expect(steps[0].highlights?.area).toEqual([]);
  });

  it("names the regions in the setup sentences the game never writes", () => {
    const steps = latinWalk({
      grid: Uint8Array.from([1, 0, 0, 0, 0, 0, 0, 0, 0]),
      pencil: new Int32Array(9),
      record: () => [],
    });
    const [populate, clean] = steps.map((s) => s.explanation);
    expect(populate).toContain("number");
    // The two words are the game's; the phrase naming its regions is the
    // preset's, and is the whole reason `notes` does not carry one.
    expect(clean).toContain("number");
    expect(clean).toContain("standing");
    expect(clean).toContain("row or column");
  });

  it("still walks a plan the checker lets through", () => {
    // The companion to {@link blockRegionGame}: the preset is usable, so its
    // refusal of that game is a refusal and not a broken signature.
    const steps = latinWalk({
      grid: new Uint8Array(9),
      pencil: new Int32Array(9).fill(bits(1)),
      record: () => [],
    });
    expect(steps[0].explanation).toBe("single 0,0");
  });

  it("refuses the block-region game at compile time, not at run time", () => {
    // The refusal lives in {@link blockRegionGame}'s `@ts-expect-error`. What
    // is asserted here is the other half: nothing stops such a plan *running*,
    // so the type is the only thing standing between that game and a hidden
    // single shaded along the wrong region.
    expect(blockRegionGame).not.toThrow();
  });
});

/**
 * A game whose hidden singles name a *region* rather than a line — Solo's
 * shape. `SingleReason` is not assignable to that union, so the preset's
 * `NarratesSingles` constraint collapses its parameter to `never` and such a
 * game must call `runCandidatePlan` instead.
 *
 * This cannot be observed by running anything: the refusal is a type error, and
 * a preset that quietly accepted the game would pass every runtime test while
 * shading a row for a hidden single in a block. `@ts-expect-error` inverts it
 * into an assertion — the gate's typecheck fails this file if the line ever
 * stops erroring (`assert-never.test.ts` uses the same idiom).
 */
function blockRegionGame(): void {
  type BlockReason =
    | { kind: "single" }
    | { kind: "hiddenSingle"; n: number; region: string };
  // @ts-expect-error the reason union cannot hold a row/column hidden single.
  runLatinCandidatePlan<Move, CandidateHighlights, DeductionRecord, BlockReason>({
    w: 3,
    steps: [],
    grid: new Uint8Array(9),
    pencil: new Int32Array(9),
    autoClean: false,
    label: "refused",
    record: () => [],
    placeWords: () => ({ explanation: "", area: [] }),
    strikeWords: () => ({ explanation: "", area: [] }),
    setUp: { done: () => true, step: () => false },
  });
}
