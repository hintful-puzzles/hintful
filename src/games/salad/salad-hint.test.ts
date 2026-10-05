/**
 * Salad's explained hint (tier 1 — pure logic).
 *
 * What the cross-game guards already cover, and this file therefore does not
 * repeat: convergence from any mid-game position, plan purity and no-op-free
 * plans (`hint-resume.test.ts`), the overlay reaching the render cache
 * (`hint-overlay.test.ts`) and narration form (`hint-quality.test.ts`) — Salad is
 * enrolled in `testing/hint-games.ts`, which buys all three.
 *
 * What is here: that each of Salad's three signature techniques actually fires
 * and narrates its own deduction, that one firing reads as one journey, that
 * every narration arm is exercised (including the two `forced*` backstops that a
 * 60-board sweep never reached), that the refusals fire, and that the recorder
 * cannot touch the board the generator sees.
 */
import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { narrate, premise, type SaladHint } from "./hint.ts";
import { saladGame } from "./index.ts";
import { recordSaladDeductions, saladSolution } from "./solver.ts";
import {
  CIRCLE,
  CROSS,
  DIFF_EASY,
  DIFF_HARD,
  GAMEMODE_LETTERS,
  GAMEMODE_NUMBERS,
  newState,
  type SaladMove,
  type SaladParams,
  type SaladState,
  scratchBoard,
  symbolChar,
} from "./state.ts";

const LETTERS: SaladParams = {
  order: 5,
  nums: 3,
  mode: GAMEMODE_LETTERS,
  diff: DIFF_EASY,
};
const NUMBERS: SaladParams = {
  order: 5,
  nums: 3,
  mode: GAMEMODE_NUMBERS,
  diff: DIFF_EASY,
};

function board(p: SaladParams, seed: string): SaladState {
  const { desc } = saladGame.newDesc(p, randomNew(seed));
  return newState(p, desc);
}

/** Walk hints from a fresh board, applying each plan's first step, collecting
 * every narration seen along the way. */
function walk(
  p: SaladParams,
  seed: string,
  cap = 400,
): { texts: string[]; steps: HintStep<unknown, SaladHint>[]; solved: boolean } {
  let state = board(p, seed);
  const texts: string[] = [];
  const steps: HintStep<unknown, SaladHint>[] = [];
  for (let i = 0; i < cap && saladGame.status(state) === "ongoing"; i++) {
    const res = saladGame.hint?.(state);
    if (!res?.ok) break;
    for (const s of res.steps) {
      texts.push(s.explanation);
      steps.push(s as HintStep<unknown, SaladHint>);
    }
    state = saladGame.executeMove(state, res.steps[0].move);
  }
  return { texts, steps, solved: saladGame.status(state) === "solved" };
}

type Step = HintStep<SaladMove, SaladHint>;

const isMarker = (step: Step): boolean =>
  step.move.type === "set" && typeof step.move.value === "string";
const ghostOf = (step: Step) => (step.highlights as SaladHint).ghost;

/**
 * Every rung on a position whose plan speaks it, and the entries a step
 * previews. The three signature techniques are the border's two rungs (near
 * the clue and past its reach), a line's two counts, and the note collapse; a
 * sentence that names letters is spoken only on a letters board, and one that
 * names numbers only on a numbers board.
 */
