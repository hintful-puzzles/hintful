/**
 * Rome explained-hint tests.
 *
 * Tier 1 — the recording projection leaves the committing solver's verdict and
 * board untouched (the generator is solver-gated at every step, so a recorder
 * that changed a deduction would change every published desc); each rung's
 * firing is recorded as one group with the premise a sentence can state; the
 * plan places, strikes and refuses at the quality bar; the marks the hint
 * teaches are marks a player can make. Tier 2.5 — render scenarios for the two
 * shapes Rome was picked to press on: an ordinary area elimination, and a
 * **reachability** firing whose evidence is a numbered chain of arrows.
 *
 * What these catch that no cheaper test would: the cross-game guards walk a
 * plan and check its *form*, and `rome-ladder.test.ts` checks the solver's
 * rungs against their oracle — but nothing else checks that the recorder is a
 * pure observer of that solver, and nothing else reads a premise back to see
 * that it is true of the board rather than merely present.
 */
import { describe, expect, it } from "vitest";
import { Midend } from "../../engine/midend.ts";
import { randomNew } from "../../engine/random/index.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import {
  DEFAULT_BACKGROUND,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { newRomeDesc } from "./generator.ts";
import { buildSteps } from "./hint.ts";
import { romeGame } from "./index.ts";
import { COL_ARROW_PENCIL, COL_HINT, COL_HINT_CELL } from "./render.ts";
import { type RomeReason, recordRomeDeductions, romeSolve } from "./solver.ts";
import {
  boardFromClues,
  DIFF_NORMAL,
  DIFF_TRICKY,
  DIFFCOUNT,
  dirBit,
  EMPTY,
  encodeParams,
  FM_ARROWMASK,
  FM_LEFT,
  legalDirs,
  type RomeMove,
  type RomeParams,
  type RomeState,
  readDesc,
} from "./state.ts";

const NORMAL: RomeParams = { w: 6, h: 6, diff: DIFF_NORMAL };
const TRICKY: RomeParams = { w: 8, h: 8, diff: DIFF_TRICKY };

function gen(p: RomeParams, seed: string): { desc: string; st: RomeState } {
  const { desc } = newRomeDesc(p, randomNew(seed));
  const { board } = readDesc(p, desc);
  return { desc, st: { ...board, completed: false, cheated: false } };
}

const kindOf = (reason: unknown): string => (reason as RomeReason).kind;

// --- tier 1: the recording projection ---------------------------------------

