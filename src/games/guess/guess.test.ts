/**
 * Tier-1 tests for the Guess Game glue: move execution + purity,
 * win/lose/reveal transitions, the `changedState` hold-carry, key
 * input mapping, and the element keypad with its tap selection. The
 * answer-row notation and the hint are `guess-hint.test.ts`'s.
 */
import { describe, expect, it } from "vitest";
import { UI_UPDATE } from "../../engine/game.ts";
import { CLEAR_BUTTON } from "../../engine/key-labels.ts";
import {
  CURSOR_SELECT,
  LEFT_BUTTON,
  LEFT_RELEASE,
  RIGHT_BUTTON,
  RIGHT_RELEASE,
} from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { decodeSave } from "../../engine/save.ts";
import { type AnyGame, probeBoard } from "../../engine/testing/input-probe.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { guessGame } from "./index.ts";
import { COL_1, pegOff } from "./render.ts";
import {
  defaultParams,
  type GuessMove,
  type GuessParams,
  type GuessState,
  type GuessUi,
  newDesc,
  newState,
  status,
} from "./state.ts";

const ZERO = { x: 0, y: 0 };

function freshGame(
  seed = "seed-X",
  params = defaultParams(),
): { state: GuessState; ui: GuessUi } {
  const { desc } = newDesc(params, randomNew(seed));
  const state = newState(params, desc);
  const ui = guessGame.newUi(state);
  guessGame.changedState?.(ui, null, state);
  return { state, ui };
}

function submit(pegs: number[], holds?: boolean[]): GuessMove {
  return { type: "guess", pegs, holds: holds ?? pegs.map(() => false) };
}

/** The buttons the panel's color keys send, read off the panel itself so a
 * test presses what a player presses. */
function colorButtons(params: GuessParams): number[] {
  const keys = guessGame.requestKeys?.(params) ?? [];
  return keys.filter((k) => k.swatch !== undefined).map((k) => k.button);
}

/** The Submit key's button, read off the panel for the same reason. */
function submitButton(params: GuessParams): number {
  const keys = guessGame.requestKeys?.(params) ?? [];
  const key = keys.find((k) => k.label === "Submit");
  if (!key) throw new Error("guess: the panel has no Submit key");
  return key.button;
}

describe("executeMove", () => {
  it("a correct guess wins", () => {
    const { state } = freshGame();
    const next = guessGame.executeMove(state, submit(state.solution.slice()));
    expect(next.solved).toBe(1);
    expect(status(next)).toBe("solved");
    // The winning row is stored at nextGo (unchanged) with all-place feedback.
    expect(next.guesses[next.nextGo].feedback.every((f) => f === 1)).toBe(true);
  });

  it("is pure (source state unchanged)", () => {
    const { state } = freshGame();
    const before = JSON.stringify(state);
    guessGame.executeMove(state, submit(state.solution.slice()));
    expect(JSON.stringify(state)).toBe(before);
  });

  it("a wrong guess advances next_go and stores feedback", () => {
    const { state } = freshGame();
    const wrong = state.solution.slice();
    wrong[0] = (wrong[0] % state.params.ncolors) + 1; // perturb one peg
    const next = guessGame.executeMove(state, submit(wrong));
    expect(next.solved).toBe(0);
    expect(next.nextGo).toBe(1);
    expect(next.guesses[0].pegs).toEqual(wrong);
  });

  it("exhausting the rows loses and reveals", () => {
    const params = { ...defaultParams(), nguesses: 1 };
    const { state } = freshGame("oneshot", params);
    const wrong = state.solution.slice();
    wrong[0] = (wrong[0] % params.ncolors) + 1;
    const next = guessGame.executeMove(state, submit(wrong));
    expect(next.solved).toBe(-1);
    expect(status(next)).toBe("lost");
  });

  it("solve reveals (give-up = loss reveal)", () => {
    const { state } = freshGame();
    const res = guessGame.solve?.(state, state);
    expect(res?.ok).toBe(true);
    if (res?.ok) {
      const next = guessGame.executeMove(state, res.move);
      expect(next.solved).toBe(-1);
      expect(status(next)).toBe("lost");
    }
  });

  it("rejects an out-of-range peg", () => {
    const { state } = freshGame();
    expect(() => guessGame.executeMove(state, submit([1, 2, 3, 99]))).toThrow();
  });
});

