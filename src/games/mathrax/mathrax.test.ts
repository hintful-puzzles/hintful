/**
 * Mathrax behavioral tests (tiers 1 and 2.5): the codec over the recorded upstream
 * boards, the solver and the generator's tier gate, the clue semantics, the input
 * mapping, `executeMove`'s live-error and completion paths, `findMistakes`
 * (including notes), the keypad, and the render frames.
 */
import { describe, expect, it } from "vitest";
import { COL_ERROR, COL_FLASH, COL_FLASH_LEAD } from "../../engine/color/roles.ts";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  descBadCharacter,
  validateDesc,
} from "../../engine/contract/desc-error.ts";
import { UI_UPDATE } from "../../engine/contract/game.ts";
import { describeParams, presetMenu } from "../../engine/game-id/param-label.ts";
import { paramsError, UnreadableParams } from "../../engine/game-id/params.ts";
import {
  CURSOR_DOWN,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  LEFT_BUTTON,
  newCursor,
  RIGHT_BUTTON,
} from "../../engine/input/pointer.ts";
import { Midend } from "../../engine/midend/midend.ts";
import { randomNew } from "../../engine/random/index.ts";
import { liveErrors } from "../../engine/render/live-errors.ts";
import { pencilIndicatorReach } from "../../engine/render/pencil-indicator.ts";
import { type Flash, sweepStep } from "../../engine/render/win-wave.ts";
import { driveMidend } from "../../engine/testing/drive-midend.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { expectWinFlashTravels, winFlashRun } from "../../engine/testing/win-flash.ts";
import {
  ladder,
  tiers as ladderTiers,
} from "../../generated/games/mathrax/mathrax.compiled.ts";
import { mathraxCandidateClue, newMathraxDesc } from "./generator.ts";
import { mathraxGame } from "./index.ts";
import { computeSize, origin, PREFERRED_TILE_SIZE } from "./render.ts";
import { mathraxSolve, SOLVE_STUCK, SOLVE_UNIQUE } from "./solver.ts";
import {
  CLUE_ADD,
  CLUE_DIV,
  CLUE_EVN,
  CLUE_MUL,
  CLUE_ODD,
  CLUE_SUB,
  clueLabel,
  clueNum,
  clueType,
  DIFF_EASY,
  DIFF_NORMAL,
  DIFF_TRICKY,
  DIFF_UNREASONABLE,
  decodeParams,
  diffFromLevel,
  encodeDesc,
  encodeParams,
  F_IMMUTABLE,
  type MathraxDiff,
  type MathraxMove,
  type MathraxParams,
  type MathraxState,
  type MathraxUi,
  newState,
  newUi,
  OPTION_ADD,
  OPTION_DIV,
  OPTION_EQL,
  OPTION_MUL,
  OPTION_ODD,
  OPTION_SUB,
  OPTIONSMASK,
  rules,
  setClueNum,
  validateParams,
} from "./state.ts";

interface Board {
  o: number;
  diff: number;
  options: number;
  desc: string;
}
/** Boards upstream's generator dealt, as [o, diff level, options, desc]. */
const boards: Board[] = (
  [
    [5, 0, 63, "u2c,cS1aS0bS0S3bS3aS2a"],
    [5, 1, 63, "j1c4j,S1dS2bS2eM4a"],
    [5, 2, 63, "f3f1k,kS1S0S3b"],
    [6, 0, 63, "i3z,aD2bS1bA7A6bA9aA5aS4bA8A7e"],
    [6, 1, 63, "j6y,A5A9hA8cS3aObA8cS1a"],
    [6, 2, 63, "zj,bS1A6bS2S3A8S2dA8bS2A7A10S2d"],
    [7, 1, 63, "g1r5k5j,bD2cA7eS1eObS0S3aS3cS1aM12aObA8"],
    [8, 1, 63, "f3zg6a35a2i6h,eD2aS4aEkA10S1eD2bA10aA8fS3dS0S1b"],
    [9, 1, 63, "h5t4a7c2a8c7e9q5d8c6c3b,eA10D3S2aS3iOcM18eS2gS1aOS4aObS2nOc"],
    [3, 0, 63, "a3g,A4c"],
    [3, 2, 63, "a1e2a,cA4"],
    [4, 1, 63, "a1g4f,aS2fS2"],
    [4, 3, 63, "p,i"],
    [5, 3, 63, "y,p"],
    [6, 3, 63, "zj,y"],
    [7, 2, 63, "t6i1r,dS2aA8D2S1OkA10bD3bA9bS0aA9S0b"],
    [8, 0, 63, "f1v5j64b1p4b,S1OeD4bA9eS4dA11A9jS4aS3fS4A9aS2bA9"],
    [9, 2, 63, "v8q5zf9d7b,fOaS5eA11fM12fOaM6M12A12A13dS0aA10aS2dObA9S0dS0g"],
    [6, 1, 1, "d3k6b5c6b62c1a4b,bA7uA7"],
    [6, 1, 2, "n6j2d3e,aS1S1cS2cS1bS2eS1e"],
    [6, 1, 4, "a3c5b1e2h6c2b56c3,iM12o"],
    [6, 1, 8, "b16a2a6a3e43a4b2f1a34b6a,y"],
    [6, 1, 16, "3a65d4b62b6c1c25g5a1a,y"],
    [6, 1, 32, "5d12a5e6c612a4e3b2d,wOa"],
    [6, 2, 3, "j4y,A5gA8fS4S3cA10aS1b"],
    [6, 1, 28, "d1b4j1a25e2g2,D2hM12lD2b"],
    [7, 0, 62, "b15k34b7n3c3b1e2a,S0S1mD3aS2dS2aOaD2i"],
    [5, 2, 33, "g1q,iEA5aA8c"],
  ] as [number, number, number, string][]
).map(([o, diff, options, desc]) => ({ o, diff, options, desc }));
const paramsOf = (f: Board): MathraxParams => ({
  o: f.o,
  diff: diffFromLevel(f.diff),
  options: f.options,
});

