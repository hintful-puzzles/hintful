/**
 * Behavioral tests for the Mines port. Tiers per the docs/games/testing.md § "The test tiers":
 * tier-1 logic (params/desc/solver/generator/game), tier-1 midend integration
 * (supersede, save/load, timer), tier-2.5 render scenarios + snapshots.
 *
 * A `D<n>` in a test title below names a numbered decision in
 * `add-mines-ts-port`'s design.md — said once here so the titles stay readable
 * and the change id is a citation the gate can resolve.
 */
import { describe, expect, it } from "vitest";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  descBadCharacter,
} from "../../engine/desc-error.ts";
import { Midend } from "../../engine/index.ts";
import { paramsError } from "../../engine/params.ts";
import { LEFT_BUTTON, LEFT_DRAG, LEFT_RELEASE } from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { decodeSave } from "../../engine/save.ts";
import { driveMidend } from "../../engine/testing/drive-midend.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { minegen } from "./generator.ts";
import { minesGame } from "./index.ts";
import { borderFor } from "./render.ts";
import { minesolve } from "./solver.ts";
import {
  COVERED,
  decodeDesc,
  decodeParams,
  encodeParams,
  type MinesMove,
  type MinesState,
  type MinesUi,
  validateDesc,
} from "./state.ts";

const BG: [number, number, number] = [0.9, 0.9, 0.9];

/** A full-params seed id for a preset (short `9x9` decodes n as area/10). */
const seedId = (params: string, seed: string) => `${params}#${seed}`;
const openMove = (x: number, y: number): MinesMove => ({
  type: "ops",
  ops: [{ op: "O", x, y }],
});

function fresh(id: string) {
  const h = driveMidend(minesGame);
  expect(h.midend.newGameFromId(id)).toBeNull();
  const gameId = () => h.last("game-id-change")?.currentGameId;
  return { m: h.midend, gameId };
}

/** A genuinely covered cell (`?` in the text format) — a flag on an opened
 * cell is illegal, so tests must pick a covered one to flag. */
function coveredCell(m: { formatAsText(): string | null }): {
  x: number;
  y: number;
} {
  const rows = (m.formatAsText() ?? "").split("\n");
  for (let y = 0; y < rows.length; y++) {
    const x = rows[y].indexOf("?");
    if (x >= 0) return { x, y };
  }
  throw new Error("no covered cell found");
}

// --- params ------------------------------------------------------------

describe("mines params", () => {
  it("round-trips the presets through encode/decode (full)", () => {
    for (const s of [
      "9x9n10",
      "9x9n35",
      "16x16n40",
      "16x16n99",
      "30x16n99",
      "30x16n170",
    ]) {
      expect(encodeParams(decodeParams(s), true)).toBe(s);
    }
  });

  it("defaults mine count to area/10 without an n suffix", () => {
    expect(decodeParams("9x9").n).toBe(8);
    expect(decodeParams("10x10").n).toBe(10);
  });

  it("parses the non-unique flag and forced first click", () => {
    const p = decodeParams("16x16n40aX3Y4");
    expect(p.unique).toBe(false);
    expect(p.firstClickX).toBe(3);
    expect(p.firstClickY).toBe(4);
  });

  it("validates size and mine-count bounds", () => {
    expect(paramsError(minesGame, decodeParams("9x9n10"), true)).toBeNull();
    expect(paramsError(minesGame, decodeParams("5x5n3"), true)).toBeNull();
    expect(paramsError(minesGame, decodeParams("5x5n0"), true)).toBe(
      "Mines must be at least 1.",
    );
    // too many mines: n > wh - 9 (a 3x3 needs 9 clear around the first click).
    expect(
      paramsError(
        minesGame,
        { w: 3, h: 3, n: 5, unique: true, firstClickX: -1, firstClickY: -1 },
        true,
      ),
    ).toBe("There must be at least 9 more squares than mines.");
    // unique requires > 2 in each dimension.
    expect(
      paramsError(
        minesGame,
        { w: 2, h: 9, n: 3, unique: true, firstClickX: -1, firstClickY: -1 },
        true,
      ),
    ).toMatch(/greater than two/);
  });
});

// --- desc codec --------------------------------------------------------

