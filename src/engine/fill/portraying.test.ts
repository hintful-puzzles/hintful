/**
 * A board of numbers drawn as pictures (`numbers.pictures`), on the
 * `portraying` fixture, a Latin square of a ghost, a vampire and a zombie: a
 * value placed is drawn as its painter's piece and noted as a small one,
 * typed by its letter, and drawn as the letter where the player's preference
 * says, `A` switching it; the row of counts follows the preference.
 */

import { describe, expect, it } from "vitest";
import * as portraying from "../../generated/engine/testing/fixtures/portraying/portraying.compiled.ts";
import * as sighting from "../../generated/engine/testing/fixtures/sighting/sighting.compiled.ts";
import { COL_ERROR } from "../color/roles.ts";
import { UI_UPDATE } from "../contract/game.ts";
import { randomNew } from "../random/index.ts";
import { ghostColor, vampireColor, zombieColor } from "../render/pieces/monster.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import type { FillBoard } from "./board.ts";
import { fillGame } from "./game.ts";
import type { FillUi } from "./play.ts";

type Board = FillBoard<portraying.Dealt>;

const game = fillGame("portraying", portraying);
const TS = 48;
const colors = game.colors(DEFAULT_BACKGROUND);
const p = game.decodeParams("3");
const b: Board = game.newState(p, game.newDesc(p, randomNew("portraying")).desc);
const open = [...b.fixed].indexOf(0);
const fixedAt = [...b.fixed].indexOf(1);

/** The palette slot of `color`, the one a painter takes for it. */
const slotOf = (color: readonly number[]): number =>
  colors.findIndex((c) => c.every((x, i) => Math.abs(x - color[i]) < 1e-9));
const bodies = [ghostColor, vampireColor, zombieColor].map((c) =>
  slotOf(c(DEFAULT_BACKGROUND)),
);

/** The ops of a first frame of board `s` under `ui`. */
function draw(s: Board, ui: FillUi = game.newUi(s)): readonly DrawOp[] {
  const dr = new RecordingDrawing(colors);
  game.redraw(dr, game.newDrawState(s, TS), {
    state: s,
    prev: null,
    dir: 1,
    ui,
    animTime: 0,
    flash: NO_FLASH,
  } as never);
  return dr.ops;
}

/** The fills of the circles drawn in a monster's body color, by monster. */
const monstersIn = (ops: readonly DrawOp[]): number[] =>
  ops.flatMap((op) =>
    op.op === "circle" && bodies.includes(op.fill) ? [bodies.indexOf(op.fill) + 1] : [],
  );

/** A Ui with the cursor on `c`. */
function at(c: number): FillUi {
  const ui = game.newUi(b);
  Object.assign(ui.cursor, { x: c % b.w, y: Math.floor(c / b.w), visible: true });
  return ui;
}

/** The move key `key` makes with the cursor on the open square. */
const press = (key: string, ui: FillUi = at(open)) =>
  game.interpretMove(
    b,
    ui,
    game.newDrawState(b, TS),
    { x: 0, y: 0 },
    key.charCodeAt(0),
  );

