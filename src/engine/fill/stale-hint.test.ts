/**
 * A displayed hint step on a board of notes never names a note already gone,
 * on the `flanking` fixture.
 *
 * A hint plan is made once with the auto-pencil preference as it stands. With
 * it off the plan teaches strikes of its own; turned on, a placement strikes
 * the placed number from its row and column itself, so a later kept strike
 * names notes already gone. The engine's `hint.refreshStep` is what prevents
 * it. This drives a real `Midend` by keyboard, as the app does, following
 * the displayed hint to solved while the preference flips, and asks after
 * every display that the strike shown names only notes the board holds.
 */

import { describe, expect, it } from "vitest";
import * as flanking from "../../generated/engine/testing/fixtures/flanking/flanking.compiled.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  CURSOR_UP,
} from "../input/pointer.ts";
import { Midend } from "../midend/midend.ts";
import { randomNew } from "../random/index.ts";
import { deepBudget } from "../testing/slow.ts";
import type { FillBoard } from "./board.ts";
import { fillGame } from "./game.ts";
import type { FillMove } from "./notes.ts";
import type { FillUi } from "./play.ts";

const game = fillGame("flanking", flanking);
type Board = FillBoard<flanking.Dealt>;
type Me = Midend<unknown, Board, FillMove, FillUi, unknown>;

/** The live midend's Ui and board, which a test reads to drive the cursor
 * exactly and to ask which notes the board holds. */
interface MidendInternals {
  ui: FillUi;
  history: Board[];
  pos: number;
}
function peek(me: Me): { ui: FillUi; state: Board } {
  const internals = me as unknown as MidendInternals;
  return { ui: internals.ui, state: internals.history[internals.pos] };
}

/** The keyboard cursor at `(x, y)`, pressed into the corner first so where
 * it lands does not hang on where it was. */
function navTo(me: Me, x: number, y: number): void {
  const w = peek(me).state.w;
  for (let i = 0; i <= w; i++) me.processInput(0, 0, CURSOR_LEFT);
  for (let i = 0; i <= w; i++) me.processInput(0, 0, CURSOR_UP);
  for (let i = 0; i < x; i++) me.processInput(0, 0, CURSOR_RIGHT);
  for (let i = 0; i < y; i++) me.processInput(0, 0, CURSOR_DOWN);
}
function setPencilMode(me: Me, want: boolean): void {
  if ((peek(me).ui as { pencilMode?: boolean }).pencilMode !== want)
    me.processInput(0, 0, CURSOR_SELECT);
}
function key(me: Me, x: number, y: number, n: number, pencil: boolean): void {
  navTo(me, x, y);
  setPencilMode(me, pencil);
  me.processInput(0, 0, 48 + n);
}

const holds = (b: Board, x: number, y: number, n: number): boolean =>
  ((b.pencil?.[y * b.w + x] ?? 0) & (1 << n)) !== 0;

/** The move of the step on display, where it has a type: a note move. */
const shownMove = (me: Me) => {
  const step = me.activeHintStep() as { move: FillMove } | null;
  return step === null || !("type" in step.move) ? null : step.move;
};

function assertStepLive(me: Me, ctx: string): void {
  const m = shownMove(me);
  if (m?.type !== "pencilStrike") return;
  const { state } = peek(me);
  for (const { x, y, n } of m.marks)
    expect(
      holds(state, x, y, n),
      `${ctx}: the strike shown names a note gone (${x},${y})=${n}`,
    ).toBe(true);
}

/** A player who follows the displayed hint to solved, the auto-pencil
 * preference as `autoPencilAt` says at each step; whether it was solved. */
function walkFollowingHints(me: Me, autoPencilAt: (stepNo: number) => boolean): string {
  for (let stepNo = 0; stepNo < 400; stepNo++) {
    if (game.status(peek(me).state) === "solved") return "solved";
    // Under the reading that pencils every candidate in first, the plan
    // strikes the notes a placement would.
    me.setPreferences({ "auto-pencil": autoPencilAt(stepNo), "hint-notes": 1 });
    const refused = me.hint();
    if (refused) return `step ${stepNo}: ${refused}`;
    assertStepLive(me, `step ${stepNo} (just displayed)`);
    const m = shownMove(me);
    if (m === null) return `step ${stepNo}: no note move shown`;
    if (m.type === "pencilAll")
      me.processInput(0, 0, 77); // 'M'
    else if (m.type === "set" && !m.pencil) key(me, m.x, m.y, m.n, false);
    else if (m.type === "pencilStrike" || m.type === "pencilAdd") {
      const strikes = m.type === "pencilStrike";
      for (const mk of [...m.marks])
        if (holds(peek(me).state, mk.x, mk.y, mk.n) === strikes)
          key(me, mk.x, mk.y, mk.n, true);
      if (!me.hint()) assertStepLive(me, `step ${stepNo} (shown again after the move)`);
    } else return `step ${stepNo}: a ${m.type} move`;
    assertStepLive(me, `step ${stepNo} (after the move)`);
  }
  return "unsolved after 400 steps";
}

function midendFromSeed(diff: number, seed: string): Me {
  const me = new Midend(game) as unknown as Me;
  const p = { w: 5, h: 5, diff };
  const { desc } = game.newDesc(p, randomNew(seed));
  expect(me.newGameFromId(`${game.encodeParams(p, true)}:${desc}`)).toBeNull();
  return me;
}

const SCENARIOS: { name: string; toggle: (s: number) => boolean }[] = [
  { name: "on throughout", toggle: () => true },
  { name: "off throughout", toggle: () => false },
  { name: "flipping every move", toggle: (s) => s % 2 === 0 },
  { name: "off, then on from step 3", toggle: (s) => s >= 3 },
  { name: "on, then off from step 3", toggle: (s) => s < 3 },
];

describe("a displayed hint step is never stale as auto-pencil flips", () => {
  for (const sc of SCENARIOS) {
    it(`auto-pencil ${sc.name}, and the board still solved`, () => {
      expect(walkFollowingHints(midendFromSeed(1, "stale"), sc.toggle)).toBe("solved");
    });
  }

  for (const [name, diff] of [
    ["Easy", 0],
    ["Normal", 1],
  ] as const)
    it(`on ${name} boards, flipping every move`, () => {
      // Two boards a tier in CI, eight in the deep tier.
      for (let s = 0; s < deepBudget(2, 8); s++)
        expect(
          walkFollowingHints(midendFromSeed(diff, `stale-${s}`), (n) => n % 2 === 0),
        ).toBe("solved");
    });
});