describe("changedState (hold-carry)", () => {
  it("carries held pegs into the next working row, clears the rest", () => {
    const { state, ui } = freshGame();
    const guess = state.solution.slice();
    guess[1] = (guess[1] % state.params.ncolors) + 1; // ensure not a win
    const holds = [true, false, false, false];
    const next = guessGame.executeMove(state, submit(guess, holds));
    guessGame.changedState?.(ui, state, next);
    expect(ui.currPegs[0]).toBe(guess[0]); // held
    expect(ui.currPegs.slice(1)).toEqual([0, 0, 0]); // cleared
    expect(ui.holds[0]).toBe(true);
  });

  it("clears the working row and holds on a win", () => {
    const { state, ui } = freshGame();
    ui.holds[0] = true;
    const next = guessGame.executeMove(
      state,
      submit(state.solution.slice(), [true, false, false, false]),
    );
    guessGame.changedState?.(ui, state, next);
    expect(ui.currPegs).toEqual([0, 0, 0, 0]);
    expect(ui.holds.every((h) => !h)).toBe(true);
  });

  it("keeps the half-composed row across a mark, and an undo of one", () => {
    // A mark is a move, and the row is not in it: rebuilding after every
    // transition would throw the row away while the player marks against it.
    const { state, ui } = freshGame();
    ui.currPegs.splice(0, 2, 3, 5);
    const marked = guessGame.executeMove(state, {
      type: "mark",
      marks: [{ pos: 0, color: 2 }],
      ruledOut: true,
    });
    guessGame.changedState?.(ui, state, marked);
    expect(ui.currPegs).toEqual([3, 5, 0, 0]);
    guessGame.changedState?.(ui, marked, state); // the undo
    expect(ui.currPegs).toEqual([3, 5, 0, 0]);
  });

  it("still rebuilds the row when an undo takes a guess back", () => {
    const { state, ui } = freshGame();
    const wrong = state.solution.slice();
    wrong[0] = (wrong[0] % state.params.ncolors) + 1;
    const next = guessGame.executeMove(state, submit(wrong));
    ui.currPegs.splice(0, 1, 4);
    guessGame.changedState?.(ui, next, state); // undo: nextGo 1 -> 0
    expect(ui.currPegs).toEqual([0, 0, 0, 0]);
  });
});

describe("the hint key belongs to the app", () => {
  it("declines h, H and ? so the app's Hint command gets them", () => {
    // Guess used to consume them for upstream's row-filler, which the app's
    // hint replaces; claimed here, the bare `h` would reach the wrong one.
    const { state, ui } = freshGame();
    const ds = preferredDrawState(guessGame, state);
    for (const key of [0x68, 0x48, 0x3f]) {
      expect(guessGame.interpretMove(state, ui, ds, ZERO, key)).toBeNull();
    }
  });
});