/** A 5×5 Easy board used as the standard scenario. */
const FIX = boards[0];
const FIX_PARAMS = paramsOf(FIX);
const FIX_ID = `${encodeParams(FIX_PARAMS, true)}:${FIX.desc}`;

const TS = PREFERRED_TILE_SIZE;

/** Pixel center of cell `(x, y)` at the default tile size. The origin comes from
 * the renderer, which carries the pencil indicator's margin. */
const center = (x: number, y: number) => ({
  x: origin(TS) + x * TS + TS / 2,
  y: origin(TS) + y * TS + TS / 2,
});

function press(
  state: MathraxState,
  ui: MathraxUi,
  button: number,
  p: { x: number; y: number } = { x: 0, y: 0 },
): MathraxMove | null | typeof UI_UPDATE {
  return mathraxGame.interpretMove(
    state,
    ui,
    preferredDrawState(mathraxGame, state),
    p,
    button,
  );
}

function harness() {
  const h = driveMidend(mathraxGame);
  const status = () => h.last("game-state-change")?.status ?? null;
  return { m: h.midend, status };
}

/** The unique solution of a fixture board, from the givens alone. */
function solutionOf(state: MathraxState): Uint8Array {
  const o = state.params.o;
  const grid = new Uint8Array(o * o);
  for (let i = 0; i < o * o; i++)
    if (state.flags[i] & F_IMMUTABLE) grid[i] = state.grid[i];
  expect(mathraxSolve(o, grid, state.clues, DIFF_UNREASONABLE)).toBe(SOLVE_UNIQUE);
  return grid;
}

// --- params ----------------------------------------------------------------

describe("mathrax params", () => {
  it("round-trips size, difficulty and a restricted clue set", () => {
    const p = decodeParams("7dtAM");
    expect(p).toEqual({ o: 7, diff: "tricky", options: OPTION_ADD | OPTION_MUL });
    expect(encodeParams(p, true)).toBe("7dtAM");
    expect(encodeParams(p, false)).toBe("7");
  });

  it("writes the full clue set as nothing, and reads nothing back as all", () => {
    const all: MathraxParams = { o: 6, diff: "normal", options: OPTIONSMASK };
    expect(encodeParams(all, true)).toBe("6dn");
    expect(decodeParams("6dn").options).toBe(OPTIONSMASK);
  });

  it("reads the clue letters only in upstream's fixed A S M D E O order", () => {
    // 'D' comes after 'S', so "SD" reads both...
    expect(decodeParams("6dnSD").options).toBe(OPTION_SUB | OPTION_DIV);
    // ...but out of order, the later letter is one nothing reads.
    expect(() => decodeParams("6dnDS")).toThrow(UnreadableParams);
    expect(() => decodeParams("6dnOA")).toThrow(UnreadableParams);
  });

  it("rejects out-of-range sizes and an empty clue set", () => {
    const error = (p: MathraxParams, full = true) => paramsError(mathraxGame, p, full);
    expect(error(decodeParams("2dn"))).toBe("Size must be at least 3.");
    expect(error(decodeParams("10dn"))).toBe("Size must be at most 9.");
    expect(error({ o: 6, diff: "normal", options: 0 })).toMatch(
      /at least one clue type/i,
    );
    // ...but an empty clue set is only a *full* (generation) constraint.
    expect(error({ o: 6, diff: "normal", options: 0 }, false)).toBeNull();
  });

  it("exposes every preset through the menu", () => {
    const submenu = presetMenu(mathraxGame).submenu ?? [];
    expect(submenu).toHaveLength(11);
    expect(submenu[0]).toMatchObject({ title: "5x5 Easy" });
    expect(submenu[3]).toMatchObject({ title: "5x5 Unreasonable" });
    expect(submenu[10]).toMatchObject({ title: "9x9 Normal" });
  });

  it("labels a custom clue set by the shorter of what is on and off", () => {
    const label = (options: number) =>
      describeParams(mathraxGame, { o: 7, diff: "tricky", options });
    expect(label(OPTIONSMASK)).toBe("7x7 Tricky");
    expect(label(OPTION_ADD)).toBe("7x7 Tricky, only addition");
    expect(label(OPTIONSMASK & ~OPTION_ODD)).toBe("7x7 Tricky, no even-odd");
  });
});

// --- desc codec ------------------------------------------------------------