describe("mines desc", () => {
  it("validates the preliminary r-form", () => {
    const p = decodeParams("9x9n10");
    const rs = randomNew("desc-seed");
    const { desc } = minesGame.newDesc(p, rs);
    expect(desc.startsWith("r10,u,")).toBe(true);
    expect(validateDesc(p, desc)).toBeNull();
  });

  it("decodes r-form to a null (not-yet-generated) layout", () => {
    const p = decodeParams("9x9n10");
    const { desc } = minesGame.newDesc(p, randomNew("desc-seed"));
    const { layout, openXY } = decodeDesc(p, desc);
    expect(layout.mines).toBeNull();
    expect(layout.n).toBe(10);
    expect(layout.unique).toBe(true);
    expect(openXY).toBeNull();
  });

  it("round-trips public and private layout descs (unmasked)", () => {
    // Build a tiny known layout via decode of an unmasked public desc.
    const p = decodeParams("3x3n1");
    // 3x3, one mine at index 0. Unmasked nibbles ((9+3)/4 = 3): bit MSB-first
    // in byte 0 (0x80 -> nibble "8"), rest 0 -> "800".
    const pub = decodeDesc(p, "1,1,u800");
    expect(pub.openXY).toEqual({ x: 1, y: 1 });
    expect(pub.layout.mines?.[0]).toBe(1);
    expect(Array.from(pub.layout.mines ?? []).reduce((a, b) => a + b, 0)).toBe(1);
    // Private desc (layout only, no click).
    const priv = decodeDesc(p, "u800");
    expect(priv.openXY).toBeNull();
    expect(priv.layout.mines?.[0]).toBe(1);
  });

  it("rejects a wrong-length desc", () => {
    const p = decodeParams("9x9n10");
    expect(validateDesc(p, "4,4,mtooshort")).toBe(descBadCharacter("t"));
    expect(validateDesc(p, `4,4,m${"0".repeat(20)}`)).toBe(DESC_TOO_SHORT);
    expect(validateDesc(p, `4,4,m${"0".repeat(22)}`)).toBe(DESC_TOO_LONG);
  });

  it("reads the layout exactly as the encoder writes it", () => {
    const p = decodeParams("3x3n1");
    expect(validateDesc(p, "1,1,u800")).toBeNull();
    // The ninth bit is the last nibble's high bit; the other three are padding.
    expect(validateDesc(p, "u801")).toBe(descBadCharacter("1"));
    expect(validateDesc(p, "uA00")).toBe(descBadCharacter("A"));
    // A layout without its `m` or `u`.
    expect(validateDesc(p, "a00")).toBe(descBadCharacter("a"));
    expect(validateDesc(p, "3,1,u800")).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(p, "1,3,u800")).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(p, "1,1u800")).toBe(descBadCharacter("u"));
  });

  it("reads the r-form's RNG state exactly as the encoder writes it", () => {
    const p = decodeParams("9x9n10");
    const { desc } = minesGame.newDesc(p, randomNew("desc-seed"));
    expect(validateDesc(p, `${desc}x`)).toBe(descBadCharacter("x"));
    expect(validateDesc(p, `${desc}0`)).toBe(DESC_TOO_LONG);
    expect(validateDesc(p, desc.slice(0, -1))).toBe(DESC_TOO_SHORT);
    // The last byte is the read position, at most 20.
    expect(validateDesc(p, `${desc.slice(0, -2)}ff`)).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(p, desc.replace(",u,", ",x,"))).toBe(descBadCharacter("x"));
    const letter = desc.slice(6).search(/[a-f]/) + 6;
    const upper = desc[letter].toUpperCase();
    expect(letter).toBeGreaterThanOrEqual(6);
    expect(
      validateDesc(p, `${desc.slice(0, letter)}${upper}${desc.slice(letter + 1)}`),
    ).toBe(descBadCharacter(upper));
  });
});

// --- solver ------------------------------------------------------------

describe("mines solver", () => {
  it("fully solves a generated unique board without guessing", () => {
    const w = 9;
    const h = 9;
    const n = 10;
    const x = 4;
    const y = 4;
    const mines = minegen(w, h, n, x, y, true, randomNew("solve"));
    const open = (ox: number, oy: number) => {
      if (mines[oy * w + ox]) return -1;
      let c = 0;
      for (let i = -1; i <= 1; i++)
        for (let j = -1; j <= 1; j++) {
          const nx = ox + i;
          const ny = oy + j;
          if (
            nx >= 0 &&
            nx < w &&
            ny >= 0 &&
            ny < h &&
            !(i === 0 && j === 0) &&
            mines[ny * w + nx]
          )
            c++;
        }
      return c;
    };
    const grid = new Int8Array(w * h).fill(-2);
    grid[y * w + x] = open(x, y);
    expect(minesolve(w, h, n, grid, open, null, null)).toBe(0);
    // no covered squares left
    expect(Array.from(grid).some((v) => v === -2)).toBe(false);
  });

  it("stalls (returns -1) on a genuine 50/50 with unknown total", () => {
    // A single open '1' between two covered squares: either could be the mine,
    // and with n = -1 the global mine-count deduction is disabled.
    const grid = new Int8Array([-2, 1, -2]);
    expect(minesolve(3, 1, -1, grid, () => 0, null, null)).toBe(-1);
  });
});

