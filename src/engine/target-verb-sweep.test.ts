/**
 * The sweep (`target-verb.ts`): a drag on from a press repeats the press on
 * every further target that held what the pressed one held, and the midend
 * undoes the whole drag in one step.
 *
 * The model's rules first, on a board of marks. Then every game declaring
 * `targetVerbs.sweep`, played through the midend: a drag between two targets
 * that hold the same thing leaves both holding the press's result, and one
 * Undo takes the board back to where the press found it. A game that declares
 * a sweep and never hands a drag to it fails there.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { UI_UPDATE } from "./game.ts";
import {
  LEFT_BUTTON,
  LEFT_DRAG,
  newCursor,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
} from "./pointer.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import {
  controlsMarkdown,
  interpretTargetVerbs,
  squareGrid,
  sweepContinues,
  sweepOpen,
  sweepPending,
  type TargetVerbs,
  type TargetVerbUi,
} from "./target-verb.ts";
import type { AnyGame } from "./testing/input-probe.ts";
import { expectDragRepeatsThePress } from "./testing/sweep-probe.ts";
import type { Point } from "./types.ts";

beforeAll(registerAllGames);

describe("the sweep, in the model", () => {
  // A row of six squares: `.` empty, `x` filled, `o` dotted, `#` a clue no
  // verb touches. The board is played, since a drag reads what each square
  // holds as it reaches it.
  type S = { w: number; h: number; row: string };
  type M = { mark: string; at: Point };
  type V = TargetVerbs<S, TargetVerbUi, typeof ds, Point, M>;
  const ds = { tileSize: 10 };
  const put = (mark: string) => (s: S, t: Point) =>
    s.row[t.x] === "#" ? null : { mark, at: t };
  const holds = (s: S, t: Point) => s.row[t.x];
  const verbs: V = {
    geometry: squareGrid({ size: (s) => s, border: () => 0 }),
    primary: { does: "fill it", apply: put("x") },
    secondary: { does: "dot it", apply: put("o") },
    sweep: { holds },
  };
  const mid = (x: number) => ({ x: x * 10 + 5, y: 5 });

  /** A board, and a pointer event on it at `p` that plays the move it makes
   * and answers the square marked, or `null`. */
  const play = (v: V = verbs) => {
    let state: S = { w: 6, h: 1, row: "..x.#." };
    const ui = { cursor: newCursor() };
    const send = (button: number, p: Point): number | null => {
      const made = interpretTargetVerbs(v, state, ui, ds, p, button);
      if (made === null || made === UI_UPDATE) return null;
      const row = [...state.row];
      row[made.at.x] = made.mark;
      state = { ...state, row: row.join("") };
      return made.at.x;
    };
    return { ui, send, row: () => state.row };
  };

  it("a drag repeats the press on each target that held what the first held", () => {
    const b = play();
    expect(b.send(LEFT_BUTTON, mid(0))).toBe(0);
    expect(sweepContinues(b.ui)).toBe(false);
    expect(b.send(LEFT_DRAG, mid(1))).toBe(1);
    expect(sweepContinues(b.ui)).toBe(true);
    // A filled square is passed over, and the drag carries on beyond it.
    expect(b.send(LEFT_DRAG, mid(2))).toBeNull();
    expect(b.send(LEFT_DRAG, mid(3))).toBe(3);
    expect(b.row()).toBe("xxxx#.");
    // The cursor follows the drag, hidden, so the keyboard carries on there.
    expect(b.ui.cursor).toEqual({ x: 3, y: 0, visible: false });
  });

  it("a drag back over what it marked does nothing more to it", () => {
    const b = play();
    b.send(LEFT_BUTTON, mid(1));
    expect(b.send(LEFT_DRAG, mid(0))).toBe(0);
    expect(b.send(LEFT_DRAG, mid(1))).toBeNull();
    expect(b.send(LEFT_DRAG, mid(0))).toBeNull();
  });

  it("one fast pointer event takes every target it passed over, one a call", () => {
    const b = play();
    b.send(LEFT_BUTTON, mid(0));
    expect(b.send(LEFT_DRAG, mid(5))).toBe(1);
    expect(sweepPending(b.ui)).toBe(true);
    expect(b.send(LEFT_DRAG, mid(5))).toBe(3);
    expect(b.send(LEFT_DRAG, mid(5))).toBe(5);
    expect(sweepPending(b.ui)).toBe(false);
  });

  it("the release ends the drag, and a press that marks nothing opens none", () => {
    const b = play();
    b.send(RIGHT_BUTTON, mid(0));
    expect(sweepOpen(b.ui)).toBe(true);
    expect(b.send(RIGHT_DRAG, mid(1))).toBe(1);
    expect(b.send(RIGHT_RELEASE, mid(1))).toBeNull();
    expect(sweepOpen(b.ui)).toBe(false);
    expect(b.send(RIGHT_DRAG, mid(3))).toBeNull();

    expect(b.send(LEFT_BUTTON, mid(4))).toBeNull();
    expect(sweepOpen(b.ui)).toBe(false);
  });

  it("takes only the buttons, and the targets, the declaration allows", () => {
    const b = play({
      ...verbs,
      sweep: {
        holds,
        buttons: ["primary"],
        reaches: (_s, first, next) => Math.abs(next.x - first.x) <= 1,
      },
    });
    b.send(RIGHT_BUTTON, mid(5));
    expect(sweepOpen(b.ui)).toBe(false);
    b.send(LEFT_BUTTON, mid(0));
    expect(b.send(LEFT_DRAG, mid(1))).toBe(1);
    expect(b.send(LEFT_DRAG, mid(3))).toBeNull();
  });

  it("with a reach, takes a target only where the pointer passes near its point", () => {
    const b = play({ ...verbs, sweep: { holds, within: () => 2 } });
    b.send(LEFT_BUTTON, mid(0));
    // Along the bottom of the row, three pixels under each square's middle.
    expect(b.send(LEFT_DRAG, { x: 15, y: 8 })).toBeNull();
    expect(b.send(LEFT_DRAG, { x: 35, y: 8 })).toBeNull();
    expect(b.send(LEFT_DRAG, mid(3))).toBe(3);
    expect(b.row()).toBe("x.xx#.");
  });

  it("a drag off the left edge marks what it passed, as one off the right does", () => {
    const b = play();
    b.send(LEFT_BUTTON, mid(5));
    const off = { x: -100, y: 5 };
    expect(b.send(LEFT_DRAG, off)).toBe(3);
    expect(b.send(LEFT_DRAG, off)).toBe(1);
    expect(b.send(LEFT_DRAG, off)).toBe(0);
    expect(b.send(LEFT_DRAG, off)).toBeNull();
    expect(b.row()).toBe("xxxx#x");
  });

  it("the Controls paragraph says the drag", () => {
    expect(controlsMarkdown(verbs)).toContain(
      "Keep the button down and drag to do the same to every square you pass " +
        "over that looked the same as the first.",
    );
    const said: V = { ...verbs, sweep: { holds, says: "Drag along a wall." } };
    expect(controlsMarkdown(said)).toContain("to dot it. Drag along a wall.\n\n");
    expect(controlsMarkdown({ ...verbs, sweep: undefined })).not.toContain("drag");
  });
});

describe("a game's declared sweep is what a drag does", () => {
  const sweeping = () =>
    registeredGameIds().filter((id) => getTsGame(id)?.targetVerbs?.sweep !== undefined);

  it("is not vacuous: games declare a sweep", () => {
    expect(sweeping().length).toBeGreaterThanOrEqual(2);
  });

  it.each(sweeping())("%s", (id) => {
    const game = getTsGame(id) as unknown as AnyGame;
    if (!game.targetVerbs) throw new Error(`${id} declares no verbs`);
    expectDragRepeatsThePress(game, id, game.targetVerbs);
  });
});
