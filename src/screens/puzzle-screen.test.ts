// @vitest-environment happy-dom
//
// Tier-3 component tests for `PuzzleScreen` (see the `repo-layout` spec): the
// Check-&-Save command path — the seam whose symptom path
// (save-when-it-should-not) the wall-mistake bug traveled — the reference-panel
// toggle, focus return, and which board a page opens with. Driven in-process
// under happy-dom with a fake `Puzzle` and mocked dialog/persistence; no worker,
// no canvas, no full render (we invoke the command handlers directly rather than
// mount Web Awesome). Visual/label rendering stays a Playwright smoke-check.
// Provides a fake `indexedDB` global (and the Dexie maxKey shim) so the
// transitive Dexie users in puzzle-screen's import graph (e.g. `settings.ts`)
// open cleanly instead of throwing under happy-dom.
//
// NO `vi.mock` HERE, ON PURPOSE. Under `isolate: false` a worker keeps its
// module graph from file to file, and a `vi.mock` reaches only the modules
// evaluated after it. `help-command-links.test.ts` and
// `puzzle-command-homes.test.ts` import this screen unmocked, so whenever either
// ran first in the worker, `puzzle-screen.ts` and `quick-save-actions.ts` were
// already bound to the real dialogs: eight tests failed, and one waited for a
// player to dismiss a real modal. A spy on the real module's export is read at
// call time by every importer however early it loaded, and `restoreAllMocks`
// hands the real function back to the next file in the worker.
// `no-module-mocks.test.ts` keeps `vi.mock` out of the suite.
import "../test-setup/indexeddb.ts";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from "vitest";
import * as alertDialog from "../dialogs/alert-dialog.ts";
import * as toast from "../dialogs/toast.ts";
import { savedGames } from "../store/saved-games.ts";

let showAlert: MockInstance<typeof alertDialog.showAlert>;
let showToast: MockInstance<typeof toast.showToast>;
let announce: MockInstance<typeof toast.announce>;
let quickSave: MockInstance<typeof savedGames.quickSave>;
let findMostRecentAutoSave: MockInstance<typeof savedGames.findMostRecentAutoSave>;
let restoreAutoSavedGame: MockInstance<typeof savedGames.restoreAutoSavedGame>;
let autoSaveGame: MockInstance<typeof savedGames.autoSaveGame>;

beforeEach(() => {
  showAlert = vi.spyOn(alertDialog, "showAlert").mockResolvedValue(undefined);
  showToast = vi.spyOn(toast, "showToast").mockReturnValue(undefined);
  announce = vi.spyOn(toast, "announce").mockReturnValue(undefined);
  quickSave = vi.spyOn(savedGames, "quickSave").mockResolvedValue(undefined);
  vi.spyOn(savedGames, "quickLoad").mockResolvedValue({ found: true });
  vi.spyOn(savedGames, "hasQuickSave").mockReturnValue(true);
  vi.spyOn(savedGames, "makeAutoSaveFilename").mockReturnValue("autosave-1");
  findMostRecentAutoSave = vi
    .spyOn(savedGames, "findMostRecentAutoSave")
    .mockResolvedValue(null);
  restoreAutoSavedGame = vi
    .spyOn(savedGames, "restoreAutoSavedGame")
    .mockResolvedValue(false);
  autoSaveGame = vi.spyOn(savedGames, "autoSaveGame").mockResolvedValue(undefined);
});
afterEach(() => {
  vi.restoreAllMocks();
});

// The settings store is deliberately NOT mocked: the board-choice tests assert
// that a remembered board survives a reload, and a mocked store would assert
// only that this file's own fake was called — the shape of guard this repo keeps
// catching (a check aimed at a neighbor of the thing it claims to check).
import type { CheckVerdict } from "../engine/types.ts";
import type { DealOutcome } from "../puzzle/puzzle.ts";
import { CHECK_OUT_OF_REACH, justSaved } from "../puzzle/quick-save-actions.ts";
import { settings } from "../store/settings.ts";
import { sleep } from "../utils/timing.ts";
import { PuzzleScreen } from "./puzzle-screen.ts";

