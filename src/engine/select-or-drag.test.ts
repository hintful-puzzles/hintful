/**
 * **One answer per gesture, across the whole note-taking family.**
 *
 * The mechanic's own arms are unit-tested in `note-taking-cell.test.ts`. What
 * is asserted here is that every member *reaches* them the same way, which a
 * unit test structurally cannot see: Rome's and Map's pointer press starts a
 * drag, so their selection happens at the **release**, and a game whose press
 * threw the answer away could still pass a direct call to the arm it never
 * makes. So every case below drives the game's own `interpretMove` through a
 * real `Midend`, press and release, exactly as the frontend does.
 *
 * Two rules, both of which Rome and Map failed before
 * `own-the-select-or-drag-gesture` moved the gesture into the engine:
 *
 *  1. **A tap on the selected cell puts the highlight away** — or the game
 *     answers the re-press some other way, which it can only do by recording
 *     it. What is banned is the third outcome, a repeat tap that *changes
 *     nothing*: their press hid the highlight to begin a possible drag, so by
 *     the release the "is it already selected?" the arm asks had been thrown
 *     away, and the tap re-selected what was already selected for ever.
 *  2. **With sticky pencil mode on, a right tap never hides a showing
 *     highlight.** The sticky toggle is a *mode switch*: it deliberately leaves
 *     the highlight alone, and "alone" meant "hidden" in a game whose press had
 *     already taken it down.
 *
 * **Neither rule carries a roster of exemptions.** Rule 1's escape is derived
 * from what the game does — Crossing flips `ui.dir` between across and down
 * when the re-pressed cell is a crossing, which is a crossword convention and a
 * decision about that puzzle — and a member is still required to put the
 * highlight away *somewhere*, so a game cannot buy its way out by answering
 * every re-press with a twitch. Rule 2 needs no escape: it is stated without
 * the qualifier the defect wore ("on a cell that can take no mark") because it
 * holds unqualified, every other path through the sticky branch ending with the
 * highlight shown. The carve-out is exercised deliberately rather than hoped
 * for — the sweep counts the taps that took it, per member, and a member that
 * reached zero of them fails instead of reporting health.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { Midend } from "./midend.ts";
import { LEFT_BUTTON, LEFT_RELEASE, RIGHT_BUTTON, RIGHT_RELEASE } from "./pointer.ts";
import { randomNew } from "./random/index.ts";
import { type AnyGame, builtGames, enrolledIn } from "./testing/enrollment.ts";
import { fingerprint, probePoints } from "./testing/input-probe.ts";
import { RecordingDrawing } from "./testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "./testing/render-scenario.ts";
import type { Point } from "./types.ts";

beforeAll(registerAllGames);

/** The fields that make a game a member — the same derivation
 * `note-taking-cell.test.ts` makes, for the same reason. */
const noteTaking = enrolledIn(
  (g) =>
    typeof g.ui["pencilMode"] === "boolean" &&
    typeof g.ui["cursorFromKeyboard"] === "boolean",
);

/** The highlight as the mechanic keeps it, plus everything else the `Ui` holds
 * — the second of which is only ever compared with itself, to tell "the game
 * answered this press" from "nothing happened". */
interface Selection {
  x: number;
  y: number;
  visible: boolean;
  pencilMode: boolean;
  sticky: boolean;
  /** A digest of the whole `Ui`. */
  all: string;
}

/**
 * A midend over a real board, plus the `Ui` it is holding.
 *
 * The `Ui` is the midend's own, read where the engine already hands it out — to
 * `redraw` — rather than by opening the midend up for a test. That also means
 * every field read below is the state the frontend would have painted from.
 */
function member(game: AnyGame, id: string) {
  let seen: Record<string, unknown> | null = null;
  const spy: AnyGame = {
    ...game,
    redraw: (dr, ds, prev, s, dir, ui, ...rest) => {
      seen = ui as Record<string, unknown>;
      return game.redraw(dr, ds, prev, s, dir, ui, ...rest);
    },
  };
  const m = new Midend(spy);
  m.setCallbacks(
    () => {},
    () => {},
    () => {},
  );
  // The player's choice, not a `newUi` default: this is the mode rule 2 is
  // about, and `applyPrefs` re-applies it across every new board. A game
  // without the preference (Group) simply never gains the field, which is how
  // it stays out of rule 2 without anybody keeping a roster.
  m.setPreferences({ "sticky-pencil-mode": true });
  // A board from a fixed seed, never `newGame`'s random one: the counts below
  // are per-board, so a random deal makes a failure name a different number of
  // squares every run and an intermittent one impossible to reproduce.
  const params = game.defaultParams();
  const desc = game.newDesc(params, randomNew(`select-or-drag-${id}`)).desc;
  const gameId = `${game.encodeParams(params, true)}:${desc}`;
  // Not `restartGame`, which replaces the board and **keeps the `Ui`**: a
  // highlight left showing by the previous probe point would then answer for
  // the next one, and a sweep whose points contaminate each other reports on a
  // gesture nobody made. Dealing the same id again is what gives a fresh `Ui`.
  const reset = () => {
    m.newGameFromId(gameId);
  };
  reset();

  const selection = (): Selection => {
    m.redraw(new RecordingDrawing(m.getColorPalette(DEFAULT_BACKGROUND)));
    const ui = seen;
    if (ui === null) throw new Error("the game painted no frame");
    const cursor = ui["cursor"] as { x: number; y: number; visible: boolean };
    return {
      ...cursor,
      pencilMode: ui["pencilMode"] === true,
      sticky: ui["pencilSticky"] === true,
      all: JSON.stringify(ui),
    };
  };
  const tap = (p: Point, button: number) => {
    m.processInput(p.x, p.y, button);
    m.processInput(p.x, p.y, button === RIGHT_BUTTON ? RIGHT_RELEASE : LEFT_RELEASE);
  };
  return { m, selection, tap, reset };
}

