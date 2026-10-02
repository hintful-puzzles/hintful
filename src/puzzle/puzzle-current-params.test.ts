// `Puzzle.currentParams` is what labels the type menu, describes the type in the
// share dialog, and keys the keypad/view re-renders. It must therefore be the
// **full** params of the board on screen, difficulty included.
//
// The trap is the sharing id, whose params are lossy: read off it, Unruly at
// 10x10 Normal came back labeled with a tier its preset menu does not offer.
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

/** The two ids a dealt board produces, as `Midend.emitIdChange` builds them: a
 * lossy sharing id and a full-params restore id. */
function idChange(opts: {
  short: string;
  full: string;
  desc: string;
}): ChangeNotification {
  return {
    type: "game-id-change",
    currentGameId: `${opts.short}:${opts.desc}`,
    restoreGameId: `${opts.full}:${opts.desc}`,
  };
}

describe("Puzzle.currentParams", () => {
  it("keeps the difficulty the sharing id drops", async () => {
    // Reading the short id reports "10x10", which the type menu renders as the
    // default tier.
    const { puzzle, notify } = makePuzzle();
    await notify(idChange({ short: "10x10", full: "10x10dn", desc: "board" }));
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
    await notify(idChange({ short: "10x10", full: "10x10dn", desc: "a" }));
    await notify(idChange({ short: "10x10", full: "10x10dt", desc: "b" }));
    expect(puzzle.currentParams).toBe("10x10dt");
  });
});