const SOUND: CheckVerdict = { kind: "sound", mistakesChecked: true };
const mistakes = (count: number): CheckVerdict => ({ kind: "mistakes", count });

interface CommandHost {
  commandMap: Record<string, (...args: unknown[]) => unknown>;
  handleBubbledKeyDown: (event: KeyboardEvent) => Promise<void> | void;
  handleCommand: (command: string) => boolean;
  handleChromeClick: (event: MouseEvent) => void;
}

/** Build a screen with a fake puzzle injected, without scheduling a Lit
 * render (shadow the reactive accessors with own properties so no update
 * is requested — there is no render root in this detached element). */
function makeScreen(opts: { canCheck: boolean; verdict?: CheckVerdict }) {
  const verdict = opts.verdict ?? SOUND;
  const check = vi.fn(async () => verdict);
  const selectReference = vi.fn(async () => undefined);
  const solve = vi.fn(async () => undefined);
  const fakePuzzle = {
    puzzleId: "galaxies",
    canCheck: opts.canCheck,
    check,
    selectReference,
    solve,
  };
  const screen = new PuzzleScreen();
  Object.defineProperty(screen, "puzzle", {
    configurable: true,
    get: () => fakePuzzle,
  });
  Object.defineProperty(screen, "puzzleId", {
    configurable: true,
    writable: true,
    value: "galaxies",
  });
  return {
    screen,
    host: screen as unknown as CommandHost,
    check,
    selectReference,
    solve,
  };
}

/** Stand a fake board in the screen's shadow root, so we can watch whether a
 * command hands focus back to it. */
function stubBoard(screen: PuzzleScreen) {
  const focus = vi.fn();
  Object.defineProperty(screen, "shadowRoot", {
    configurable: true,
    get: () => ({
      querySelector: (selector: string) =>
        selector === "puzzle-view-interactive" ? { focus } : null,
    }),
  });
  return focus;
}