describe("mathrax desc codec", () => {
  it("round-trips every sample description", () => {
    for (const f of boards) {
      const p = paramsOf(f);
      expect(validateDesc(mathraxGame, p, f.desc)).toBeNull();
      const st = newState(p, f.desc);
      expect(encodeDesc(p.o, st.grid, st.clues)).toBe(f.desc);
    }
  });

  it("splits an empty run longer than 26 cells", () => {
    // A 6×6 board with no givens at all: 36 empties = 'z' (26) + 'j' (10).
    const grid = new Uint8Array(36);
    const clues = new Int32Array(25);
    expect(encodeDesc(6, grid, clues)).toBe("zj,y");
  });

  it("encodes equality as a zero-valued subtraction clue", () => {
    const clues = new Int32Array(4);
    clues[0] = CLUE_SUB | setClueNum(0);
    expect(encodeDesc(3, new Uint8Array(9), clues)).toBe("i,S0c");
    const back = newState({ o: 3, diff: "easy", options: OPTIONSMASK }, "i,S0c");
    expect(clueType(back.clues[0])).toBe(CLUE_SUB);
    expect(clueNum(back.clues[0])).toBe(0);
  });

  it("rejects the descriptions upstream rejects", () => {
    const p: MathraxParams = { o: 3, diff: "easy", options: OPTIONSMASK };
    expect(validateDesc(mathraxGame, p, "1231231231,c")).toBe(DESC_TOO_LONG);
    expect(validateDesc(mathraxGame, p, "12345678,d")).toBe(DESC_OUT_OF_RANGE); // 4 > o
    expect(validateDesc(mathraxGame, p, "12?,d")).toBe(descBadCharacter("?"));
    expect(validateDesc(mathraxGame, p, "12,d")).toBe(DESC_TOO_SHORT);
    expect(validateDesc(mathraxGame, p, "i,A100")).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(mathraxGame, p, "i,A2")).toBe(DESC_TOO_SHORT);
    expect(validateDesc(mathraxGame, p, "i,dA1")).toBe(DESC_TOO_LONG);
  });

  it("refuses what the encoder never writes", () => {
    const p: MathraxParams = { o: 3, diff: "easy", options: OPTIONSMASK };
    expect(validateDesc(mathraxGame, p, "i,d")).toBeNull();
    // A run past either part, and anything after the clues.
    expect(validateDesc(mathraxGame, p, "j,d")).toBe(DESC_TOO_LONG);
    expect(validateDesc(mathraxGame, p, "i,e")).toBe(DESC_TOO_LONG);
    expect(validateDesc(mathraxGame, p, "i,d!")).toBe(DESC_TOO_LONG);
    // A character the clue part has no use for, where upstream skipped it.
    expect(validateDesc(mathraxGame, p, "i,c!E")).toBe(descBadCharacter("!"));
    // An empty desc, an empty grid part, and a missing clue part.
    expect(validateDesc(mathraxGame, p, "")).toBe(DESC_TOO_SHORT);
    expect(validateDesc(mathraxGame, p, ",d")).toBe(DESC_TOO_SHORT);
    expect(validateDesc(mathraxGame, p, "i")).toBe(DESC_TOO_SHORT);
    // An arithmetic clue without its number, and a parity clue with one.
    expect(validateDesc(mathraxGame, p, "i,Ac")).toBe(descBadCharacter("c"));
    expect(validateDesc(mathraxGame, p, "i,E5c")).toBe(descBadCharacter("5"));
    // A number no two of the board's digits can make.
    expect(validateDesc(mathraxGame, p, "i,A7c")).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(mathraxGame, p, "i,S3c")).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(mathraxGame, p, "i,M10c")).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(mathraxGame, p, "i,D1c")).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(mathraxGame, p, "i,A6S2M9D3")).toBeNull();
  });
});

// --- clue semantics --------------------------------------------------------

describe("mathrax clue semantics", () => {
  it("runs the description's tiers at the difficulty levels, in order", () => {
    expect(ladderTiers).toHaveLength(4);
    expect([
      ladderTiers[DIFF_EASY],
      ladderTiers[DIFF_NORMAL],
      ladderTiers[DIFF_TRICKY],
      ladderTiers[DIFF_UNREASONABLE],
    ]).toEqual(["Easy", "Normal", "Tricky", "Unreasonable"]);
    expect(ladder.filter((t) => t.id.startsWith("clue")).map((t) => t.tier)).toEqual([
      DIFF_EASY,
      DIFF_NORMAL,
      DIFF_TRICKY,
    ]);
  });

  it("follows upstream's candidate-clue precedence cascade", () => {
    // 3+4 == 2+5 and 3−4 != 2−5, so addition wins over everything below it.
    expect(clueType(mathraxCandidateClue(3, 4, 2, 5, OPTIONSMASK))).toBe(CLUE_ADD);
    // With addition disabled, the same digits fall through to nothing here.
    expect(mathraxCandidateClue(3, 4, 2, 5, OPTIONSMASK & ~OPTION_ADD)).toBe(0);
    // Equal pairs reach the equality arm only after subtraction declines them
    // (a zero difference fails its `> 0` test) — encoded as `Sub 0`.
    const eq = mathraxCandidateClue(3, 3, 5, 5, OPTION_SUB | OPTION_EQL);
    expect(clueType(eq)).toBe(CLUE_SUB);
    expect(clueNum(eq)).toBe(0);
    // 6×2 == 4×3, with sums and differences unequal ⇒ multiplication.
    expect(clueType(mathraxCandidateClue(6, 2, 4, 3, OPTIONSMASK))).toBe(CLUE_MUL);
    // A ratio of 1 is explicitly excluded from the division arm.
    expect(mathraxCandidateClue(3, 3, 5, 5, OPTION_DIV)).toBe(0);
    // The *even* clue is gated on the odd option — the two share one setting.
    expect(mathraxCandidateClue(8, 2, 6, 2, OPTION_ODD)).toBe(CLUE_EVN);
    expect(mathraxCandidateClue(8, 2, 6, 2, OPTIONSMASK & ~OPTION_ODD)).toBe(0);
  });

  it("labels each clue type the way the board shows it", () => {
    expect(clueLabel(CLUE_ADD | setClueNum(7))).toBe("7+");
    expect(clueLabel(CLUE_SUB | setClueNum(2))).toBe("2−");
    expect(clueLabel(CLUE_SUB | setClueNum(0))).toBe("=");
    expect(clueLabel(CLUE_MUL | setClueNum(12))).toBe("12×");
    expect(clueLabel(CLUE_DIV | setClueNum(3))).toBe("3÷");
    expect(clueLabel(CLUE_EVN)).toBe("E");
    expect(clueLabel(CLUE_ODD)).toBe("O");
  });
});