describe("interpretMove keyboard", () => {
  it("number keys place a peg and advance the cursor", () => {
    const { state, ui } = freshGame();
    ui.cursor.visible = true;
    const r = guessGame.interpretMove(
      state,
      ui,
      preferredDrawState(guessGame, state),
      ZERO,
      0x33 /* '3' */,
    );
    expect(r).toBeTruthy();
    expect(ui.currPegs[0]).toBe(3);
    expect(ui.cursor.x).toBe(1);
  });

  it("submit is offered only for a markable row", () => {
    const { state, ui } = freshGame();
    // Fill all pegs → markable; move cursor to submit position.
    for (let i = 0; i < state.params.npegs; i++) ui.currPegs[i] = 1;
    ui.markable = true;
    ui.cursor.x = state.params.npegs;
    ui.cursor.visible = true;
    const r = guessGame.interpretMove(
      state,
      ui,
      preferredDrawState(guessGame, state),
      ZERO,
      CURSOR_SELECT,
    );
    expect(r).toMatchObject({ type: "guess" });
  });

  it("clearing on the submit position backspaces, and never lengthens the row", () => {
    // Every other keyboard arm bounds the cursor against `npegs`; the erase arm
    // did not, and `cursor.x` *is* `npegs` the moment a row is full. Unguarded
    // it writes `currPegs[npegs]` — lengthening the row while `isMarkable`
    // (reading only the first `npegs`) still says yes — and `executeMove` then
    // rejects the guess. Upstream has the same hole; the Clear key on the panel
    // sends this very button.
    //
    // It used to be closed by *declining* the key there, which left Clear dead
    // at the moment a typo is most likely. It now rubs out the last color
    // typed, and the row still keeps its length.
    const { state, ui } = freshGame();
    const { npegs } = state.params;
    const ds = preferredDrawState(guessGame, state);
    for (const key of colorButtons(state.params).slice(0, npegs))
      guessGame.interpretMove(state, ui, ds, ZERO, key);
    expect(ui.cursor.x).toBe(npegs);
    expect(ui.markable).toBe(true);

    expect(guessGame.interpretMove(state, ui, ds, ZERO, CLEAR_BUTTON)).toBe(UI_UPDATE);
    expect(ui.currPegs).toHaveLength(npegs);
    expect(ui.currPegs[npegs - 1]).toBe(0);
    expect(ui.markable).toBe(false);

    // Again, and it walks back a second slot rather than sticking on the empty
    // one it just made.
    guessGame.interpretMove(state, ui, ds, ZERO, CLEAR_BUTTON);
    expect(ui.currPegs.slice(npegs - 2)).toEqual([0, 0]);

    // And the guess that follows still plays.
    for (const key of colorButtons(state.params).slice(0, 2))
      guessGame.interpretMove(state, ui, ds, ZERO, key);
    const move = guessGame.interpretMove(state, ui, ds, ZERO, CURSOR_SELECT);
    expect(move).toMatchObject({ type: "guess" });
    expect(() => guessGame.executeMove(state, move as GuessMove)).not.toThrow();
  });

  it("Backspace leaves a held peg alone, and stops when only holds remain", () => {
    // A held slot was carried over from the previous row rather than typed, so
    // walking back through it would undo a decision the player made with a
    // different gesture entirely.
    const { state, ui } = freshGame("backspace-holds");
    const ds = preferredDrawState(guessGame, state);
    ui.currPegs[0] = 4;
    ui.holds[0] = true;
    guessGame.interpretMove(state, ui, ds, ZERO, colorButtons(state.params)[1]);
    expect(ui.currPegs.slice(0, 2)).toEqual([4, 2]);

    guessGame.interpretMove(state, ui, ds, ZERO, CLEAR_BUTTON);
    expect(ui.currPegs.slice(0, 2)).toEqual([4, 0]);
    // Nothing left that the player typed: the key is declined rather than
    // eating the hold.
    expect(guessGame.interpretMove(state, ui, ds, ZERO, CLEAR_BUTTON)).toBeNull();
    expect(ui.currPegs[0]).toBe(4);
  });

  it("the label toggle works even after the game ends", () => {
    const { state, ui } = freshGame();
    const solved = guessGame.executeMove(state, submit(state.solution.slice()));
    const before = ui.showLabels;
    const r = guessGame.interpretMove(
      solved,
      ui,
      preferredDrawState(guessGame, solved),
      ZERO,
      0x6c /* 'l' */,
    );
    expect(r).toBeTruthy();
    expect(ui.showLabels).toBe(!before);
  });
});