const pinned = describeHintPins({
  game: saladGame,
  params: [
    LETTERS,
    NUMBERS,
    { ...LETTERS, diff: DIFF_HARD },
    { ...NUMBERS, diff: DIFF_HARD },
  ],
  unreached: {
    note: "it is the implicit reading's step, and Salad's plan sets its notes up itself and always walks the populate reading (`buildSteps`'s `setUp`)",
    regionsFull:
      "it is how a single reads on a square with no notes; held on 0 of 2570 positions walked on these 48 boards, where every single follows the populate step",
  },
  kinds: {
    // A marker step previews the entry it asks for, a placement its symbol.
    marker: (step) => isMarker(step),
    previewsCross: (step) => ghostOf(step) === "cross",
    previewsCircle: (step) => ghostOf(step) === "circle",
    previewsNumber: (step) => typeof ghostOf(step) === "number",
  },
  pins: {
    /** Held on 876 of 2570 positions walked. */
    marker: "5n3Bde:dXbXb2a1aX1bOb3c",
    /** Held on 410 of 2570 positions walked. */
    previewsCross: "5n3Bde:bXc1ObOg2113Ob",
    /** Held on 466 of 2570 positions walked. */
    previewsCircle: "5n3Bde:dXbXb2a1aX1bOb3c",
    /** Held on 621 of 2570 positions walked. */
    previewsNumber: {
      id: "5n3Bde:Oa2b1bOd3b1Xc2bO",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":1},{"x":0,"y":0,"n":2},{"x":1,"y":0,"n":1},{"x":1,"y":0,"n":2},{"x":3,"y":0,"n":2},{"x":3,"y":0,"n":3},{"x":4,"y":0,"n":2},{"x":1,"y":1,"n":1},{"x":1,"y":1,"n":2},{"x":2,"y":1,"n":1},{"x":2,"y":1,"n":2},{"x":3,"y":1,"n":1},{"x":3,"y":1,"n":3},{"x":4,"y":1,"n":1},{"x":0,"y":2,"n":1},{"x":0,"y":2,"n":3},{"x":1,"y":2,"n":1},{"x":1,"y":2,"n":2},{"x":1,"y":2,"n":3},{"x":2,"y":2,"n":2},{"x":2,"y":2,"n":3},{"x":4,"y":2,"n":3},{"x":0,"y":3,"n":1},{"x":3,"y":3,"n":1},{"x":3,"y":3,"n":3},{"x":4,"y":3,"n":1},{"x":0,"y":4,"n":1},{"x":0,"y":4,"n":2},{"x":2,"y":4,"n":2},{"x":3,"y":4,"n":2},{"x":3,"y":4,"n":3},{"x":4,"y":4,"n":2}]}]',
    },
    /** Held on 144 of 2570 positions walked. */
    populate: "5n3Lde:AbCAbCbBaAAaBd,y",
    /** Held on 599 of 2570 positions walked. */
    clean: { id: "5n3Bde:Oa2b1bOd3b1Xc2bO", moves: [{ type: "pencilAll" }] },
    /** Held on 2354 of 2570 positions walked. */
    dup: "5n3Lde:AbCAbCbBaAAaBd,y",
    /** Held on 2570 of 2570 positions walked. */
    single: {
      id: "5n3Bde:Oa2b1bOd3b1Xc2bO",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":1},{"x":0,"y":0,"n":2},{"x":1,"y":0,"n":1},{"x":1,"y":0,"n":2},{"x":3,"y":0,"n":2},{"x":3,"y":0,"n":3},{"x":4,"y":0,"n":2},{"x":1,"y":1,"n":1},{"x":1,"y":1,"n":2},{"x":2,"y":1,"n":1},{"x":2,"y":1,"n":2},{"x":3,"y":1,"n":1},{"x":3,"y":1,"n":3},{"x":4,"y":1,"n":1},{"x":0,"y":2,"n":1},{"x":0,"y":2,"n":3},{"x":1,"y":2,"n":1},{"x":1,"y":2,"n":2},{"x":1,"y":2,"n":3},{"x":2,"y":2,"n":2},{"x":2,"y":2,"n":3},{"x":4,"y":2,"n":3},{"x":0,"y":3,"n":1},{"x":3,"y":3,"n":1},{"x":3,"y":3,"n":3},{"x":4,"y":3,"n":1},{"x":0,"y":4,"n":1},{"x":0,"y":4,"n":2},{"x":2,"y":4,"n":2},{"x":3,"y":4,"n":2},{"x":3,"y":4,"n":3},{"x":4,"y":4,"n":2}]}]',
    },
    /** Held on 1342 of 2570 positions walked. */
    hiddenSingle: {
      id: "5n3Bde:bOa21a3b3cOaOf3a",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":1},{"x":0,"y":0,"n":2},{"x":0,"y":0,"n":3},{"x":1,"y":0,"n":2},{"x":2,"y":0,"n":2},{"x":2,"y":0,"n":3},{"x":3,"y":0,"n":2},{"x":3,"y":0,"n":3},{"x":1,"y":1,"n":1},{"x":1,"y":1,"n":3},{"x":3,"y":1,"n":1},{"x":3,"y":1,"n":3},{"x":4,"y":1,"n":1},{"x":4,"y":1,"n":2},{"x":4,"y":1,"n":3},{"x":1,"y":2,"n":3},{"x":2,"y":2,"n":3},{"x":3,"y":2,"n":3},{"x":4,"y":2,"n":2},{"x":4,"y":2,"n":3},{"x":0,"y":3,"n":1},{"x":0,"y":3,"n":3},{"x":2,"y":3,"n":3},{"x":3,"y":3,"n":3},{"x":4,"y":3,"n":2},{"x":0,"y":4,"n":1},{"x":0,"y":4,"n":3},{"x":1,"y":4,"n":3},{"x":2,"y":4,"n":3},{"x":4,"y":4,"n":2},{"x":4,"y":4,"n":3}]},{"type":"set","x":2,"y":0,"value":1},{"type":"set","x":4,"y":2,"value":1},{"type":"set","x":0,"y":0,"value":"cross"},{"type":"set","x":4,"y":1,"value":"cross"},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":1},{"x":3,"y":0,"n":1},{"x":1,"y":2,"n":1},{"x":2,"y":2,"n":1},{"x":3,"y":2,"n":1},{"x":2,"y":3,"n":1},{"x":4,"y":3,"n":1},{"x":2,"y":4,"n":1},{"x":4,"y":4,"n":1}]},{"type":"set","x":3,"y":0,"value":"cross"},{"type":"set","x":1,"y":0,"value":"circle"},{"type":"set","x":4,"y":4,"value":"cross"},{"type":"set","x":4,"y":3,"value":"circle"},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":4},{"x":4,"y":3,"n":4}]},{"type":"set","x":1,"y":0,"value":3},{"type":"set","x":4,"y":3,"value":3},{"type":"pencilStrike","marks":[{"x":1,"y":3,"n":3}]}]',
    },
    /** Held on 440 of 2570 positions walked. */
    set: {
      id: "5n3Ldx:bCAbBBCbAdCCBa,y",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":1},{"x":0,"y":1,"n":3}]},{"type":"pencilStrike","marks":[{"x":3,"y":1,"n":2},{"x":4,"y":1,"n":2}]},{"type":"pencilStrike","marks":[{"x":1,"y":4,"n":2},{"x":1,"y":4,"n":3}]},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":1},{"x":1,"y":0,"n":1}]},{"type":"pencilStrike","marks":[{"x":4,"y":1,"n":1}]},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":3}]},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":1},{"x":2,"y":0,"n":2}]},{"type":"pencilStrike","marks":[{"x":2,"y":3,"n":3},{"x":2,"y":4,"n":3}]},{"type":"pencilStrike","marks":[{"x":0,"y":2,"n":1},{"x":0,"y":2,"n":3}]},{"type":"pencilStrike","marks":[{"x":3,"y":2,"n":2},{"x":4,"y":2,"n":2}]},{"type":"pencilStrike","marks":[{"x":4,"y":2,"n":1}]},{"type":"pencilStrike","marks":[{"x":1,"y":2,"n":3}]},{"type":"pencilStrike","marks":[{"x":3,"y":0,"n":2},{"x":3,"y":0,"n":3}]},{"type":"pencilStrike","marks":[{"x":3,"y":3,"n":1},{"x":3,"y":4,"n":1}]},{"type":"pencilStrike","marks":[{"x":0,"y":3,"n":1},{"x":0,"y":3,"n":2}]},{"type":"pencilStrike","marks":[{"x":3,"y":3,"n":3},{"x":4,"y":3,"n":3}]},{"type":"pencilStrike","marks":[{"x":4,"y":3,"n":1}]},{"type":"pencilStrike","marks":[{"x":1,"y":3,"n":2}]}]',
    },
    /** Held on 981 of 2570 positions walked. */
    borderNear: { id: "5n3Lde:AbCAbCbBaAAaBd,y", moves: [{ type: "pencilAll" }] },
    /** Held on 984 of 2570 positions walked. */
    borderFar: {
      id: "5n3Lde:AbCAbCbBaAAaBd,y",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":2},{"x":0,"y":0,"n":3}]}]',
    },
    /** Held on 2228 of 2570 positions walked. */
    countHolesDone: "5n3Bde:dXbXb2a1aX1bOb3c",
    /** Held on 2211 of 2570 positions walked. */
    countLettersDone: "5n3Bde:bXc1ObOg2113Ob",
    /** Held on 1976 of 2570 positions walked. */
    crossNaked: {
      id: "5n3Lde:aBaAbAaBcCaCBd,y",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":4,"y":0,"n":1},{"x":4,"y":0,"n":3}]},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":2},{"x":0,"y":0,"n":2}]},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":1},{"x":1,"y":0,"n":3}]}]',
    },
    /** Held on 12 of 2570 positions walked. */
    forcing: {
      id: "5n3Bdx:2dXOa1aXa2XbObX1aXb",
      moves:
        '[{"type":"set","x":1,"y":2,"value":"circle"},{"type":"set","x":4,"y":2,"value":"circle"},{"type":"set","x":0,"y":3,"value":"circle"},{"type":"set","x":1,"y":0,"value":"cross"},{"type":"set","x":1,"y":4,"value":"cross"},{"type":"set","x":3,"y":4,"value":"circle"},{"type":"set","x":4,"y":4,"value":"circle"},{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":2},{"x":3,"y":0,"n":1},{"x":3,"y":0,"n":2},{"x":4,"y":0,"n":2},{"x":1,"y":1,"n":1},{"x":2,"y":1,"n":1},{"x":2,"y":1,"n":2},{"x":4,"y":1,"n":1},{"x":1,"y":2,"n":2},{"x":4,"y":2,"n":2},{"x":0,"y":3,"n":1},{"x":0,"y":3,"n":2},{"x":2,"y":3,"n":2},{"x":3,"y":3,"n":1},{"x":3,"y":4,"n":1},{"x":4,"y":4,"n":1}]},{"type":"set","x":0,"y":3,"value":3},{"type":"pencilStrike","marks":[{"x":1,"y":3,"n":3},{"x":2,"y":3,"n":3},{"x":3,"y":3,"n":3}]}]',
    },
    /**
     * Kept by hand: held on 0 of 2570 positions walked. A set crosses an
     * empty-square mark out on this board, and the last move before this
     * position is that strike.
     */
    xNoteGone: {
      id: "5n3Bdx:c2b1aOXbXb3c1OOc",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":2},{"x":0,"y":0,"n":3},{"x":1,"y":0,"n":1},{"x":1,"y":0,"n":2},{"x":2,"y":0,"n":2},{"x":4,"y":0,"n":1},{"x":4,"y":0,"n":2},{"x":0,"y":1,"n":1},{"x":0,"y":1,"n":3},{"x":2,"y":1,"n":1},{"x":3,"y":1,"n":1},{"x":3,"y":1,"n":2},{"x":0,"y":2,"n":3},{"x":1,"y":2,"n":1},{"x":3,"y":2,"n":2},{"x":4,"y":2,"n":1},{"x":1,"y":3,"n":1},{"x":1,"y":3,"n":3},{"x":2,"y":3,"n":1},{"x":2,"y":3,"n":3},{"x":3,"y":3,"n":1},{"x":3,"y":3,"n":2},{"x":3,"y":3,"n":3},{"x":0,"y":4,"n":3},{"x":1,"y":4,"n":1},{"x":3,"y":4,"n":2},{"x":4,"y":4,"n":1}]},{"type":"set","x":3,"y":1,"value":3},{"type":"set","x":3,"y":3,"value":"cross"},{"type":"pencilStrike","marks":[{"x":2,"y":1,"n":3},{"x":3,"y":2,"n":3},{"x":3,"y":4,"n":3}]},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":4}]}]',
    },
    /** Held on 2301 of 2570 positions walked. */
    circleXNote: {
      id: "5n3Bde:Xb3aXb2c1b2Xd2bO",
      moves:
        '[{"type":"set","x":0,"y":2,"value":"circle"},{"type":"set","x":0,"y":4,"value":"circle"},{"type":"set","x":2,"y":4,"value":"cross"},{"type":"set","x":3,"y":4,"value":"cross"},{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":2},{"x":1,"y":0,"n":3},{"x":2,"y":0,"n":1},{"x":2,"y":0,"n":3},{"x":4,"y":0,"n":3},{"x":1,"y":1,"n":2},{"x":2,"y":1,"n":1},{"x":2,"y":1,"n":2},{"x":4,"y":1,"n":2},{"x":0,"y":2,"n":1},{"x":0,"y":2,"n":2},{"x":1,"y":2,"n":1},{"x":1,"y":2,"n":2},{"x":3,"y":2,"n":1},{"x":3,"y":2,"n":2},{"x":3,"y":2,"n":3},{"x":4,"y":2,"n":1},{"x":2,"y":3,"n":1},{"x":2,"y":3,"n":2},{"x":3,"y":3,"n":2},{"x":3,"y":3,"n":3},{"x":4,"y":3,"n":2},{"x":0,"y":4,"n":2},{"x":4,"y":4,"n":2}]},{"type":"set","x":0,"y":2,"value":3},{"type":"set","x":3,"y":2,"value":"cross"},{"type":"set","x":3,"y":3,"value":"circle"}]',
    },
  },
});