// --- solver and generator --------------------------------------------------

describe("mathrax solver", () => {
  it("solves every sample upstream board uniquely, at no more than its tier", () => {
    // The Recursive boards are excluded: upstream strips those past uniqueness
    // (they are literally blank), which is the defect the generator's
    // divergence fixes.
    for (const f of boards.filter((x) => x.diff < DIFF_UNREASONABLE)) {
      const p = paramsOf(f);
      const st = newState(p, f.desc);
      const grid = Uint8Array.from(st.grid);
      expect(mathraxSolve(p.o, grid, st.clues, DIFF_UNREASONABLE)).toBe(SOLVE_UNIQUE);
      // The filled grid really is an answer.
      expect(mathraxGame.status({ ...st, grid })).toBe("solved");
      // And the board's own tier suffices (the generator gated on exactly
      // this), except at Tricky: upstream's Tricky has forcing chains, which
      // here are a search, so a Tricky board that needs one falls to the
      // recursive cap alone, checked above.
      if (f.diff === DIFF_TRICKY) continue;
      expect(mathraxSolve(p.o, Uint8Array.from(st.grid), st.clues, f.diff)).toBe(
        SOLVE_UNIQUE,
      );
    }
  });

  it("reports a clueless board as stuck rather than solved", () => {
    const p: MathraxParams = { o: 5, diff: "tricky", options: OPTIONSMASK };
    expect(mathraxSolve(p.o, new Uint8Array(25), new Int32Array(16), DIFF_TRICKY)).toBe(
      SOLVE_STUCK,
    );
  });

  it("grades an Easy board as Easy and a Tricky board as beyond Easy", () => {
    const easy = boards.find((f) => f.o === 6 && f.diff === DIFF_EASY);
    const tricky = boards.find((f) => f.o === 6 && f.diff === DIFF_TRICKY);
    if (!easy || !tricky) throw new Error("sample boards changed");
    const e = newState(paramsOf(easy), easy.desc);
    expect(mathraxSolve(6, Uint8Array.from(e.grid), e.clues, DIFF_EASY)).toBe(
      SOLVE_UNIQUE,
    );
    const t = newState(paramsOf(tricky), tricky.desc);
    expect(mathraxSolve(6, Uint8Array.from(t.grid), t.clues, DIFF_EASY)).toBe(
      SOLVE_STUCK,
    );
  });
});

describe("mathrax generator", () => {
  it("generates a validly-described, uniquely-solvable board for a fresh seed", () => {
    // Order 3 is Easy-or-Tricky only — see `validateParams` and the tier tests
    // below — so the smallest Normal board is order 4.
    for (const o of [4, 5, 7]) {
      const p: MathraxParams = { o, diff: "normal", options: OPTIONSMASK };
      const { desc } = newMathraxDesc(p, randomNew(`fresh-${o}`));
      expect(validateDesc(mathraxGame, p, desc)).toBeNull();
      const st = newState(p, desc);
      expect(mathraxSolve(o, Uint8Array.from(st.grid), st.clues, DIFF_NORMAL)).toBe(
        SOLVE_UNIQUE,
      );
    }
  });

  it("generates a *uniquely* solvable Recursive board (the upstream fix)", () => {
    // Upstream's Recursive tier keeps stripping while the board is merely
    // "not stuck", which accepts an ambiguous verdict — every sampled upstream
    // board had several solutions. The port requires a unique solve instead.
    for (let i = 0; i < 5; i++) {
      const p: MathraxParams = { o: 5, diff: "recursive", options: OPTIONSMASK };
      const { desc } = newMathraxDesc(p, randomNew(`recursive-${i}`));
      const st = newState(p, desc);
      expect(
        mathraxSolve(5, Uint8Array.from(st.grid), st.clues, DIFF_UNREASONABLE),
      ).toBe(SOLVE_UNIQUE);
      // And it genuinely needs the recursion — Tricky alone can't finish it.
      expect(mathraxSolve(5, Uint8Array.from(st.grid), st.clues, DIFF_TRICKY)).toBe(
        SOLVE_STUCK,
      );
    }
  });

  // The tier gate. Upstream had none, so a tier need not bind: of 23 boards
  // upstream dealt above Easy, 3 fall lower.
  describe("difficulty tiers bind", () => {
    const CASES: [number, MathraxDiff, number, number][] = [
      [3, "tricky", DIFF_TRICKY, DIFF_NORMAL],
      [4, "normal", DIFF_NORMAL, DIFF_EASY],
      [5, "normal", DIFF_NORMAL, DIFF_EASY],
      [5, "tricky", DIFF_TRICKY, DIFF_NORMAL],
      [6, "tricky", DIFF_TRICKY, DIFF_NORMAL],
      [7, "normal", DIFF_NORMAL, DIFF_EASY],
    ];
    for (const [o, diff, level, below] of CASES) {
      it(`${o}x${o} ${diff} needs its own tier, not the one below`, () => {
        const p: MathraxParams = { o, diff, options: OPTIONSMASK };
        const { desc } = newMathraxDesc(p, randomNew(`tier-${o}-${diff}`));
        const st = newState(p, desc);
        expect(mathraxSolve(o, Uint8Array.from(st.grid), st.clues, level)).toBe(
          SOLVE_UNIQUE,
        );
        expect(mathraxSolve(o, Uint8Array.from(st.grid), st.clues, below)).not.toBe(
          SOLVE_UNIQUE,
        );
      });
    }

    // Order 3 has only four intersections, and two of its four tiers have
    // nothing to grade with — measured at 0 binding boards in 3,000 candidates
    // each. Refusing beats generating a board of the wrong difficulty.
    for (const diff of ["normal", "recursive"] as const) {
      it(`refuses to generate 3x3 ${diff}, which has no such board`, () => {
        const p: MathraxParams = { o: 3, diff, options: OPTIONSMASK };
        expect(validateParams(p, true)).toMatch(/Size 3/);
        // Loading an existing description at those params still works.
        expect(validateParams(p, false)).toBeNull();
      });
    }
  });

  it("emits only the clue types the options allow", () => {
    const p: MathraxParams = { o: 6, diff: "normal", options: OPTION_ADD };
    const { desc } = newMathraxDesc(p, randomNew("only-add"));
    const st = newState(p, desc);
    const kinds = new Set([...st.clues].filter(Boolean).map(clueType));
    expect(kinds).toEqual(new Set([CLUE_ADD]));
  });
});

