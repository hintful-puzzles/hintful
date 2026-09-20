/**
 * Solo explained-hint tests.
 *
 * Tier 1 — the recording solver records a reason per technique (incl. a killer
 * deduction and an X-diagonal deduction) and its replayed placements complete a
 * generated board; `hint` populates, strikes (deductive eliminations + basic
 * region culls) and places with quality-bar narration; refusal on solved / on
 * mistakes; `hintKeepTrack` verdicts. Tier 2.5 — a render-scenario snapshot of a
 * deductive elimination journey frame (struck candidate `COL_PENCIL`
 * strikethrough, evidence `COL_HINT_CELL`, grid/clues still drawn).
 */
import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import {
  DEFAULT_BACKGROUND,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { newSoloDesc } from "./generator.ts";
import { noRepeatRegionNames, regionsOf, soloGame } from "./index.ts";
import { COL_HINT_CELL, COL_PENCIL, digitChar } from "./render.ts";
import { type HintReason, recordSoloDeductions } from "./solver.ts";
import {
  DIFF_BLOCK,
  DIFF_EXTREME,
  DIFF_INTERSECT,
  DIFF_KINTERSECT,
  DIFF_SET,
  DIFF_SIMPLE,
  defaultParams,
  encodeParams,
  newState,
  type SoloMove,
  type SoloParams,
  type SoloState,
  SYMM_NONE,
  status as soloStatus,
} from "./state.ts";

function gen(p: SoloParams, seed: string) {
  const { desc, aux } = newSoloDesc(p, randomNew(seed));
  return { p, desc, aux, st: newState(p, desc) };
}

// biome-ignore lint/suspicious/noExplicitAny: structural access to hint highlights/move in tests.
type AnyStep = any;

const BASIC: SoloParams = { ...defaultParams(), diff: DIFF_SIMPLE };
const INTER: SoloParams = { ...defaultParams(), diff: DIFF_INTERSECT };
const ADV: SoloParams = { ...defaultParams(), diff: DIFF_SET };
const XADV: SoloParams = { ...defaultParams(), diff: DIFF_SET, xtype: true };
const EXTREME: SoloParams = { ...defaultParams(), diff: DIFF_EXTREME };
const KILLER: SoloParams = {
  c: 3,
  r: 3,
  symm: SYMM_NONE,
  diff: DIFF_BLOCK,
  kdiff: DIFF_KINTERSECT,
  xtype: false,
  killer: true,
};

// --- tier 1: recording solver ----------------------------------------------

describe("solo recording solver", () => {
  it("records reasons and its placements complete the board (Normal)", () => {
    const { st } = gen(BASIC, "rec-basic");
    const ops = recordSoloDeductions(st, DIFF_SIMPLE);
    expect(ops.length).toBeGreaterThan(0);
    const cr = st.cr;
    const filled = new Int8Array(cr * cr);
    for (let i = 0; i < cr * cr; i++) if (st.immutable[i]) filled[i] = st.grid[i];
    for (const op of ops) if (op.kind === "place") filled[op.y * cr + op.x] = op.n;
    for (let i = 0; i < cr * cr; i++) expect(filled[i]).toBeGreaterThan(0);
  });

  it("records the intersect technique on Tricky boards", () => {
    const kinds = new Set<string>();
    for (const s of ["i0", "i1", "i2", "i3", "i4", "i5"]) {
      const { st } = gen(INTER, s);
      for (const op of recordSoloDeductions(st, DIFF_INTERSECT))
        kinds.add((op.reason as HintReason).kind);
    }
    expect([...kinds]).toContain("intersect");
  });

  it("records the set technique on Hard boards", () => {
    const kinds = new Set<string>();
    for (const s of ["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7"]) {
      const { st } = gen(ADV, s);
      for (const op of recordSoloDeductions(st, DIFF_SET))
        kinds.add((op.reason as HintReason).kind);
    }
    expect([...kinds]).toContain("set");
  });

  it("records killer-cage reasons on a killer board", () => {
    const kinds = new Set<string>();
    for (const s of ["k0", "k1", "k2"]) {
      const { st } = gen(KILLER, s);
      for (const op of recordSoloDeductions(st, DIFF_BLOCK, DIFF_KINTERSECT))
        kinds.add((op.reason as HintReason).kind);
    }
    expect([...kinds].some((k) => k.startsWith("cage"))).toBe(true);
  });
});

// --- tier 1: hint plan ------------------------------------------------------

describe("solo hint", () => {
  it("populates before the first elimination", () => {
    const { st } = gen(ADV, "hint-empty");
    const res = soloGame.hint?.(st);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    const moves = res.steps.map((s) => (s.move as SoloMove).type);
    const populateAt = moves.indexOf("pencilAll");
    const firstStrike = moves.indexOf("pencilStrike");
    expect(populateAt).toBe(0);
    expect(firstStrike).toBeGreaterThan(0);
  });

  it("skips populate once notes are present", () => {
    const { st } = gen(ADV, "hint-pop");
    const populated = soloGame.executeMove(st, { type: "pencilAll" });
    const res = soloGame.hint?.(populated);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    expect((res.steps[0].move as SoloMove).type).not.toBe("pencilAll");
  });

  it("surfaces a naked single as the next move ahead of any elimination", () => {
    const { st } = gen(ADV, "hint-naked");
    const r = soloGame.solve?.(st, st);
    if (!r?.ok || r.move.type !== "solve") throw new Error("solve failed");
    const cr = st.cr;
    // Pick a non-given cell, narrow it to its solution value.
    let x = 0;
    let y = 0;
    for (let i = 0; i < cr * cr; i++)
      if (!st.immutable[i]) {
        x = i % cr;
        y = (i / cr) | 0;
        break;
      }
    const v = r.move.grid[y * cr + x];
    const populated = soloGame.executeMove(st, { type: "pencilAll" });
    const marks = [];
    for (let n = 1; n <= cr; n++) if (n !== v) marks.push({ x, y, n });
    const narrowed = soloGame.executeMove(populated, { type: "pencilStrike", marks });
    const res = soloGame.hint?.(narrowed);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    // Auto-pencil defaults off → the placement carries `autoElim: false`.
    expect(res.steps[0].move).toEqual({
      type: "set",
      x,
      y,
      n: v,
      pencil: false,
      autoElim: false,
    });
    expect(res.steps[0].explanation).toMatch(/can only be/);
  });

  it("every deduction conclusion uses the necessity voice", () => {
    const { st } = gen(ADV, "voice");
    const populated = soloGame.executeMove(st, { type: "pencilAll" });
    const res = soloGame.hint?.(populated);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    const modal =
      /can only|can't|must (be|sit|cross out)|must be|cross out the|cross out/i;
    for (const s of res.steps) {
      if ((s.move as SoloMove).type === "pencilAll") continue;
      expect(s.explanation, s.explanation).toMatch(modal);
    }
  });

  it("a deductive strike step's marks all lie in one cell or all share one digit", () => {
    let checked = 0;
    for (const p of [INTER, ADV, KILLER]) {
      for (let s = 0; s < 6; s++) {
        const { st } = gen(p, `bleed-${p.diff}-${p.killer}-${s}`);
        const res = soloGame.hint?.(st);
        if (!res?.ok) continue;
        for (const step of res.steps as AnyStep[]) {
          if (step.move.type !== "pencilStrike") continue;
          // Skip the basic-region dup opening (one placed value across its groups)
          // and the bulk obvious-candidate cleanup at populate (a setup step, not a
          // deductive strike — multi-cell and multi-digit by design).
          if (/is placed here, so it can't repeat/.test(step.explanation)) continue;
          if (/clear the easy ones|fill all pencil marks/.test(step.explanation)) {
            continue;
          }
          const marks = step.move.marks as { x: number; y: number; n: number }[];
          const cells = new Set(marks.map((m) => `${m.x},${m.y}`));
          const digits = new Set(marks.map((m) => m.n));
          // One firing's leg either acts on a single cell (cage/set split) or
          // crosses a single digit (intersect) — never a mixed bag.
          expect(cells.size === 1 || digits.size === 1).toBe(true);
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it("auto-pencil off teaches more cleanup steps than on", () => {
    const { st } = gen(ADV, "autopencil");
    const dupRe = /is placed here, so it can't repeat/;
    const uiOn = soloGame.newUi(st);
    uiOn.autoPencil = true;
    const on = soloGame.hint?.(st, undefined, uiOn);
    const uiOff = soloGame.newUi(st);
    uiOff.autoPencil = false;
    const off = soloGame.hint?.(st, undefined, uiOff);
    expect(on?.ok && off?.ok).toBe(true);
    if (!on?.ok || !off?.ok) return;
    const dupCount = (r: typeof on) =>
      r.steps.filter((s) => dupRe.test(s.explanation)).length;
    // On, each placement's own `autoElim` does the cleanup, so the plan never
    // teaches it; off, the plan does.
    expect(dupCount(on)).toBe(0);
    expect(dupCount(off)).toBeGreaterThan(0);
    expect(off.steps.length).toBeGreaterThan(on.steps.length);
  });

  it("narrates a hidden single by its region, never as a naked single", () => {
    let checked = 0;
    for (const seed of ["hs0", "hs1", "hs2", "hs3", "hs4", "hs5"]) {
      const { st, aux } = gen(ADV, seed);
      let state: SoloState = st;
      for (let i = 0; i < 3000 && soloStatus(state) !== "solved"; i++) {
        const res = soloGame.hint?.(state, aux);
        if (!res?.ok) break;
        const step = res.steps.find((s) =>
          /can go in only this cell/.test(s.explanation),
        ) as AnyStep | undefined;
        if (step) {
          const m = step.move as { type: string; x: number; y: number; n: number };
          expect(step.explanation).not.toMatch(/Every other number has been ruled out/);
          expect(step.explanation).toMatch(/In this (row|column|block|diagonal)/);
          const area = (step.highlights?.area ?? []) as { x: number; y: number }[];
          expect(area.some((a) => a.x === m.x && a.y === m.y)).toBe(true);
          checked++;
          break;
        }
        state = soloGame.executeMove(state, res.steps[0].move);
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it("a naked-single narration only ever appears on a genuine one-candidate cell", () => {
    let checked = 0;
    for (const seed of ["nk0", "nk1", "nk2", "nk3"]) {
      const { st, aux } = gen(ADV, seed);
      let state: SoloState = st;
      const cr = st.cr;
      for (let i = 0; i < 2000 && soloStatus(state) === "ongoing"; i++) {
        const res = soloGame.hint?.(state, aux);
        if (!res?.ok) break;
        const step = res.steps[0];
        const m = step.move as AnyStep;
        if (
          m.type === "set" &&
          !m.pencil &&
          /ruled out in this cell/.test(step.explanation)
        ) {
          const pen = state.pencil[m.y * cr + m.x];
          const ncand = Array.from({ length: cr }, (_, k) => k + 1).filter(
            (n) => pen & (1 << n),
          ).length;
          expect(ncand, `naked-single narration on a ${ncand}-candidate cell`).toBe(1);
          checked++;
        }
        state = soloGame.executeMove(state, step.move);
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it("teaches an X-diagonal deduction on an X board", () => {
    let found = false;
    for (let s = 0; s < 30 && !found; s++) {
      const { st, aux } = gen(XADV, `xd-${s}`);
      let state: SoloState = st;
      for (let i = 0; i < 2000 && soloStatus(state) === "ongoing"; i++) {
        const res = soloGame.hint?.(state, aux);
        if (!res?.ok) break;
        if (res.steps.some((step) => /diagonal/.test(step.explanation))) {
          found = true;
          break;
        }
        state = soloGame.executeMove(state, res.steps[0].move);
      }
    }
    expect(found).toBe(true);
  });

  // Both rungs used to name cells the frame never marked — "these cells must
  // total 5" over one shaded cell, "across these lines" over none
  // (`mark-the-cells-solo-points-at`). A sentence is only as good as what the
  // player can see it against, so each test asserts the marks *are* what the
  // words point at, not merely that the words appear.
  it("shows the region a deduced extra-cage counted", () => {
    let checked = 0;
    for (let s = 0; s < 8 && checked === 0; s++) {
      const { st, aux } = gen(KILLER, `killer-${s}`);
      const res = soloGame.hint?.(st, aux);
      if (!res?.ok) continue;
      const solved = soloGame.solve?.(st, st);
      if (!solved?.ok) throw new Error("solve failed");
      const sol = (solved.move as { type: "solve"; grid: number[] }).grid;
      const cr = st.cr;
      for (const step of res.steps as AnyStep[]) {
        const said = /^This (row|column|block) must total (\d+);/.exec(
          step.explanation,
        );
        if (said === null) continue;
        checked++;
        expect(
          Number(said[2]),
          "the total named is the region's, not the residual",
        ).toBe((cr * (cr + 1)) / 2);
        const [target] = step.highlights.targets as { x: number; y: number }[];
        const area = step.highlights.area as { x: number; y: number }[];
        // The cells shaded are the cells of the region the sentence names.
        const want =
          said[1] === "row"
            ? area.every((c) => c.y === target.y)
            : said[1] === "column"
              ? area.every((c) => c.x === target.x)
              : area.every(
                  (c) =>
                    ((c.x / st.params.c) | 0) === ((target.x / st.params.c) | 0) &&
                    ((c.y / st.params.r) | 0) === ((target.y / st.params.r) | 0),
                );
        expect(want, `shaded cells outside the ${said[1]} the sentence names`).toBe(
          true,
        );
        expect(area).toHaveLength(cr);
        expect(area).toContainEqual({ x: target.x, y: target.y });
        // The arithmetic the sentence teaches is the arithmetic the board does.
        expect(area.reduce((t, c) => t + sol[c.y * cr + c.x], 0)).toBe(
          (cr * (cr + 1)) / 2,
        );
        break;
      }
    }
    expect(checked, "no extra-cage firing reached").toBeGreaterThan(0);
  });

  it("shows the cells a locked pattern is locked into", () => {
    let checked = 0;
    for (let s = 0; s < 16 && checked === 0; s++) {
      const { st, aux } = gen(EXTREME, `extreme-${s}`);
      const res = soloGame.hint?.(st, aux);
      if (!res?.ok) continue;
      for (const step of res.steps as AnyStep[]) {
        const said = /^The highlighted cells are the only places (\S+) fits/.exec(
          step.explanation,
        );
        if (said === null) continue;
        checked++;
        const area = step.highlights.area as { x: number; y: number }[];
        const marks = step.highlights.marks as { x: number; y: number; n: number }[];
        expect(
          area.length,
          "'the highlighted cells' with nothing highlighted",
        ).toBeGreaterThan(3);
        const rows = new Set(area.map((c) => c.y));
        const cols = new Set(area.map((c) => c.x));
        expect(rows.size, "a locked pattern spans as many rows as columns").toBe(
          cols.size,
        );
        for (const m of marks) {
          // What the sentence claims: the strike is in a pattern row, and it is
          // outside the columns the pattern uses up.
          expect(rows.has(m.y), "struck a cell outside the pattern's rows").toBe(true);
          expect(cols.has(m.x), "struck a cell inside the pattern's own columns").toBe(
            false,
          );
          expect(digitChar(m.n), "struck a digit the sentence does not name").toBe(
            said[1],
          );
        }
        break;
      }
    }
    expect(checked, "no locked-pattern firing reached").toBeGreaterThan(0);
  });

  it("refuses on a solved board and on a board with mistakes", () => {
    const { st } = gen(BASIC, "refuse");
    const r = soloGame.solve?.(st, st);
    if (!r?.ok) throw new Error("solve failed");
    const solved = soloGame.executeMove(st, r.move);
    expect(soloGame.hint?.(solved)?.ok).toBe(false);

    const cr = st.cr;
    const sol = (r.move as { type: "solve"; grid: number[] }).grid;
    // Place a wrong digit in the first editable cell.
    let bx = 0;
    let by = 0;
    for (let i = 0; i < cr * cr; i++)
      if (!st.immutable[i]) {
        bx = i % cr;
        by = (i / cr) | 0;
        break;
      }
    const wrong = (sol[by * cr + bx] % cr) + 1;
    const bad = soloGame.executeMove(st, {
      type: "set",
      x: bx,
      y: by,
      n: wrong,
      pencil: false,
    });
    expect(soloGame.hint?.(bad)?.ok).toBe(false);
  });
});

describe("solo killer cages forbid repeats", () => {
  /** A board whose hint threw while the culls ignored cages: the solver struck a
   * placed digit from its cage-mates without recording it, so a later single
   * rested on a strike the notes never showed. */
  const DESC =
    "zzzc,__aab___aa___a__a___a_a___aaa_aa_a_a_a_aa__baa_baa_ca____aaa__aa___" +
    "__________a__a__a___a____aaa_ab,7_16_11a12a9d11_10_16a10a19_10d10_11c7_12_" +
    "17c8a14c9a8a11b5_7a16a18a13b7a3b24_14_15a13b8d9a15d";

  /** The other empty cells of `cell`'s cage that still note `n`. */
  function cageMatesNoting(state: SoloState, cell: number, n: number): number[] {
    const kblocks = state.killerData?.kblocks;
    if (!kblocks) throw new Error("not a killer board");
    return kblocks.blocks[kblocks.whichblock[cell]].filter(
      (c) => c !== cell && state.grid[c] === 0 && (state.pencil[c] & (1 << n)) !== 0,
    );
  }

  it("walks to solved on recomputed hints", () => {
    let state = newState(KILLER, DESC);
    for (let i = 0; i < 2000 && soloStatus(state) === "ongoing"; i++) {
      const res = soloGame.hint?.(state);
      if (!res?.ok) throw new Error(`hint refused after ${i} moves`);
      state = soloGame.executeMove(state, res.steps[0].move);
    }
    expect(soloStatus(state)).toBe("solved");
  });

  it("a hinted placement leaves no cage-mate noting its digit", () => {
    let state = newState(KILLER, DESC);
    const res = soloGame.hint?.(state);
    if (!res?.ok) throw new Error("hint refused");
    const placed: { cell: number; n: number }[] = [];
    let checked = 0;
    const settle = () => {
      for (const p of placed) {
        expect(cageMatesNoting(state, p.cell, p.n)).toEqual([]);
        checked++;
      }
      placed.length = 0;
    };
    for (const step of res.steps) {
      if (!step.continuesPrevious) settle();
      const m = step.move as SoloMove;
      if (m.type === "set" && !m.pencil && m.n > 0)
        placed.push({ cell: m.y * state.cr + m.x, n: m.n });
      state = soloGame.executeMove(state, step.move);
    }
    settle();
    expect(checked).toBeGreaterThan(20);
  });

  it("auto-pencil strikes a placed digit from its cage-mates' notes", () => {
    const st = newState(KILLER, DESC);
    const res = soloGame.hint?.(st);
    if (!res?.ok) throw new Error("hint refused");
    const noted = soloGame.executeMove(st, res.steps[0].move);
    const cr = noted.cr;
    // An empty cell, and a digit one of its cage-mates also notes.
    let found: { x: number; y: number; n: number } | null = null;
    for (let cell = 0; cell < cr * cr && !found; cell++) {
      if (noted.grid[cell] !== 0) continue;
      for (let n = 1; n <= cr && !found; n++)
        if (noted.pencil[cell] & (1 << n) && cageMatesNoting(noted, cell, n).length > 0)
          found = { x: cell % cr, y: (cell / cr) | 0, n };
    }
    if (!found) throw new Error("no cage-mate shares a note");
    const after = soloGame.executeMove(noted, {
      type: "set",
      ...found,
      pencil: false,
      autoElim: true,
    });
    expect(cageMatesNoting(after, found.y * cr + found.x, found.n)).toEqual([]);
  });
});

// --- tier 1: the words a repeat sentence cites ------------------------------

describe("solo no-repeat region names", () => {
  /** Every optional region at once: X diagonals *and* killer cages. A board
   * with neither exercises three region kinds of six and passes everything
   * below, so the naming guard is worth nothing without one. `cr` is odd on
   * purpose — the center cell lies on both diagonals, which is the only cell
   * anywhere that asks the naming to collapse two regions into one word. */
  const XKILLER: SoloParams = { ...KILLER, xtype: true };

  /** The word each region kind is named by. Written out here rather than read
   * off the production mapping, so the guard has an oracle of its own: a
   * renamed region word fails this whether or not the derivation still agrees
   * with itself. */
  const WORD: Record<string, string> = {
    row: "row",
    col: "column",
    block: "block",
    diag0: "diagonal",
    diag1: "diagonal",
    cage: "cage",
  };

  const kindOf = (r: ReturnType<typeof regionsOf>[number]): string =>
    r.holdsEvery ? r.region.kind : "cage";

  it("names exactly each cell's regions, the two diagonals as one word", () => {
    const { st } = gen(XKILLER, "region-names");
    const cr = st.cr;
    const seen = new Set<string>();
    let onBothDiagonals = 0;
    let cells = 0;
    for (let y = 0; y < cr; y++)
      for (let x = 0; x < cr; x++) {
        const kinds = regionsOf(st, x, y).map(kindOf);
        for (const k of kinds) seen.add(k);
        if (kinds.includes("diag0") && kinds.includes("diag1")) onBothDiagonals++;
        expect(noRepeatRegionNames(st, { x, y })).toEqual([
          ...new Set(kinds.map((k) => WORD[k])),
        ]);
        cells++;
      }
    expect(cells).toBe(cr * cr);
    expect(onBothDiagonals).toBe(1);
    expect([...seen].sort()).toEqual(["block", "cage", "col", "diag0", "diag1", "row"]);
  });

  it("the at-less call is the union over the board", () => {
    const { st } = gen(XKILLER, "region-names");
    const cr = st.cr;
    const union = new Set<string>();
    for (let y = 0; y < cr; y++)
      for (let x = 0; x < cr; x++)
        for (const r of regionsOf(st, x, y)) union.add(WORD[kindOf(r)]);
    expect(noRepeatRegionNames(st)).toEqual([...union]);
    // `say.cleanObvious` speaks for the whole board at once, so a cell off the
    // diagonals must still be told its notes were cleaned against them.
    expect(noRepeatRegionNames(st)).toContain("diagonal");
  });

  it("omits the regions a board has not got", () => {
    expect(noRepeatRegionNames(gen(BASIC, "region-plain").st)).toEqual([
      "row",
      "column",
      "block",
    ]);
    expect(noRepeatRegionNames(gen(XADV, "region-x").st)).toEqual([
      "row",
      "column",
      "block",
      "diagonal",
    ]);
  });
});

// --- tier 1: keep-track -----------------------------------------------------

describe("solo hintKeepTrack", () => {
  it("matches a populate step, rejects anything else", () => {
    const { st } = gen(ADV, "kt-pop");
    const res = soloGame.hint?.(st);
    if (!res?.ok) throw new Error("refused");
    const step = res.steps.find((s) => (s.move as SoloMove).type === "pencilAll");
    if (!step) throw new Error("no populate step");
    expect(soloGame.hintKeepTrack?.({ type: "pencilAll" }, step, st)).toBe("completed");
    expect(
      soloGame.hintKeepTrack?.(
        { type: "set", x: 0, y: 0, n: 1, pencil: false },
        step,
        st,
      ),
    ).toBe("off");
  });

  it("shrinks then finishes a multi-mark strike journey", () => {
    const { st } = gen(ADV, "kt-strike");
    const populated = soloGame.executeMove(st, { type: "pencilAll" });
    const res = soloGame.hint?.(populated);
    if (!res?.ok) throw new Error("hint refused");
    const step = res.steps.find(
      (s) =>
        (s.move as SoloMove).type === "pencilStrike" &&
        (s.move as { type: "pencilStrike"; marks: unknown[] }).marks.length >= 2,
    ) as AnyStep | undefined;
    if (!step) throw new Error("no multi-mark strike step");

    const marks = [...step.move.marks] as { x: number; y: number; n: number }[];
    let cur = populated;
    for (let k = 0; k < marks.length; k++) {
      const mk = marks[k];
      const v = soloGame.hintKeepTrack?.(
        { type: "set", x: mk.x, y: mk.y, n: mk.n, pencil: true },
        step,
        cur,
      );
      expect(v).toBe(k === marks.length - 1 ? "completed" : "onTrack");
      cur = soloGame.executeMove(cur, {
        type: "set",
        x: mk.x,
        y: mk.y,
        n: mk.n,
        pencil: true,
      });
    }
  });
});

// --- tier 2.5: render ------------------------------------------------------

/** Scan seeds for an id whose from-populated plan reaches a deductive strike step
 * matching `pred` — so the render frame is deterministic without a known desc. */
function strikeFrame(p: SoloParams, pred: (s: string) => boolean): string {
  for (let s = 0; s < 40; s++) {
    const seed = `frame-${p.diff}-${s}`;
    const { st } = gen(p, seed);
    const populated = soloGame.executeMove(st, { type: "pencilAll" });
    const res = soloGame.hint?.(populated);
    if (!res?.ok) continue;
    if (
      res.steps.some(
        (step) =>
          (step.move as SoloMove).type === "pencilStrike" && pred(step.explanation),
      )
    )
      return `${encodeParams(p, true)}#${seed}`;
  }
  throw new Error(`no strike frame found for ${p.diff}`);
}

describe("solo hint render", () => {
  it("a deductive elimination shades the evidence and strikes the candidate", () => {
    const pred = (e: string) =>
      /crossed out of the rest of it|already accounts? for/.test(e);
    const id = strikeFrame(ADV, pred);
    const { recording, hint } = renderScenario({
      game: soloGame,
      id,
      defaultBackground: DEFAULT_BACKGROUND,
      moves: [{ type: "pencilAll" }],
      showHint: true,
      hintUntil: (s) => pred(s.explanation),
    });
    expect(pred(hint?.explanation ?? "")).toBe(true);
    // The evidence region is shaded COL_HINT_CELL.
    expect(
      recording.ops.some((o) => o.op === "rect" && o.color === COL_HINT_CELL),
    ).toBe(true);
    // The struck candidate keeps its COL_PENCIL digit, crossed through in COL_PENCIL.
    expect(recording.ops.some((o) => o.op === "line" && o.color === COL_PENCIL)).toBe(
      true,
    );
    expect(recording.ops.some((o) => o.op === "text" && o.color === COL_PENCIL)).toBe(
      true,
    );
    expect(recording.ops).toMatchSnapshot();
  });
});