describe("puzzle-screen: Check-&-Save command", () => {
  it("saves a clean board (0 mistakes) and confirms on the button, not in a popup", async () => {
    vi.useFakeTimers();
    try {
      const { host, check } = makeScreen({ canCheck: true });
      expect(justSaved("galaxies")).toBe(false);
      await host.commandMap["check-and-save"].call(host);
      expect(check).toHaveBeenCalledOnce();
      expect(quickSave).toHaveBeenCalledOnce();
      // Owner, 2026-09-25: success is not special. No toast, no modal — the
      // button reads "Saved" for a moment, and then it is Check & save again.
      expect(showToast).not.toHaveBeenCalled();
      expect(showAlert).not.toHaveBeenCalled();
      expect(justSaved("galaxies")).toBe(true);
      expect(justSaved("lightup")).toBe(false);
      // A screen reader hears the check as well as the save: "did the board
      // survive?" is what the player pressed the button to find out.
      expect(announce).toHaveBeenCalledWith("No mistakes. Saved.");
      vi.runAllTimers();
      expect(justSaved("galaxies")).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("refuses to save when mistakes are present, and reports them in a modal", async () => {
    const { host, check } = makeScreen({ canCheck: true, verdict: mistakes(3) });
    await host.commandMap["check-and-save"].call(host);
    expect(check).toHaveBeenCalledOnce();
    expect(quickSave).not.toHaveBeenCalled();
    // A refused save must interrupt — modal, not toast.
    expect(showToast).not.toHaveBeenCalled();
    expect(showAlert).toHaveBeenCalledOnce();
    expect(showAlert.mock.calls[0]?.[0]).toMatchObject({
      label: "Not saved",
      type: "warning",
    });
    // The count and pluralization reach the message.
    expect(String(showAlert.mock.calls[0]?.[0]?.message)).toContain("3 mistakes found");
  });

  it("refuses to save a dead end, in the hint's words, in a modal", async () => {
    const reason = "The outlined peg is cut off. Undo until it is not.";
    const { host } = makeScreen({
      canCheck: true,
      verdict: { kind: "dead-end", reason },
    });
    await host.commandMap["check-and-save"].call(host);
    expect(quickSave).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
    expect(showAlert).toHaveBeenCalledOnce();
    expect(showAlert.mock.calls[0]?.[0]).toMatchObject({
      label: "Not saved",
      message: reason,
    });
  });

  it("saves a position the check could not settle, and says so", async () => {
    // Owner, 2026-10-02: past the search's reach establishes nothing, so it
    // saves; but "Saved." alone would hide that the check could not tell.
    const { host } = makeScreen({ canCheck: true, verdict: { kind: "out-of-reach" } });
    await host.commandMap["check-and-save"].call(host);
    expect(quickSave).toHaveBeenCalledOnce();
    expect(justSaved("galaxies")).toBe(true);
    expect(showAlert).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledOnce();
    expect(showToast.mock.calls[0]?.[0]).toMatchObject({
      label: "Saved",
      message: CHECK_OUT_OF_REACH,
    });
    // The toast is announced; a second announcement would say it twice.
    expect(announce).not.toHaveBeenCalled();
  });

  it("claims no mistakes only where findMistakes ran", async () => {
    const { host } = makeScreen({
      canCheck: true,
      verdict: { kind: "sound", mistakesChecked: false },
    });
    await host.commandMap["check-and-save"].call(host);
    expect(quickSave).toHaveBeenCalledOnce();
    expect(announce).toHaveBeenCalledWith("Saved.");
  });

  it("on a game that cannot check, Check-&-Save is a plain quick-save", async () => {
    const { host, check } = makeScreen({ canCheck: false, verdict: mistakes(99) });
    await host.commandMap["check-and-save"].call(host);
    expect(check).not.toHaveBeenCalled();
    expect(quickSave).toHaveBeenCalledOnce();
    // No check ran, so the announcement claims none.
    expect(announce).toHaveBeenCalledWith("Saved.");
    expect(showToast).not.toHaveBeenCalled();
  });

  it("Cmd/Ctrl+S routes to Check-&-Save and suppresses the browser default", async () => {
    const { host } = makeScreen({ canCheck: true });
    const event = new KeyboardEvent("keydown", {
      key: "s",
      metaKey: true,
      cancelable: true,
    });
    const prevent = vi.spyOn(event, "preventDefault");
    await host.handleBubbledKeyDown(event);
    expect(prevent).toHaveBeenCalled();
    expect(quickSave).toHaveBeenCalledOnce();
  });
});

describe("puzzle-screen: Check without saving", () => {
  /**
   * **The case this command exists for.** The quick-save slot is one per
   * puzzle, so the combined Check & save overwrites it. A player who saved
   * deliberately before a speculative branch and then checks would lose the
   * position they were keeping — and would lose it *silently*, because the
   * check succeeded.
   *
   * "Does not call quickSave" is the assertion that matters, and it is the one
   * that would still pass if the command were wired to the wrong handler. So it
   * is checked alongside the two halves that say the command did its own job:
   * the board was examined, and the result was reported.
   *
   * That an untouched slot is still restorable afterwards is `saved-games`'
   * own guarantee, round-tripped in `saved-games.test.ts` against
   * `fake-indexeddb`; re-asserting it here through this file's mock would be
   * asserting that the mock remembers what it was told.
   */
  it("checks and reports without touching the quick-save slot", async () => {
    const { host, check } = makeScreen({ canCheck: true, verdict: mistakes(2) });
    await host.commandMap["check-only"].call(host);
    expect(check).toHaveBeenCalledOnce();
    expect(quickSave).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledOnce();
    expect(showToast.mock.calls[0]?.[0]).toMatchObject({
      label: "2 mistakes found",
      type: "warning",
    });
    // The message says the checkpoint survived, because that is the whole
    // reason a player chose this command over the other one.
    expect(String(showToast.mock.calls[0]?.[0]?.message)).toContain("untouched");
    // A report, not an interruption: there is nothing here that failed to
    // happen, so there is nothing to stop the player for.
    expect(showAlert).not.toHaveBeenCalled();
  });

  it("reports a clean board too", async () => {
    const { host } = makeScreen({ canCheck: true });
    await host.commandMap["check-only"].call(host);
    expect(quickSave).not.toHaveBeenCalled();
    expect(showToast.mock.calls[0]?.[0]).toMatchObject({
      label: "No mistakes",
      type: "success",
    });
  });

  it("reports a dead end in the hint's words, and what it could not settle", async () => {
    const reason =
      "The ball can no longer reach the outlined gem. Undo to where it can.";
    const dead = makeScreen({ canCheck: true, verdict: { kind: "dead-end", reason } });
    await dead.host.commandMap["check-only"].call(dead.host);
    expect(showToast.mock.calls[0]?.[0]).toMatchObject({
      label: "Dead end",
      message: reason,
      type: "warning",
    });
    const far = makeScreen({ canCheck: true, verdict: { kind: "out-of-reach" } });
    await far.host.commandMap["check-only"].call(far.host);
    expect(showToast.mock.calls[1]?.[0]).toMatchObject({ message: CHECK_OUT_OF_REACH });
    expect(quickSave).not.toHaveBeenCalled();
    expect(showAlert).not.toHaveBeenCalled();
  });

  it("does nothing on a game that cannot check", async () => {
    // The command is gated on `canCheck` in the rail, so this arm is only ever
    // reached by a shortcut or a stale surface — and it must not report a
    // clean board it never examined.
    const { host, check } = makeScreen({ canCheck: false });
    await host.commandMap["check-only"].call(host);
    expect(check).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
  });
});

describe("puzzle-screen: reference panel toggle command", () => {
  it("toggle-reference flips the panel and keeps the spotlight on close", () => {
    const { screen, host, selectReference } = makeScreen({ canCheck: false });
    // Shadow the reactive `referenceOpen` with a plain own property so toggling
    // it doesn't schedule a Lit render on this detached element (the same
    // technique makeScreen uses for `puzzle`/`puzzleId`).
    Object.defineProperty(screen, "referenceOpen", {
      configurable: true,
      writable: true,
      value: false,
    });
    const open = () => (screen as unknown as { referenceOpen: boolean }).referenceOpen;

    host.commandMap["toggle-reference"].call(host);
    expect(open()).toBe(true);
    host.commandMap["toggle-reference"].call(host);
    expect(open()).toBe(false);
    // Closing must NOT clear the board spotlight — the mark→close→place flow
    // relies on it persisting (Escape / re-clicking the chip is the clear path).
    expect(selectReference).not.toHaveBeenCalled();
  });
});

describe("puzzle-screen: focus returns to the board after a command", () => {
  // The bug this pins: a command run from the game menu left focus on the menu's
  // trigger button (wa-dropdown puts it back there as it closes), and a command
  // run from the toolbar left focus on its button — so the next keystroke went
  // to the button, not the puzzle. Enter reopened the menu instead of playing.
  // Worst on Inertia, whose route-following aid *is* "Solve, then press Enter",
  // but it swallowed the cursor keys in every keyboard-playable game.

  it("hands focus to the board once the command has run", async () => {
    const { screen, host, solve } = makeScreen({ canCheck: false });
    const focus = stubBoard(screen);

    expect(host.handleCommand("solve")).toBe(true);
    expect(solve).toHaveBeenCalledOnce();

    // Deferred by a microtask on purpose: wa-dropdown focuses its own trigger
    // the moment our wa-select handler returns, so focusing the board inline
    // would just be overwritten.
    expect(focus).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("leaves focus alone when the command isn't one of ours", async () => {
    const { screen, host } = makeScreen({ canCheck: false });
    const focus = stubBoard(screen);

    // An unhandled command falls through to the browser (an ordinary link, say),
    // and stealing focus from whatever it does would be wrong.
    expect(host.handleCommand("not-a-command")).toBe(false);
    await Promise.resolve();
    expect(focus).not.toHaveBeenCalled();
  });

  it("hands focus to the board after a chrome control is clicked", async () => {
    // A pointer click anywhere in the rail or the phone bar hands the keyboard
    // back, whether or not the control also went through the command bus — a
    // control may be both a `data-command` and a menu trigger, and only a real
    // event's composed path tells those apart.
    const { screen, host } = makeScreen({ canCheck: false });
    const focus = stubBoard(screen);

    host.handleChromeClick(new MouseEvent("click", { detail: 1 }));
    await Promise.resolve();
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("leaves focus alone when a button was activated from the keyboard", async () => {
    // Tab to the button, press Enter: that arrives as a click with detail 0. The
    // player is walking the tab order on purpose; throwing them out of it onto
    // the board would lose their place.
    const { screen, host } = makeScreen({ canCheck: false });
    const focus = stubBoard(screen);

    host.handleChromeClick(new MouseEvent("click", { detail: 0 }));
    await Promise.resolve();
    expect(focus).not.toHaveBeenCalled();
  });
});

// --- which board a puzzle page opens with -----------------------------------

/** Every board this fake deals gets a distinct id — across instances, not just
 * within one. Two puzzles that each deal "fresh-1" would make "the same board
 * came back" and "a new board was dealt" indistinguishable, which is how the
 * dropped-stale-board test first passed for the wrong reason. */
let dealt = 0;

function makeLoadPuzzle(opts: { rejectId?: (id: string) => string | null } = {}) {
  const puzzle = {
    puzzleId: "abcd",
    params: "5x5n4d1",
    // Full params, difficulty included, as `Midend.emitIdChange` builds it.
    currentGameId: "",
    // A board freshly dealt: the screen autosaves only once a move is made.
    totalMoves: 0,
    isSolved: false,
    setPreferences: vi.fn(async () => undefined),
    setParams: vi.fn(async (_params: string) => null),
    // The flattened form, a submenu's heading before its members, as
    // `Puzzle.getPresets(true)` returns it: the heading carries no params of
    // its own to deal, so the first *leaf* is the first preset.
    getPresets: vi.fn(async (_flat?: boolean) => [
      { title: "4x4", params: "", submenu: [{ title: "4x4 Easy", params: "4x4n4d0" }] },
      { title: "4x4 Easy", params: "4x4n4d0" },
      { title: "5x5 Normal", params: "5x5n4d1" },
    ]),
    newGame: vi.fn(async (): Promise<DealOutcome> => {
      dealt += 1;
      puzzle.currentGameId = `5x5n4d1:fresh-${dealt}`;
      return "dealt";
    }),
    newGameFromId: vi.fn(async (id: string) => {
      const error = opts.rejectId?.(id);
      if (error) return error;
      puzzle.currentGameId = id;
      return null;
    }),
  };
  return puzzle;
}

type FakeLoadPuzzle = ReturnType<typeof makeLoadPuzzle>;

/** Drive one page load: construct the screen, fire `handlePuzzleLoaded`, then
 * fire the state-change handler the way a dealt game does, so the board is
 * recorded exactly as it is in the app. */
async function load(
  puzzle: FakeLoadPuzzle,
  opts: { gameId?: string; params?: string } = {},
): Promise<void> {
  const screen = new PuzzleScreen() as unknown as {
    gameId?: string;
    params?: string;
    handlePuzzleLoaded: (e: unknown) => Promise<void>;
    handlePuzzleGameStateChange: (e: unknown) => Promise<void>;
  };
  screen.gameId = opts.gameId;
  screen.params = opts.params;
  const event = { detail: { puzzle }, preventDefault: vi.fn() };
  await screen.handlePuzzleLoaded(event);
  // `handlePuzzleGameStateChange` is @debounced(250); awaiting the debounce
  // window would make every test sleep. Record through the same public API it
  // uses instead, recording the same value it does. `records the board it will
  // re-deal from` below pays the debounce once so the real handler is exercised
  // at least somewhere.
  await settings.setLastGameId(puzzle.puzzleId, puzzle.currentGameId);
}

describe("which board a puzzle page opens with", () => {
  // Scoped to this describe, not the file: the command tests above never read
  // the settings store, and a top-level hook would make each of them pay for a
  // fake-indexeddb round trip.
  beforeEach(async () => {
    await settings.loaded;
    await settings.setLastGameId("abcd", null);
    await settings.setParams("abcd", null);
  });

  it("re-deals the board it last showed, when no move was ever made", async () => {
    const first = makeLoadPuzzle();
    await load(first);
    const board = first.currentGameId;
    // The difficulty the board was dealt at travels with it.
    expect(board).toMatch(/^5x5n4d1:fresh-\d+$/);

    const second = makeLoadPuzzle();
    await load(second);

    expect(second.currentGameId).toBe(board);
    expect(second.newGameFromId).toHaveBeenCalledWith(board);
    expect(second.newGame).not.toHaveBeenCalled();
  });

  it("records the board it will re-deal from, difficulty included", async () => {
    // THE ONE TEST THAT DRIVES THE REAL HANDLER. Every other test in this block
    // goes through `load`'s shortcut, which writes the settings key directly to
    // avoid a 250ms debounce per test — so none of them can see *what
    // production stored*. This one pays the debounce once and asserts the stored
    // value, difficulty included: reopening a board whose id has lost the tier
    // deals it at the puzzle's default difficulty.
    const puzzle = makeLoadPuzzle();
    await puzzle.newGame();
    const screen = new PuzzleScreen() as unknown as {
      handlePuzzleGameStateChange: (e: unknown) => void;
    };
    screen.handlePuzzleGameStateChange({ detail: { puzzle } });
    await sleep(300);

    expect(await settings.getLastGameId("abcd")).toBe(puzzle.currentGameId);
    expect(await settings.getLastGameId("abcd")).toMatch(/^5x5n4d1:/);
    // And no autosave for a board nobody has moved on, which is why the board
    // is a settings key and not a `SaveType.Auto` row: the home screen badges
    // "game in progress" off the autosaves.
    expect(autoSaveGame).not.toHaveBeenCalled();
  });

  it("prefers an autosave, so a started game is restored rather than re-dealt", async () => {
    const first = makeLoadPuzzle();
    await load(first);

    findMostRecentAutoSave.mockResolvedValue("autosave-1");
    restoreAutoSavedGame.mockResolvedValue(true);
    const second = makeLoadPuzzle();
    await load(second);

    expect(restoreAutoSavedGame).toHaveBeenCalled();
    expect(second.newGameFromId).not.toHaveBeenCalled();
    expect(second.newGame).not.toHaveBeenCalled();
  });

  it("prefers a game id from the URL over the remembered board", async () => {
    const first = makeLoadPuzzle();
    await load(first);

    const second = makeLoadPuzzle();
    await load(second, { gameId: "5x5n4:from-url" });
    expect(second.currentGameId).toBe("5x5n4:from-url");
  });

  it("ignores the remembered board when the URL asks for a type", async () => {
    // A remembered board may not match the requested params, same reasoning as
    // the autosave branch above.
    const first = makeLoadPuzzle();
    await load(first);

    const second = makeLoadPuzzle();
    await load(second, { params: "6x6n4" });
    expect(second.newGameFromId).not.toHaveBeenCalled();
    expect(second.newGame).toHaveBeenCalled();
  });

  it("says so and starts on the first preset when the remembered type deals nothing", async () => {
    const puzzle = makeLoadPuzzle();
    await settings.setParams(puzzle.puzzleId, "9x9n4d3");
    puzzle.newGame.mockImplementationOnce(async () => ({
      refusal: "No Hard puzzle was found.",
    }));
    await load(puzzle);

    expect(showAlert).toHaveBeenCalledOnce();
    expect(showAlert.mock.calls[0]?.[0]).toMatchObject({
      message: "No Hard puzzle was found.",
    });
    expect(puzzle.setParams).toHaveBeenLastCalledWith("4x4n4d0");
    expect(puzzle.newGame).toHaveBeenCalledTimes(2);
  });

  it("starts on the first preset, with no word, when the search for the remembered type is stopped", async () => {
    const puzzle = makeLoadPuzzle();
    await settings.setParams(puzzle.puzzleId, "9x9n4d3");
    puzzle.newGame.mockImplementationOnce(async () => "stopped");
    await load(puzzle);

    expect(showAlert).not.toHaveBeenCalled();
    expect(puzzle.setParams).toHaveBeenLastCalledWith("4x4n4d0");
    // There is nothing to go back to from the first preset's own deal.
    expect(puzzle.newGame).toHaveBeenLastCalledWith({ canStop: false });
    expect(puzzle.newGame).toHaveBeenCalledTimes(2);
  });

  it("drops a remembered board this build cannot deal, quietly", async () => {
    const first = makeLoadPuzzle();
    await load(first);
    const stale = first.currentGameId;

    const second = makeLoadPuzzle({
      rejectId: (id) => (id === stale ? "Board size no longer supported" : null),
    });
    await load(second);

    // It was tried — without this the rest of the assertions below all hold
    // just as well when the lookup is not performed at all.
    expect(second.newGameFromId).toHaveBeenCalledWith(stale);
    // Dealt a new game rather than refusing to open the puzzle...
    expect(second.newGame).toHaveBeenCalled();
    // ...said nothing about it, because the player never asked for that board...
    expect(showAlert).not.toHaveBeenCalled();
    // ...and forgot it, so the next load does not retry the same failure.
    expect(await settings.getLastGameId("abcd")).not.toBe(stale);
  });

  it("deals a player who never chose a type the first preset", async () => {
    const puzzle = makeLoadPuzzle();
    await load(puzzle);
    expect(puzzle.setParams).toHaveBeenCalledWith("4x4n4d0");
    // Before the deal, or the first board is dealt at the game's defaults.
    expect(puzzle.setParams.mock.invocationCallOrder[0]).toBeLessThan(
      puzzle.newGame.mock.invocationCallOrder[0],
    );
  });

  it("keeps a type the player chose, from settings or from the URL", async () => {
    await settings.setParams("abcd", "6x6n4");
    const remembered = makeLoadPuzzle();
    await load(remembered);
    expect(remembered.setParams.mock.calls).toEqual([["6x6n4"]]);

    await settings.setParams("abcd", null);
    const asked = makeLoadPuzzle();
    await load(asked, { params: "7x7n3" });
    expect(asked.setParams.mock.calls).toEqual([["7x7n3"]]);
  });

  it("redraws its chrome once the puzzle exists, without waiting for the deal", async () => {
    // The phone bar reads the puzzle through a non-reactive `@query`, so a
    // render requested only by `puzzleLoaded` left Hint off the bar for as long
    // as the first board took to deal.
    const puzzle = makeLoadPuzzle();
    const screen = new PuzzleScreen();
    const requestUpdate = vi.spyOn(screen, "requestUpdate");
    let rendersBeforeDeal = -1;
    puzzle.newGame.mockImplementationOnce(async () => {
      rendersBeforeDeal = requestUpdate.mock.calls.length;
      return "dealt";
    });
    const loaded = (
      screen as unknown as { handlePuzzleLoaded: (e: unknown) => Promise<void> }
    ).handlePuzzleLoaded;
    await loaded.call(screen, { detail: { puzzle }, preventDefault: vi.fn() });
    expect(puzzle.newGame).toHaveBeenCalled();
    expect(rendersBeforeDeal).toBeGreaterThan(0);
  });

  it("still alerts for a bad game id in the URL, which the player did ask for", async () => {
    const puzzle = makeLoadPuzzle({ rejectId: () => "no such board" });
    await load(puzzle, { gameId: "5x5n4:typo" });
    expect(showAlert).toHaveBeenCalled();
  });
});
