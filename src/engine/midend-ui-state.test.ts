/**
 * **A game's saveable `Ui` must reach the thing that decides to save it.**
 *
 * `encodeUi`/`decodeUi` make a `Ui` field survive a save, and every test of
 * them calls the two hooks directly — which is why Guess shipped a correct
 * encoding whose output nothing ever asked for. The app autosaves when
 * `puzzle-context` sees one of the values it watches change, and a `Ui` edit is
 * not a move: it moves no move index, no game id and no checkpoint. A row
 * composed in Guess came back empty from a real page reload with the whole
 * suite green, and only opening the app said so.
 *
 * So the midend reports the encoding itself on every transition
 * (`NotifyGameStateChange.uiState`), and the app watches *that*. The value it
 * compares is then the part of the save file that would differ, rather than a
 * proxy for it — and a game with no `encodeUi` reports nothing, so it costs
 * nothing.
 *
 * The population is **derived from the hook**, so a game acquires this the day
 * it acquires an `encodeUi` and nobody has to remember this file exists.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import type { Game } from "./game.ts";
import { Midend } from "./midend.ts";
import { CURSOR_RIGHT } from "./pointer.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import { RecordingDrawing } from "./testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "./testing/render-scenario.ts";
import type { ChangeNotification } from "./types.ts";

beforeAll(registerAllGames);

type AnyGame = Game<unknown, unknown, unknown, unknown, unknown>;

/**
 * A midend on a real board, plus every notification it has emitted and the
 * `Ui` the midend is holding.
 *
 * The `Ui` is private to the midend, and rather than open it up for a test this
 * reads it where the engine already hands it out — `redraw` receives it. The
 * wrapper delegates to the real game, so the midend is driving the real thing
 * throughout (the idiom is `drag-cancel.test.ts`'s `midendAndUi`).
 */
function boardFor(game: AnyGame) {
  const notes: ChangeNotification[] = [];
  let ui: unknown;
  const spy: AnyGame = {
    ...game,
    redraw(dr, ds, prev, state, dir, seen, animTime, flashTime, hint, mistakes) {
      ui = seen;
      game.redraw(dr, ds, prev, state, dir, seen, animTime, flashTime, hint, mistakes);
    },
  };
  const m = new Midend(spy);
  m.setCallbacks(
    (n) => notes.push(n),
    () => {},
  );
  m.newGame();
  const uiNow = (): unknown => {
    m.forceRedraw(new RecordingDrawing(m.getColorPalette(DEFAULT_BACKGROUND)));
    return ui;
  };
  return { m, notes, uiNow };
}

/**
 * The `uiState` on the midend's most recent `game-state-change`, or `null` when
 * that notification carried none.
 *
 * **Throws when there was no state change at all**, rather than answering
 * `null`: the two would otherwise be indistinguishable, and a midend that had
 * gone quiet would read as "this game reports no Ui" and pass every assertion
 * below.
 */
function lastUiState(notes: ChangeNotification[]): string | null {
  for (let i = notes.length - 1; i >= 0; i--) {
    const note = notes[i];
    if (note.type === "game-state-change") return note.uiState ?? null;
  }
  throw new Error("midend-ui-state: the midend emitted no game-state-change");
}

const PERSISTS_UI = registeredGameIds().filter(
  (id) => (getTsGame(id) as AnyGame | undefined)?.encodeUi !== undefined,
);

describe("a game's saveable Ui is reported to the app", () => {
  let swept = 0;

  for (const id of PERSISTS_UI) {
    it(`${id}: reports its encoded Ui with every state change`, () => {
      const game = getTsGame(id) as AnyGame;
      const { notes, uiNow } = boardFor(game);
      const reported = lastUiState(notes);
      expect(reported, `${id} persists a Ui but reports no uiState`).toBe(
        game.encodeUi?.(uiNow()),
      );
      swept++;
    });
  }

  for (const id of registeredGameIds()) {
    const game = getTsGame(id) as AnyGame | undefined;
    if (!game || game.encodeUi) continue;
    it(`${id}: reports no Ui, having none to save`, () => {
      const { notes } = boardFor(game);
      expect(lastUiState(notes)).toBeNull();
      swept++;
    });
  }

  it("swept every registered game, and some of them persist a Ui", () => {
    // Two vacuity guards, because they fail differently. The second is the one
    // this file exists for — with no game persisting a `Ui`, every assertion
    // above passes over nothing and the sweep reports health. The first catches
    // the quieter shape: a registry that answers with a *subset* leaves most
    // games unswept while both loops still run.
    expect(swept).toBe(registeredGameIds().length);
    expect(PERSISTS_UI.length).toBeGreaterThan(0);
  });
});

describe("the reported Ui tracks a Ui edit that is not a move", () => {
  it("guess: composing a row changes the reported uiState", () => {
    // The concrete defect. Placing a color is a `UI_UPDATE`, so the move index
    // does not move and nothing else the app watches does either; before the
    // midend reported the encoding, a composed row was never autosaved.
    const game = getTsGame("guess") as AnyGame;
    const { m, notes } = boardFor(game);
    const before = lastUiState(notes);
    expect(before).not.toBeNull();

    const colors = m.requestKeys().filter((k) => k.swatch !== undefined);
    expect(colors.length).toBeGreaterThan(0);
    expect(m.processInput(0, 0, colors[0].button)).toBe(true);

    const after = lastUiState(notes);
    expect(after, "a composed peg left the reported Ui unchanged").not.toBe(before);
  });

  it("guess: moving the cursor alone does not change it", () => {
    // The other direction, so the report is the *save's* content and not a
    // "something happened" counter: where the cursor sits is not in the save,
    // and re-saving for it would be a DB write per arrow key.
    const game = getTsGame("guess") as AnyGame;
    const { m, notes } = boardFor(game);
    const before = lastUiState(notes);
    expect(
      m.processInput(0, 0, CURSOR_RIGHT),
      "the cursor did not move, so nothing was tested",
    ).toBe(true);
    expect(lastUiState(notes)).toBe(before);
  });
});