describe("guess keypad", () => {
  it("offers one key per color, painted in it, then Clear and Submit", () => {
    // Pinned, so a seventh color key or a renumbered swatch fails here rather
    // than showing the player a button in a color the board does not use. No
    // Marks key: Guess takes no notes, and the engine appends that one only to
    // a game that does. Submit's 13 is `'\r'` — a code this frontend's key map
    // never sends, so the panel is its only emitter and it cannot collide with
    // a letter the app's bare-key shortcuts want.
    expect(guessGame.requestKeys?.(defaultParams())).toEqual([
      { button: 0x31, label: "1", swatch: COL_1 },
      { button: 0x32, label: "2", swatch: COL_1 + 1 },
      { button: 0x33, label: "3", swatch: COL_1 + 2 },
      { button: 0x34, label: "4", swatch: COL_1 + 3 },
      { button: 0x35, label: "5", swatch: COL_1 + 4 },
      { button: 0x36, label: "6", swatch: COL_1 + 5 },
      { button: CLEAR_BUTTON, label: "Clear" },
      { button: 13, label: "Submit" },
    ]);
  });

  it("spells the tenth color '0', and leaves Clear alone at nine", () => {
    // `digitKeys` rolls over to 'a' past nine; Guess reads the tenth color off
    // the '0' key, as upstream does, so an 'a' key here would be one the game
    // refuses — inert on the panel and invisible to `input-parity.test.ts`,
    // which sweeps the default params only. Ten colors is reachable from the
    // Custom dialog (`MAXCOLORS`).
    const ten = guessGame.requestKeys?.({ ...defaultParams(), ncolors: 10 }) ?? [];
    expect(ten.map((k) => k.label)).toEqual([
      ..."123456789".split(""),
      "0",
      "Clear",
      "Submit",
    ]);
    expect(ten.at(-3)).toEqual({ button: 0x30, label: "0", swatch: COL_1 + 9 });
    // Nine colors is the neighbor the rewrite could have clobbered: the tenth
    // *entry* there is the clear key, not a tenth color.
    const nine = guessGame.requestKeys?.({ ...defaultParams(), ncolors: 9 }) ?? [];
    expect(nine.at(-2)).toEqual({ button: CLEAR_BUTTON, label: "Clear" });
    expect(nine).toHaveLength(11);
  });

  it("names a swatch this game's own palette holds", () => {
    // The frontend resolves the index against this palette, so one past its end
    // paints the key in nothing at all.
    const palette = guessGame.colors(DEFAULT_BACKGROUND);
    for (const p of [defaultParams(), { ...defaultParams(), ncolors: 10 }]) {
      const swatches = (guessGame.requestKeys?.(p) ?? []).flatMap((k) =>
        k.swatch === undefined ? [] : [k.swatch],
      );
      expect(swatches).toHaveLength(p.ncolors);
      for (const i of swatches) expect(palette[i]).toBeDefined();
    }
  });

  it("commits a guess from panel buttons alone, with no pointer input at all", () => {
    // The question `input-parity.test.ts` structurally cannot ask: it presses
    // keys with a cursor already placed, so it would pass over a panel no
    // gesture a touch player has can reach. Guess's peg entry was drag-only
    // until the panel arrived.
    const { m } = probeBoard(guessGame as unknown as AnyGame, "guess-panel");
    const keys = m.requestKeys();
    const colors = keys.filter((k) => k.swatch !== undefined);
    expect(colors.length).toBeGreaterThanOrEqual(defaultParams().npegs);

    for (let i = 0; i < defaultParams().npegs; i++) {
      expect(m.processInput(0, 0, colors[i].button), `key ${i} was not consumed`).toBe(
        true,
      );
    }
    // Filling the working row is a `GuessUi` mutation, not a move — asserted
    // on the move log rather than on the whole save, which the row now reaches
    // through `encodeUi` and would change either way.
    expect(decodeSave(m.saveGame()).moves).toHaveLength(0);
    expect(m.processInput(0, 0, submitButton(defaultParams()))).toBe(true);
    expect(decodeSave(m.saveGame()).moves, "no guess was committed").toHaveLength(1);
  });

  it("the Submit key refuses a row that cannot be marked, and says why", () => {
    // The whole reason the status line was turned on: the submit arms answer an
    // unsubmittable row with `null`, and a key that appears to do nothing is
    // indistinguishable from one that is broken.
    const params = { ...defaultParams(), allowMultiple: false };
    const { state, ui } = freshGame("no-repeats", params);
    const ds = preferredDrawState(guessGame, state);
    const keys = colorButtons(params);
    // 1, 2, 3, 3 — a full row whose last peg repeats the one before it.
    for (const color of [0, 1, 2, 2])
      guessGame.interpretMove(state, ui, ds, ZERO, keys[color]);

    expect(ui.currPegs).toEqual([1, 2, 3, 3]);
    expect(ui.markable).toBe(false);
    expect(
      guessGame.interpretMove(state, ui, ds, ZERO, submitButton(params)),
    ).toBeNull();
    expect(guessGame.statusbarText?.(state, ui)).toContain("no repeated colors");

    // The cursor stayed on the peg that caused it, so one key fixes the row.
    guessGame.interpretMove(state, ui, ds, ZERO, keys[3]);
    expect(ui.currPegs).toEqual([1, 2, 3, 4]);
    expect(guessGame.statusbarText?.(state, ui)).not.toContain("repeated");
    expect(
      guessGame.interpretMove(state, ui, ds, ZERO, submitButton(params)),
    ).toMatchObject({ type: "guess" });
  });
});

/** Press and release on one point — the whole gesture, no drag frames. The
 * frontend delivers the release at the press point when the press is not
 * consumed (`view-interactive.ts`), so this is a tap on either path. */
