/**
 * Tier-1 tests for the Guess Game glue: move execution + purity,
 * win/lose/reveal transitions, the `changedState` hold-carry, the
 * hint-fills-the-working-row behavior (played end-to-end), key
 * input mapping, and the element keypad with its tap selection.
 */
import { describe, expect, it } from "vitest";
import { CLEAR_BUTTON } from "../../engine/key-labels.ts";
import {
  CURSOR_SELECT,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
} from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import {
  type AnyGame,
  fingerprint,
  probeBoard,
} from "../../engine/testing/input-probe.ts";
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
  markPegs,
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

  it("drops the cached hint on an undo (next_go decreases)", () => {
    const { state, ui } = freshGame();
    ui.hint = [1, 1, 1, 1];
    const wrong = state.solution.slice();
    wrong[0] = (wrong[0] % state.params.ncolors) + 1;
    const next = guessGame.executeMove(state, submit(wrong)); // nextGo 0 -> 1
    guessGame.changedState?.(ui, next, state); // simulate undo: new < old
    expect(ui.hint).toBeNull();
  });
});

describe("hint (compute_hint)", () => {
  it("solving by always taking the hint wins within the guess limit", () => {
    const params = defaultParams();
    let { state, ui } = freshGame("hint-solve", params);
    let guesses = 0;
    while (state.solved === 0 && guesses < params.nguesses) {
      // Press the hint key: fills ui.currPegs with a consistent row.
      const r = guessGame.interpretMove(
        state,
        ui,
        preferredDrawState(guessGame, state),
        ZERO,
        0x68 /* 'h' */,
      );
      expect(r).toBeTruthy();
      const move = submit(ui.currPegs.slice());
      state = guessGame.executeMove(state, move);
      guessGame.changedState?.(ui, state, state);
      guesses++;
    }
    expect(state.solved).toBe(1);
  });

  it("the hint row is consistent with every prior guess's feedback", () => {
    const params = defaultParams();
    const { state: s0, ui } = freshGame("hint-consistency", params);
    const s1 = guessGame.executeMove(s0, submit([1, 2, 3, 4]));
    expect(s1.nextGo).toBe(1); // scored, not won
    guessGame.changedState?.(ui, s0, s1);
    guessGame.interpretMove(s1, ui, preferredDrawState(guessGame, s1), ZERO, 0x68);
    // Consistent: had the hint row been the answer, every prior guess
    // would have scored exactly as it did.
    const hintRow = ui.currPegs.slice();
    for (const prior of s1.guesses.slice(0, s1.nextGo)) {
      const { feedback } = markPegs(prior.pegs, hintRow, params.ncolors);
      expect(feedback).toEqual(prior.feedback);
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

  it("clearing on the submit position is declined, and the row keeps its length", () => {
    // Every other keyboard arm bounds the cursor against `npegs`; the erase arm
    // did not, and `cursor.x` *is* `npegs` the moment a row is full, because
    // the digit arm advances onto the submit position. Unguarded this writes
    // `currPegs[npegs]` — lengthening the row while `isMarkable` (reading only
    // the first `npegs`) still says yes — and `executeMove` then rejects the
    // guess. Upstream has the same hole; the Clear key on the panel sends this
    // very button.
    const { state, ui } = freshGame();
    const { npegs } = state.params;
    const ds = preferredDrawState(guessGame, state);
    for (const key of colorButtons(state.params).slice(0, npegs))
      guessGame.interpretMove(state, ui, ds, ZERO, key);
    expect(ui.cursor.x).toBe(npegs);
    expect(ui.markable).toBe(true);

    expect(guessGame.interpretMove(state, ui, ds, ZERO, CLEAR_BUTTON)).toBeNull();
    expect(ui.currPegs).toHaveLength(npegs);

    // And the guess that follows still plays.
    const move = guessGame.interpretMove(state, ui, ds, ZERO, CURSOR_SELECT);
    expect(move).toMatchObject({ type: "guess" });
    expect(() => guessGame.executeMove(state, move as GuessMove)).not.toThrow();
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
  it("offers one key per color, painted in it, plus Clear", () => {
    // Pinned, so a seventh key or a renumbered swatch fails here rather than
    // showing the player a button in a color the board does not use. No Marks
    // key: Guess takes no notes, and the engine appends that one only to a game
    // that does.
    expect(guessGame.requestKeys?.(defaultParams())).toEqual([
      { button: 0x31, label: "1", swatch: COL_1 },
      { button: 0x32, label: "2", swatch: COL_1 + 1 },
      { button: 0x33, label: "3", swatch: COL_1 + 2 },
      { button: 0x34, label: "4", swatch: COL_1 + 3 },
      { button: 0x35, label: "5", swatch: COL_1 + 4 },
      { button: 0x36, label: "6", swatch: COL_1 + 5 },
      { button: CLEAR_BUTTON, label: "Clear" },
    ]);
  });

  it("spells the tenth color '0', and leaves Clear alone at nine", () => {
    // `digitKeys` rolls over to 'a' past nine; Guess reads the tenth color off
    // the '0' key, as upstream does, so an 'a' key here would be one the game
    // refuses — inert on the panel and invisible to `input-parity.test.ts`,
    // which sweeps the default params only. Ten colors is reachable from the
    // Custom dialog (`MAXCOLORS`).
    const ten = guessGame.requestKeys?.({ ...defaultParams(), ncolors: 10 }) ?? [];
    expect(ten.map((k) => k.label)).toEqual([..."123456789".split(""), "0", "Clear"]);
    expect(ten.at(-2)).toEqual({ button: 0x30, label: "0", swatch: COL_1 + 9 });
    // Nine colors is the neighbor the rewrite could have clobbered: the tenth
    // *entry* there is the clear key, not a tenth color.
    const nine = guessGame.requestKeys?.({ ...defaultParams(), ncolors: 9 }) ?? [];
    expect(nine.at(-1)).toEqual({ button: CLEAR_BUTTON, label: "Clear" });
    expect(nine).toHaveLength(10);
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
    // until this change.
    const { m } = probeBoard(guessGame as unknown as AnyGame, "guess-panel");
    const keys = m.requestKeys();
    const colors = keys.filter((k) => k.swatch !== undefined);
    expect(colors.length).toBeGreaterThanOrEqual(defaultParams().npegs);

    const before = fingerprint(m);
    for (let i = 0; i < defaultParams().npegs; i++) {
      expect(m.processInput(0, 0, colors[i].button), `key ${i} was not consumed`).toBe(
        true,
      );
    }
    // Filling the working row is a `GuessUi` mutation, not a move.
    expect(fingerprint(m)).toBe(before);
    expect(m.processInput(0, 0, CURSOR_SELECT)).toBe(true);
    expect(fingerprint(m), "no guess was committed").not.toBe(before);
  });
});

describe("guess tap selection", () => {
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

  it("dragging a color onto a slot still places it", () => {
    // The gesture this change must not cost: the drag is still the way a mouse
    // player enters a peg, and it leaves no keyboard chrome behind.
    const { state, ui } = freshGame("drag-place");
    const ds = preferredDrawState(guessGame, state);
    const off = pegOff(ds);
    const from = { x: ds.colx + 2, y: ds.coly + 2 * off + 2 }; // color 3
    const to = slot(state, 0);
    guessGame.interpretMove(state, ui, ds, from, LEFT_BUTTON);
    guessGame.interpretMove(state, ui, ds, to, LEFT_DRAG);
    guessGame.interpretMove(state, ui, ds, to, LEFT_RELEASE);
    expect(ui.currPegs[0]).toBe(3);
    expect(ui.cursor.visible).toBe(false);
  });

  it("dragging a peg out of the row still clears it", () => {
    const { state, ui } = freshGame("drag-clear");
    ui.currPegs[0] = 4;
    const ds = preferredDrawState(guessGame, state);
    const away = { x: ds.colx + 2, y: ds.coly + 2 };
    guessGame.interpretMove(state, ui, ds, slot(state, 0), LEFT_BUTTON);
    guessGame.interpretMove(state, ui, ds, away, LEFT_DRAG);
    guessGame.interpretMove(state, ui, ds, away, LEFT_RELEASE);
    expect(ui.currPegs[0]).toBe(0);
  });
});
