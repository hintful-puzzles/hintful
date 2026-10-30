/**
 * The target-verb model (`target-verb.ts`): its own rules, and — across every
 * game declaring `Game.targetVerbs` — the declaration held to the behavior.
 *
 * The cross-game half is what makes the generated Controls paragraph true. The
 * paragraph says Enter does what a click does to the square under the cursor,
 * Space what a right-click does, and each verb's own keys what its button does;
 * so for every declaring game, at every cursor position the arrows reach, the
 * board a key leaves must be the board its button leaves pressed at that
 * target's `pointAt`. Paired by target, and not compared as two sets of
 * boards, because a key acting on the square beside the cursor leaves a board
 * a click on that neighbor leaves too. A game whose `interpretMove` forgot to
 * hand a button to the model, or handled a key in an arm of its own that
 * disagrees with the verb, fails here.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { type HintStep, type HintTrackVerdict, UI_UPDATE } from "./game.ts";
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
import { randomNew } from "./random/index.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import {
  controlsMarkdown,
  interpretTargetVerbs,
  isRulingOut,
  type KeyOnlyVerb,
  rulingOut,
  squareGrid,
  type TargetVerbs,
  type TargetVerbUi,
  verbClicks,
} from "./target-verb.ts";
import {
  type AnyGame,
  type BoardsReached,
  boardsReached,
  CURSOR_CAP,
  type ProbeBoard,
  probeBoard,
  targetPoints,
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

  it("a ruling-out verb goes on the right button and nowhere else", () => {
    const dot = rulingOut(verbs.primary);
    const ruling: TargetVerbs<S, TargetVerbUi, typeof ds, Point, M> = {
      ...verbs,
      secondary: dot,
    };
    const reversed: TargetVerbs<S, TargetVerbUi, typeof ds, Point, M> = {
      ...verbs,
      // @ts-expect-error The left button places; a ruling-out verb is the right's.
      primary: dot,
    };
    expect([isRulingOut(ruling.secondary), isRulingOut(verbs.secondary)]).toEqual([
      true,
      false,
    ]);
    expect(reversed.primary).toBe(dot);
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
      "Click a square to fill it. Right-click it " +
        "to dot it.\n\nWith the keyboard, the arrow keys move a cursor around the " +
        "board. Enter does what a click does to the square under it, and Space (or D) " +
        "what a right-click does.",
    );
  });
});

describe("verbClicks: a hint step's clicks, found by its keep-track", () => {
  // A board of marks, a move that sets some, and a step that wants a set of
  // them, as a click game's hint would: keep-track keeps a move whose marks
  // are all wanted, shrinks the step by them, and completes it when none are
  // left.
  type S = { w: number; h: number; marks: Record<string, string> };
  type M = { set: [string, string][] };
  type U = { cursor: ReturnType<typeof newCursor>; tally: number };
  const ds = { tileSize: 10 };
  const key = (t: Point) => `${t.x},${t.y}`;
  const setTo = (mark: string) => (_s: S, t: Point, ui: U) => {
    ui.tally++;
    return { set: [[key(t), mark]] as [string, string][] };
  };
  const verbs: TargetVerbs<S, U, typeof ds, Point, M> = {
    geometry: squareGrid({ size: (s) => s, border: () => 5 }),
    primary: { does: "fill it", apply: setTo("fill") },
    secondary: { does: "dot it", apply: setTo("dot") },
  };
  const rules = {
    executeMove: (s: S, m: M): S => ({
      ...s,
      marks: { ...s.marks, ...Object.fromEntries(m.set) },
    }),
    hintKeepTrack: (m: M, step: HintStep<M>): HintTrackVerdict => {
      const wanted = new Map(step.move.set);
      if (!m.set.every(([k, v]) => wanted.get(k) === v)) return "off";
      step.move.set = step.move.set.filter(([k]) => !m.set.some(([j]) => j === k));
      return step.move.set.length === 0 ? "completed" : "onTrack";
    },
  };
  const state: S = { w: 3, h: 2, marks: {} };
  const stepOf = (set: [string, string][]): HintStep<M> => ({
    move: { set },
    rung: "test",
    explanation: "",
  });

  it("clicks each target with the button whose verb the step keeps", () => {
    const step = stepOf([
      ["0,0", "dot"],
      ["2,1", "fill"],
    ]);
    const ui = { cursor: newCursor(), tally: 0 };
    const gesture = verbClicks(verbs, rules, state, ui, ds, step, [
      { x: 0, y: 0 },
      { x: 2, y: 1 },
    ]);
    expect(gesture).toEqual([
      { kind: "click", button: "secondary", at: { x: 10, y: 10 } },
      { kind: "click", button: "primary", at: { x: 30, y: 20 } },
    ]);
    // Neither the step the midend will judge nor the player's Ui was touched.
    expect(step.move.set).toHaveLength(2);
    expect(ui.tally).toBe(0);
  });

  it("stops at the click that completes the step", () => {
    const step = stepOf([["1,0", "fill"]]);
    const ui = { cursor: newCursor(), tally: 0 };
    const gesture = verbClicks(verbs, rules, state, ui, ds, step, [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);
    expect(gesture).toHaveLength(1);
  });

  it("takes the button that makes the step over one only on the way to it", () => {
    // A press cycle's keep-track: a mark on a wanted square that is not yet
    // the wanted one is on the way, and changes nothing about the step.
    const cycling = {
      ...rules,
      hintKeepTrack: (m: M, step: HintStep<M>): HintTrackVerdict => {
        const wanted = new Map(step.move.set);
        if (m.set.every(([k, v]) => wanted.has(k) && wanted.get(k) !== v))
          return "onTrack";
        return rules.hintKeepTrack(m, step);
      },
    };
    const step = stepOf([
      ["0,0", "dot"],
      ["1,0", "dot"],
    ]);
    const ui = { cursor: newCursor(), tally: 0 };
    const gesture = verbClicks(verbs, cycling, state, ui, ds, step, [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]);
    expect(gesture.map((c) => c.kind === "click" && c.button)).toEqual([
      "secondary",
      "secondary",
    ]);
  });

  it("throws on a target no button's verb keeps on the step", () => {
    const step = stepOf([["1,0", "cross"]]);
    const ui = { cursor: newCursor(), tally: 0 };
    expect(() =>
      verbClicks(verbs, rules, state, ui, ds, step, [{ x: 1, y: 0 }]),
    ).toThrow(/no button's verb keeps the step/);
  });
});

describe("a geometry's pointAt is a point that addresses its target", () => {
  // A hint's gesture aims at `pointAt` (`verbGesture`), so a point that pressed
  // a neighbor would play a step on the wrong square. Every target a press can
  // reach, found by sweeping the board, must come back from its own point.
  it.each(
    registeredGameIds().filter((id) => getTsGame(id)?.targetVerbs),
  )("%s: every target's point presses that target", (id) => {
    const game = getTsGame(id) as unknown as AnyGame;
    const geometry = game.targetVerbs?.geometry;
    if (!geometry) throw new Error(`${id} declares no verbs`);
    const params = game.defaultParams();
    const state = game.newState(params, game.newDesc(params, randomNew(id)).desc);
    const ui = game.newUi(state);
    // The midend's own fallback for a game that names no tile size.
    const tileSize = game.preferredTileSize ?? 32;
    const ds = game.newDrawState(state, tileSize);
    const size = game.computeSize(params, tileSize);
    // A target is a plain record, or an object of the game's own that the
    // geometry hands out by identity (Loopy's edges).
    const keyOf = (t: unknown): unknown => {
      try {
        return JSON.stringify(t);
      } catch {
        return t;
      }
    };
    const targets = new Map<unknown, { t: unknown; from: Point }>();
    const step = Math.max(1, Math.floor(tileSize / 8));
    for (let x = 0; x < size.w; x += step)
      for (let y = 0; y < size.h; y += step) {
        const t = geometry.pointerTarget(state, ds, { x, y }, ui);
        if (t !== null && !targets.has(keyOf(t)))
          targets.set(keyOf(t), { t, from: { x, y } });
      }
    expect(targets.size, "a press reaches no target").toBeGreaterThan(1);
    for (const [k, { t, from }] of targets) {
      const at = geometry.pointAt(state, ds, t, ui);
      const back = geometry.pointerTarget(state, ds, at, ui);
      expect(
        back !== null && keyOf(back) === k,
        `the target pressed at (${from.x}, ${from.y}) has pointAt (${at.x}, ${at.y}), which presses another`,
      ).toBe(true);
    }
  });
});

describe("a game's declared verbs are what its buttons and keys do", () => {
  const declaring = () =>
    registeredGameIds().filter((id) => getTsGame(id)?.targetVerbs !== undefined);

  it("is not vacuous — games declare verbs", () => {
    expect(declaring().length).toBeGreaterThanOrEqual(4);
  });

  const click = (b: ProbeBoard, p: Point) => {
    b.m.processInput(p.x, p.y, LEFT_BUTTON);
    b.m.processInput(p.x, p.y, LEFT_RELEASE);
  };

  /** A left-click at the first point where one commits a move, so an emptying
   * verb has something to empty. The point is found once and replayed. */
  const primeWithAClick = () => {
    let found: Point | null = null;
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

  /**
   * The two clicks that arm a move, for a game where no one click commits
   * one: Target's move is a number, an operator and a second number, so a
   * click there only selects, and a key compared with it at a fresh board
   * would agree with a dead one. The first pair of targets after whose clicks
   * a third commits; none where one click commits, or no three do.
   */
  const armingClicks = (game: AnyGame, id: string): Point[] => {
    const b = probeBoard(game, id);
    b.reset();
    const points = targetPoints(game, b);
    const commits = (run: readonly Point[]) => {
      b.reset();
      const before = b.board();
      for (const p of run) click(b, p);
      return b.board() !== before;
    };
    if (points.some((p) => commits([p]))) return [];
    for (const p of points)
      for (const q of points) if (points.some((r) => commits([p, q, r]))) return [p, q];
    return [];
  };

  it.each(
    registeredGameIds().filter((id) => getTsGame(id)?.targetVerbs),
  )("%s: each key does at the cursor what its button does there", (id) => {
    const game = getTsGame(id) as unknown as AnyGame;
    const verbs = game.targetVerbs;
    if (!verbs) throw new Error(`${id} declares no verbs`);
    const { geometry } = verbs;
    // Keys are pressed where a shown cursor rests on a target, which is all the
    // paragraph speaks for: a hidden cursor's first key only shows it, and a
    // rest on none is an arm's (Subsets' tally band).
    const pairAt = (s: unknown, ui: unknown, ds: unknown) => {
      if (!(ui as TargetVerbUi).cursor.visible) return null;
      const t = geometry.cursorTarget(s, ui);
      return t === null ? null : geometry.pointAt(s, ds, t, ui);
    };
    const fresh = boardsReached(game, id, () => {}, pairAt);
    const primed = boardsReached(game, id, primeWithAClick(), pairAt);
    const arming = armingClicks(game, id);
    const armed =
      arming.length > 0
        ? boardsReached(
            game,
            id,
            (b) => {
              for (const p of arming) click(b, p);
            },
            pairAt,
          )
        : null;

    /** Each position where the key's board is not among the press's, named by
     * the point the press was made at. A key that changed no board anywhere
     * agrees with a dead button, so it is refused first, on the boards it was
     * pressed on together. */
    const disagree = (
      runs: readonly {
        r: BoardsReached;
        byKey: readonly unknown[];
        byPress: readonly (readonly unknown[])[];
      }[],
    ) => {
      expect(
        runs.some(({ r, byKey }) =>
          r.positions.some(({ board }, i) => !r.same(byKey[i], board)),
        ),
        "the key changes no board anywhere",
      ).toBe(true);
      return runs.flatMap(({ r, byKey, byPress }) =>
        r.positions
          .filter((_, i) => !byPress[i].some((board) => r.same(byKey[i], board)))
          .map(({ at }) => `(${at.x}, ${at.y})`),
      );
    };
    /** A key against a button, on a fresh board and, where one click commits
     * no move, on the board the arming clicks leave. */
    const against = (code: number, button: number) =>
      [fresh, ...(armed ? [armed] : [])].map((r) => ({
        r,
        byKey: r.key(code),
        byPress: r.pressed([button]),
      }));
    for (const r of [fresh, primed, ...(armed ? [armed] : [])]) {
      expect(r.cursorPositions, "the cursor walk ran out of budget").toBeLessThan(
        CURSOR_CAP,
      );
      expect(r.positions.length, "the cursor rests on no target").toBeGreaterThan(1);
    }

    expect(
      disagree(against(CURSOR_SELECT, LEFT_BUTTON)),
      "Enter against a left-click at its target",
    ).toEqual([]);
    expect(
      disagree(against(CURSOR_SELECT2, verbs.secondary ? RIGHT_BUTTON : LEFT_BUTTON)),
      "Space against its button at its target",
    ).toEqual([]);

    const slots = [
      [verbs.primary, LEFT_BUTTON],
      [verbs.secondary, RIGHT_BUTTON],
    ] as const;
    for (const [verb, button] of slots) {
      if (!verb?.keys?.length) continue;
      const presses = primed.pressed([button]);
      for (const k of verb.keys)
        for (const code of k.codes)
          expect(
            disagree([{ r: primed, byKey: primed.key(code), byPress: presses }]),
            `${k.name} (code ${code}) against its button at its target`,
          ).toEqual([]);
    }
    // A key-only verb has no button of its own, so its declared pointer route
    // is what it must agree with, and the paragraph says both. Boards are
    // compared as the player sees them: a half turn and two quarter turns leave
    // one picture, whatever the state records about the last turn.
    if (!verbs.keyOnly?.length) return;
    const sighted = boardsReached(game, id, primeWithAClick(), pairAt, {
      bySight: true,
    });
    for (const verb of verbs.keyOnly) {
      const route = verb.pointer;
      const button = route.button === "primary" ? LEFT_BUTTON : RIGHT_BUTTON;
      const byPointer =
        route.kind === "repeat"
          ? sighted.pressed(Array(route.times).fill(button))
          : route.kind === "cycle"
            ? sighted.pressed(Array(CYCLE_PRESSES).fill(button), { every: true })
            : sighted.pressed([button], { before: [PENCIL_MODE_BUTTON] });
      // Each code on its own: a dead key, or a dead case of a letter, would
      // hide beside a live one.
      for (const k of verb.keys)
        for (const code of k.codes)
          expect(
            disagree([{ r: sighted, byKey: sighted.key(code), byPress: byPointer }]),
            `${verb.does}: ${k.name} (code ${code}) against its ${route.kind} route at its target`,
          ).toEqual([]);
    }
  });
});

describe("the marks a placement rules out are the right button's", () => {
  /**
   * `Game.rulesOut` makes, for the player, the marks a placement rules out:
   * the marks the right button makes by hand. A game declaring it without a
   * ruling-out right button has its crosses on the wrong button, or no
   * button for them at all.
   */
  it("every game that brings them declares its right button as ruling out", () => {
    const bringing = registeredGameIds().filter(
      (id) => getTsGame(id)?.rulesOut !== undefined,
    );
    expect(bringing.length, "no game brings the marks it rules out").toBeGreaterThan(0);
    expect(
      bringing.filter((id) => !isRulingOut(getTsGame(id)?.targetVerbs?.secondary)),
    ).toEqual([]);
  });
});