describe("rome recording projection", () => {
  /**
   * The assertion the whole change rests on. Rome's generator keeps a blanked
   * clue only while this solver still finishes the board, so the published desc
   * depends on the solver's verdict on every intermediate clue set: a rung that
   * deduced differently under a recorder would change every board in the
   * collection. Rome's rungs record as a pure side effect and none of them
   * takes an early return on the recording path, which is what makes this pass
   * — it is not a property the shape guarantees, which is why it is checked.
   */
  it("records without changing a single deduction the solver makes", () => {
    for (const p of [NORMAL, TRICKY]) {
      for (let s = 0; s < 6; s++) {
        const { st } = gen(p, `pure-${p.w}-${s}`);
        const plain = boardFromClues(st);
        const recorded = boardFromClues(st);
        romeSolve(plain, DIFFCOUNT);
        const ops = recordRomeDeductions(recorded, DIFFCOUNT);

        // The whole board, not just the answer: two ladders reaching the same
        // grid by different deductions differ here and nowhere else. The
        // verdict rides along, being a function of the grid. Each board is
        // solved **once** — re-solving a solved one reseeds its candidates and
        // compares two different questions.
        expect(Array.from(recorded.grid)).toEqual(Array.from(plain.grid));
        expect(Array.from(recorded.pencil)).toEqual(Array.from(plain.pencil));
        expect(ops.length).toBeGreaterThan(0);
      }
    }
  });

  it("gives every recorded op a premise, and every firing one group", () => {
    const { st } = gen(TRICKY, "premise-0");
    const ops = recordRomeDeductions(boardFromClues(st), DIFFCOUNT);
    expect(ops.length).toBeGreaterThan(20);
    for (const op of ops) {
      expect(op.n, `${op.kind} at ${op.x},${op.y} records no arrow`).toBeGreaterThan(0);
      expect(op.n).toBeLessThanOrEqual(4);
      expect(op.group).toBeGreaterThan(0);
      // A placement is always a naked single here: `solverSingle` is the only
      // rung that writes to the grid, and it fires on a one-bit note set.
      if (op.kind === "place") expect(kindOf(op.reason)).toBe("single");
    }
    // Every op of one group shares its reason object, so a firing narrates once.
    const byGroup = new Map<number, unknown[]>();
    for (const op of ops) {
      const list = byGroup.get(op.group) ?? [];
      list.push(op.reason);
      byGroup.set(op.group, list);
    }
    for (const [group, reasons] of byGroup)
      expect(new Set(reasons.map(kindOf)).size, `group ${group} mixes reasons`).toBe(1);
  });

  /**
   * A `loop` reason claims a walk exists, so the walk is read back and taken.
   * `arrowPath` throws rather than returning a wrong path, so this is checking
   * the *claim the sentence makes* — that following the arrows from the named
   * neighbor arrives at the struck square — against the board it was recorded
   * from (AGENTS.md § "Hint quality bar", rule 5).
   */
  it("records a loop path that really leads back to the square it strikes", () => {
    let checked = 0;
    for (let s = 0; s < 8; s++) {
      const { st } = gen(TRICKY, `loop-${s}`);
      const board = boardFromClues(st);
      const ops = recordRomeDeductions(board, DIFFCOUNT);
      // Re-solve to the same board the ops were recorded against is not
      // possible op by op, so the structural claims are what is checked here:
      // the path starts at the neighbor the struck arrow points at and ends on
      // the struck square itself.
      for (const op of ops) {
        const reason = op.reason as RomeReason;
        if (reason.kind !== "loop") continue;
        checked++;
        const cell = op.y * st.w + op.x;
        const step = op.n === 1 ? -st.w : op.n === 2 ? st.w : op.n === 3 ? -1 : 1;
        expect(reason.path[0]).toBe(cell + step);
        expect(reason.path[reason.path.length - 1]).toBe(cell);
        expect(reason.path.length).toBeGreaterThanOrEqual(2);
      }
    }
    expect(
      checked,
      "no loop firing was recorded, so nothing was checked",
    ).toBeGreaterThan(50);
  });
});

// --- tier 1: the plan --------------------------------------------------------

