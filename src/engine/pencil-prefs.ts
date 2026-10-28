/**
 * The `GamePref` declarations every pencil-mark game shares, so the wording a
 * player reads has **one** source: a preference whose label is copied is a
 * preference whose label drifts.
 *
 * Each is its own factory rather than one options-bag helper, so each carries
 * the precise `Ui` constraint for the field it drives — a game that offers
 * keep-highlight without a `pencilKeepHighlight` field fails to compile rather
 * than silently reading `undefined`. Separate items also drop into any position
 * in a game's `prefs` array (Crossing lists sticky-pencil fourth, after three
 * of its own).
 *
 * `auto-pencil`'s label is deliberately **not** shared: it names what the
 * placement clears ("its row and column" in Keen and Unequal, and Towers
 * places a *tower* rather than a number), so the sentence is a per-game fact
 * and is passed in. Sharing only the keyword and plumbing is the honest amount
 * to share.
 *
 * A game whose regions depend on its mode names the **relation** instead of
 * listing them — Solo's row/column/block gain a diagonal under X and a cage
 * under Killer, so any list is a second statement of its `regionsOf` that no
 * one board makes true.
 */

import { type CandidateReading, DEFAULT_CANDIDATE_READING } from "./candidate-hint.ts";
import type { GamePref } from "./game.ts";

/**
 * Upstream's `auto-pencil`: placing a value clears it from the pencil marks it
 * can no longer be in. `name` is the game's own sentence, because the regions
 * it names differ per game.
 */
export function autoPencilPref<Ui extends { autoPencil: boolean }>(
  name: string,
): GamePref<Ui> {
  return {
    kw: "auto-pencil",
    name,
    type: "boolean",
    get: (ui) => ui.autoPencil,
    set: (ui, v) => {
      ui.autoPencil = v;
    },
  };
}

/** The readings in the order the preference lists them. */
const READINGS: readonly CandidateReading[] = ["implicit", "populate"];

/**
 * How a hint pencils: only the notes a deduction needs, or every candidate
 * first (`candidate-hint.ts`'s {@link CandidateReading}). The one label every
 * candidate game shows, since the choice is about the hint and not the game.
 */
export function candidateReadingPref<
  Ui extends { candidateReading: CandidateReading },
>(): GamePref<Ui> {
  return {
    kw: "hint-notes",
    name: "Hints pencil in",
    type: "choices",
    choices: ["Only as needed", "Every candidate first"],
    get: (ui) => READINGS.indexOf(ui.candidateReading),
    set: (ui, v) => {
      ui.candidateReading = READINGS[v] ?? DEFAULT_CANDIDATE_READING;
    },
  };
}

const STICKY_PENCIL_KW = "sticky-pencil-mode";
const STICKY_PENCIL_NAME =
  "Right-click toggles a sticky pencil mode (stays on until right-clicked again)";

/** Right-click latches pencil mode instead of applying to one cell. */
export function stickyPencilPref<Ui extends { pencilSticky: boolean }>(): GamePref<Ui> {
  return {
    kw: STICKY_PENCIL_KW,
    name: STICKY_PENCIL_NAME,
    type: "boolean",
    get: (ui) => ui.pencilSticky,
    set: (ui, v) => {
      ui.pencilSticky = v;
    },
  };
}

/** Whether `game` offers the sticky pencil preference. */
export function offersStickyPencil(game: {
  readonly prefs?: readonly { readonly kw: string }[];
}): boolean {
  return game.prefs?.some((p) => p.kw === STICKY_PENCIL_KW) ?? false;
}

/** Where the help page of a game offering the preference writes
 * {@link STICKY_PENCIL_HELP}. */
export const STICKY_PENCIL_PLACEHOLDER = "{{sticky-pencil}}";

/**
 * What a help page says of the preference, in the one place it is said: a
 * page that words it for itself can call the mode something "a preference
 * switches on" while its game starts with it on.
 *
 * It says the preference is on to begin with, which is each game's `newUi`
 * and not a fact of this file; `pencil-prefs.test.ts` holds every game
 * offering the preference to it.
 */
export const STICKY_PENCIL_HELP =
  "Pencil mode is *sticky*: once a right-click switches it on, it stays on " +
  "wherever you click, until you right-click again. The **Marks** key is lit " +
  "while it is on, and pressing the key also switches it. To have it last only until " +
  `your next click, turn off **${STICKY_PENCIL_NAME}** in the preferences.`;

/** Keep the mouse highlight on the cell after a pencil mark changes. */
export function pencilKeepHighlightPref<
  Ui extends { pencilKeepHighlight: boolean },
>(): GamePref<Ui> {
  return {
    kw: "pencil-keep-highlight",
    name: "Keep mouse highlight after changing a pencil mark",
    type: "boolean",
    get: (ui) => ui.pencilKeepHighlight,
    set: (ui, v) => {
      ui.pencilKeepHighlight = v;
    },
  };
}
