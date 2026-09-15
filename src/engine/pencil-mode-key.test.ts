/**
 * **One way into pencil mode, in every game that has one.**
 *
 * The eleven cell games reach note-taking through a right-click or a held
 * finger, which Loopy cannot copy: its right button and its held finger already
 * rule an edge out. Rather than give Loopy a key of its own — the shape the owner
 * rejected, since a player should not learn a second notation UX per game — every
 * game with a `ui.pencilMode` offers the same {@link pencilModeKey} on its keypad,
 * sending the one {@link PENCIL_MODE_BUTTON} code that the app's bare `P` shortcut
 * also sends.
 *
 * **The population is derived from the `Ui` each game's `newUi` returns**, not
 * from a roster: a game acquires the key's obligation the moment it acquires the
 * mode (`AGENTS.md` § "Convention over configuration"; `testing/enrollment.ts`).
 * Both directions are asserted, because either alone leaves a hole — a game with
 * the mode and no key is unreachable by touch, and a game offering the key
 * without the mode has a control that does nothing.
 *
 * What this does NOT assert is that the press *shows*: that a panel key changes
 * the frame or the save is `input-parity.test.ts` § "no on-screen key is inert",
 * which sweeps every key of every keypad and would catch a toggle that no
 * renderer reads.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { UI_UPDATE } from "./game.ts";
import { pencilModeKey } from "./key-labels.ts";
import { PENCIL_MODE_BUTTON } from "./pointer.ts";
import { type AnyGame, builtGames, enrolledIn } from "./testing/enrollment.ts";
import { preferredDrawState } from "./testing/preferred-draw-state.ts";

beforeAll(registerAllGames);

/** A game takes notes iff its own `Ui` carries the collection's mode flag. */
const noteTaking = enrolledIn((g) => typeof g.ui["pencilMode"] === "boolean");

/** Every game whose keypad offers the Marks key, whatever its `Ui` says. */
function offersTheKey(): string[] {
  return builtGames()
    .filter((g) => keysOf(g.game).some((k) => k.button === PENCIL_MODE_BUTTON))
    .map((g) => g.id);
}

function keysOf(game: AnyGame) {
  return game.requestKeys?.(game.defaultParams()) ?? [];
}

describe("every game with a pencil mode offers the Marks key", () => {
  it("found the note-taking games at all", () => {
    // Vacuity, both halves: a filter that matched nothing, or a registry that
    // built nothing, would make every case below pass over an empty set.
    expect(noteTaking.population).toBeGreaterThanOrEqual(50);
    expect(noteTaking.ids.length).toBeGreaterThanOrEqual(12);
  });

  for (const { id, game, state } of builtGames()) {
    if (!noteTaking.ids.includes(id)) continue;

    it(`${id}: offers it once, last, and toggles the mode from it`, () => {
      const keys = keysOf(game);
      expect(
        keys.filter((k) => k.button === PENCIL_MODE_BUTTON),
        `${id} must offer exactly one Marks key`,
      ).toEqual([pencilModeKey]);
      // Last, so the mode sits after the symbols in every game rather than
      // wherever each game happened to put it.
      expect(keys.at(-1)).toEqual(pencilModeKey);

      // A fresh Ui, not the shared one `builtGames` memoizes: the mode is
      // mutated here, and the other cross-game guards read that same object.
      const ui = game.newUi(state) as { pencilMode: boolean };
      const ds = preferredDrawState(game, state);
      const press = () =>
        game.interpretMove(state, ui, ds, { x: 0, y: 0 }, PENCIL_MODE_BUTTON);
      expect(press(), `${id} must consume the Marks key`).toBe(UI_UPDATE);
      expect(ui.pencilMode).toBe(true);
      expect(press()).toBe(UI_UPDATE);
      expect(ui.pencilMode).toBe(false);
    });
  }

  it("offers it nowhere else", () => {
    // The other direction: a keypad key that toggles a mode the game does not
    // have is a control that does nothing when pressed.
    expect(offersTheKey()).toEqual(noteTaking.ids);
  });
});