// --- generator ---------------------------------------------------------

describe("mines generator", () => {
  it("generates solvable boards with exactly n mines and a clear first-click area", () => {
    const w = 9;
    const h = 9;
    const n = 10;
    const x = 4;
    const y = 4;
    for (let s = 0; s < 4; s++) {
      const mines = minegen(w, h, n, x, y, true, randomNew(`gen${s}`));
      expect(Array.from(mines).reduce((a, b) => a + b, 0)).toBe(n);
      // 3x3 around the first click is clear.
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) expect(mines[(y + dy) * w + (x + dx)]).toBe(0);
    }
  }, 30_000);
});

// --- game / supersede / midend -----------------------------------------

describe("mines supersede + midend", () => {
  it("the first click generates a layout and supersedes the desc", () => {
    const h = fresh(seedId("9x9n10", "sup1"));
    // The preliminary id names no layout…
    expect(h.gameId()).toContain("r10,u,");
    h.m.playMoves([openMove(4, 4)]);
    // …and after the first open it names the real board (x,y + masked layout).
    expect(h.gameId()).toMatch(/^9x9:4,4,m[0-9a-f]+$/);
  });

  it("validates both descs supersededDesc writes", () => {
    const p = decodeParams("9x9n10");
    const h = fresh(seedId("9x9n10", "sup-valid"));
    h.m.playMoves([openMove(4, 4)]);
    const publicDesc = (h.gameId() ?? "").replace(/^[^:]*:/, "");
    const { privDesc } = decodeSave(h.m.saveGame());
    expect(publicDesc).toMatch(/^4,4,m/);
    expect(validateDesc(p, publicDesc)).toBeNull();
    expect(privDesc).toMatch(/^m/);
    expect(validateDesc(p, privDesc ?? "")).toBeNull();
    const pub = decodeDesc(p, publicDesc).layout.mines;
    const priv = decodeDesc(p, privDesc ?? "").layout.mines;
    expect(Array.from(pub ?? []).reduce((a, b) => a + b, 0)).toBe(10);
    expect(Array.from(priv ?? [])).toEqual(Array.from(pub ?? []));
  });

  it("does NOT reroll the layout after undo + click elsewhere (design D1)", () => {
    const h = fresh(seedId("9x9n10", "noreroll"));
    h.m.playMoves([openMove(4, 4)]);
    const hex1 = decodeSave(h.m.saveGame()).privDesc;
    h.m.undo();
    h.m.playMoves([openMove(0, 0)]);
    const hex2 = decodeSave(h.m.saveGame()).privDesc;
    // Same layout box: the masked bitmap is identical, only the recorded first
    // click differs — the whole point of the shared box (no board reroll).
    expect(hex2).toBe(hex1);
    expect(h.gameId()).toMatch(/^9x9:0,0,m/);
  });

  it("a save after the first click carries both descs and the ui", () => {
    const h = fresh(seedId("9x9n10", "save1"));
    h.m.playMoves([openMove(4, 4)]);
    const save = decodeSave(h.m.saveGame());
    expect(save.desc).toMatch(/^4,4,m/);
    expect(save.privDesc).toMatch(/^m/);
    expect(save.ui).toBe("D0");
  });

  it("a restored save replays to the same board against the private desc", () => {
    const h = fresh(seedId("9x9n10", "roundtrip"));
    h.m.playMoves([openMove(4, 4)]);
    const flag = coveredCell(h.m);
    h.m.playMoves([{ type: "ops", ops: [{ op: "F", x: flag.x, y: flag.y }] }]);
    const before = h.m.formatAsText();
    const data = h.m.saveGame();

    const m2 = new Midend(minesGame);
    expect(m2.loadGame(data)).toBeNull();
    expect(m2.formatAsText()).toBe(before);
    // Undo to state 0: rebuilt from the private desc (layout, no click), so the
    // board is fully covered again — the click was not baked in.
    m2.undo();
    m2.undo();
    expect(m2.formatAsText()?.replace(/\n/g, "")).toBe("?".repeat(81));
  });

  it("restart lands after the first click, not on a blank board (design D1)", () => {
    const h = fresh(seedId("9x9n10", "restart"));
    h.m.playMoves([openMove(4, 4)]);
    const flag = coveredCell(h.m);
    h.m.playMoves([{ type: "ops", ops: [{ op: "F", x: flag.x, y: flag.y }] }]);
    h.m.restartGame();
    // The (4,4) click is still open (row 4 is not all covered); only the flag
    // move is gone. Restarting to history[0] would have given a blank grid.
    const board = h.m.formatAsText() ?? "";
    expect(board.replace(/\n/g, "").includes("-") || /[1-8]/.test(board)).toBe(true);
    expect(board.split("\n")[4]).not.toBe("?????????");
  });

  it("interpretMove bumps the death counter when opening a mine (design D7)", () => {
    // Hand-built ongoing 3x3 board, one mine at (0,0), one open cell so the
    // board is neither won nor blank. A left press + release on the mine cell
    // must emit an open and bump ui.deaths.
    const p = decodeParams("3x3n1");
    const layout = decodeDesc(p, "u800").layout; // mine at (0,0)
    const grid = new Int8Array(9).fill(COVERED);
    grid[4] = 1; // (1,1) opened, showing 1 — leaves the board ongoing
    const s: MinesState = {
      w: 3,
      h: 3,
      n: 1,
      dead: false,
      layout,
      clickedAt: { x: 1, y: 1 },
      grid,
    };
    const ui = minesGame.newUi(s);
    const ds = minesGame.newDrawState(s, 20);
    const border = borderFor(20);
    const at = (x: number, y: number) => ({
      x: x * 20 + border + 10,
      y: y * 20 + border + 10,
    });
    // Press then release on (0,0).
    minesGame.interpretMove(s, ui, ds, at(0, 0), LEFT_BUTTON);
    const move = minesGame.interpretMove(s, ui, ds, at(0, 0), LEFT_RELEASE);
    expect(move).toEqual({ type: "ops", ops: [{ op: "O", x: 0, y: 0 }] });
    expect(ui.deaths).toBe(1);
  });

  it("a mis-flagged chord reveals only the mined square (design D7)", () => {
    // 3x3, mine at (0,0). Player has opened (1,1) showing 1, and wrongly flagged
    // (1,0) instead of the real mine (0,0). Chording the satisfied '1' must emit
    // an open of *only* the true mine (0,0), not the whole neighborhood, and
    // bump the death counter.
    const p = decodeParams("3x3n1");
    const layout = decodeDesc(p, "u800").layout; // mine at (0,0)
    const grid = new Int8Array(9).fill(COVERED);
    grid[4] = 1; // (1,1) open, showing 1 neighboring mine
    grid[1] = -1; // (1,0) wrongly flagged
    const s: MinesState = {
      w: 3,
      h: 3,
      n: 1,
      dead: false,
      layout,
      clickedAt: { x: 1, y: 1 },
      grid,
    };
    const ui = minesGame.newUi(s);
    const ds = minesGame.newDrawState(s, 20);
    const border = borderFor(20);
    const at = (x: number, y: number) => ({
      x: x * 20 + border + 10,
      y: y * 20 + border + 10,
    });
    // A click (chord) on the '1' at (1,1): press, then release.
    minesGame.interpretMove(s, ui, ds, at(1, 1), LEFT_BUTTON);
    const move = minesGame.interpretMove(s, ui, ds, at(1, 1), LEFT_RELEASE);
    expect(move).toEqual({ type: "ops", ops: [{ op: "O", x: 0, y: 0 }] });
    expect(ui.deaths).toBe(1);
    // Executing it kills the player and exposes only that mine.
    if (move && move !== null && typeof move === "object") {
      const next = minesGame.executeMove(s, move as MinesMove);
      expect(next.dead).toBe(true);
      expect(next.grid[0]).toBe(65); // KILLED at (0,0)
    }
  });

  it("Solve on an alive board reveals the full solution", () => {
    const p = decodeParams("3x3n1");
    const s = minesGame.newState(p, "1,1,u800"); // opens (1,1); wins on this tiny board
    // Rebuild an explicitly-ongoing board so Solve fills the whole grid.
    const alive: MinesState = { ...s, grid: new Int8Array(9).fill(COVERED) };
    expect(minesGame.status(alive)).toBe("ongoing");
    const solved = minesGame.executeMove(alive, { type: "solve" });
    expect(minesGame.status(solved)).toBe("solved");
    expect(solved.grid[0]).toBe(-1); // the mine, flagged
    // every non-mine square carries its neighbor count
    expect(Array.from(solved.grid)).toEqual([-1, 1, 0, 1, 1, 0, 0, 0, 0]);
  });

  it("Solve after death shows the finished board", () => {
    const p = decodeParams("3x3n1");
    const layout = decodeDesc(p, "u800").layout; // mine at (0,0)
    const grid = new Int8Array(9).fill(COVERED);
    grid[0] = 65; // trodden on the mine
    grid[1] = -1; // (1,0) wrongly flagged (no mine there)
    const dead: MinesState = {
      w: 3,
      h: 3,
      n: 1,
      dead: true,
      layout,
      clickedAt: { x: 0, y: 0 },
      grid,
    };
    const solved = minesGame.executeMove(dead, { type: "solve" });
    // The opened mine and the wrong flag are replaced, as any wrong entry is.
    expect(minesGame.status(solved)).toBe("solved");
    expect(Array.from(solved.grid)).toEqual([-1, 1, 0, 1, 1, 0, 0, 0, 0]);
  });

  it("encodeUi / decodeUi round-trips deaths, and reads an older save's C", () => {
    const ui = minesGame.newUi({} as never);
    ui.deaths = 3;
    const enc = minesGame.encodeUi?.(ui) ?? "";
    expect(enc).toBe("D3");
    const ui2 = minesGame.newUi({} as never);
    minesGame.decodeUi?.(ui2, enc);
    expect(ui2.deaths).toBe(3);
    const ui3 = minesGame.newUi({} as never);
    minesGame.decodeUi?.(ui3, "D4C");
    expect(ui3.deaths).toBe(4);
  });
});

