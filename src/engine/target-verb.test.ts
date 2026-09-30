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
  newCursor,
  PENCIL_MODE_BUTTON,
  RIGHT_BUTTON,
} from "./pointer.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import {
  controlsMarkdown,
  interpretTargetVerbs,
  type KeyOnlyVerb,
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

/** Presses a cycle route is followed for: longer than any verb's cycle, so a
 * result the cycle passes through is met before the presses run out. */
const CYCLE_PRESSES = 6;

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
      keyOnly: [
        {
          does: "flip the square",
          keys: [{ codes: [0x66], name: "F" }],
          apply: at("flip"),
          pointer: { kind: "repeat", button: "primary", times: 2 } as const,
        },
      ],
    };
    const ui = { cursor: newCursor(1, 0, true) };
    expect(interpretTargetVerbs(more, state, ui, ds, { x: 0, y: 0 }, 0x66)).toEqual({
      verb: "flip",
      at: { x: 1, y: 0 },
    });
    expect(controlsMarkdown(more)).toMatch(
      /what a right-click does\. Press F to flip the square, or click it twice\.$/,
    );
  });

  it("the paragraph says each kind of pointer route", () => {
    const say = (pointer: KeyOnlyVerb<S, TargetVerbUi, Point, M>["pointer"]) =>
      controlsMarkdown({
        ...verbs,
        keyOnly: [
          {
            does: "clear it",
            keys: [{ codes: [0x7f], name: "Delete" }],
            apply: at("clear"),
            pointer,
          },
        ],
      });
    expect(say({ kind: "cycle", button: "secondary" })).toMatch(
      /Press Delete to clear it; right-clicking it round gets there too\.$/,
    );
    expect(say({ kind: "notes", button: "primary", where: "its middle" })).toMatch(
      /Press Delete to clear it, or, in notes mode, click its middle\.$/,
    );
    expect(say({ kind: "repeat", button: "secondary", times: 3 })).toMatch(
      /Press Delete to clear it, or right-click it 3 times\.$/,
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
    // Keys are pressed where the cursor rests on a target, which is all the
    // paragraph speaks for; a rest on none is an arm's (Subsets' tally band).
    const onTarget = (s: unknown, ui: unknown) =>
      verbs.geometry.cursorTarget(s, ui) !== null;
    const fresh = boardsReached(game, id, () => {}, onTarget);
    const primed = boardsReached(game, id, primeWithAClick(), onTarget);
    for (const r of [fresh, primed]) {
      expect(r.cursorPositions, "the cursor walk ran out of budget").toBeLessThan(
        CURSOR_CAP,
      );
      expect(r.keyPositions, "the cursor rests on no target").toBeGreaterThan(1);
    }

    const left = fresh.click(LEFT_BUTTON);
    expect(left.size, "a left-click reaches no board").toBeGreaterThan(0);
    expect(fresh.key(CURSOR_SELECT), "Enter against a left-click").toEqual(left);
    const space = verbs.secondary ? fresh.click(RIGHT_BUTTON) : left;
    expect(fresh.key(CURSOR_SELECT2), "Space against its button").toEqual(space);

    const slots = [
      [verbs.primary, LEFT_BUTTON],
      [verbs.secondary, RIGHT_BUTTON],
    ] as const;
    for (const [verb, button] of slots) {
      if (!verb) continue;
      // Only a verb with keys has anything to compare, and the comparison is
      // vacuous over no boards.
      if (!verb.keys?.length) continue;
      const clicks = primed.click(button);
      expect(clicks.size, `${verb.does}: no board`).toBeGreaterThan(0);
      for (const k of verb.keys)
        for (const code of k.codes)
          expect(primed.key(code), `${k.name} against its button`).toEqual(clicks);
    }
    // A key-only verb has no button of its own, so its declared pointer route
    // is what it must agree with, and the paragraph says both. Boards are
    // compared as the player sees them: a half turn and two quarter turns leave
    // one picture, whatever the state records about the last turn.
    if (!verbs.keyOnly?.length) return;
    const sighted = boardsReached(game, id, primeWithAClick(), onTarget, {
      bySight: true,
    });
    for (const verb of verbs.keyOnly) {
      const byKey = new Set<string>();
      for (const k of verb.keys)
        for (const code of k.codes)
          for (const board of sighted.key(code)) byKey.add(board);
      expect(byKey.size, `${verb.does}: its keys reach no board`).toBeGreaterThan(0);
      const route = verb.pointer;
      const button = route.button === "primary" ? LEFT_BUTTON : RIGHT_BUTTON;
      if (route.kind === "repeat") {
        const byPointer = sighted.presses(Array(route.times).fill(button));
        expect(byKey, `${verb.does}: against ${route.times} presses`).toEqual(
          byPointer,
        );
        continue;
      }
      const byPointer =
        route.kind === "cycle"
          ? sighted.presses(Array(CYCLE_PRESSES).fill(button), { every: true })
          : sighted.presses([button], { before: [PENCIL_MODE_BUTTON] });
      const unreached = [...byKey].filter((board) => !byPointer.has(board));
      expect(
        unreached.length,
        `${verb.does}: ${unreached.length} of ${byKey.size} boards its keys reach ` +
          `are not on its ${route.kind} route`,
      ).toBe(0);
    }
  });
});
