/**
 * **A gesture does not survive the board changing under it** — swept through
 * the real registry, so a game is covered the day it is registered.
 *
 * Two rules of the midend's, each for every game with nothing declared. A
 * board change from outside the player's input (Undo, Redo, a hint, Solve)
 * ends the pointer gesture in flight, whatever a game holds it in. And any
 * state replacement, a key's move included, ends every `GridDrag` a `Ui`
 * carries: the midend finds one by its type, so a game with a drag joins by
 * having one.
 *
 * Why it matters concretely: a release after an Undo made a move in thirty
 * games, some of them moves no play of that board could reach, and Inertia's
 * threw. Each had its drag in fields the engine could not see.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { Midend } from "./midend.ts";
import {
  GridDrag,
  LEFT_BUTTON,
  LEFT_RELEASE,
  PENCIL_MODE_BUTTON,
  startDrag,
} from "./pointer.ts";
import { builtGames, REGISTERED_GAMES } from "./testing/enrollment.ts";
import { changedUnder, probeBoard, probePoints } from "./testing/input-probe.ts";
import { itOverWholeSweep } from "./testing/slow.ts";
import type { Point } from "./types.ts";

beforeAll(registerAllGames);

/** Every `GridDrag` on a `Ui`, one level deep — the same reach the engine has. */
function dragsOf(ui: unknown): GridDrag[] {
  if (typeof ui !== "object" || ui === null) return [];
  return Object.values(ui).filter((v): v is GridDrag => v instanceof GridDrag);
}

/** The games whose `newUi` actually returns a `GridDrag`. Derived, not listed:
 * nothing here reads a name or a declaration. */
function dragGames() {
  return builtGames().filter((g) => dragsOf(g.ui).length > 0);
}

/**
 * Leave the board one Redo short of a state replacement that keeps its `Ui`:
 * Solve's step, taken back. A restart will not do, since on a board nothing
 * has been played on it replaces nothing.
 */
function stageReplacement(m: { solve(): string | null; undo(): void }, id: string) {
  expect(m.solve(), `${id}: Solve is how this sweep replaces the state`).toBeNull();
  m.undo();
}

/**
 * Games whose drag no bare press at a probe point arms, each with the gesture
 * it takes. The release case below says nothing about them, so the set is
 * asserted exact: a game whose drag stops arming fails here. Empty, and meant
 * to stay so.
 */
const NOT_ARMED_BY_A_PRESS: Record<string, string> = {};

describe("a gesture does not survive the board changing under it", () => {
  // The engine ends the gesture (`Midend.stateReplaced`), whatever a game
  // holds it in: a `GridDrag`, fields of its own, or a declared sweep. No
  // game is asked for anything, so the population is every game. A preview
  // needs no knowledge of where a game paints one: the `Ui` is compared with
  // one that never met the gesture, and a preview is a difference between them.
  //
  // One case per game, so a run scoped to one game walks only that game's
  // board (`testing/game-scope.ts`).
  const moved: string[] = [];
  for (const [id, game] of REGISTERED_GAMES) {
    it(`${id}: held and dragged, with both buttons, under an Undo and a Redo`, () => {
      const r = changedUnder(game, id);
      const said = `of ${r.gestures} gestures the board changed under`;
      expect(r.carriedOn, said).toEqual([]);
      expect(r.painted, said).toEqual([]);
      expect(r.left, said).toEqual([]);
      expect(r.dragged, "no drag had the board changed under it").toBeGreaterThan(0);
      if (r.moved > 0) moved.push(id);
    });
  }

  // A press that already made its move is a gesture too, and most click
  // games act on the press: a handful would mean a broken probe.
  itOverWholeSweep(
    "changed the board under a press that had moved, in most games",
    () => {
      expect(moved.length).toBeGreaterThanOrEqual(20);
    },
  );

  it("a move made by a key with the pointer down is typed where the press pointed", () => {
    // The one board change that does not end the gesture: a press selects a
    // cell, and a digit typed with that finger still down goes into it. The
    // same key after the release is the control, so the two must leave the
    // same board and the same `Ui`.
    let exercised = 0;
    for (const { id, game } of builtGames()) {
      const b = probeBoard(game, id);
      const keys = b.m
        .requestKeys()
        .map((k) => k.button)
        .filter((k) => k !== PENCIL_MODE_BUTTON);
      if (keys.length === 0) continue;
      const typedAfter = (p: Point, key: number, held: boolean) => {
        b.reset();
        const claimed = b.m.processInput(p.x, p.y, LEFT_BUTTON);
        if (!held) b.m.processInput(p.x, p.y, LEFT_RELEASE);
        const before = b.moves();
        b.m.processInput(0, 0, key);
        const moved = b.moves() > before;
        const open = held && b.m.cancelPress();
        if (held) b.m.processInput(p.x, p.y, LEFT_RELEASE);
        return { claimed, moved, open, where: b.where() };
      };
      // The first point at which a key typed after a click makes a move.
      const at = probePoints(b.size).find((p) => typedAfter(p, keys[0], false).moved);
      if (at === undefined) continue;
      const control = typedAfter(at, keys[0], false);
      const held = typedAfter(at, keys[0], true);
      // A game that selects on the release (Group, whose press arms a drag)
      // has nothing selected for the key yet.
      if (!held.moved) continue;
      exercised++;
      expect(held.open, `${id}: the press outlived the key's move`).toBe(false);
      expect(held.where, `${id}: typed under the press and typed after it`).toBe(
        control.where,
      );
    }
    expect(exercised).toBeGreaterThanOrEqual(8);
  });
});