function tap(state: GuessState, ui: GuessUi, x: number, y: number) {
  const ds = preferredDrawState(guessGame, state);
  guessGame.interpretMove(state, ui, ds, { x, y }, LEFT_BUTTON);
  return guessGame.interpretMove(state, ui, ds, { x, y }, LEFT_RELEASE);
}

/** The center of current-row slot `peg`. */
function slot(state: GuessState, peg: number) {
  const ds = preferredDrawState(guessGame, state);
  const off = pegOff(ds);
  return {
    x: ds.guessx + peg * off + Math.floor(ds.tileSize / 2),
    y: ds.guessy + state.nextGo * off + Math.floor(ds.tileSize / 2),
  };
}

describe("guess tap selection", () => {
  it("a tap on an empty slot selects it, and a color key then acts there", () => {
    const { state, ui } = freshGame("tap-empty");
    const target = 2;
    const { x, y } = slot(state, target);
    expect(tap(state, ui, x, y)).toBeTruthy();
    expect(ui.cursor.visible).toBe(true);
    expect(ui.cursor.x).toBe(target);

    const ds = preferredDrawState(guessGame, state);
    guessGame.interpretMove(state, ui, ds, ZERO, colorButtons(state.params)[4]);
    expect(ui.currPegs[target]).toBe(5);
  });

  it("a tap on a filled slot selects it rather than hiding the cursor", () => {
    // This is the half that was worse than a no-op: the press picked the peg
    // up, the release put the same color back and switched the cursor *off*,
    // which is the one thing a panel player must not have happen.
    const { state, ui } = freshGame("tap-filled");
    const target = 1;
    ui.currPegs[target] = 3;
    const { x, y } = slot(state, target);
    expect(tap(state, ui, x, y)).toBeTruthy();
    expect(ui.currPegs[target]).toBe(3);
    expect(ui.cursor.visible).toBe(true);
    expect(ui.cursor.x).toBe(target);
  });

  it("a tap to the left of the rows is no move at all", () => {
    // Where the palette column used to be. The board is the guess rows and the
    // feedback beside them, and nothing else: a color comes from its key. This
    // asserts the *absence*, which is the only thing that would catch a stray
    // hit test surviving the column it belonged to.
    const { state, ui } = freshGame("no-palette");
    const ds = preferredDrawState(guessGame, state);
    expect(ds.guessx).toBe(ds.border);
    const before = ui.currPegs.slice();
    for (const y of [ds.guessy, ds.guessy + ds.h / 2, ds.h - 1]) {
      expect(tap(state, ui, 1, Math.floor(y))).toBeNull();
    }
    expect(ui.currPegs).toEqual(before);
  });

  it("a held finger over the feedback pegs still submits", () => {
    const { state, ui } = freshGame("submit-hold");
    const ds = preferredDrawState(guessGame, state);
    for (const key of colorButtons(state.params).slice(0, state.params.npegs))
      guessGame.interpretMove(state, ui, ds, ZERO, key);
    expect(ui.markable).toBe(true);

    const off = pegOff(ds);
    const at = {
      x: ds.guessx + state.params.npegs * off + 2,
      y: ds.guessy + state.nextGo * off + 2,
    };
    guessGame.interpretMove(state, ui, ds, at, RIGHT_BUTTON);
    expect(guessGame.interpretMove(state, ui, ds, at, RIGHT_RELEASE)).toMatchObject({
      type: "guess",
    });
  });
});