describe("a board of numbers drawn as pictures", () => {
  it("draws its painters' colors, each a slot", () => {
    expect(bodies.every((s) => s >= 0)).toBe(true);
    expect(new Set(bodies).size).toBe(3);
  });

  it("draws a value as its piece, and as its letter under the preference", () => {
    const given = b.values[fixedAt];
    const letter = "GVZ"[given - 1];
    const ops = draw(b);
    expect(monstersIn(ops)).toContain(given);
    expect(ops.some((op) => op.op === "text" && op.text === letter)).toBe(false);
    const ui = game.newUi(b);
    ui.pictures = false;
    const lettered = draw(b, ui);
    expect(monstersIn(lettered)).toEqual([]);
    expect(lettered.some((op) => op.op === "text" && op.text === letter)).toBe(true);
  });

  it("notes each value as a small piece, two by two in its square", () => {
    const noted = game.executeMove(b, {
      type: "pencilAdd",
      marks: [1, 2, 3].map((n) => ({ x: open % b.w, y: Math.floor(open / b.w), n })),
    } as never);
    /** The monsters' heads drawn, each its body's circle of the widest
     * radius: one a monster, a placed one's or a note's. */
    const heads = (ops: readonly DrawOp[]) =>
      ops.filter(
        (op): op is Extract<DrawOp, { op: "circle" }> =>
          op.op === "circle" && bodies.includes(op.fill),
      );
    const placed = Math.max(...heads(draw(b)).map((op) => op.r));
    // A note fills a quarter of its square, a placed piece three quarters of
    // it: two thirds as wide.
    const notes = heads(draw(noted)).filter((op) => op.r <= (placed * 3) / 4);
    // The widest circle of each note, by monster.
    const widest = [1, 2, 3].map((m) =>
      notes
        .filter((op) => op.fill === bodies[m - 1])
        .reduce((a, op) => (op.r > a.r ? op : a)),
    );
    // Two by two in reading order: the ghost and the vampire side by side,
    // the zombie beneath the ghost, all inside the noted square.
    const [ghost, vampire, zombie] = widest;
    expect(vampire.cx).toBeGreaterThan(ghost.cx + TS / 4);
    expect(zombie.cy).toBeGreaterThan(ghost.cy + TS / 4);
    expect(Math.abs(zombie.cx - ghost.cx)).toBeLessThan(2);
    expect(vampire.cx - ghost.cx).toBeLessThan(TS / 2 + 2);
  });

  it("types a value by its letter, and A switches pictures and letters", () => {
    const move = press("Z");
    expect(move).toMatchObject({ type: "set", n: 3 });
    const ui = at(open);
    expect(ui.pictures).toBe(true);
    expect(press("A", ui)).toBe(UI_UPDATE);
    expect(ui.pictures).toBe(false);
    expect(press("a", ui)).toBe(UI_UPDATE);
    expect(ui.pictures).toBe(true);
  });

  it("offers the preference by the description's name", () => {
    const pref = game.prefs?.find((q) => q.kw === "monsters");
    if (pref?.type !== "choices") throw new Error("no pictures preference");
    expect(pref.name).toBe("Monster representation");
    expect(pref.choices).toEqual(["Pictures", "Letters"]);
    const ui = game.newUi(b);
    expect(pref.get(ui)).toBe(0);
    pref.set(ui, 1);
    expect(ui.pictures).toBe(false);
  });

  it("draws the row of counts as the board's values are drawn", () => {
    const counted = (ui: FillUi) =>
      draw(b, ui).filter(
        (op) => op.op === "text" && "GVZ".includes(op.text) && op.text !== "",
      );
    const pictured = draw(b);
    // Each record's piece: every monster at least once, in the row.
    expect(new Set(monstersIn(pictured))).toEqual(new Set([1, 2, 3]));
    const ui = game.newUi(b);
    ui.pictures = false;
    expect(new Set(counted(ui).map((op) => (op.op === "text" ? op.text : "")))).toEqual(
      new Set(["G", "V", "Z"]),
    );
  });

  it("labels each value's key by its name, and types it by its place", () => {
    expect(game.requestKeys?.(p, b).map((k) => k.label)).toEqual([
      "Ghost",
      "Vampire",
      "Zombie",
      "Clear",
    ]);
    // The alphabet is not the first letters, so a digit types its letter.
    expect(press("1")).toMatchObject({ type: "set", n: 1 });
    expect(press("3")).toMatchObject({ type: "set", n: 3 });
    expect(press("4")).toBeNull();
  });
});

describe("a row of counts read in the player's style", () => {
  /** The counts' texts beneath the board, under `ui`. */
  const countsOf = (s: Board, ui: FillUi = game.newUi(s)) =>
    draw(s, ui).filter(
      (op): op is Extract<DrawOp, { op: "text" }> =>
        op.op === "text" && /^[\d−]+(\/\d+)?$/.test(op.text),
    );
  const { total } = b.dealt;

  it("offers the styles by the description's name, left over total first", () => {
    const pref = game.prefs?.find((q) => q.kw === "count-style");
    if (pref?.type !== "choices") throw new Error("no count style preference");
    expect(pref.name).toBe("Count display");
    expect(pref.choices).toEqual(["Total", "Remaining", "Placed/Total", "Left/Total"]);
    expect(pref.get(game.newUi(b))).toBe(3);
  });

  it("reads each count in the chosen style", () => {
    const placed = total.item.map((v) => b.values.filter((x) => x === v).length);
    const read = (style: number) => {
      const ui = game.newUi(b);
      ui.countStyle = style;
      return countsOf(b, ui).map((op) => op.text);
    };
    const minus = (n: number) => (n < 0 ? `−${-n}` : String(n));
    expect(read(0)).toEqual(total.many.map(String));
    expect(read(1)).toEqual(total.many.map((n, i) => minus(placed[i] - n)));
    expect(read(2)).toEqual(total.many.map((n, i) => `${placed[i]}/${n}`));
    expect(read(3)).toEqual(total.many.map((n, i) => `${minus(n - placed[i])}/${n}`));
  });

  it("grays a count whose value is all placed, and no other", () => {
    const k = total.item.indexOf(2);
    const opens = [...b.values.keys()].filter((c) => b.fixed[c] === 0);
    const short = total.many[k] - b.values.filter((x) => x === 2).length;
    // Vampires placed on open squares until the board holds as many as its
    // count, and one fewer.
    const placing = (n: number): Board =>
      game.executeMove(b, { set: opens.slice(0, n).flatMap((c) => [c, 2]) } as never);
    expect(short).toBeGreaterThan(0);
    const ink = countsOf(placing(short - 1))[k].color;
    const all = countsOf(placing(short))[k].color;
    expect(all).not.toBe(ink);
    expect(all).not.toBe(COL_ERROR);
  });

  it("lies within the board's width and its right margin", () => {
    const right = Math.max(
      ...countsOf(b).map((op) => op.x + op.text.length * 0.6 * (op.size ?? TS)),
    );
    expect(right).toBeLessThanOrEqual(game.computeSize(p, TS).w);
  });
});

describe("a board where a placed value rules out none other", () => {
  it("offers no preference to remove what a placement rules out", () => {
    expect(game.prefs?.some((q) => q.kw === "auto-pencil")).toBe(true);
    expect(
      fillGame("sighting", sighting).prefs?.some((q) => q.kw === "auto-pencil"),
    ).toBe(false);
  });
});