// --- chord preview -----------------------------------------------------

describe("mines chord preview", () => {
  // A hand-built board: '1' at (1,1) satisfied by a flag at (0,0), one covered
  // safe cell (2,2) to open, so a chord actually does something.
  function board(): {
    s: MinesState;
    ui: MinesUi;
    ds: unknown;
    at: (x: number, y: number) => { x: number; y: number };
  } {
    const p = decodeParams("3x3n1");
    const layout = decodeDesc(p, "u800").layout; // mine at (0,0)
    const grid = new Int8Array(9).fill(COVERED);
    grid[1 * 3 + 1] = 1; // (1,1) open, showing 1
    grid[0] = -1; // (0,0) flagged (the mine)
    const s: MinesState = {
      w: 3,
      h: 3,
      n: 1,
      dead: false,
      layout,
      clickedAt: { x: 1, y: 1 },
      grid,
    };
    const ui = minesGame.newUi(s);
    const ds = minesGame.newDrawState(s, 20);
    const border = borderFor(20);
    const at = (x: number, y: number) => ({
      x: x * 20 + border + 10,
      y: y * 20 + border + 10,
    });
    return { s, ui, ds, at };
  }

  it("a LEFT press over a number with all its flags previews the 3x3 chord", () => {
    const { s, ui, ds, at } = board();
    minesGame.interpretMove(s, ui, ds as never, at(1, 1), LEFT_BUTTON);
    expect(ui.hradius).toBe(1);
    expect(ui.validradius).toBe(1);
  });

  it("a LEFT press over a number still short of flags shows NO preview but records chord intent", () => {
    const { s, ui, ds, at } = board();
    const unflagged: MinesState = {
      ...s,
      grid: s.grid.map((v) => (v === -1 ? COVERED : v)),
    };
    minesGame.interpretMove(unflagged, ui, ds as never, at(1, 1), LEFT_BUTTON);
    // No preview flash (a false "uncover" that the release would revert).
    expect(ui.hradius).toBe(0);
    expect(ui.validradius).toBe(1);
  });

  it("a press that opens shows no chord preview when dragged onto a ready number", () => {
    const { s, ui, ds, at } = board();
    minesGame.interpretMove(s, ui, ds as never, at(2, 2), LEFT_BUTTON);
    minesGame.interpretMove(s, ui, ds as never, at(1, 1), LEFT_DRAG);
    // The release would open, not chord, so the 3x3 would be a false promise.
    expect(ui.hradius).toBe(0);
  });

  it("a LEFT press over a covered cell keeps its single-cell open highlight", () => {
    const { s, ui, ds, at } = board();
    minesGame.interpretMove(s, ui, ds as never, at(2, 2), LEFT_BUTTON);
    expect(ui.hradius).toBe(0);
    expect(ui.validradius).toBe(0); // open intent, not chord
  });

  it("a plain LEFT click on a satisfied number still chords (no preview needed)", () => {
    const { s, ui, ds, at } = board();
    minesGame.interpretMove(s, ui, ds as never, at(1, 1), LEFT_BUTTON);
    const move = minesGame.interpretMove(s, ui, ds as never, at(1, 1), LEFT_RELEASE);
    expect(move).toEqual({ type: "ops", ops: [{ op: "C", x: 1, y: 1 }] });
    // Executing it opens the covered safe neighbor.
    const next = minesGame.executeMove(s, move as MinesMove);
    expect(next.grid[2 * 3 + 2]).toBeGreaterThanOrEqual(0); // (2,2) now open
  });
});