describe("salad hint — the three signature techniques", () => {
  it("never emits a step it cannot name a technique for", () => {
    // The standing bar: no "just because" fallback (docs/games/solver-and-generator.md § "Guess-free generation"). Every
    // narration must match one of the arms the game knows how to say.
    const KNOWN =
      /(sees [A-C1-9] first|empty squares?, so this square and the rest|and the rest of it must be empty|empty-square mark is the only one left|no (letter|number) can still go here|can't be empty: it must hold|cross out (?:their|its) empty-square marks?|ruled out in this square|square in this (?:row|column) rules out|too, for the same (?:row|column)|together, only|just placed |already accounts? for|Following a chain|Start by penciling|Now clear the easy ones)/;
    for (const p of [LETTERS, NUMBERS, { ...LETTERS, diff: DIFF_HARD }]) {
      for (const t of walk(p, "bar-1").texts) {
        expect(t, `unnamed technique: ${t}`).toMatch(KNOWN);
      }
    }
  });
});

describe("salad hint — journeys and highlights", () => {
  it("one line-count firing settling several squares is one journey", () => {
    // A count deduction settles every still-unsettled square of its line at
    // once; those legs must read as one multi-leg hint, not N unrelated ones
    // (quality-bar rule 2). Note two *different* lines produce word-for-word the
    // same narration, so sameness of text proves nothing — the flag is what
    // separates one firing from the next, and a flagged leg must always name
    // its own firing's line as its basis.
    let journeys = 0;
    for (const seed of ["j1", "j2", "j3", "j4"]) {
      let state = board(NUMBERS, seed);
      for (let i = 0; i < 60 && saladGame.status(state) === "ongoing"; i++) {
        const res = saladGame.hint?.(state);
        if (!res?.ok) break;
        for (let k = 1; k < res.steps.length; k++) {
          const prev = res.steps[k - 1];
          const cur = res.steps[k];
          const isMarker =
            (cur.move as { type: string; value?: unknown }).type === "set" &&
            typeof (cur.move as { value?: unknown }).value === "string";
          if (!isMarker || !cur.continuesPrevious) continue;
          // A continuation leg of a marker journey is the same firing, so it
          // rests on the same line — never glued to an unrelated deduction.
          expect(cur.explanation).toMatch(
            /^…and this square must (hold a number|be empty) too, for the same (row|column)\.$/,
          );
          expect((cur.highlights as SaladHint).area).toEqual(
            (prev.highlights as SaladHint).area,
          );
          journeys++;
        }
        state = saladGame.executeMove(state, res.steps[0].move);
      }
    }
    expect(journeys, "no multi-square marker journey was seen").toBeGreaterThan(0);
  });

  it("a border step highlights its clue and the run it reasons over", () => {
    let near = 0;
    let far = 0;
    for (const seed of ["h1", "h2", "h3"]) {
      for (const step of walk(LETTERS, seed).steps) {
        if (step.rung !== "borderNear" && step.rung !== "borderFar") continue;
        const hl = step.highlights as SaladHint;
        // The premise is only visible if the clue itself is lit.
        expect(hl.clues.length).toBe(1);
        expect(hl.area.length).toBeGreaterThan(0);
        const inArea = (t: { x: number; y: number }): boolean =>
          hl.area.some((a) => a.x === t.x && a.y === t.y);
        if (step.rung === "borderFar") {
          // Both far arms conclude about squares past the outlined run, which
          // is where the clue's symbol *can* be; the struck squares lie
          // beyond it, which is exactly the deduction.
          for (const t of hl.targets) expect(inArea(t)).toBe(false);
          far++;
        } else {
          // The near arm outlines the squares it walks across, known empty; the
          // square it decides is outlined too only when it is the whole premise,
          // the one the clue sees straight away ("this square is nearest to it").
          const whole = /nearest to it/.test(step.explanation);
          for (const t of hl.targets) expect(inArea(t)).toBe(whole);
          near++;
        }
      }
    }
    expect(near).toBeGreaterThan(0);
    expect(far).toBeGreaterThan(0);
  });
});

describe("salad hint — narration arms", () => {
  const s = { mode: GAMEMODE_LETTERS, order: 5, nums: 3 };

  it("names a blocking ball when that is what bounds a clue's reach", () => {
    const t = premise(
      {
        kind: "borderFar",
        clue: 5,
        clueVal: 3,
        reach: 2,
        holes: 2,
        tightenedBy: 0,
        circleAt: 7,
      },
      [{ x: 4, y: 3, n: 3 }],
      s,
    );
    expect(t.premise.text).toMatch(
      /outlined square furthest from it already holds a letter/,
    );
    expect(t.premise.text).toMatch(/keeps the C somewhere in the outlined run/);
    // Past the blocking square, which the conclusion names.
    expect(t.where).toBe("past it");
  });

  it("reads correctly where a line holds exactly one empty square", () => {
    // The degenerate extreme: `nums = order − 1`.
    const tight = { mode: GAMEMODE_NUMBERS, order: 4, nums: 3 };
    expect(
      narrate(
        { kind: "countHolesDone", line: "row", index: 0 },
        { x: 1, y: 0, n: 0 },
        tight,
      ).text,
    ).toBe(
      "This row already has its one empty square, so this square and the rest of it must hold a number.",
    );
    expect(
      premise(
        {
          kind: "borderFar",
          clue: 4,
          clueVal: 1,
          reach: 0,
          holes: 1,
          tightenedBy: 1,
          circleAt: null,
        },
        [{ x: 0, y: 3, n: 1 }],
        { mode: GAMEMODE_LETTERS, order: 4, nums: 3 },
      ).premise.text,
    ).toMatch(
      /one of them is already marked later in the row, which keeps the A in the square nearest the clue$/,
    );
  });

  it("speaks each mode's own value vocabulary", () => {
    expect(symbolChar(GAMEMODE_LETTERS, 3)).toBe("C");
    expect(symbolChar(GAMEMODE_NUMBERS, 3)).toBe("3");
    const one = { x: 0, y: 0, n: 1 };
    expect(narrate({ kind: "single" }, one, s).text).toBe(
      "Every other letter has been ruled out in this square, so it can only be A.",
    );
    expect(
      narrate({ kind: "single" }, one, { ...s, mode: GAMEMODE_NUMBERS }).text,
    ).toBe(
      "Every other number has been ruled out in this square, so it can only be 1.",
    );
    // The shared `dup` arm names the placed value in the mode's own symbols.
    const struck = (n: number) => [{ x: 2, y: 0, n }];
    expect(
      premise({ kind: "dup", n: 1, px: 0, py: 0 }, struck(1), s).premise.text,
    ).toMatch(/^The A just placed /);
    expect(
      premise({ kind: "dup", n: 2, px: 0, py: 0 }, struck(2), s).premise.text,
    ).toMatch(/^The B just placed /);
  });
});

describe("salad hint — refusals and resumption", () => {
  it("counts a solved board as finished, so the midend refuses it", () => {
    const state = board(LETTERS, "r1");
    const res = saladGame.solve?.(state, state);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    expect(saladGame.status(saladGame.executeMove(state, res.move))).toBe("solved");
  });

  it("flags a symbol the solution contradicts, so the midend refuses it", () => {
    const state = board(LETTERS, "r2");
    const soln = saladSolution(state);
    expect(soln).not.toBeNull();
    // Write a symbol the unique solution contradicts.
    let wrong: SaladState | null = null;
    for (let i = 0; i < state.order * state.order && !wrong; i++) {
      if (state.gridclues[i] !== 0) continue;
      for (let n = 1; n <= state.nums; n++) {
        if (n === (soln as number[])[i]) continue;
        wrong = saladGame.executeMove(state, {
          type: "set",
          x: i % state.order,
          y: (i / state.order) | 0,
          value: n,
        });
        break;
      }
    }
    expect(wrong).not.toBeNull();
    expect(saladGame.findMistakes?.(wrong as SaladState).length ?? 0).toBeGreaterThan(
      0,
    );
  });

  it("resumes from a partly-followed plan without repeating or stalling", () => {
    const state = board(LETTERS, "r3");
    const first = saladGame.hint?.(state);
    expect(first?.ok).toBe(true);
    if (!first?.ok) return;
    // Play the plan's first two steps by hand — the app drops the stored plan on
    // a self-played move, so the next request recomputes.
    let after = state;
    const played = first.steps.slice(0, 2);
    for (const s of played) after = saladGame.executeMove(after, s.move);
    const again = saladGame.hint?.(after);
    expect(again?.ok).toBe(true);
    if (!again?.ok) return;
    const key = (m: unknown): string => JSON.stringify(m);
    for (const s of played) {
      expect(again.steps.some((n) => key(n.move) === key(s.move))).toBe(false);
    }
    // And it still makes progress.
    const next = saladGame.executeMove(after, again.steps[0].move);
    expect(key(next)).not.toBe(key(after));
  });

  /**
   * A circle's own firing strikes the square's empty-square note in the same
   * journey, but a circle can reach the board without that leg: the player
   * puts it there, or takes a circle step and then goes their own way. The note
   * then hid the placement behind it, and the plan threw rather than strike it.
   * Both boards are pinned as descs, the input the plan consumes, from a
   * random-play sweep that found them.
   */
  it("strikes the empty-square note of its own circle, once recomputed", () => {
    // Walking the plan one first step at a time takes each circle without the
    // leg that tidies it.
    const own = descWalk("8n5Bde:c13c13aXXdX52f3b42f5aX4bXc3aOOb24a21bOXaX");
    expect(own.solved).toBe(true);
    expect(own.texts.some((t) => /empty-square mark/.test(t))).toBe(true);
  });

  it("strikes the empty-square note of the player's circle", () => {
    // The circle is right, so the hint has no mistake to refuse on.
    const played = descWalk("8n5Lde:aDaEBcBaEAaEdEADDcCDaABBA,uCeBlXeDbXaXl", [
      { type: "pencilAll" },
      { type: "pencil", x: 2, y: 6, value: "circle" },
    ]);
    expect(played.first).toMatch(/This square is now known to hold/);
    expect(played.solved).toBe(true);
  });
});

describe("salad hint — a square a set rules out as empty", () => {
  // The three outlined squares of column 2 can hold only a 2 and the column's
  // two empty squares, so its other squares hold numbers, and the 1 of row 0
  // has one square left only once that is on the board. No count says it.
  const BOARD = "5n3Bdx:c2b1aOXbXb3c1OOc";

  it("crosses the empty-square mark out, then marks the ball", () => {
    const { state, step } = pinned("xNoteGone");
    expect(step.move).toEqual({ type: "set", x: 2, y: 0, value: "circle" });
    // The mark is gone from the square's notes, and its symbols are not.
    const notes = state.pencil[2];
    expect(notes & (1 << state.nums)).toBe(0);
    expect(notes).not.toBe(0);
    expect(step.explanation).toBe(
      "This square's pencil marks have no empty-square mark among them, so it must hold a number.",
    );
  });

  it("names the line whose empty squares the set holds", () => {
    const walked = descWalk(BOARD);
    expect(walked.solved).toBe(true);
    expect(walked.texts).toContain(
      "The outlined squares account for both empty squares of their column, so we must cross out the X here.",
    );
  });

  it("names the symbols a set strikes with the mark", () => {
    const t = premise(
      {
        kind: "set",
        cells: [
          { x: 2, y: 1 },
          { x: 2, y: 2 },
          { x: 2, y: 3 },
        ],
      },
      [
        { x: 2, y: 4, n: 2 },
        { x: 2, y: 4, n: 4 },
      ],
      { mode: GAMEMODE_NUMBERS, order: 5, nums: 3 },
    );
    expect(t.premise.text).toBe(
      "The outlined squares account for 2 and both empty squares of their column",
    );
    expect(t.struck).toBe("2 and the X here");
  });

  it("names the lines of a set that spans several", () => {
    // The empty squares of rows 0 and 3 lie in columns 1 and 4 alone, so those
    // columns' empty squares are all in the four outlined squares.
    const t = premise(
      {
        kind: "set",
        cells: [
          { x: 1, y: 0 },
          { x: 4, y: 0 },
          { x: 1, y: 3 },
          { x: 4, y: 3 },
        ],
      },
      [{ x: 1, y: 2, n: 4 }],
      { mode: GAMEMODE_NUMBERS, order: 5, nums: 3 },
    );
    expect(t.premise.text).toBe(
      "The outlined squares account for both empty squares of each of their columns",
    );
  });

  it("prints the empty-square mark as the X it is penciled as", () => {
    // Where a line has one empty square the mark is an ordinary candidate, and
    // a chain may run through it.
    const t = premise(
      {
        kind: "forcing",
        chain: [
          { x: 0, y: 0, n: 1 },
          { x: 0, y: 2, n: 4 },
        ],
        shares: "row",
      },
      [{ x: 3, y: 0, n: 4 }],
      { mode: GAMEMODE_LETTERS, order: 4, nums: 3 },
    );
    expect(t.premise.text).toBe(
      "Square 1 is X or A, and every numbered square has just two pencil marks left, so each forces the next. If square 1 is X, this square's row already has it; if A, square 2 is driven to X, in line with this square. Either way, X is ruled out here",
    );
  });
});

/** Walk the plan's first steps to the end from the board `id` names, after
 * `setup` moves the player makes; `first` is the first narration seen. */
function descWalk(
  id: string,
  setup: SaladMove[] = [],
): { texts: string[]; first: string | null; solved: boolean } {
  const [params, desc] = id.split(":", 2);
  let state = newState(saladGame.decodeParams(params), desc);
  for (const m of setup) state = saladGame.executeMove(state, m);
  const texts: string[] = [];
  for (let i = 0; i < 400 && saladGame.status(state) === "ongoing"; i++) {
    const res = saladGame.hint?.(state);
    if (!res?.ok) break;
    texts.push(res.steps[0].explanation);
    state = saladGame.executeMove(state, res.steps[0].move);
  }
  return {
    texts,
    first: texts[0] ?? null,
    solved: saladGame.status(state) === "solved",
  };
}

describe("salad hint — the opener never destroys the player's own notes", () => {
  it("fills only the squares that carry no mark yet", () => {
    // On a board with *some* penciled squares and *some* blank ones, a resetting
    // fill (upstream's `markAll`) would throw away deductions the player had
    // already made.
    const state = board(LETTERS, "fill-1");
    const o = state.order;
    let s = saladGame.executeMove(state, { type: "markAll" });

    // Narrow one square's notes down (keeping the solution value, so the board
    // stays mistake-free and the hint doesn't refuse), and blank another's
    // entirely, so a fill is genuinely needed.
    const soln = saladSolution(s);
    expect(soln).not.toBeNull();
    const cells = soln as number[];
    const editable = (i: number): boolean =>
      state.gridclues[i] === 0 && s.grid[i] === 0 && s.holes[i] === 0;
    const narrow = [...cells.keys()].find((i) => editable(i) && cells[i] > 0);
    const blank = [...cells.keys()].find((i) => i !== narrow && editable(i));
    expect(narrow).toBeDefined();
    expect(blank).toBeDefined();
    const at = (i: number): { x: number; y: number } => ({ x: i % o, y: (i / o) | 0 });
    for (let n = 1; n <= state.nums; n++) {
      if (n === cells[narrow as number]) continue;
      s = saladGame.executeMove(s, {
        type: "pencil",
        ...at(narrow as number),
        value: n,
      });
    }
    s = saladGame.executeMove(s, {
      type: "pencil",
      ...at(narrow as number),
      value: "cross",
    });
    s = saladGame.executeMove(s, {
      type: "set",
      ...at(blank as number),
      value: "clear",
    });
    const narrowed = s.pencil[narrow as number];
    expect(s.pencil[blank as number]).toBe(0);

    const res = saladGame.hint?.(s);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    // The opener is the *additive* fill, never upstream's resetting `markAll`.
    const fill = res.steps.find(
      (step) => (step.move as { type: string }).type === "pencilAll",
    );
    expect(fill, "the plan did not open with an additive fill").toBeDefined();
    expect(
      res.steps.some((step) => (step.move as { type: string }).type === "markAll"),
    ).toBe(false);
    if (!fill) return;

    const filled = saladGame.executeMove(s, fill.move);
    expect(filled.pencil[narrow as number]).toBe(narrowed);
    expect(filled.pencil[blank as number]).not.toBe(0);
  });

  it("the additive `pencilAll` is idempotent where `markAll` is destructive", () => {
    const state = board(NUMBERS, "fill-2");
    const o = state.order;
    const full = saladGame.executeMove(state, { type: "markAll" });
    const i = [...full.pencil.keys()].find(
      (k) => full.pencil[k] !== 0 && state.gridclues[k] === 0,
    );
    expect(i).toBeDefined();
    const cell = { x: (i as number) % o, y: ((i as number) / o) | 0 };
    const narrowed = saladGame.executeMove(full, {
      type: "pencil",
      ...cell,
      value: 1,
    });
    expect(narrowed.pencil[i as number]).not.toBe(full.pencil[i as number]);

    // The additive fill changes nothing at all here (every square has a mark)…
    const refilled = saladGame.executeMove(narrowed, { type: "pencilAll" });
    expect(Array.from(refilled.pencil)).toEqual(Array.from(narrowed.pencil));
    // …where the player's own Mark-all deliberately resets it, as upstream does.
    const reset = saladGame.executeMove(narrowed, { type: "markAll" });
    expect(reset.pencil[i as number]).toBe(full.pencil[i as number]);
  });
});

describe("salad hint — the recorder cannot reach the generator", () => {
  it("recording leaves the board it was given untouched", () => {
    // The recorder is gated off the generate/solve path, and nothing regenerates
    // a board against a recording; this pins the narrower property that the
    // recording run itself is pure on its input.
    const state = board(LETTERS, "i1");
    const b = scratchBoard(state);
    const before = [Array.from(b.grid), Array.from(b.holes)];
    recordSaladDeductions(b, DIFF_HARD);
    expect([Array.from(b.grid), Array.from(b.holes)]).toEqual(before);
  });

  it("records the border deduction with the premise the narration cites", () => {
    const state = board(LETTERS, "i2");
    const { ops } = recordSaladDeductions(scratchBoard(state), DIFF_EASY);
    const kinds = new Set(ops.map((o) => (o.reason as { kind: string }).kind));
    expect(kinds.has("borderNear") || kinds.has("borderFar")).toBe(true);
    for (const op of ops) {
      const r = op.reason as { kind: string; clue?: number; clueVal?: number };
      if (r.kind === "borderNear" || r.kind === "borderFar") {
        expect(r.clue).toBeGreaterThanOrEqual(0);
        expect(state.borderclues[r.clue as number]).toBe(r.clueVal);
      }
    }
  });
});

describe("salad hint — the strike move", () => {
  it("clearing a pencil mark twice is a no-op, unlike the toggle", () => {
    const state = board(NUMBERS, "m1");
    const marked = saladGame.executeMove(state, { type: "markAll" });
    const mark = { x: 0, y: 0, n: 1 };
    // Pick a square the fill actually noted.
    let cell = -1;
    for (let i = 0; i < state.order * state.order; i++) {
      if (marked.pencil[i] & 1) {
        cell = i;
        break;
      }
    }
    expect(cell).toBeGreaterThanOrEqual(0);
    mark.x = cell % state.order;
    mark.y = (cell / state.order) | 0;
    const once = saladGame.executeMove(marked, { type: "pencilStrike", marks: [mark] });
    const twice = saladGame.executeMove(once, { type: "pencilStrike", marks: [mark] });
    expect(Array.from(twice.pencil)).toEqual(Array.from(once.pencil));
    expect(once.pencil[cell] & 1).toBe(0);
    // The X mark rides the same formula: `n = nums + 1` clears bit `nums`.
    const xstruck = saladGame.executeMove(marked, {
      type: "pencilStrike",
      marks: [{ x: mark.x, y: mark.y, n: state.nums + 1 }],
    });
    expect(xstruck.pencil[cell] & (1 << state.nums)).toBe(0);
  });

  it("a marker step is judged followed once the square carries that marker", () => {
    const { state, step } = pinned("marker");
    const move = step.move as {
      type: "set";
      x: number;
      y: number;
      value: "cross" | "circle";
    };
    expect(saladGame.hintKeepTrack?.(move, step as never, state)).toBe("completed");
    // A different marker on the same square is off-plan.
    expect(
      saladGame.hintKeepTrack?.(
        { ...move, value: move.value === "cross" ? "circle" : "cross" },
        step as never,
        state,
      ),
    ).toBe("off");
    // And the step is resolved (dropped) once the board already shows it.
    const done = saladGame.executeMove(state, move);
    expect(saladGame.refreshHintStep?.(step as never, done)).toBeNull();
    expect(done.holes[move.y * state.order + move.x]).toBe(
      move.value === "cross" ? CROSS : CIRCLE,
    );
  });
});
