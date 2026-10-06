/**
 * Sticks hint tests: the five contradiction kinds and
 * their narrations, the evidence areas counting out against the sentences,
 * journey grouping on a generated board, resume from a self-played position,
 * refusal on a wrong board, and tier-2.5 render frames for every kind.
 *
 * The cross-game guards (resume convergence, plan purity, no-op-free plans,
 * overlay repaint, narration voice/length) come from the enrollment in
 * `engine/testing/hint-games.ts` and are deliberately not duplicated here.
 */
import { describe, expect, it } from "vitest";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { isThin, markSides } from "../../engine/testing/mark-shape.ts";
import {
  renderPinnedHint,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { newSticksDesc } from "./generator.ts";
import { STICKS_RUNGS, sticksGame } from "./index.ts";
import { COL_HINT, COL_HINT_CELL, COL_LINE } from "./render.ts";
import {
  deduceSticksPlan,
  newScratch,
  type SticksReason,
  sticksValidate,
} from "./solver.ts";
import {
  defaultParams,
  F_BLOCK,
  F_HOR,
  F_VER,
  newState,
  type SticksState,
} from "./state.ts";

const PARAMS = defaultParams();
const PARAM_STR = `${PARAMS.w}x${PARAMS.h}b${PARAMS.blackpc}s${PARAMS.symm}`;

/** A fixed-seed board — deterministic, so every test below names a real
 * generated position rather than a crafted one. */
function board(seed: number): { id: string; state: SticksState } {
  const { desc } = newSticksDesc(PARAMS, randomNew(String(seed)));
  return { id: `${PARAM_STR}:${desc}`, state: newState(PARAMS, desc) };
}

const KINDS = STICKS_RUNGS;

/** A position for each rung, whose plan opens with it, and one whose plan
 * opens with a firing that decides more than one square. */
const pinned = describeHintPins({
  game: sticksGame,
  params: [PARAMS],
  kinds: {
    journey: (_step, state) => deduceSticksPlan(state)[0].length > 1,
  },
  pins: {
    /** Held on 102 of 485 positions walked. */
    journey: "7x7b20s2:a2b2B_3aB0B1b2d3cBBa2_3BB2a2_2hB1B2a1B0a1_3b",
    /** Held on 453 of 485 positions walked. */
    tooLong: {
      id: "7x7b20s2:1b2a1_1B_1aB3a2aBB1bB1b1d5_1bBa2B1Ba1aB3bB0_1_2b1b",
      moves:
        '[{"kind":"set","changes":[{"index":3,"line":"hor"}]},{"kind":"set","changes":[{"index":9,"line":"hor"}]}]',
    },
    /** Held on 453 of 485 positions walked. */
    unreachable: "7x7b20s2:a4cB3a2c3b1c2aB2aB1_1bB2aB3b4a2_1b2b1bB2a1_2a2",
    /** Held on 326 of 485 positions walked. */
    twoClues: {
      id: "7x7b20s2:B1a1_1_2aB_1a2_1a2Bb6f1B2a3a1_1_3_1a1aB1c1bB1c3aB2",
      moves:
        '[{"kind":"set","changes":[{"index":9,"line":"hor"}]},{"kind":"set","changes":[{"index":8,"line":"hor"}]}]',
    },
    /** Held on 371 of 485 positions walked. */
    overConnected: "7x7b20s2:a2b2B_3aB0B1b2d3cBBa2_3BB2a2_2hB1B2a1B0a1_3b",
    /** Held on 408 of 485 positions walked. */
    starved: "7x7b20s2:aB2aB1B_1a1_2_1B2b1e3B1_1a2c1B2a1_1_3a2a3aB3c2aBB1aB1_1",
  },
});

describe("sticks hint — technique coverage", () => {
  it("every one of the five contradiction kinds fires on generated boards", () => {
    // A rung that never fires is a rung nothing tests. Sticks' five
    // are the whole of `sticksValidate`'s vocabulary, so this is also the
    // check that the classifier is total: the sentence a pin opens with is
    // the one for the reason the solver recorded there.
    for (const kind of KINDS)
      expect(deduceSticksPlan(pinned(kind).state)[0][0].reason.kind).toBe(kind);
  });

  it("the deduction narrates every board to completion — no un-narrated residue", () => {
    for (let seed = 0; seed < 6; seed++) {
      const { state } = board(seed);
      const blanks = [...state.grid].filter((t) => t === 0).length;
      const cells = deduceSticksPlan(state).flat().length;
      // The plan is capped for UX, so it either solves the board or hits the cap.
      expect(cells).toBeGreaterThanOrEqual(Math.min(blanks, 40));
    }
  });
});

describe("sticks hint — narration", () => {
  const stepsFor = (seed: number) => {
    const r = sticksGame.hint?.(board(seed).state);
    if (!r?.ok) throw new Error("expected a hint");
    return r.steps;
  };

  it("states its conclusion in the necessity voice, naming the orientation", () => {
    for (const kind of KINDS) {
      expect(pinned(kind).step.explanation, kind).toMatch(
        /, so this \w+ must be (horizontal|vertical)\.$/,
      );
    }
  });

  it("names the clue by the number the player can see, never a bare pronoun", () => {
    for (let seed = 0; seed < 6; seed++) {
      for (const s of stepsFor(seed)) {
        expect(s.explanation).toMatch(/\d/);
        expect(s.explanation).not.toMatch(/^(It|They|This is)\b/);
      }
    }
  });

  it("a black 0's continuation never claims another line already runs into it", () => {
    // "As well" is true at every clue value except the one where the rule is
    // starkest: a black 0 has no line running into it at all.
    let seen = 0;
    for (let seed = 0; seed < 12; seed++) {
      // One step a firing, in the plan's order.
      const firings = deduceSticksPlan(board(seed).state).flat();
      stepsFor(seed).forEach((s, i) => {
        const { reason } = firings[i];
        if (reason.kind === "overConnected" && reason.value === 0) {
          expect(s.rung).toBe("overConnected");
          expect(s.explanation).toMatch(/[Tt]he black 0/);
          expect(s.explanation).not.toMatch(/as well|another/);
          seen++;
        }
      });
    }
    expect(seen, "no step narrated a black 0 — the phrase has changed").toBeGreaterThan(
      0,
    );
  });

  it("says which orientation is being ruled out, and it is not the forced one", () => {
    for (let seed = 0; seed < 6; seed++) {
      for (const s of stepsFor(seed)) {
        const forced = /must be (horizontal|vertical)\b/.exec(s.explanation)?.[1];
        // "here" is optional: a continuation leg drops it, since the opening
        // leg already located the move.
        const ruledOut = /[Aa] (horizontal|vertical) line\b/.exec(s.explanation)?.[1];
        expect(ruledOut, s.explanation).toBeDefined();
        expect(ruledOut, s.explanation).not.toBe(forced);
      }
    }
  });
});

describe("sticks hint — evidence counts out against the words", () => {
  const reasons = (seed: number): SticksReason[] =>
    deduceSticksPlan(board(seed).state)
      .flat()
      .map((f) => f.reason);

  it("every step shows evidence on the board", () => {
    for (let seed = 0; seed < 6; seed++) {
      const r = sticksGame.hint?.(board(seed).state);
      if (!r?.ok) throw new Error("expected a hint");
      for (const s of r.steps) {
        const marks = stepMarks(s);
        const evidence = marks.of("outline", CELL).map((p) => `${p.x},${p.y}`);
        expect(evidence.length, s.explanation).toBeGreaterThan(0);
        // A black clue's counted lines never include the one being ruled out.
        const [target] = marks.of("ring", CELL);
        if (s.rung === "overConnected" || s.rung === "starved")
          expect(evidence).not.toContain(`${target.x},${target.y}`);
      }
    }
  });

  it("a length argument shades exactly the run it narrates", () => {
    let seen = 0;
    for (let seed = 0; seed < 12; seed++) {
      for (const r of reasons(seed)) {
        if (r.kind === "tooLong") {
          expect(r.segment.length).toBe(r.size);
          seen++;
        }
      }
    }
    expect(seen, "no `tooLong` reason fired across twelve seeds").toBeGreaterThan(0);
  });

  it("a reachability argument shades exactly the span the walk covered", () => {
    // The span is the premise, so an approximated one would make the sentence
    // false. It is also the *quirked* walk's span, deliberately.
    let seen = 0;
    for (let seed = 0; seed < 12; seed++) {
      for (const r of reasons(seed)) {
        if (r.kind === "unreachable") {
          expect(r.span.length).toBe(r.max);
          expect(r.max).toBeLessThan(r.value);
          seen++;
        }
      }
    }
    expect(seen, "no `unreachable` reason fired across twelve seeds").toBeGreaterThan(
      0,
    );
  });

  it("a black clue's argument marks as many sides as it claims", () => {
    let seen = 0;
    for (let seed = 0; seed < 12; seed++) {
      for (const r of reasons(seed)) {
        // Counted on the trial board: over-connected has gained the offending
        // line (value + 1), starved has just lost one of its value open sides.
        if (r.kind === "overConnected") {
          expect(r.lines.length).toBe(r.value + 1);
          seen++;
        }
        if (r.kind === "starved") {
          expect(r.open.length).toBe(r.value - 1);
          seen++;
        }
      }
    }
    expect(seen, "neither black-clue reason fired across twelve seeds").toBeGreaterThan(
      0,
    );
  });

  it("a two-numbers argument names both numbers and shades the run holding them", () => {
    let seen = 0;
    for (let seed = 0; seed < 12; seed++) {
      for (const r of reasons(seed)) {
        if (r.kind !== "twoClues") continue;
        expect(r.clues.length).toBeGreaterThanOrEqual(2);
        for (const c of r.clues) expect(r.segment).toContain(c);
        seen++;
      }
    }
    expect(seen, "no `twoClues` reason fired across twelve seeds").toBeGreaterThan(0);
  });
});

describe("sticks hint — grouping", () => {
  it("groups one firing into one journey, on a generated board", () => {
    // ~a fifth of firings decide more than one square, and a black clue that
    // has run out of lines is the commonest.
    let journeys = 0;
    for (const group of deduceSticksPlan(pinned("journey").state)) {
      if (group.length < 2) continue;
      journeys++;
      const first = group[0].reason;
      for (const f of group) {
        expect(f.reason.kind).toBe(first.kind);
        if (f.reason.kind !== "twoClues" && first.kind !== "twoClues")
          expect(f.reason.clue).toBe(first.clue);
      }
    }
    expect(journeys).toBeGreaterThan(0);
  });

  it("a journey's first leg opens it and the rest continue it", () => {
    for (let seed = 0; seed < 6; seed++) {
      const r = sticksGame.hint?.(board(seed).state);
      if (!r?.ok) throw new Error("expected a hint");
      expect(r.steps[0].continuesPrevious).toBe(false);
      for (const s of r.steps) {
        if (s.continuesPrevious)
          expect(s.explanation).toMatch(
            /^…and this (square|\d) must be (horizontal|vertical), for /,
          );
      }
    }
  });
});

describe("sticks hint — lifecycle", () => {
  it("resumes from a position the player reached by their own moves", () => {
    // Sticks rescans every blank square on every call rather than propagating
    // from what it changed, so it needs no cascade priming — the assumption
    // Singles shipped a bug on, so it is evidenced rather than assumed.
    const { state } = board(3);
    let cur = state;
    // Play the first few forced squares by hand, out of the plan's order.
    const plan = deduceSticksPlan(cur).flat();
    for (const f of [plan[2], plan[0], plan[5]]) {
      cur = sticksGame.executeMove(cur, {
        kind: "set",
        changes: [{ index: f.index, line: f.to }],
      });
    }
    const r = sticksGame.hint?.(cur);
    expect(r?.ok).toBe(true);
    if (!r?.ok) return;
    expect(r.steps.length).toBeGreaterThan(0);
    // And it does not re-suggest anything already on the board.
    for (const s of r.steps) {
      const hl = s.highlights as { target: number };
      expect(cur.grid[hl.target] & (F_HOR | F_VER | F_BLOCK)).toBe(0);
    }
  });

  it("flags a wrong square, so the midend refuses a hint", () => {
    const { state } = board(1);
    const plan = deduceSticksPlan(state).flat();
    const wrong = plan[0];
    const bad = sticksGame.executeMove(state, {
      kind: "set",
      changes: [{ index: wrong.index, line: wrong.to === "hor" ? "ver" : "hor" }],
    });
    expect(sticksGame.findMistakes?.(bad)).toContainEqual({ index: wrong.index });
  });

  it("counts a solved board as finished, so the midend refuses it", () => {
    const { state } = board(1);
    const r = sticksGame.solve?.(state, state);
    if (!r?.ok) throw new Error("solve refused");
    expect(sticksGame.status(sticksGame.executeMove(state, r.move))).toBe("solved");
  });

  it("follows a step only when the hinted square gets the hinted orientation", () => {
    const { state } = board(1);
    const r = sticksGame.hint?.(state);
    if (!r?.ok) throw new Error("expected a hint");
    const step = r.steps[0];
    const hl = step.highlights as { target: number; to: "hor" | "ver" };
    const other = hl.to === "hor" ? "ver" : "hor";
    expect(
      sticksGame.hintKeepTrack?.(
        { kind: "set", changes: [{ index: hl.target, line: hl.to }] },
        step,
        state,
      ),
    ).toBe("completed");
    expect(
      sticksGame.hintKeepTrack?.(
        { kind: "set", changes: [{ index: hl.target, line: other }] },
        step,
        state,
      ),
    ).toBe("off");
  });
});

describe("sticks hint — recording stays off the solve path", () => {
  it("collecting reasons does not change a single verdict", () => {
    // The generator's byte-identity rests on this, and the differential is the
    // other half of the check: `nextSticksFiring` is a parallel function, so
    // the only shared surface is `sticksValidate`'s extra out-param.
    let compared = 0;
    for (let seed = 0; seed < 6; seed++) {
      const { state } = board(seed);
      const { w, h, numbers } = state;
      const grid = state.grid.slice();
      const scratch = newScratch(w * h);
      for (let i = 0; i < w * h; i++) {
        if (grid[i] & F_BLOCK) continue;
        for (const bit of [F_HOR, F_VER]) {
          grid[i] = bit;
          const plain = sticksValidate(grid, numbers, w, h, scratch);
          const recorded = sticksValidate(grid, numbers, w, h, scratch, undefined, []);
          expect(recorded).toBe(plain);
          compared++;
        }
        grid[i] = 0;
      }
    }
    // Six all-block fixtures would compare nothing and pass.
    expect(compared).toBeGreaterThan(100);
  });
});

describe("sticks hint — render frames (tier 2.5)", () => {
  for (const kind of KINDS) {
    it(`draws the forced line and its evidence for a ${kind} deduction`, () => {
      const result = renderPinnedHint(sticksGame, pinned(kind));
      const ops = result.recording.ops;
      // The forced square is drawn as a bar in the hint color — the game's own
      // line shape, which a plain tint could not give an orientation.
      const bars = ops.filter((o) => o.op === "rect" && o.color === COL_HINT);
      expect(bars.length).toBe(1);
      const bar = bars[0];
      if (bar.op !== "rect") throw new Error("unreachable");
      // A bar, not a square: its long axis *is* the orientation being hinted.
      expect(bar.w === bar.h).toBe(false);
      // …and the evidence as an area, not a single premise square, drawn
      // as a **ring per square** — never a wash, on a white square or a black
      // one: a white evidence square carries the clue the deduction counts with.
      const evidence = markSides(ops, COL_HINT_CELL);
      expect(evidence.length).toBeGreaterThanOrEqual(4);
      expect(evidence.length % 4).toBe(0);
      for (const s of evidence) expect(isThin(s)).toBe(true);
      // Clue numbers stay drawn under the overlay.
      expect(ops.some((o) => o.op === "text")).toBe(true);
      expect(ops).toMatchSnapshot();
    });
  }

  it("never draws the forced line in the placed-line color", () => {
    // The hint shows where and which, it does not perform the move. On a
    // fresh board no line is placed, so any COL_LINE bar would be a preview.
    const id = `${PARAM_STR}:3dB2aB1_1bB3_3b2a1_2a1B2_2dB2c3d1B1b1B_1B2_1_2_1_2a`;
    const result = renderScenario({ game: sticksGame, id, showHint: true });
    expect(
      result.recording.ops.some((o) => o.op === "rect" && o.color === COL_LINE),
    ).toBe(false);
  });
});