// --- timer -------------------------------------------------------------

describe("mines timer", () => {
  // Mines keeps upstream's clock through the engine's rule alone: the first
  // click is the first move, and a win is a solve.
  it("starts at the first click, stops on a win, and resumes when the win is undone", () => {
    const { midend: m, last, timerActive: ticking } = driveMidend(minesGame);
    expect(m.newGameFromId(seedId("9x9n10", "timer"))).toBeNull();
    const seconds = () => last("timer-change")?.timer?.seconds;

    expect(seconds()).toBe(0);
    expect(ticking()).toBe(false);
    m.playMoves([openMove(4, 4)]);
    expect(ticking()).toBe(true);
    m.timer(7);
    expect(seconds()).toBe(7);

    // The win's flash keeps the tick alive a moment, so the time is what is
    // asserted, not the tick.
    expect(m.solve()).toBeNull();
    m.timer(5);
    expect(seconds()).toBe(7);
    expect(ticking()).toBe(false);
    // A peek at the solution, undone, puts the player back on the clock.
    m.undo();
    expect(ticking()).toBe(true);
    m.timer(5);
    expect(seconds()).toBe(12);
  });
});

// --- render (tier 2.5) -------------------------------------------------

describe("mines render", () => {
  it("paints the opened board: numbers, covered bevels, recessed border", () => {
    const { recording } = renderScenario({
      game: minesGame,
      id: seedId("9x9n10", "render1"),
      moves: [openMove(4, 4)],
    });
    const ops = recording.ops;
    // A recessed frame (two filled pentagons) on the first frame.
    expect(ops.some((o) => o.op === "polygon")).toBe(true);
    // At least one number drawn (drawText) and covered tiles (bevel triangles).
    expect(ops.some((o) => o.op === "text")).toBe(true);
    expect(ops.filter((o) => o.op === "rect").length).toBeGreaterThan(0);
    expect(ops).toMatchSnapshot();
  });

  it("repaints the mouse-down highlight on press AND on release (paint twice, D8)", () => {
    // The highlight radius is folded into each tile's cache value `v`, so it
    // must repaint the affected covered tile both when pressed and when
    // released — a cold-frame test could not catch a missing one.
    const p = decodeParams("9x9n10");
    const { desc } = minesGame.newDesc(p, randomNew("hl"));
    const s = minesGame.newState(p, desc); // blank pre-click board, all covered
    const palette = minesGame.colors(BG);
    const ui = minesGame.newUi(s);
    const ds = minesGame.newDrawState(s, 20);

    const paint = (state: MinesState) => {
      const rec = new RecordingDrawing(palette);
      minesGame.redraw?.(rec, ds, null, state, 0, ui, 0, 0);
      return rec;
    };

    paint(s); // warm the per-tile cache
    expect(paint(s).ops.length).toBe(0); // steady state: nothing repaints

    // Press on covered (2,2): its tile value flips to the pressed flat fill.
    ui.hx = 2;
    ui.hy = 2;
    ui.hradius = 0;
    const pressed = paint(s);
    expect(pressed.ops.length).toBeGreaterThan(0);

    // Release: the tile reverts, and must repaint to *clear* the highlight.
    ui.hx = -1;
    ui.hy = -1;
    const released = paint(s);
    expect(released.ops.length).toBeGreaterThan(0);
  });
});
