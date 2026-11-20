/**
 * **One keyboard cursor, spelled one way, across the whole collection** —
 * the guard behind the `engine-input` requirement "One keyboard-cursor vocabulary
 * across games".
 *
 * While each game spells the cursor its own way, nothing above the games can
 * ask where the cursor is. This file stops the spellings drifting apart again
 * one game at a time.
 *
 * ON THE INSTRUMENT. Two of the three checks are **derived**, and say so:
 *
 *  - The canonical shape is read out of `newCursor()` itself, not written down
 *    here. Add a field to `GridCursor` and this file tracks it the same day.
 *  - Every game's *actual* `newUi()` object is walked, so the population is the
 *    registry rather than a list somebody has to remember to extend — and a
 *    cursor hidden under a differently-named field is caught **structurally**,
 *    by its shape, with no name matching at all.
 *
 * The third check reads the syntax tree for a member declared under a retired
 * spelling, and that one is a list; it is here because it names the failure in
 * the terms a session
 * would reintroduce it in (`hshow`, `cshow`, `curVisible`, …). The structural
 * check above is the one that holds when somebody invents a new spelling.
 *
 * The shadowing half of the contract — a game re-declaring a `pointer.ts`
 * helper such as `moveCursor` — is guarded in `emittable-keys.test.ts`, derived
 * from that module's export list.
 */

import ts from "typescript";
import { describe, expect, it } from "vitest";
import type { Game } from "../engine/game.ts";
import { CURSOR_RIGHT, newCursor } from "../engine/pointer.ts";
import { randomNew } from "../engine/random/index.ts";
import {
  REGISTERED_GAME_COUNT,
  REGISTERED_GAMES,
} from "../engine/testing/enrollment.ts";
import { preferredDrawState } from "../engine/testing/preferred-draw-state.ts";
import {
  nodesOf,
  parsed,
  resolveSpecifier,
  shown,
  where,
} from "../engine/testing/syntax.ts";

type AnyGame = Game<unknown, unknown, unknown, unknown, unknown>;

/** The cursor's field names, read off the engine's own constructor. */
const CURSOR_KEYS = Object.keys(newCursor()).sort();

/** The canonical `Ui` field the whole collection holds its cursor under. */
const CURSOR_FIELD = "cursor";

/** True iff `v` has exactly the shape `newCursor()` produces. */
function isCursorShaped(v: unknown): boolean {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  const keys = Object.keys(v).sort();
  return (
    keys.length === CURSOR_KEYS.length && keys.every((k, i) => k === CURSOR_KEYS[i])
  );
}

/** A fresh `Ui` per game, built through the game's own `newUi`. */
function uis(): { id: string; game: AnyGame; ui: Record<string, unknown> }[] {
  const out: { id: string; game: AnyGame; ui: Record<string, unknown> }[] = [];
  for (const [id, game] of REGISTERED_GAMES) {
    const params = game.defaultParams();
    // The board is irrelevant — only the `Ui` `newUi` builds from it is — but
    // the seed is fixed so a failure names the same board every run.
    const desc = game.newDesc(params, randomNew(`cursor-vocab-${id}`)).desc;
    out.push({
      id,
      game,
      ui: game.newUi(game.newState(params, desc)) as Record<string, unknown>,
    });
  }
  return out;
}

describe("one keyboard-cursor vocabulary", () => {
  it("reads a plausible cursor shape from the engine", () => {
    // Vacuity: if `newCursor()` ever returns `{}` every check below passes over
    // nothing and reports health.
    expect(CURSOR_KEYS).toEqual(["visible", "x", "y"]);
  });

  it("holds every cursor under one field, named the same everywhere", () => {
    const all = uis();
    // Vacuity: how many things did we look at?
    expect(all.length).toBe(REGISTERED_GAME_COUNT);
    expect(all.length).toBeGreaterThanOrEqual(50);

    const misplaced: string[] = [];
    let withCursor = 0;
    for (const { id, ui } of all) {
      for (const [field, value] of Object.entries(ui)) {
        if (!isCursorShaped(value)) continue;
        if (field === CURSOR_FIELD) withCursor++;
        else misplaced.push(`${id}: Ui.${field} is a cursor but is not \`cursor\``);
      }
    }
    expect(misplaced).toEqual([]);
    // Vacuity again, from the other side: a structural check that finds no
    // cursors at all would pass silently.
    expect(withCursor).toBeGreaterThanOrEqual(45);
  });

  it("reveals and moves on one arrow press, in every game with a cursor", () => {
    // The player-visible half of the contract: a game that spends the first
    // press on the reveal keeps its own suite green. Nothing below any
    // individual game can see it, because the question is only interesting
    // across the collection.
    const stalled: string[] = [];
    let checked = 0;
    for (const { id, game, ui } of uis()) {
      const cursor = ui[CURSOR_FIELD];
      if (!isCursorShaped(cursor)) continue;
      const c = cursor as { x: number; y: number; visible: boolean };
      const params = game.defaultParams();
      const desc = game.newDesc(params, randomNew(`cursor-vocab-${id}`)).desc;
      const state = game.newState(params, desc);
      const ds = preferredDrawState(game, state);

      const before = { ...c };
      expect(before.visible, `${id} starts with a hidden cursor`).toBe(false);
      game.interpretMove(state, ui, ds, { x: 0, y: 0 }, CURSOR_RIGHT);
      checked++;
      const moved = c.x !== before.x || c.y !== before.y;
      if (!moved) {
        stalled.push(
          `${id}: one arrow press revealed the cursor without moving it ` +
            `(${before.x},${before.y}) → (${c.x},${c.y})`,
        );
      }
    }
    expect(stalled).toEqual([]);
    // Vacuity: a loop that skipped every game would report health.
    expect(checked).toBeGreaterThanOrEqual(45);
  });

  it("finds no game re-declaring a retired cursor spelling", () => {
    const RETIRED = [
      "hshow",
      "cshow",
      "curVisible",
      "cursorVisible",
      "cursorShow",
      "cursorActive",
      "displayCur",
      "displaySel",
    ];
    const sources = import.meta.glob<string>("../games/**/*.ts", {
      query: "?raw",
      import: "default",
      eager: true,
    });
    // Vacuity: an unmatched glob yields `{}` and every assertion below passes.
    expect(Object.keys(sources).length).toBeGreaterThan(300);

    // A member declared under a retired name: a field of a type, a class or
    // an object literal, whatever its type and however it is modified.
    const retired = new Set(RETIRED);
    const offenders: string[] = [];
    for (const [key, src] of Object.entries(sources)) {
      const sf = parsed(resolveSpecifier("src/guards/x.ts", key), src);
      for (const n of nodesOf(sf))
        if (
          (ts.isPropertySignature(n) ||
            ts.isPropertyDeclaration(n) ||
            ts.isPropertyAssignment(n) ||
            ts.isShorthandPropertyAssignment(n)) &&
          (ts.isIdentifier(n.name) || ts.isStringLiteral(n.name)) &&
          retired.has(n.name.text)
        )
          offenders.push(`${where(n)}  ${shown(n)}`);
    }
    expect(offenders).toEqual([]);
  });
});
