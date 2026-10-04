// `Puzzle.currentParams` is what labels the type menu, describes the type in the
// share dialog, and keys the keypad/view re-renders. It must therefore be the
// **full** params of the board on screen, difficulty included.
//
// Drives the notification handler directly against a Puzzle built without a
// worker, the way `puzzle-hint-stepper.test.ts` does.
import { describe, expect, it } from "vitest";
import type { ChangeNotification, PuzzleStaticAttributes } from "../engine/types.ts";
import { Puzzle } from "./puzzle.ts";
import type { RemoteWorkerPuzzle } from "./worker.ts";

const ATTRS: PuzzleStaticAttributes = {
  canSolve: false,
  canHint: false,
  canCheck: false,
  hasReference: false,
  canMarkAll: false,
  ignoresSecondaryButton: false,
  wantsStatusbar: false,
  paletteScheme: { board: 0, darkSwaps: [] },
};

/** A Puzzle around a stub worker: `notifyChange` touches only its own signals,
 * so nothing else needs to exist. Same construction as
 * `puzzle-hint-stepper.test.ts` — the private constructor is bypassed via
 * `Reflect.construct` (TS `private` is compile-time only) and neither
 * `initialize()` nor `delete()` is ever called. */
function makePuzzle(): {
  puzzle: Puzzle;
  notify: (m: ChangeNotification) => Promise<void>;
} {
  const puzzle = Reflect.construct(Puzzle, [
    "test",
    {} as unknown as Worker,
    {} as unknown as RemoteWorkerPuzzle,
    ATTRS,
  ]) as Puzzle;
  const notify = (
    puzzle as unknown as { notifyChange: (m: ChangeNotification) => Promise<void> }
  ).notifyChange;
  return { puzzle, notify: (m) => notify(m) };
}

const idChange = (currentGameId: string): ChangeNotification => ({
  type: "game-id-change",
  currentGameId,
});

describe("Puzzle.currentParams", () => {
  it("is the game id's params, difficulty included", async () => {
    const { puzzle, notify } = makePuzzle();
    await notify(idChange("10x10dn:board"));
    expect(puzzle.currentParams).toBe("10x10dn");
  });

  it("is undefined before any board has been dealt", async () => {
    const { puzzle } = makePuzzle();
    expect(puzzle.currentParams).toBeNull();
  });

  it("follows the board when the difficulty changes", async () => {
    // Guards against a cached first value: the label has to track re-deals, not
    // just be right once.
    const { puzzle, notify } = makePuzzle();
    await notify(idChange("10x10dn:a"));
    await notify(idChange("10x10dt:b"));
    expect(puzzle.currentParams).toBe("10x10dt");
  });
});
