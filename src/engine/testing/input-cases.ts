/**
 * A cases file's `input` section (`game-cases.ts`): events sent to a game
 * as a player sends them, and what each leaves. A key is named as a player
 * presses it (`right`, `ctrl+right`, `pad 7`, `1`); a pointer event is
 * aimed at a cell through the game's target geometry, or at the board's
 * margin, off the grid.
 *
 * Dev/test-only; never imported by production code.
 */

import { readBoard } from "../contract/desc-error.ts";
import { UI_UPDATE } from "../contract/game.ts";
import type { Point } from "../contract/types.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  CURSOR_UP,
  DELETE,
  ESCAPE,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  MOD_CTRL,
  MOD_NUM_KEYPAD,
  MOD_SHFT,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
} from "../input/pointer.ts";
import type { AnyGame } from "./enrollment.ts";

const NAMED_KEYS: Readonly<Record<string, number>> = {
  up: CURSOR_UP,
  down: CURSOR_DOWN,
  left: CURSOR_LEFT,
  right: CURSOR_RIGHT,
  select: CURSOR_SELECT,
  select2: CURSOR_SELECT2,
  delete: DELETE,
  escape: ESCAPE,
};

const MODIFIERS: Readonly<Record<string, number>> = {
  ctrl: MOD_CTRL,
  shift: MOD_SHFT,
};

/** The button a key's name is, or `null` for no key: modifiers before it
 * joined by `+`, then a named key, `pad` and a digit for the number pad's,
 * or one character. */
export function keyButton(name: string): number | null {
  const parts = name.split("+");
  const base = parts.pop() ?? "";
  let mods = 0;
  for (const m of parts) {
    const bit = MODIFIERS[m];
    if (bit === undefined) return null;
    mods |= bit;
  }
  const pad = /^pad ([0-9])$/.exec(base);
  if (pad) return mods | MOD_NUM_KEYPAD | (0x30 + Number(pad[1]));
  if (base in NAMED_KEYS) return mods | NAMED_KEYS[base];
  if (base.length === 1) return mods | base.charCodeAt(0);
  return null;
}

/** A pointer event's kinds, and its buttons by which button it is. */
export const POINTER = {
  press: { left: [LEFT_BUTTON], right: [RIGHT_BUTTON] },
  drag: { left: [LEFT_DRAG], right: [RIGHT_DRAG] },
  release: { left: [LEFT_RELEASE], right: [RIGHT_RELEASE] },
  click: { left: [LEFT_BUTTON, LEFT_RELEASE], right: [RIGHT_BUTTON, RIGHT_RELEASE] },
} as const;

export type InputEvent =
  | { readonly key: string; readonly button: number }
  | {
      readonly pointer: keyof typeof POINTER;
      readonly right: boolean;
      /** A cell, `[x, y]`, or the margin off the grid. */
      readonly at: readonly [number, number] | "margin";
    };

/** An event, or none, and what holds once it is sent. */
export interface InputStep {
  readonly line: number;
  readonly event: InputEvent | null;
  /** The board's values. */
  readonly values?: readonly number[];
  /** The cell the cursor is on, `null` for none. */
  readonly cursor?: readonly [number, number] | null;
  /** What the game made of the event: a `move`, an update of what the
   * player sees (`ui`), or `none`. */
  readonly returns?: "move" | "ui" | "none";
  /** Preferences by keyword, as the Preferences dialog keys them. */
  readonly preferences?: Readonly<Record<string, string | boolean | number>>;
}

export interface InputCase {
  readonly line: number;
  readonly id: string;
  readonly moves: readonly unknown[];
  /** The cell the cursor starts on, shown, as a key would leave it. */
  readonly cursor: readonly [number, number] | null;
  readonly events: readonly InputStep[];
}

interface CellTarget {
  x: number;
  y: number;
}

/** What of an input case the game does not do. The board is the desc's
 * reading, answers or none: what an event does is the controls', and the
 * smallest board that shows it seldom has one answer. */
export function checkInput(game: AnyGame, c: InputCase): string[] {
  const [params, desc] = [
    c.id.slice(0, c.id.indexOf(":")),
    c.id.slice(c.id.indexOf(":") + 1),
  ];
  const loaded = readBoard(game, game.decodeParams(params), desc);
  if (!loaded.ok) return [`reads as no board: ${loaded.error}`];
  let state = loaded.value;
  for (const m of c.moves) state = game.executeMove(state, m);
  const ui = game.newUi(state);
  const ds = game.newDrawState(state, game.preferredTileSize);
  const geometry = game.targetVerbs?.geometry;
  if (c.cursor !== null) {
    if (geometry === undefined)
      return ["has no cursor geometry to start the cursor on"];
    geometry.parkCursor(ui, { x: c.cursor[0], y: c.cursor[1] });
    const cursor = (ui as { cursor?: { visible?: boolean } }).cursor;
    if (cursor?.visible === undefined) return ["has no cursor to show"];
    cursor.visible = true;
  }
  const out: string[] = [];
  const pointAt = (at: readonly [number, number] | "margin"): Point => {
    if (at === "margin") return { x: 0, y: 0 };
    if (geometry === undefined) throw new Error(`${game.id}: no target geometry`);
    return geometry.pointAt(state, ds, { x: at[0], y: at[1] }, ui);
  };
  for (const step of c.events) {
    const where = `line ${step.line}`;
    const e = step.event;
    let returned: "move" | "ui" | "none" | null = null;
    if (e !== null) {
      const sends: [Point, number][] =
        "key" in e
          ? [[{ x: -1, y: -1 }, e.button]]
          : POINTER[e.pointer][e.right ? "right" : "left"].map((b) => [
              pointAt(e.at),
              b,
            ]);
      for (const [p, button] of sends) {
        const m = game.interpretMove(state, ui, ds, p, button);
        if (m === null) returned = returned ?? "none";
        else if (m === UI_UPDATE) returned = returned === "move" ? "move" : "ui";
        else {
          returned = "move";
          state = game.executeMove(state, m);
        }
      }
    }
    const was = (what: string, got: unknown, want: unknown) => {
      if (JSON.stringify(got) !== JSON.stringify(want))
        out.push(
          `${where}: ${what} ${JSON.stringify(got)}, not ${JSON.stringify(want)}`,
        );
    };
    if (step.returns !== undefined) was("returns", returned, step.returns);
    if (step.values !== undefined)
      was(
        "values",
        Array.from((state as { values: ArrayLike<number> }).values),
        step.values,
      );
    if (step.cursor !== undefined) {
      const t = geometry?.cursorTarget(state, ui) as CellTarget | null | undefined;
      was("cursor", t === null || t === undefined ? null : [t.x, t.y], step.cursor);
    }
    for (const [kw, want] of Object.entries(step.preferences ?? {})) {
      const pref = game.prefs?.find((p) => p.kw === kw);
      if (pref === undefined) out.push(`${where}: no preference ${kw}`);
      else was(`preference ${kw}`, pref.get(ui), want);
    }
  }
  return out;
}
