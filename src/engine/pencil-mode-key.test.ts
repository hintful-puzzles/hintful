/**
 * **One way into pencil mode, in every game that takes notes.**
 *
 * The cell games reach note-taking through a right-click or a held finger,
 * which Loopy cannot copy: its right button and its held finger already rule an
 * edge out. Rather than give Loopy a key of its own — the shape the owner
 * rejected, since a player should not learn a second notation UX per game —
 * every note-taking game offers the same {@link pencilModeKey}, sending the one
 * {@link PENCIL_MODE_BUTTON} code that the app's bare `P` shortcut also sends.
 *
 * ## What this file checks, and what it stopped checking
 *
 * The key is no longer a per-game obligation: `Midend.requestKeys` appends it
 * for any game {@link takesNotes} recognizes, so "did the game remember to list
 * it?" is not a question that can be answered wrongly any more. What is left is
 * the pair of questions that can:
 *
 * 1. **Does the derivation see every game that takes notes?** A game whose
 *    notes neither arm of {@link takesNotes} can see would get no key and
 *    nothing would notice — which is exactly what used to happen.
 * 2. **Does the key do anything when pressed?** The engine can put a key on the
 *    panel; only the game can make it act. A key that is offered and inert is a
 *    worse failure than no key, because it looks like the feature is there.
 * 3. **Does the key show the mode, whatever switched it?** A right press, the P
 *    shortcut and a tap in Right-click mode flip the mode without the key, and
 *    a key that showed only its own presses read "off" with the mode on (the
 *    owner, playtesting Keen, 2026-10-28).
 *
 * ## The failure this replaced
 *
 * The population was read as `typeof ui.pencilMode === "boolean"` — a **name**,
 * so it found only the games that had spelled the mode that way — and the
 * keypad was read from `game.requestKeys` rather than from the `Midend` the app
 * actually renders. **Rome and Map carried notes with no Marks key for their
 * whole lives**, with this file green over both (owner-reported, 2026-09-20,
 * on Rome, right after its hint shipped). docs/method.md § "A scan that keys on a
 * name".
 */

import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { UI_UPDATE } from "./game.ts";
import { Midend } from "./index.ts";
import { pencilModeKey, takesNotes } from "./key-labels.ts";
import { PENCIL_MODE_BUTTON } from "./pointer.ts";
import { randomNew } from "./random/index.ts";
import { observeMidend } from "./testing/drive-midend.ts";
import { builtGames } from "./testing/enrollment.ts";
import {
  type AnyGame,
  GESTURE_KINDS,
  probeBoard,
  randomGesture,
} from "./testing/input-probe.ts";
import { preferredDrawState } from "./testing/preferred-draw-state.ts";
import { itOverWholeSweep } from "./testing/slow.ts";

beforeAll(registerAllGames);

/**
 * Games whose Marks key is offered but does **not** toggle a mode, each with
 * the reason — the `NO_KEYBOARD` shape (`docs/testing.md` § "How a
 * cross-game guard finds its population"): the population is derived and only
 * the *exception* is written down, one entry per member, asserted exact so a
 * game that quietly stops handling the key fails here.
 *
 * **Empty is the goal, and empty still asserts something.**
 */
const NO_MODE: Record<string, string> = {};

/** The games in which an input other than the Marks key flipped the mode. */
let flippedByOtherInput = 0;

/** Every note-taking game, derived from what each game *is*. */
const noteTaking = builtGames().filter((g) => takesNotes(g.state, g.ui));

/** The keypad the app renders — through the `Midend`, not off the game. */
function renderedKeys(id: string): { button: number; label: string }[] {
  const { game } = builtGames().find((g) => g.id === id) as (typeof noteTaking)[number];
  const midend = new Midend(game);
  // A loaded board, because the derivation reads one. The id is the gate
  // slice's smallest; which board it is does not change who takes notes.
  midend.newGameFromId(`${game.encodeParams(game.defaultParams(), true)}#marks-key`);
  return midend.requestKeys();
}