describe("guess next-empty entry", () => {
  it("a color lands in the first open slot, so holds survive the first key", () => {
    // The defect this change was opened on. Holds on pegs 0 and 2 carry a row
    // pre-filled *out of order*; the cursor used to be reset to peg 0 and the
    // color keys used to advance by index, so the first color a player pressed
    // landed on a held peg and destroyed it. A touch player has no arrow keys
    // to escape that with.
    const { state, ui } = freshGame("holds-first-key");
    const ds = preferredDrawState(guessGame, state);
    const keys = colorButtons(state.params);
    // Panel keys only, as a touch player has: compose 1,5,3,5 …
    for (const color of [0, 4, 2, 4])
      guessGame.interpretMove(state, ui, ds, ZERO, keys[color]);
    expect(ui.currPegs).toEqual([1, 5, 3, 5]);
    // … hold pegs 0 and 2 (the long press the frontend delivers as the right
    // button), and submit.
    for (const peg of [0, 2])
      guessGame.interpretMove(state, ui, ds, slot(state, peg), RIGHT_BUTTON);
    const move = guessGame.interpretMove(
      state,
      ui,
      ds,
      ZERO,
      submitButton(state.params),
    );
    expect(move).toMatchObject({ type: "guess" });
    const next = guessGame.executeMove(state, move as GuessMove);
    expect(next.solved).toBe(0);
    guessGame.changedState?.(ui, state, next);
    expect(ui.currPegs).toEqual([1, 0, 3, 0]);
    // The player has been pressing keys, so the cursor is on screen — which is
    // what made this destructive rather than merely confusing.
    expect(ui.cursor.visible).toBe(true);

    // The cursor is parked on the first slot the holds left open, not on peg 0.
    expect(ui.cursor.x).toBe(1);
    guessGame.interpretMove(next, ui, ds, ZERO, keys[3]);
    expect(ui.currPegs).toEqual([1, 4, 3, 0]);
    guessGame.interpretMove(next, ui, ds, ZERO, keys[5]);
    expect(ui.currPegs).toEqual([1, 4, 3, 6]);
  });

  it("a selected slot wins over the first empty one, which is how a blank is placed", () => {
    // `allowBlank` makes a blank's *position* part of the probe — "blank at 2,
    // red at 3" is a different guess from "red at 2, blank at 3", because
    // Mastermind scores position. Filling the first empty slot can only ever
    // leave blanks as a suffix, so selection is what keeps the row fully
    // expressible.
    const params = { ...defaultParams(), allowBlank: true };
    const { state, ui } = freshGame("blank-in-the-middle", params);
    const ds = preferredDrawState(guessGame, state);
    const { x, y } = slot(state, 3);
    guessGame.interpretMove(state, ui, ds, { x, y }, LEFT_RELEASE);
    guessGame.interpretMove(state, ui, ds, ZERO, colorButtons(params)[0]);
    expect(ui.currPegs).toEqual([0, 0, 0, 1]);
    expect(ui.markable).toBe(true);
  });

  it("a color key is declined when the row is full and nothing is selected", () => {
    const { state, ui } = freshGame("full-row");
    const ds = preferredDrawState(guessGame, state);
    for (const key of colorButtons(state.params).slice(0, state.params.npegs))
      guessGame.interpretMove(state, ui, ds, ZERO, key);
    const filled = ui.currPegs.slice();
    ui.cursor.visible = false;
    expect(
      guessGame.interpretMove(state, ui, ds, ZERO, colorButtons(state.params)[5]),
    ).toBeNull();
    expect(ui.currPegs).toEqual(filled);
  });
});

describe("guess encodeUi / decodeUi", () => {
  it("carries a half-composed row and its holds through a save", () => {
    // Neither is in the move log — a row is only recorded once submitted, and a
    // hold only as part of the guess that carries it — so replaying the log
    // cannot recover them. Losing them mattered less when a row could be
    // composed by dragging in a second or two; composing *is* the game now.
    const { state, ui } = freshGame("encode-ui");
    const ds = preferredDrawState(guessGame, state);
    guessGame.interpretMove(state, ui, ds, ZERO, colorButtons(state.params)[2]);
    guessGame.interpretMove(state, ui, ds, slot(state, 0), LEFT_RELEASE);
    guessGame.interpretMove(state, ui, ds, slot(state, 0), RIGHT_BUTTON);
    expect(ui.currPegs).toEqual([3, 0, 0, 0]);
    expect(ui.holds).toEqual([true, false, false, false]);

    const restored = guessGame.newUi(state);
    guessGame.changedState?.(restored, null, state);
    guessGame.decodeUi?.(restored, guessGame.encodeUi?.(ui) ?? "");
    expect(restored.currPegs).toEqual(ui.currPegs);
    expect(restored.holds).toEqual(ui.holds);
    // And the restored cursor is where the next color goes, not wherever it
    // was when `newUi` built it.
    expect(restored.cursor.x).toBe(1);
  });

  it("drops a peg a save claims that this game has no color for", () => {
    const { ui } = freshGame("decode-ui-junk");
    guessGame.decodeUi?.(ui, "3,99,-1,2_");
    expect(ui.currPegs).toEqual([3, 0, 0, 2]);
    expect(ui.holds).toEqual([false, false, false, true]);
  });
});
