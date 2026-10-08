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
  LEFT_RELEASE,
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
import { type AnyGame, probeBoard } from "./testing/input-probe.ts";
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

  it("a pointer that leaves the canvas marks nothing on its way out", () => {
    const b = play();
    b.send(LEFT_BUTTON, mid(5));
    // The frontend's report of a pointer gone: far off the top left corner.
    expect(b.send(LEFT_DRAG, { x: -100, y: -100 })).toBeNull();
    expect(b.send(LEFT_DRAG, { x: -100, y: 5 })).toBeNull();
    expect(b.row()).toBe("..x.#x");
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

  /** How many pairs of targets a button is tried on before the guard says no
   * drag works. A pair can fail for the puzzle's own reasons (Tracks refuses a
   * third rail into a square), so the claim is that the nearest pairs include
   * one that works, which a game that drops its drags never meets. */
  const PAIRS_TRIED = 40;

  it.each(sweeping())("%s", (id) => {
    const game = getTsGame(id) as unknown as AnyGame;
    const verbs = game.targetVerbs;
    const sweep = verbs?.sweep;
    if (!verbs || !sweep) throw new Error(`${id} declares no sweep`);
    const { geometry } = verbs;
    const b = probeBoard(game, id);
    const opening = b.live();
    const ds = game.newDrawState(opening.state, b.tileSize);

    // Every target a press reaches, with the point a press addresses it from.
    const targets = new Map<string, { t: unknown; at: Point }>();
    const step = Math.max(1, Math.floor(b.tileSize / 8));
    for (let x = 0; x < b.size.w; x += step)
      for (let y = 0; y < b.size.h; y += step) {
        const t = geometry.pointerTarget(opening.state, ds, { x, y }, opening.ui);
        if (t === null) continue;
        const k = JSON.stringify(t);
        if (!targets.has(k))
          targets.set(k, { t, at: geometry.pointAt(opening.state, ds, t, opening.ui) });
      }

    const slots = (sweep.buttons ?? ["primary", "secondary"]).filter((s) => verbs[s]);
    expect(slots.length, "the sweep names no button with a verb").toBeGreaterThan(0);
    for (const slot of slots) {
      const [down, drag, up] =
        slot === "primary"
          ? [LEFT_BUTTON, LEFT_DRAG, LEFT_RELEASE]
          : [RIGHT_BUTTON, RIGHT_DRAG, RIGHT_RELEASE];
      const verb = verbs[slot];
      if (!verb) continue;
      const marks = (t: unknown) => {
        const made = verb.apply(opening.state, t, structuredClone(opening.ui));
        return made !== null && made !== UI_UPDATE;
      };
      // Pairs the drag should take, nearest first.
      const all = [...targets.values()].filter(({ t }) => marks(t));
      const pairs: { a: (typeof all)[number]; b: (typeof all)[number]; d: number }[] =
        [];
      for (const a of all)
        for (const c of all) {
          if (a === c) continue;
          if (sweep.holds(opening.state, a.t) !== sweep.holds(opening.state, c.t))
            continue;
          if (!(sweep.reaches?.(opening.state, a.t, c.t) ?? true)) continue;
          pairs.push({ a, b: c, d: Math.hypot(a.at.x - c.at.x, a.at.y - c.at.y) });
        }
      pairs.sort((p, q) => p.d - q.d);
      expect(pairs.length, `${slot}: no two targets a drag could join`).toBeGreaterThan(
        0,
      );

      let worked = false;
      for (const { a, b: c } of pairs.slice(0, PAIRS_TRIED)) {
        b.reset();
        const before = sweep.holds(b.live().state, a.t);
        b.m.processInput(a.at.x, a.at.y, down);
        const n = Math.max(
          1,
          Math.ceil(Math.hypot(c.at.x - a.at.x, c.at.y - a.at.y) / 4),
        );
        for (let i = 1; i <= n; i++)
          b.m.processInput(
            a.at.x + ((c.at.x - a.at.x) * i) / n,
            a.at.y + ((c.at.y - a.at.y) * i) / n,
            drag,
          );
        b.m.processInput(c.at.x, c.at.y, up);
        const after = b.live().state;
        const painted =
          sweep.holds(after, a.t) !== before &&
          sweep.holds(after, a.t) === sweep.holds(after, c.t);
        if (!painted || b.moves() < 2) continue;
        // The whole drag is one step of Undo, and one of Redo.
        const made = b.moves();
        b.m.undo();
        expect(b.moves(), `${slot}: one Undo left part of the drag`).toBe(0);
        b.m.redo();
        expect(b.moves(), `${slot}: one Redo replayed part of the drag`).toBe(made);
        worked = true;
        break;
      }
      expect(worked, `${slot}: no drag between two like targets marked both`).toBe(
        true,
      );
    }
    b.reset();
  });
});