describe("every game that takes notes offers the Marks key", () => {
  it("found the note-taking games at all", () => {
    // Vacuity, both halves: a filter that matched nothing, or a registry that
    // built nothing, would make every case below pass over an empty set.
    expect(builtGames().length).toBeGreaterThanOrEqual(50);
    expect(noteTaking.length).toBeGreaterThanOrEqual(14);
  });

  it("ledgers only note-taking games, each with its reason", () => {
    const ids = new Set(noteTaking.map((g) => g.id));
    for (const [id, why] of Object.entries(NO_MODE)) {
      expect(ids.has(id), `${id} is ledgered here but takes no notes`).toBe(true);
      expect(why.length, `${id}'s entry states no reason`).toBeGreaterThan(40);
    }
  });

  for (const { id } of noteTaking) {
    it(`${id}: the rendered keypad ends with the Marks key, exactly once`, () => {
      const keys = renderedKeys(id);
      expect(
        keys.filter((k) => k.button === PENCIL_MODE_BUTTON),
        `${id} must offer exactly one Marks key`,
      ).toEqual([pencilModeKey]);
      // Last, so the mode sits after the symbols in every game rather than
      // wherever each game happened to put it.
      expect(keys.at(-1)).toEqual(pencilModeKey);
    });
  }

  for (const { id, game, state } of noteTaking) {
    it(`${id}: pressing it is consumed${id in NO_MODE ? "" : " and toggles the mode"}`, () => {
      // A fresh Ui, not the shared one `builtGames` memoizes: the mode is
      // mutated here, and the other cross-game guards read that same object.
      const ui = game.newUi(state) as { pencilMode?: boolean };
      const ds = preferredDrawState(game, state);
      const press = () =>
        game.interpretMove(state, ui, ds, { x: 0, y: 0 }, PENCIL_MODE_BUTTON);

      // The engine can put the key on the panel; only the game can make it act.
      expect(press(), `${id} offers the Marks key but ignores it`).toBe(UI_UPDATE);
      if (id in NO_MODE) return;

      expect(ui.pencilMode, `${id} consumed the key without arming the mode`).toBe(
        true,
      );
      expect(press()).toBe(UI_UPDATE);
      expect(ui.pencilMode).toBe(false);
    });
  }

  it("offers it nowhere else", () => {
    // The other direction: a keypad key that toggles a mode the game does not
    // have is a control that does nothing when pressed.
    const offered = builtGames()
      .filter((g) => renderedKeys(g.id).some((k) => k.button === PENCIL_MODE_BUTTON))
      .map((g) => g.id);
    expect(offered).toEqual(noteTaking.map((g) => g.id));
  });

  for (const { id, game } of noteTaking) {
    it(`${id}: the mode the app is told is the mode the Ui holds, after every input`, () => {
      const b = probeBoard(game as AnyGame, id);
      // Replaces the probe's own callbacks, whose move count this does not read.
      const d = observeMidend(b.m);
      const rs = randomNew(`pencil-report-${id}`);
      const reported = () => d.last("game-state-change")?.pencilMode;
      const held = () => (b.ui() as { pencilMode: boolean }).pencilMode;
      const flips = { key: 0, other: 0 };

      b.reset();
      let mode = held();
      expect(reported(), `${id}: a fresh board is reported`).toBe(mode);
      for (let step = 0; step < 60; step++) {
        const byKey = step % 7 === 3;
        if (byKey) b.m.processInput(0, 0, PENCIL_MODE_BUTTON);
        else if (step % 13 === 12) b.m.undo();
        else randomGesture(b.m, b.size, rs, GESTURE_KINDS[step % GESTURE_KINDS.length]);
        const now = held();
        expect(reported(), `${id}: step ${step}`).toBe(now);
        if (now !== mode) flips[byKey ? "key" : "other"]++;
        mode = now;
      }
      // The key's own presses flipped it, or nothing above was measured. What
      // else flips it varies by game (a right press arms it in the cell games
      // and draws a cross in Loopy), so that is counted across the games.
      expect(flips.key).toBeGreaterThan(0);
      if (flips.other > 0) flippedByOtherInput++;
    });
  }

  // The path the owner tripped over is a right press, and the walk's blind
  // gestures reach it in most cell games; a handful would mean they stopped.
  itOverWholeSweep(
    "saw an input other than the key flip the mode in most games",
    () => {
      expect(flippedByOtherInput).toBeGreaterThanOrEqual(10);
    },
  );

  it("no game lists the key itself, so there is one source", () => {
    // The engine appends it. A game that also lists it is a second statement of
    // the same rule, and the two can drift — `Midend.requestKeys` de-duplicates,
    // so the drift would be silent.
    const selfListed = builtGames()
      .filter((g) =>
        (g.game.requestKeys?.(g.game.defaultParams()) ?? []).some(
          (k) => k.button === PENCIL_MODE_BUTTON,
        ),
      )
      .map((g) => g.id);
    expect(selfListed).toEqual([]);
  });
});
