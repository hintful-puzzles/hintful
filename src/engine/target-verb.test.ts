/**
 * The target-verb model (`target-verb.ts`): its own rules, and — across every
 * game declaring `Game.targetVerbs` — the declaration held to the behavior.
 *
 * The cross-game half is what makes the generated Controls paragraph true. The
 * paragraph says Enter does what a click does and Space what a right-click does,
 * and each verb's own keys what its button does; so for every declaring game,
 * the boards a key reaches at every cursor position must be exactly the boards
 * its button reaches at every point on the board. A game whose `interpretMove`
 * forgot to hand a button to the model, or handled a key in an arm of its own
 * that disagrees with the verb, fails here.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { UI_UPDATE } from "./game.ts";
import {
  CURSOR_RIGHT,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  LEFT_BUTTON,
  LEFT_RELEASE,
  MIDDLE_BUTTON,
  newCursor,
  RIGHT_BUTTON,
} from "./pointer.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import {
  controlsMarkdown,
  interpretTargetVerbs,
  squareGrid,
  type TargetVerbs,
  type TargetVerbUi,
} from "./target-verb.ts";
import {
  type AnyGame,
  boardsReached,
  CURSOR_CAP,
  type ProbeBoard,
} from "./testing/input-probe.ts";
import type { Point } from "./types.ts";

beforeAll(registerAllGames);

describe("the model", () => {
  type S = { w: number; h: number; clue: Point };
  type M = { verb: string; at: Point };
  const state: S = { w: 3, h: 2, clue: { x: 2, y: 1 } };
  const ds = { tileSize: 10 };
  const at = (verb: string) => (s: S, t: Point) =>
    t.x === s.clue.x && t.y === s.clue.y ? null : { verb, at: t };
  const verbs: TargetVerbs<S, TargetVerbUi, typeof ds, Point, M> = {
    geometry: squareGrid({ size: (s) => s, border: () => 5 }),
    primary: { does: "fill it", apply: at("fill") },
    secondary: {
      does: "dot it",
      keys: [{ codes: [0x64], name: "D" }],
      apply: at("dot"),
    },
  };
  const run = (ui: TargetVerbUi, button: number, p: Point = { x: 0, y: 0 }) =>
    interpretTargetVerbs(verbs, state, ui, ds, p, button);

  it("a press applies its verb and parks the hidden cursor on the target", () => {
    const ui = { cursor: newCursor(0, 0, true) };
    expect(run(ui, RIGHT_BUTTON, { x: 16, y: 16 })).toEqual({
      verb: "dot",
      at: { x: 1, y: 1 },
    });
    expect(ui.cursor).toEqual({ x: 1, y: 1, visible: false });
  });

  it("a press that applies nothing repaints only to hide a shown cursor", () => {
    expect(run({ cursor: newCursor(0, 0, true) }, LEFT_BUTTON, { x: 26, y: 16 })).toBe(
      UI_UPDATE,
    );
    expect(run({ cursor: newCursor() }, LEFT_BUTTON, { x: 26, y: 16 })).toBeNull();
  });

  it("a press off the grid, or a button with no verb, is not the model's", () => {
    const ui = { cursor: newCursor(0, 0, true) };
    expect(run(ui, LEFT_BUTTON, { x: 2, y: 2 })).toBeNull();
    expect(run(ui, MIDDLE_BUTTON, { x: 16, y: 16 })).toBeNull();
    expect(run(ui, LEFT_RELEASE, { x: 16, y: 16 })).toBeNull();
    expect(ui.cursor.visible).toBe(true);
  });

  it("the first select only shows a hidden cursor; the next applies", () => {
    const ui = { cursor: newCursor(1, 0) };
    expect(run(ui, CURSOR_SELECT)).toBe(UI_UPDATE);
    expect(ui.cursor.visible).toBe(true);
    expect(run(ui, CURSOR_SELECT)).toEqual({ verb: "fill", at: { x: 1, y: 0 } });
    expect(run(ui, CURSOR_SELECT2)).toEqual({ verb: "dot", at: { x: 1, y: 0 } });
    expect(run(ui, 0x64)).toEqual({ verb: "dot", at: { x: 1, y: 0 } });
  });

  it("an arrow reveals and moves in one press", () => {
    const ui = { cursor: newCursor() };
    expect(run(ui, CURSOR_RIGHT)).toBe(UI_UPDATE);
    expect(ui.cursor).toEqual({ x: 1, y: 0, visible: true });
  });

  it("a game with no second verb takes Space as a second Enter", () => {
    const one = { ...verbs, secondary: undefined };
    const ui = { cursor: newCursor(0, 0, true) };
    expect(
      interpretTargetVerbs(one, state, ui, ds, { x: 0, y: 0 }, CURSOR_SELECT2),
    ).toEqual({ verb: "fill", at: { x: 0, y: 0 } });
    expect(controlsMarkdown(one)).toContain("Enter or Space does what a click does");
  });

  it("a key-only verb applies at the cursor, and the paragraph says so", () => {
    const more = {
      ...verbs,
      middle: {
        does: "star it",
        keys: [{ codes: [0x73], name: "S" }],
        apply: at("star"),
      },
      keyOnly: [
        {
          does: "flip the square",
          keys: [{ codes: [0x66], name: "F" }],
          apply: at("flip"),
        },
      ],
    };
    const ui = { cursor: newCursor(1, 0, true) };
    expect(interpretTargetVerbs(more, state, ui, ds, { x: 0, y: 0 }, 0x66)).toEqual({
      verb: "flip",
      at: { x: 1, y: 0 },
    });
    expect(controlsMarkdown(more)).toContain(
      "Middle-click it (or Shift-click it) to star it.",
    );
    expect(controlsMarkdown(more)).toContain(
      "S does what a middle-click does. Press F to flip the square.",
    );
  });

  it("the Controls paragraph names each verb's button and key", () => {
    expect(controlsMarkdown(verbs)).toBe(
      "Click a square to fill it. Right-click it (on a touch screen, a long press) " +
        "to dot it.\n\nWith the keyboard, the arrow keys move a cursor around the " +
        "grid. Enter does what a click does to the square under it, and Space (or D) " +
        "what a right-click does.",
    );
  });
});

describe("a game's declared verbs are what its buttons and keys do", () => {
  const declaring = () =>
    registeredGameIds().filter((id) => getTsGame(id)?.targetVerbs !== undefined);

  it("is not vacuous — games declare verbs", () => {
    expect(declaring().length).toBeGreaterThanOrEqual(4);
  });

  /** A left-click at the first point where one commits a move, so an emptying
   * verb has something to empty. The point is found once and replayed. */
  const primeWithAClick = () => {
    let found: Point | null = null;
    const click = (b: ProbeBoard, p: Point) => {
      b.m.processInput(p.x, p.y, LEFT_BUTTON);
      b.m.processInput(p.x, p.y, LEFT_RELEASE);
    };
    return (b: ProbeBoard) => {
      if (found) return click(b, found);
      const step = Math.max(2, Math.floor(b.tileSize / 4));
      for (let x = 1; x < b.size.w; x += step)
        for (let y = 1; y < b.size.h; y += step) {
          const before = b.board();
          click(b, { x, y });
          if (b.board() !== before) {
            found = { x, y };
            return;
          }
        }
    };
  };

  it.each(
    registeredGameIds().filter((id) => getTsGame(id)?.targetVerbs),
  )("%s", (id) => {
    const game = getTsGame(id) as unknown as AnyGame;
    const verbs = game.targetVerbs;
    if (!verbs) throw new Error(`${id} declares no verbs`);
    const fresh = boardsReached(game, id);
    const primed = boardsReached(game, id, primeWithAClick());
    for (const r of [fresh, primed])
      expect(r.cursorPositions, "the cursor walk ran out of budget").toBeLessThan(
        CURSOR_CAP,
      );

    const left = fresh.click(LEFT_BUTTON);
    expect(left.size, "a left-click reaches no board").toBeGreaterThan(0);
    expect(fresh.key(CURSOR_SELECT), "Enter against a left-click").toEqual(left);
    const space = verbs.secondary ? fresh.click(RIGHT_BUTTON) : left;
    expect(fresh.key(CURSOR_SELECT2), "Space against its button").toEqual(space);

    const slots = [
      [verbs.primary, LEFT_BUTTON],
      [verbs.secondary, RIGHT_BUTTON],
      [verbs.middle, MIDDLE_BUTTON],
    ] as const;
    for (const [verb, button] of slots) {
      if (!verb) continue;
      const clicks = primed.click(button);
      expect(clicks.size, `${verb.does}: no board`).toBeGreaterThan(0);
      for (const k of verb.keys ?? [])
        for (const code of k.codes)
          expect(primed.key(code), `${k.name} against its button`).toEqual(clicks);
    }
    // A key-only verb has no button to agree with; the paragraph still says
    // the key does something, so it must.
    for (const verb of verbs.keyOnly ?? [])
      for (const k of verb.keys)
        for (const code of k.codes)
          expect(primed.key(code).size, `${k.name}: no board`).toBeGreaterThan(0);
  });
});