// --- live validity ---------------------------------------------------------

describe("mathrax live errors", () => {
  /** A 3×3 board with `grid` filled in and `clues` at its four corners. */
  const board = (grid: number[], clues: number[] = [0, 0, 0, 0]): MathraxState => ({
    params: { o: 3, diff: "easy", options: 0 },
    grid: Uint8Array.from(grid),
    flags: new Uint8Array(9),
    pencil: new Int32Array(9),
    clues: Int32Array.from(clues),
  });
  const sumAt = (st: MathraxState) => [
    ...(liveErrors(rules, st).clueAt.get("sum")?.get(0) ?? []),
  ];

  it("marks a duplicated digit in a row or column", () => {
    const live = liveErrors(rules, board([1, 1, 0, 0, 0, 0, 0, 0, 0]));
    expect(live.pairs).toEqual([[1, 0]]);
  });

  it("marks both cells of a diagonal pair a clue cannot admit", () => {
    // "Sum to 5" at the top-left corner, 1 and 1 on its main diagonal.
    const st = board([1, 0, 0, 0, 1, 0, 0, 0, 0], [CLUE_ADD | setClueNum(5), 0, 0, 0]);
    expect(sumAt(st).sort()).toEqual([0, 4]);
  });

  it("marks a digit no digit across its clue pairs with, the cell across still open", () => {
    // 1 needs a 4 across "sum to 5", and a 3×3 holds no 4: the open cell
    // across has nothing to hold either.
    const st = board([1, 0, 0, 0, 0, 0, 0, 0, 0], [CLUE_ADD | setClueNum(5), 0, 0, 0]);
    expect(sumAt(st).sort()).toEqual([0, 4]);
    // 2 pairs with a 3, so nothing is marked.
    expect(
      sumAt(board([2, 0, 0, 0, 0, 0, 0, 0, 0], [CLUE_ADD | setClueNum(5), 0, 0, 0])),
    ).toEqual([]);
  });

  it("marks nothing on an untouched board", () => {
    const st = newState(FIX_PARAMS, FIX.desc);
    expect(rules.violations(st, rules.grid(st))).toEqual([]);
  });
});

// --- input -----------------------------------------------------------------