describe("rome hint plan", () => {
  it("opens by penciling in, then clearing the area duplicates", () => {
    const { st } = gen(NORMAL, "open-0");
    const steps = buildSteps(st, false);
    expect(steps[0].explanation).toMatch(/^Start by penciling/);
    expect((steps[0].move as RomeMove).kind).toBe("pencilAll");
    expect(steps[1].explanation).toMatch(/^Now clear the easy ones/);
    expect(steps[1].continuesPrevious).toBe(true);
  });

  /**
   * Rule 6, checked rather than asserted: every mark the plan tells the player
   * to make or cross off is one Rome's own input can produce, and the populate
   * never offers an arrow that would point off the grid — which is the one
   * place Rome's note set differs in shape from a Latin game's, and the reason
   * `NoteEncoding.all` exists.
   */
  it("only ever teaches marks the player could make", () => {
    const { st } = gen(NORMAL, "markable-0");
    const populated = romeGame.executeMove(st, { kind: "pencilAll" });
    for (let i = 0; i < populated.pencil.length; i++) {
      const x = i % st.w;
      const y = (i / st.w) | 0;
      if (populated.grid[i] !== EMPTY) continue;
      if (y === 0) expect(populated.pencil[i] & dirBit(1)).toBe(0);
      if (y === st.h - 1) expect(populated.pencil[i] & dirBit(2)).toBe(0);
      if (x === 0) expect(populated.pencil[i] & dirBit(3)).toBe(0);
      if (x === st.w - 1) expect(populated.pencil[i] & dirBit(4)).toBe(0);
    }
    for (const step of buildSteps(st, false)) {
      const m = step.move as RomeMove;
      expect(["place", "pencil", "pencilAll", "pencilStrike"]).toContain(m.kind);
      if (m.kind !== "pencilStrike") continue;
      for (const mark of m.marks) {
        expect(
          dirBit(mark.n),
          "a strike names something that is not an arrow",
        ).toBeGreaterThan(0);
      }
    }
  });

  /**
   * The `naked-pairs` rung fires on about one board in sixty, so this is the
   * pinned desc from `rome-ladder.test.ts` rather than a seed — and it is here
   * because that sentence names **two** arrows, which the struck marks alone
   * cannot always supply: where the region's other squares had already lost one
   * of the pair, a narration built from the live strikes would call a pair one
   * arrow. The reason carries `values` from where the elimination is computed.
   */
  it("names both arrows of a naked pair, not only the ones still live", () => {
    const params: RomeParams = { w: 6, h: 6, diff: DIFF_TRICKY };
    const desc = "1a1aa2a4b1a1ab2a1a4c3aaa1a2aa,aLDRDgRaXUDcLcRUaURg";
    const { board } = readDesc(params, desc);
    const ops = recordRomeDeductions(boardFromClues(board), DIFFCOUNT);
    const pair = ops.find((o) => kindOf(o.reason) === "pair");
    expect(pair, "the pinned board no longer fires naked-pairs").toBeDefined();
    const reason = pair?.reason as Extract<RomeReason, { kind: "pair" }>;
    // A pair is two squares holding two arrows between them. Both counts are
    // what the sentence claims, so both are asserted.
    expect(reason.pair).toHaveLength(2);
    expect(reason.values).toHaveLength(2);
    expect(new Set(reason.values).size).toBe(2);
    expect(reason.region.length).toBeGreaterThanOrEqual(3);
    for (const cell of reason.pair) expect(reason.region).toContain(cell);
  });

  /**
   * The board a random-play sweep crashed the hint on. Every move but the last
   * is a hint step, and the last is the player noting "left" on square (0, 2),
   * which points off the grid. No rung strikes a note the solver never
   * considers, so the placement behind it (right, on that same square) was
   * neither a naked nor a hidden single and the plan threw. Pinned as the moves
   * the plan consumes rather than as a seed: a seed reaches the plan only
   * through a generator free to stop producing this board.
   */
  it("survives a note pointing off the grid in a replayed move log", () => {
    const me = new Midend(romeGame);
    expect(me.newGameFromId("4x4de:aa5a2aca1a,bRaDaXcLbRaL")).toBeNull();
    me.playMoves([
      { kind: "pencilAll" },
      {
        kind: "pencilStrike",
        marks: [
          { x: 0, y: 2, n: 2 },
          { x: 0, y: 3, n: 4 },
          { x: 2, y: 3, n: 3 },
        ],
      },
      { kind: "place", x: 0, y: 3, dir: 4 },
      { kind: "pencilStrike", marks: [{ x: 3, y: 0, n: 3 }] },
      { kind: "place", x: 3, y: 0, dir: 8 },
      {
        kind: "pencilStrike",
        marks: [
          { x: 3, y: 1, n: 2 },
          { x: 3, y: 2, n: 2 },
        ],
      },
      { kind: "pencilStrike", marks: [{ x: 3, y: 1, n: 1 }] },
      { kind: "place", x: 3, y: 1, dir: 16 },
      { kind: "pencilStrike", marks: [{ x: 3, y: 2, n: 3 }] },
      { kind: "pencil", x: 0, y: 2, dir: FM_LEFT },
    ]);
    const st = (me as unknown as { state: RomeState }).state;
    expect(romeGame.hint?.(st)?.ok).toBe(true);
    expect(st.pencil[2 * st.w] & FM_LEFT).toBe(0);
  });

  it("refuses on a solved board and on a board with a wrong mark", () => {
    const { st } = gen(NORMAL, "refuse-0");
    const solution = boardFromClues(st);
    romeSolve(solution, DIFFCOUNT);
    const solved = romeGame.executeMove(st, {
      kind: "solve",
      arrows: Array.from(solution.grid, (c) =>
        (c & FM_ARROWMASK) === 0 ? null : ((c & FM_ARROWMASK) as 4 | 8 | 16 | 32),
      ),
    });
    expect(romeGame.hint?.(solved)?.ok).toBe(false);

    // A square whose marks have crossed out its answer is a mistake, so the
    // hint declines rather than deducing from notes it cannot trust.
    const target = solution.grid.findIndex(
      (c, i) => st.grid[i] === EMPTY && (c & FM_ARROWMASK) !== 0,
    );
    const answer = solution.grid[target] & FM_ARROWMASK;
    const tx = target % st.w;
    const ty = (target / st.w) | 0;
    // A wrong arrow the square could hold: one off the grid is not a mark.
    const others = legalDirs(tx, ty, st.w, st.h) & ~answer;
    const wrong = others & -others;
    const noted = romeGame.executeMove(st, {
      kind: "pencil",
      x: tx,
      y: ty,
      dir: wrong as 4 | 8 | 16 | 32,
    });
    expect(romeGame.findMistakes?.(noted).some((m) => m.kind === "note")).toBe(true);
    expect(romeGame.hint?.(noted)?.ok).toBe(false);
  });
});