/** One member's answers to rule 1, over every point on its board where a first
 * tap selects. */
interface RepeatTaps {
  /** Points where the repeat tap put the highlight away — the rule. */
  away: number;
  /** Points where the game answered the re-press some other way and recorded
   * it, with the first such point for the failure message. */
  answered: string[];
  /** Points where the repeat tap changed nothing at all — the defect. */
  inert: string[];
}

function repeatTaps(game: AnyGame, id: string): RepeatTaps {
  const { m, selection, tap, reset } = member(game, id);
  const out: RepeatTaps = { away: 0, answered: [], inert: [] };
  for (const p of probePoints(m.preferredSize())) {
    reset();
    tap(p, LEFT_BUTTON);
    const first = selection();
    if (!first.visible) continue;
    tap(p, LEFT_BUTTON);
    const second = selection();
    const at = `(${p.x},${p.y})`;
    if (!second.visible) out.away++;
    else if (second.all !== first.all) out.answered.push(at);
    else out.inert.push(at);
  }
  return out;
}

describe("the select-or-drag gesture answers like every other press", () => {
  it("finds the members, derived from what their Ui carries", () => {
    // The vacuity guard: every assertion below iterates this list, so an empty
    // one would pass in perfect silence.
    expect(noteTaking.population).toBeGreaterThanOrEqual(50);
    expect(noteTaking.ids.length).toBeGreaterThanOrEqual(13);
  });

  it("a tap on the selected cell puts the highlight away", () => {
    const inert: string[] = [];
    const never: string[] = [];
    for (const { id, game } of builtGames()) {
      if (!noteTaking.ids.includes(id)) continue;
      const taps = repeatTaps(game, id);
      if (taps.inert.length > 0)
        inert.push(`${id}: ${taps.inert.length} inert, first at ${taps.inert[0]}`);
      // The power argument, and what stops a game buying its way out of the
      // rule by answering every re-press with a twitch: somewhere on the board
      // the repeat tap has to be the deselect.
      if (taps.away === 0)
        never.push(`${id}: ${taps.answered.length} answered otherwise, 0 deselects`);
    }
    expect(
      inert,
      "a repeat tap changed nothing — the press threw away whether the cell " +
        "was already selected, so the tap re-selected it",
    ).toEqual([]);
    expect(
      never,
      "no repeat tap anywhere on the board puts the highlight away",
    ).toEqual([]);
  });

  it("a sticky right tap never hides a showing highlight", () => {
    const hidden: string[] = [];
    const unreached: string[] = [];
    const checked: string[] = [];

    for (const { id, game } of builtGames()) {
      if (!noteTaking.ids.includes(id)) continue;
      const { m, selection, tap, reset } = member(game, id);
      if (!selection().sticky) continue; // no sticky preference, so no sticky rule
      const points = probePoints(m.preferredSize());
      /** The game's own first board element, off its keypad — what the prime
       * below puts into a cell to make it refuse a mark. */
      const element = game.requestKeys?.(game.defaultParams())?.[0]?.button ?? null;

      // A place the highlight shows, to hold it while the right tap lands
      // somewhere else. Derived by trying, never tabulated: a table of each
      // game's selectable cells is a manifest, and one that rots quietly.
      let home: Point | null = null;
      for (const p of points) {
        reset();
        tap(p, LEFT_BUTTON);
        if (selection().visible) {
          home = p;
          break;
        }
      }
      expect(home, `${id}: no tap anywhere on the board selects`).not.toBeNull();
      if (home === null) continue;

      let carveOuts = 0;
      for (const q of points) {
        // Most members have no cell that refuses a mark until the player has
        // filled one — a fresh Keen or Rome is empty everywhere the pointer can
        // reach — so the carve-out is unreachable on an untouched board. The
        // prime fills the cell the way that game's own player would: select it
        // and press the first element off its keypad, which is the one "put
        // something here" gesture every member has and none of them share the
        // spelling of. It runs only while the plain pass has not reached the
        // branch.
        for (const prime of carveOuts === 0 ? [false, true] : [false]) {
          reset();
          let filled = false;
          if (prime) {
            if (element === null) continue;
            const empty = fingerprint(m);
            tap(q, LEFT_BUTTON);
            m.processInput(0, 0, element);
            filled = fingerprint(m) !== empty;
          }
          tap(home, LEFT_BUTTON);
          const before = selection();
          if (!before.visible) continue;

          tap(q, RIGHT_BUTTON);
          const after = selection();
          if (!after.visible) hidden.push(`${id}: at (${q.x},${q.y})`);

          // The carve-out reached, proved from the two facts that define it and
          // from nothing about the highlight — which is the state under test, so
          // reading it here would make the sweep's power depend on the very
          // defect it is measuring. The cell holds something (so it refuses a
          // mark, in every member's vocabulary), and the mode switched (so the
          // sticky branch is the one that ran).
          if (filled && after.pencilMode !== before.pencilMode) carveOuts++;
        }
      }
      if (carveOuts === 0) unreached.push(id);
      checked.push(id);
    }

    // The instrument before the finding: a sweep that never reached the branch
    // rule 2 is about would pass over nothing and report health, so what the
    // sweep exercised is asserted before what it concluded.
    expect(
      unreached,
      "no sticky right tap reached the mode-switch carve-out, so the rule was " +
        "asserted over a sweep that never exercised it",
    ).toEqual([]);
    expect(checked.length).toBeGreaterThanOrEqual(12);
    expect(
      hidden,
      "a sticky right tap put the highlight away — the mode switch is not a " +
        "selection, so it must leave the highlight exactly where it was",
    ).toEqual([]);
  });
});