describe("mathrax input", () => {
  it("selects an editable cell, and refuses to highlight a given", () => {
    const st = newState(FIX_PARAMS, FIX.desc);
    const ui = newUi(st);
    const empty = [...st.flags].findIndex((f) => !(f & F_IMMUTABLE));
    const given = [...st.flags].findIndex((f) => f & F_IMMUTABLE);
    const o = FIX_PARAMS.o;

    expect(press(st, ui, LEFT_BUTTON, center(empty % o, (empty / o) | 0))).toBe(
      UI_UPDATE,
    );
    expect(ui.cursor.visible).toBe(true);
    expect(ui.cursor).toMatchObject({ x: empty % o, y: (empty / o) | 0 });

    press(st, ui, LEFT_BUTTON, center(given % o, (given / o) | 0));
    expect(ui.cursor.visible).toBe(false);
  });

  it("enters a digit, and suppresses re-entering the same one", () => {
    const st = newState(FIX_PARAMS, FIX.desc);
    const ui = newUi(st);
    const o = FIX_PARAMS.o;
    const empty = [...st.flags].findIndex((f) => !(f & F_IMMUTABLE));
    const x = empty % o;
    const y = (empty / o) | 0;

    press(st, ui, LEFT_BUTTON, center(x, y));
    expect(press(st, ui, "3".charCodeAt(0))).toEqual({
      type: "set",
      x,
      y,
      n: 3,
      pencil: false,
      // Auto-pencil defaults off, so the entry carries `autoElim: false`.
      autoElim: false,
    });

    const after = mathraxGame.executeMove(st, {
      type: "set",
      x,
      y,
      n: 3,
      pencil: false,
    });
    press(st, ui, LEFT_BUTTON, center(x, y)); // re-show the highlight
    // Re-entering 3 changes nothing, so it produces no move.
    expect(press(after, ui, "3".charCodeAt(0))).toBe(UI_UPDATE);
    expect(ui.cursor.visible).toBe(false);
  });

  it("refuses a digit above the grid order, and refuses to edit a given", () => {
    const st = newState(FIX_PARAMS, FIX.desc);
    const ui = newUi(st);
    const o = FIX_PARAMS.o;
    const empty = [...st.flags].findIndex((f) => !(f & F_IMMUTABLE));
    press(st, ui, LEFT_BUTTON, center(empty % o, (empty / o) | 0));
    expect(press(st, ui, "9".charCodeAt(0))).toBeNull(); // o is 5

    const given = [...st.flags].findIndex((f) => f & F_IMMUTABLE);
    ui.cursor.visible = true;
    ui.cursor.x = given % o;
    ui.cursor.y = (given / o) | 0;
    expect(press(st, ui, "1".charCodeAt(0))).toBeNull();
  });

  it("toggles a sticky pencil mode on right-click, and pencil-marks with it", () => {
    const st = newState(FIX_PARAMS, FIX.desc);
    const ui = newUi(st);
    const o = FIX_PARAMS.o;
    const empty = [...st.flags].findIndex((f) => !(f & F_IMMUTABLE));
    const x = empty % o;
    const y = (empty / o) | 0;

    expect(press(st, ui, RIGHT_BUTTON, center(x, y))).toBe(UI_UPDATE);
    expect(ui.pencilMode).toBe(true);
    expect(press(st, ui, "4".charCodeAt(0))).toEqual({
      type: "set",
      x,
      y,
      n: 4,
      pencil: true,
    });
    // A second right-click turns the mode back off (CapsLock-style).
    press(st, ui, RIGHT_BUTTON, center(x, y));
    expect(ui.pencilMode).toBe(false);
  });

  it("never pencil-marks a filled cell", () => {
    const st = newState(FIX_PARAMS, FIX.desc);
    const ui = newUi(st);
    const o = FIX_PARAMS.o;
    const given = [...st.flags].findIndex((f) => f & F_IMMUTABLE);
    ui.cursor.visible = true;
    ui.pencilMode = true;
    ui.cursor.x = given % o;
    ui.cursor.y = (given / o) | 0;
    expect(press(st, ui, "2".charCodeAt(0))).toBeNull();
  });

  it("moves and reveals the keyboard cursor, and Enter switches ink/pencil", () => {
    const st = newState(FIX_PARAMS, FIX.desc);
    const ui = newUi(st);
    expect(press(st, ui, CURSOR_RIGHT)).toBe(UI_UPDATE);
    expect(ui).toMatchObject({
      cursor: newCursor(1, 0, true),
      cursorFromKeyboard: true,
    });
    press(st, ui, CURSOR_DOWN);
    expect(ui.cursor).toMatchObject({ x: 1, y: 1 });
    expect(press(st, ui, CURSOR_SELECT)).toBe(UI_UPDATE);
    expect(ui.pencilMode).toBe(true);
  });

  it("fills all notes on the first M, then strikes the obvious ones on the next", () => {
    const st = newState(FIX_PARAMS, FIX.desc);
    const first = mathraxGame.markAll?.(st);
    expect(first).toEqual({ type: "pencilAll" });

    const noted = mathraxGame.executeMove(st, first as MathraxMove);
    const second = mathraxGame.markAll?.(noted);
    // Every empty cell now carries every candidate, so the adaptive second press
    // strikes the values already placed in that cell's row or column.
    expect(second).toMatchObject({ type: "pencilStrike" });
    const marks = (second as { type: "pencilStrike"; marks: unknown[] }).marks;
    expect(marks.length).toBeGreaterThan(0);
  });

  it("ignores a press outside the grid", () => {
    const st = newState(FIX_PARAMS, FIX.desc);
    const ui = newUi(st);
    const outside = computeSize(FIX_PARAMS, TS).w - 1; // the indicator margin
    expect(press(st, ui, LEFT_BUTTON, { x: outside, y: 10 })).toBeNull();
  });

  // The Marks key is the engine's, appended to every note-taking game's keypad
  // (`Midend.requestKeys`); a game lists only what is its own.
  it("offers a keypad of exactly the grid's digits and Clear", () => {
    expect(mathraxGame.requestKeys?.({ ...FIX_PARAMS, o: 5 })).toEqual([
      { button: 49, label: "1" },
      { button: 50, label: "2" },
      { button: 51, label: "3" },
      { button: 52, label: "4" },
      { button: 53, label: "5" },
      { button: 8, label: "Clear" },
    ]);
  });
});

// --- moves, completion and solve -------------------------------------------