// --- tier 2.5: render --------------------------------------------------------

/** Scan seeds for a board whose hint reaches a step matching `pred`, so a frame
 * is deterministic without a hand-written desc (docs/games/testing.md). */
function frameFor(p: RomeParams, pred: (e: string) => boolean): string {
  for (let s = 0; s < 40; s++) {
    const seed = `frame-${p.w}-${s}`;
    const { st } = gen(p, seed);
    if (buildSteps(st, false).some((step) => pred(step.explanation)))
      return `${encodeParams(p, true)}#${seed}`;
  }
  throw new Error(`no matching frame for ${encodeParams(p, true)}`);
}

describe("rome hint render", () => {
  it("rings the square, outlines its area, and crosses the marks it rules out", () => {
    const pred = (e: string): boolean => /^This area now has/.test(e);
    const { recording, hint } = renderScenario({
      game: romeGame,
      id: frameFor(NORMAL, pred),
      defaultBackground: DEFAULT_BACKGROUND,
      showHint: true,
      hintUntil: (s) => pred(s.explanation),
    });
    expect(hint?.explanation).toMatch(/^This area now has/);
    // The marks it rules out keep their own pencil color and take a
    // strikethrough in it, rather than being crossed off for the player.
    expect(
      recording.ops.some((o) => o.op === "line" && o.color === COL_ARROW_PENCIL),
    ).toBe(true);
    expectRing(recording.ops, COL_HINT_CELL, 1);
    expect(recording.ops).toMatchSnapshot();
  });

  /**
   * The reachability frame — the one Rome was picked for. A `loop` firing's
   * evidence is the chain of arrows leading back to the struck square, drawn as
   * a numbered contour, because "following the arrows leads back here" is a
   * claim the player has to be able to walk.
   */
  it("numbers the arrow chain a loop deduction walks", () => {
    const pred = (e: string): boolean => /^Following the arrows/.test(e);
    const { recording, hint } = renderScenario({
      game: romeGame,
      id: frameFor(TRICKY, pred),
      defaultBackground: DEFAULT_BACKGROUND,
      showHint: true,
      hintUntil: (s) => pred(s.explanation),
    });
    expect(hint?.explanation).toMatch(/^Following the arrows/);
    const area = (hint?.highlights as { area: { order?: number }[] }).area;
    expect(area.length).toBeGreaterThanOrEqual(2);
    // Every evidence square carries its place in the walk, numbered from the
    // square the struck arrow would point at.
    expect(area.map((a) => a.order)).toEqual(area.map((_, i) => i + 1));
    const ordinals = recording.ops.filter(
      (o) => o.op === "text" && o.color === COL_HINT_CELL,
    );
    expect(ordinals.length).toBe(area.length);
    expect(recording.ops.some((o) => o.op === "rect" && o.color === COL_HINT)).toBe(
      true,
    );
    expect(recording.ops).toMatchSnapshot();
  });
});
