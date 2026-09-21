/**
 * Shared builders for a game's on-screen keypad (`Game.requestKeys`).
 *
 * Upstream's `game_request_keys` returns `label = NULL` for keys whose text
 * derives from the button code (the digits and the `'\b'` clear key) and lets
 * the frontend's `button2label` resolve them. Here the label is resolved up
 * front: a digit/letter key carries its own character, and the clear key the
 * literal `"Clear"`, which the `puzzle-keys` icon map renders as the clear icon.
 */

import { PENCIL_MODE_BUTTON } from "./pointer.ts";
import type { KeyLabel } from "./types.ts";

/** ASCII backspace — upstream's clear-key button code (`'\b'`). */
export const CLEAR_BUTTON = 8;

/** The clear key, labeled so `puzzle-keys` maps it to the clear icon. */
export const clearKey: KeyLabel = { button: CLEAR_BUTTON, label: "Clear" };

/** The Marks key, which toggles pencil mode, labeled so `puzzle-keys` maps it to
 * the marks icon. **The engine appends it to every note-taking game's keypad**
 * (`Midend.requestKeys`), which is a touch player's one visible way into the
 * mode; a game does not list it itself. */
export const pencilModeKey: KeyLabel = { button: PENCIL_MODE_BUTTON, label: "Marks" };

/**
 * Does a game take notes? The one definition, read off what a game **is** — a
 * `pencil` array on its board, or the collection's `pencilMode` flag on its
 * `Ui` — so the engine that offers the Marks key and the guard that checks it
 * cannot disagree about who is in the population.
 *
 * Two arms because neither alone is the shape. `pencil` is the spelling every
 * note-taking *board* uses; Loopy and Slant take notes with no such array
 * (their marks are edge and line states) and are known by the flag. Every game
 * either arm catches wants the key, so the union is exact rather than a
 * convenient over-reach.
 *
 * **Deliberately not a game-declared boolean.** A declaration can be forgotten
 * by a new game and left behind by a changed one with nothing noticing, which
 * is exactly what happened while this was keyed on the *name* `pencilMode`:
 * Rome and Map carried notes with no key for their whole lives (AGENTS.md
 * § "A game joins a shared mechanic by *having* it").
 */
export function takesNotes(state: unknown, ui: unknown): boolean {
  const pencil = (state as { pencil?: ArrayLike<number> } | undefined)?.pencil;
  if (pencil && typeof pencil.length === "number") return true;
  return typeof (ui as { pencilMode?: unknown } | undefined)?.pencilMode === "boolean";
}

/**
 * The common digit keypad: buttons `'1'..'9'` then `'a','b',…` once the
 * count exceeds nine, followed by the clear key. Mirrors upstream's
 * `i < 9 ? '1' + i : 'a' + i - 9` used by Filling, Keen, Solo and Towers
 * (Unequal diverges for order ≥ 10 and builds its own).
 */
export function digitKeys(n: number): KeyLabel[] {
  const keys: KeyLabel[] = [];
  for (let i = 0; i < n; i++) {
    const button = i < 9 ? "1".charCodeAt(0) + i : "a".charCodeAt(0) + (i - 9);
    keys.push({ button, label: String.fromCharCode(button) });
  }
  keys.push(clearKey);
  return keys;
}

/**
 * {@link digitKeys} where each key **enters a color**: key `i` carries palette
 * index `firstColor + i`, and the panel paints the key in it.
 *
 * For a game whose element is a color there is no character that names it, so
 * the digit stays as the label — the key the keyboard presses — and the color
 * arrives as the key's face. Map is the case: its four region colors.
 *
 * Built by decorating `digitKeys` rather than beside it, because the button
 * codes are the decimal-digit fact and `decimal.test.ts` allows exactly one
 * statement of it in the tree. The clear key `digitKeys` appends is the entry
 * past `n`, and is left plain.
 */
export function colorKeys(n: number, firstColor: number): KeyLabel[] {
  return digitKeys(n).map((key, i) =>
    i < n ? { ...key, swatch: firstColor + i } : key,
  );
}

/**
 * {@link colorKeys} for a game that numbers ten colors `1..10` and spells the
 * tenth on the **`'0'` key** — the inverse of what `digitOf` answers for `'0'`,
 * which `pointer.ts` already names Guess's meaning of zero.
 *
 * Below ten colors this is `colorKeys` exactly. `digitKeys`'s `'a'` rollover is
 * the collection's other convention (Solo, Keen, Towers) and is what a game
 * that can go past ten values wants; a game capped at ten and reading `'0'`
 * would ship an `'a'` key it refuses, which is the defect Seismic's keypad had.
 */
export function colorKeysZeroIsTen(n: number, firstColor: number): KeyLabel[] {
  const keys = colorKeys(n, firstColor);
  // Keyed on there *being* a tenth color, not on `keys[TENTH]` existing: at
  // nine colors that entry is the clear key `digitKeys` appends.
  if (n <= TENTH) return keys;
  keys[TENTH] = { ...keys[TENTH], button: ZERO_BUTTON, label: "0" };
  return keys;
}

/** The `'0'` key, stated here because a game may not spell a digit's code
 * (`decimal.test.ts`). */
const ZERO_BUTTON = "0".charCodeAt(0);
const TENTH = 9;