describe("mathrax moves", () => {
  it("clears a cell, and clears all of a cell's notes with 0", () => {
    const st = newState(FIX_PARAMS, FIX.desc);
    const o = FIX_PARAMS.o;
    const empty = [...st.flags].findIndex((f) => !(f & F_IMMUTABLE));
    const x = empty % o;
    const y = (empty / o) | 0;

    let s = mathraxGame.executeMove(st, { type: "set", x, y, n: 2, pencil: true });
    s = mathraxGame.executeMove(s, { type: "set", x, y, n: 5, pencil: true });
    expect(s.pencil[empty]).toBe((1 << 2) | (1 << 5));
    s = mathraxGame.executeMove(s, { type: "set", x, y, n: 0, pencil: true });
    expect(s.pencil[empty]).toBe(0);
  });

  it("rejects a move onto a given", () => {
    const st = newState(FIX_PARAMS, FIX.desc);
    const o = FIX_PARAMS.o;
    const given = [...st.flags].findIndex((f) => f & F_IMMUTABLE);
    expect(() =>
      mathraxGame.executeMove(st, {
        type: "set",
        x: given % o,
        y: (given / o) | 0,
        n: 1,
        pencil: false,
      }),
    ).toThrow();
  });

  it("completes the game — and flashes — when the player fills the last cell", () => {
    const { m, status } = harness();
    expect(m.newGameFromId(FIX_ID)).toBeNull();
    const st = (m as unknown as { state: MathraxState }).state;
    const o = st.params.o;
    const sol = solutionOf(st);

    const moves: MathraxMove[] = [];
    for (let i = 0; i < o * o; i++) {
      if (st.flags[i] & F_IMMUTABLE) continue;
      moves.push({ type: "set", x: i % o, y: (i / o) | 0, n: sol[i], pencil: false });
    }
    m.playMoves(moves);
    expect(status()).toBe("solved");

    // A player-completed board celebrates: the win flash sweeps its cells
    // from the bottom left to the top right.
    const solved = moves.reduce(
      (s, mv) => mathraxGame.executeMove(s, mv),
      newState(FIX_PARAMS, FIX.desc),
    );
    expect(mathraxGame.status(solved)).toBe("solved");
    const palette = mathraxGame.colors(DEFAULT_BACKGROUND);
    const paint = (flash: Flash) => {
      const dr = new RecordingDrawing(palette);
      const ds = preferredDrawState(mathraxGame, solved);
      mathraxGame.redraw(dr, ds, {
        prev: null,
        state: solved,
        dir: 1,
        ui: newUi(solved),
        animTime: 0,
        flash,
      });
      return dr;
    };
    // The cells filled in the flash color, each as its index.
    // Lit is either tone of the highlight, and the flash shows both.
    const tones = new Set<number>();
    const isLit = (color: number) =>
      (color === COL_FLASH || color === COL_FLASH_LEAD) && tones.add(color).size > 0;
    const run = winFlashRun(paint, (dr) =>
      dr.ops.flatMap((op) =>
        op.op === "rect" && isLit(op.color)
          ? [((op.y - origin(TS)) / TS) * o + (op.x - origin(TS)) / TS]
          : [],
      ),
    );
    expectWinFlashTravels(run, o * o, (i) => sweepStep(i % o, Math.floor(i / o)));
    expect(tones.size).toBe(2);
  });

  it("Solve fills the board and reports solved-with-help", () => {
    const { m, status } = harness();
    expect(m.newGameFromId(FIX_ID)).toBeNull();
    expect(m.solve()).toBeNull();
    expect(status()).toBe("solved-with-help");

    const st = (m as unknown as { state: MathraxState }).state;
    expect([...st.grid].every((d) => d > 0)).toBe(true);
  });

  it("saveGame -> loadGame restores an equivalent game", () => {
    const { m } = harness();
    expect(m.newGameFromId(FIX_ID)).toBeNull();
    const st = (m as unknown as { state: MathraxState }).state;
    const o = st.params.o;
    const empty = [...st.flags].findIndex((f) => !(f & F_IMMUTABLE));
    m.playMoves([
      { type: "set", x: empty % o, y: (empty / o) | 0, n: 1, pencil: false },
      { type: "pencilAll" },
    ]);
    const saved = m.saveGame();

    const m2 = new Midend(mathraxGame);
    expect(m2.loadGame(saved)).toBeNull();
    const st2 = (m2 as unknown as { state: MathraxState }).state;
    expect([...st2.grid]).toEqual([
      ...(m as unknown as { state: MathraxState }).state.grid,
    ]);
    expect([...st2.pencil]).toEqual([
      ...(m as unknown as { state: MathraxState }).state.pencil,
    ]);
  });
});

// --- findMistakes ----------------------------------------------------------