describe("a drag does not survive a state replacement", () => {
  it("finds a non-trivial population, derived from what the games carry", () => {
    // The vacuity guard. An empty sweep would make every assertion below pass
    // over nothing and report health — the shape this repo has hit repeatedly.
    // Six games carry one today; the floor is deliberately lower than that so
    // the guard fails on a broken probe rather than on a game being converted.
    expect(builtGames().length).toBeGreaterThanOrEqual(57);
    expect(dragGames().length).toBeGreaterThanOrEqual(4);
  });

  it("ends every drag on the Ui when the midend replaces the state", () => {
    const checked: string[] = [];
    for (const { id, game } of dragGames()) {
      const { m, ui } = probeBoard(game, id);
      stageReplacement(m, id);

      // Arm every drag the game carries, by hand: this asks about the engine's
      // cancel, not about any game's gesture vocabulary, so it must not depend
      // on knowing how a given game starts one.
      const drags = dragsOf(ui());
      expect(drags.length, `${id} kept its drag through the deal`).toBeGreaterThan(0);
      for (const d of drags) startDrag(d, 1, 1);

      m.redo();

      for (const d of drags) {
        expect(d.live, `${id}: a drag survived the board being replaced`).toBe(false);
      }
      checked.push(id);
    }
    // Say what was actually covered, so a shrinking population is visible in
    // the failure rather than silently reducing the sweep to nothing.
    expect(checked.length).toBe(dragGames().length);
  });

  it("a release after the cancel commits nothing", () => {
    // The assertion that matters, and the one an earlier version of this file
    // missed. Ending `drag.live` only protects a game that *asks* `drag.live`:
    // Tents gated its drag branch on `dragButton >= 0`, Tracks on `painting`
    // and Bridges on `dragged`, and all three would have committed a move from
    // an anchor the undo invalidated — the same defect `changedState` was added
    // to Pegs for. So this drives a real press, replaces the state under it,
    // and releases.
    let exercised = 0;
    const unarmed: string[] = [];
    for (const { id, game } of dragGames()) {
      const { m, ui, moves, reset } = probeBoard(game, id);
      const size = m.preferredSize();

      // Find a press that actually arms this game's drag. Derived by trying —
      // a table of "where each game's drag starts" would be a manifest.
      let armed: Point | null = null;
      for (const p of probePoints(size)) {
        reset();
        stageReplacement(m, id);
        m.processInput(p.x, p.y, LEFT_BUTTON);
        if (dragsOf(ui()).some((d) => d.live)) {
          armed = p;
          break;
        }
      }
      if (!armed) {
        unarmed.push(id);
        continue;
      }
      exercised++;

      // Replace the state under the live drag, then release where the drag is.
      m.redo();
      const before = moves();
      m.processInput(armed.x, armed.y, LEFT_RELEASE);
      expect(
        moves(),
        `${id}: a release after the board changed still committed a move`,
      ).toBe(before);
    }
    // A game no press armed was asserted nothing about, so it is named.
    expect(unarmed.sort()).toEqual(Object.keys(NOT_ARMED_BY_A_PRESS).sort());
    expect(exercised).toBeGreaterThan(0);
  });

  it("a game with no Ui at all is not a crash", () => {
    // `newUi` is optional and two games genuinely have nothing to remember, so
    // the sweep has to treat "no object" as "nothing to cancel".
    const empty = builtGames().filter((g) => Object.keys(g.ui).length === 0);
    expect(empty.length).toBeGreaterThan(0);
    for (const { game } of empty) {
      const m = new Midend(game);
      expect(() => {
        m.newGame();
        m.restartGame();
        m.undo();
      }).not.toThrow();
    }
  });
});