describe("mathrax findMistakes", () => {
  it("reports nothing on an untouched or correctly-played board", () => {
    const st = newState(FIX_PARAMS, FIX.desc);
    expect(mathraxGame.findMistakes?.(st)).toEqual([]);

    const o = FIX_PARAMS.o;
    const sol = solutionOf(st);
    const empty = [...st.flags].findIndex((f) => !(f & F_IMMUTABLE));
    const right = mathraxGame.executeMove(st, {
      type: "set",
      x: empty % o,
      y: (empty / o) | 0,
      n: sol[empty],
      pencil: false,
    });
    expect(mathraxGame.findMistakes?.(right)).toEqual([]);
  });

  it("flags a digit that contradicts the unique solution", () => {
    const st = newState(FIX_PARAMS, FIX.desc);
    const o = FIX_PARAMS.o;
    const sol = solutionOf(st);
    const empty = [...st.flags].findIndex((f) => !(f & F_IMMUTABLE));
    const wrong = (sol[empty] % o) + 1;
    const bad = mathraxGame.executeMove(st, {
      type: "set",
      x: empty % o,
      y: (empty / o) | 0,
      n: wrong,
      pencil: false,
    });
    expect(mathraxGame.findMistakes?.(bad)).toEqual([
      { kind: "cell", x: empty % o, y: (empty / o) | 0 },
    ]);
  });

  it("flags a note that has crossed the solution digit out (notes are markings)", () => {
    const st = newState(FIX_PARAMS, FIX.desc);
    const o = FIX_PARAMS.o;
    const sol = solutionOf(st);
    const empty = [...st.flags].findIndex((f) => !(f & F_IMMUTABLE));
    const x = empty % o;
    const y = (empty / o) | 0;

    // Pencil in every candidate, then strike the correct one.
    let s = mathraxGame.executeMove(st, { type: "pencilAll" });
    s = mathraxGame.executeMove(s, {
      type: "pencilStrike",
      marks: [{ x, y, n: sol[empty] }],
    });
    expect(mathraxGame.findMistakes?.(s)).toContainEqual({ kind: "note", x, y });

    // A note carrying merely *extra* candidates is ordinary mid-solve state.
    const noted = mathraxGame.executeMove(st, { type: "pencilAll" });
    expect(mathraxGame.findMistakes?.(noted)).toEqual([]);
  });
});

// --- rendering (tier 2.5) --------------------------------------------------

describe("mathrax rendering", () => {
  it("sizes the board from the tile size, plus the pencil-indicator margin", () => {
    const size = computeSize({ o: 5 }, 40);
    // The board is square and upstream's exact size; the canvas adds the room
    // the engine's indicator needs, on every side — so the board stays centered
    // and the canvas stays square.
    const board = 5 * 40 + 2;
    expect(size.w).toBe(board + 2 * pencilIndicatorReach(40));
    expect(size.h).toBe(board + 2 * pencilIndicatorReach(40));
  });

  it("draws the opening frame", () => {
    const { recording } = renderScenario({ game: mathraxGame, id: FIX_ID });
    // Every clue is a circle; every given is text.
    expect(recording.ops.filter((o) => o.op === "circle").length).toBeGreaterThan(0);
    expect(recording.ops.filter((o) => o.op === "text").length).toBeGreaterThan(0);
    expect(recording.ops).toMatchSnapshot();
  });

  it("draws pencil marks for a noted cell", () => {
    const plain = renderScenario({ game: mathraxGame, id: FIX_ID });
    const noted = renderScenario({
      game: mathraxGame,
      id: FIX_ID,
      moves: [{ type: "pencilAll" }],
    });
    const texts = (r: typeof plain) =>
      r.recording.ops.filter((o) => o.op === "text").length;
    expect(texts(noted)).toBeGreaterThan(texts(plain));
    expect(noted.recording.ops).toMatchSnapshot();
  });

  it("marks a wrong digit with the COL_ERROR mistake outline", () => {
    const st = newState(FIX_PARAMS, FIX.desc);
    const o = FIX_PARAMS.o;
    const sol = solutionOf(st);
    const empty = [...st.flags].findIndex((f) => !(f & F_IMMUTABLE));
    const { recording, mistakeCount } = renderScenario({
      game: mathraxGame,
      id: FIX_ID,
      moves: [
        {
          type: "set",
          x: empty % o,
          y: (empty / o) | 0,
          n: (sol[empty] % o) + 1,
          pencil: false,
        },
      ],
      showMistakes: true,
    });
    expect(mistakeCount).toBe(1);
    expect(recording.ops.some((op) => op.op === "line" && op.color === COL_ERROR)).toBe(
      true,
    );
  });

  it("repaints the mistake overlay on a cell that was already drawn", () => {
    // Regression guard for docs/rendering.md § "Overlay sidecars": the overlay isn't part of the packed
    // tile value, so it must also be compared in the cache-miss test — Check &
    // Save runs a frame *after* the move that drew the cell.
    const m = new Midend(mathraxGame);
    expect(m.newGameFromId(FIX_ID)).toBeNull();
    const st = (m as unknown as { state: MathraxState }).state;
    const o = st.params.o;
    const sol = solutionOf(st);
    const empty = [...st.flags].findIndex((f) => !(f & F_IMMUTABLE));
    m.playMoves([
      {
        type: "set",
        x: empty % o,
        y: (empty / o) | 0,
        n: (sol[empty] % o) + 1,
        pencil: false,
      },
    ]);

    const palette = mathraxGame.colors(DEFAULT_BACKGROUND);
    m.redraw(new RecordingDrawing(palette)); // first paint: no overlay yet
    expect(m.findMistakes()).toBe(1);
    const after = new RecordingDrawing(palette);
    m.redraw(after);
    expect(after.ops.some((op) => op.op === "line" && op.color === COL_ERROR)).toBe(
      true,
    );

    // …and a third frame without the overlay erases it again.
    m.playMoves([{ type: "pencilAll" }]);
    const cleared = new RecordingDrawing(palette);
    m.redraw(cleared);
    expect(cleared.ops.some((op) => op.op === "line" && op.color === COL_ERROR)).toBe(
      false,
    );
  });
});
