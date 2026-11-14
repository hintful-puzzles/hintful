/**
 * Rome explained-hint tests.
 *
 * Tier 1 — the plan, deducing from the notes, finishes every board; what a
 * loop or reach step claims is read back on the board it is shown on; the
 * plan places, strikes and refuses at the quality bar; the marks the hint
 * teaches are marks a player can make. Tier 2.5 — render scenarios for the two
 * shapes Rome was picked to press on: an ordinary area elimination, and a
 * **reachability** firing whose evidence is an outlined chain of arrows.
 *
 * What these catch that no cheaper test would: the cross-game guards walk a
 * plan and check its *form*, and `rome-ladder.test.ts` checks that every rung
 * of the solver fires — but nothing else reads a premise back to see that it
 * is true of the board rather than merely present.
 */
import { describe, expect, it } from "vitest";
import type { CandidatePlanPrefs } from "../../engine/candidate-hint.ts";
import { descValue } from "../../engine/desc-error.ts";
import { Midend } from "../../engine/midend.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { markSides, ringsOf } from "../../engine/testing/mark-shape.ts";
import { opsOfKind } from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderPinnedHint,
} from "../../engine/testing/render-scenario.ts";
import { newRomeDesc } from "./generator.ts";
import { buildSteps } from "./hint.ts";
import { say } from "./hint-text.ts";
import { romeGame } from "./index.ts";
import { COL_ARROW_PENCIL, COL_HINT_CELL } from "./render.ts";
import { parseDesc, romeSolve } from "./solver.ts";
import {
  boardFromClues,
  DIFF_NORMAL,
  DIFF_TRICKY,
  DIFFCOUNT,
  dirBit,
  EMPTY,
  FM_ARROWMASK,
  FM_LEFT,
  legalDirs,
  type RomeMove,
  type RomeParams,
  type RomeState,
} from "./state.ts";

const NORMAL: RomeParams = { w: 6, h: 6, diff: DIFF_NORMAL };
const TRICKY: RomeParams = { w: 8, h: 8, diff: DIFF_TRICKY };

/** A 6x6 Tricky board on which the `pair` technique fires. */
const PAIR_DESC = "2aa1bb4aa2a3ab7a3a1b1aaa1a,cDcLcLaUaUaXbLRUbRdRRUc";

/** The plan these cases read: every mark penciled in first. */
const POPULATE: CandidatePlanPrefs = { autoClean: false, reading: "populate" };

function gen(p: RomeParams, seed: string): { desc: string; st: RomeState } {
  const { desc } = newRomeDesc(p, randomNew(seed));
  return { desc, st: descValue(parseDesc(p, desc)) };
}

/** Each step of the plan from `st`, with the board it is shown on, and the
 * board the plan leaves. */
function walk(
  st: RomeState,
  prefs: CandidatePlanPrefs,
): { shown: { step: RomeStep; on: RomeState }[]; end: RomeState } {
  const shown: { step: RomeStep; on: RomeState }[] = [];
  let on = st;
  for (const step of buildSteps(st, prefs)) {
    shown.push({ step, on });
    on = romeGame.executeMove(on, step.move as RomeMove);
  }
  return { shown, end: on };
}

type RomeStep = ReturnType<typeof buildSteps>[number];
type Cells = readonly { x: number; y: number }[];
const keys = (cs: Cells): Set<string> => new Set(cs.map((c) => `${c.x},${c.y}`));

/** The boards the plan checks below are walked on: Normal and Tricky, under
 * both readings. */
function* plans(
  tag: string,
): Generator<{ shown: { step: RomeStep; on: RomeState }[]; end: RomeState }> {
  for (const p of [NORMAL, TRICKY])
    for (let s = 0; s < 6; s++) {
      const { st } = gen(p, `${tag}-${p.w}-${s}`);
      for (const reading of ["populate", "implicit"] as const)
        yield walk(st, { autoClean: false, reading });
    }
}

// --- tier 1: the plan's deductions -------------------------------------------

describe("rome plan deductions", () => {
  /** The plan deduces from the notes, so finishing is what shows that the
   * strikes it reads off them are the ones the solve needs. */
  it("finishes every board, under both readings", () => {
    let boards = 0;
    for (const { end } of plans("pure")) {
      boards++;
      expect(romeGame.status(end)).toBe("solved");
    }
    expect(boards).toBe(24);
  });

  /**
   * "Only this mark still leads into the striped group" is a claim about every
   * square around the group, so the step reads them all; without them the
   * plan could offer it while one of them still showed a mark pointing in.
   */
  it("reads every square bordering the group a reach strike names", () => {
    let seen = 0;
    for (const { shown } of plans("reach"))
      for (const { step, on } of shown) {
        if (step.rung !== "reach") continue;
        seen++;
        const h = step.highlights as { hatch: Cells; reads: Cells };
        expect(h.hatch.length).toBeGreaterThan(0);
        const group = keys(h.hatch);
        const reads = keys(h.reads);
        for (const { x, y } of h.hatch)
          for (const [nx, ny] of [
            [x + 1, y],
            [x - 1, y],
            [x, y + 1],
            [x, y - 1],
          ])
            if (
              nx >= 0 &&
              ny >= 0 &&
              nx < on.w &&
              ny < on.h &&
              !group.has(`${nx},${ny}`)
            )
              expect(reads).toContain(`${nx},${ny}`);
      }
    expect(seen, "reach strikes looked at").toBeGreaterThan(3);
  });

  /**
   * A loop sentence claims a walk exists, so the walk is taken on the board
   * the step is shown on: from the square the struck arrow points at, along
   * the arrows placed, to the struck square (docs/hints.md § "The quality
   * bar", rule 5).
   */
  it("outlines a loop's chain that really leads back to the square it strikes", () => {
    let checked = 0;
    for (const { shown } of plans("loop"))
      for (const { step, on } of shown) {
        if (step.rung !== "loop") continue;
        checked++;
        const { w } = on;
        const h = step.highlights as { area: Cells; targets: Cells };
        expect(h.targets).toHaveLength(1);
        const cell = h.targets[0].y * w + h.targets[0].x;
        const chain = h.area.map((c) => c.y * w + c.x).filter((i) => i !== cell);
        expect(chain.length).toBeGreaterThan(0);
        // Every outlined arrow leads, along the arrows, to the struck square.
        for (const from of chain) {
          let at = from;
          for (let k = 0; at !== cell; k++) {
            expect(k, "the chain runs on without coming back").toBeLessThan(w * on.h);
            const arrow = on.grid[at] & FM_ARROWMASK;
            expect(arrow, "the chain stops at a square with no arrow").not.toBe(0);
            const n = [0, dirBit(1), dirBit(2), dirBit(3), dirBit(4)].indexOf(arrow);
            at += n === 1 ? -w : n === 2 ? w : n === 3 ? -1 : 1;
          }
        }
      }
    expect(checked, "no loop step was shown, so nothing was checked").toBeGreaterThan(
      50,
    );
  });
});

// --- tier 1: the plan --------------------------------------------------------

describe("rome hint plan", () => {
  it("opens by penciling in, then clearing the area duplicates", () => {
    const { st } = gen(NORMAL, "open-0");
    const steps = buildSteps(st, POPULATE);
    expect(steps[0].explanation).toMatch(/^Start by penciling/);
    expect((steps[0].move as RomeMove).kind).toBe("pencilAll");
    expect(steps[1].explanation).toMatch(/^Now clear the easy ones/);
    expect(steps[1].continuesPrevious).toBe(true);
  });

  /**
   * Rule 6, checked rather than asserted: every mark the plan tells the player
   * to make or cross off is one Rome's own input can produce, and the populate
   * never offers an arrow that would point off the grid — which is the one
   * place Rome's note set differs in shape from a Latin game's, and the reason
   * `NoteEncoding.all` exists.
   */
  it("only ever teaches marks the player could make", () => {
    const { st } = gen(NORMAL, "markable-0");
    const populated = romeGame.executeMove(st, { kind: "pencilAll" });
    for (let i = 0; i < populated.pencil.length; i++) {
      const x = i % st.w;
      const y = (i / st.w) | 0;
      if (populated.grid[i] !== EMPTY) continue;
      if (y === 0) expect(populated.pencil[i] & dirBit(1)).toBe(0);
      if (y === st.h - 1) expect(populated.pencil[i] & dirBit(2)).toBe(0);
      if (x === 0) expect(populated.pencil[i] & dirBit(3)).toBe(0);
      if (x === st.w - 1) expect(populated.pencil[i] & dirBit(4)).toBe(0);
    }
    for (const step of buildSteps(st, POPULATE)) {
      const m = step.move as RomeMove;
      expect(["place", "pencil", "pencilAll", "pencilStrike"]).toContain(m.kind);
      if (m.kind !== "pencilStrike") continue;
      for (const mark of m.marks) {
        expect(
          dirBit(mark.n),
          "a strike names something that is not an arrow",
        ).toBeGreaterThan(0);
      }
    }
  });

  /**
   * A plan takes a `pair` on about one board in six hundred (2 of 1200 dealt
   * 5x5 to 7x7 Tricky boards, 2026-11-14), so this is a pinned desc rather
   * than a seed — and it is here
   * because that sentence names **two** arrows, which the struck marks alone
   * cannot always supply: where the region's other squares had already lost one
   * of the pair, a narration built from the live strikes would call a pair one
   * arrow. The reason carries `values` from where the elimination is computed.
   */
  it("names both arrows of a naked pair, not only the ones still live", () => {
    const params: RomeParams = { w: 6, h: 6, diff: DIFF_TRICKY };
    const board = descValue(parseDesc(params, PAIR_DESC));
    const pair = walk(board, POPULATE).shown.find(({ step }) => step.rung === "pair");
    expect(pair, "the pinned board's plan no longer takes a pair").toBeDefined();
    // A pair is two squares holding two arrows between them. Both counts are
    // what the sentence claims, so both are asserted.
    const words = pair?.step.explanation.match(/must take (\w+) or (\w+) between them/);
    expect(words, pair?.step.explanation).not.toBeNull();
    expect(words?.[1]).not.toBe(words?.[2]);
    const h = pair?.step.highlights as { area: Cells; hatch: Cells };
    expect(h.area).toHaveLength(2);
    expect(h.hatch.length).toBeGreaterThanOrEqual(3);
    for (const c of keys(h.area)) expect(keys(h.hatch)).toContain(c);
  });

  /**
   * The board a random-play sweep crashed the hint on. Every move but the last
   * is a hint step, and the last is the player noting "left" on square (0, 2),
   * which points off the grid. No rung strikes a note the solver never
   * considers, so the placement behind it (right, on that same square) was
   * neither a naked nor a hidden single and the plan threw. Pinned as the moves
   * the plan consumes rather than as a seed: a seed reaches the plan only
   * through a generator free to stop producing this board.
   */
  it("survives a note pointing off the grid in a replayed move log", () => {
    const me = new Midend(romeGame);
    expect(me.newGameFromId("4x4de:aa5a2aca1a,bRaDaXcLbRaL")).toBeNull();
    me.playMoves([
      { kind: "pencilAll" },
      {
        kind: "pencilStrike",
        marks: [
          { x: 0, y: 2, n: 2 },
          { x: 0, y: 3, n: 4 },
          { x: 2, y: 3, n: 3 },
        ],
      },
      { kind: "place", x: 0, y: 3, dir: 4 },
      { kind: "pencilStrike", marks: [{ x: 3, y: 0, n: 3 }] },
      { kind: "place", x: 3, y: 0, dir: 8 },
      {
        kind: "pencilStrike",
        marks: [
          { x: 3, y: 1, n: 2 },
          { x: 3, y: 2, n: 2 },
        ],
      },
      { kind: "pencilStrike", marks: [{ x: 3, y: 1, n: 1 }] },
      { kind: "place", x: 3, y: 1, dir: 16 },
      { kind: "pencilStrike", marks: [{ x: 3, y: 2, n: 3 }] },
      { kind: "pencil", x: 0, y: 2, dir: FM_LEFT },
    ]);
    const st = (me as unknown as { state: RomeState }).state;
    expect(romeGame.hint?.(st)?.ok).toBe(true);
    expect(st.pencil[2 * st.w] & FM_LEFT).toBe(0);
  });

  it("counts a solved board as finished and flags a wrong mark, the boards the midend refuses", () => {
    const { st } = gen(NORMAL, "refuse-0");
    const solution = boardFromClues(st);
    romeSolve(solution, DIFFCOUNT);
    const solved = romeGame.executeMove(st, {
      kind: "solve",
      arrows: Array.from(solution.grid, (c) =>
        (c & FM_ARROWMASK) === 0 ? null : ((c & FM_ARROWMASK) as 4 | 8 | 16 | 32),
      ),
    });
    expect(romeGame.status(solved)).toBe("solved");

    // A square whose marks have crossed out its answer is a mistake, so no
    // hint deduces from notes it cannot trust.
    const target = solution.grid.findIndex(
      (c, i) => st.grid[i] === EMPTY && (c & FM_ARROWMASK) !== 0,
    );
    const answer = solution.grid[target] & FM_ARROWMASK;
    const tx = target % st.w;
    const ty = (target / st.w) | 0;
    // A wrong arrow the square could hold: one off the grid is not a mark.
    const others = legalDirs(tx, ty, st.w, st.h) & ~answer;
    const wrong = others & -others;
    const noted = romeGame.executeMove(st, {
      kind: "pencil",
      x: tx,
      y: ty,
      dir: wrong as 4 | 8 | 16 | 32,
    });
    expect(romeGame.findMistakes?.(noted).some((m) => m.kind === "note")).toBe(true);
  });
});

// --- tier 2.5: render --------------------------------------------------------

/** Every square noted, as the Mark-all press leaves it: the frames below show a
 * strike of marks on the board, which under the implicit reading a note-less
 * square would fold into what it leaves. */
const MARK_ALL: RomeMove[] = [{ kind: "pencilAll" }];

/** The bare boards of the scan: one read implicitly, where `note` and
 * `regionsFull` are spoken of a square with no marks, and one read with the
 * marks penciled in first, which is where a plan opens on `populate`. */
const BARE: RomeParams = { w: 5, h: 5, diff: DIFF_TRICKY };
const BARE_POPULATED: RomeParams = { w: 4, h: 4, diff: DIFF_NORMAL };

/** A position for every rung, and one whose hint opens with a loop strike. */
const pinned = describeHintPins({
  game: romeGame,
  params: [NORMAL, TRICKY, BARE, BARE_POPULATED],
  opening: (state) => (state.w >= NORMAL.w ? MARK_ALL : []),
  ui: (state) => ({
    ...romeGame.newUi(state),
    ...(state.w === BARE_POPULATED.w ? { candidateReading: "populate" as const } : {}),
  }),
  kinds: { opensOnLoop: (step) => step.rung === "loop" },
  pins: {
    /** Held on 1011 of 2499 positions walked. */
    opensOnLoop: {
      id: "6x6dn:abaaa1a1a4a1ca7a1a2aa1a2a2a1,aRcDbUdUaDcDULDUXbDbRe",
      moves:
        '[{"kind":"pencilAll"},{"kind":"pencilStrike","marks":[{"x":0,"y":0,"n":4},{"x":0,"y":1,"n":1},{"x":1,"y":1,"n":1},{"x":3,"y":1,"n":1},{"x":4,"y":1,"n":2},{"x":5,"y":1,"n":2},{"x":2,"y":2,"n":1},{"x":2,"y":2,"n":2},{"x":4,"y":2,"n":2},{"x":0,"y":3,"n":2},{"x":1,"y":4,"n":2},{"x":2,"y":4,"n":2},{"x":4,"y":4,"n":1},{"x":5,"y":4,"n":1},{"x":1,"y":5,"n":4},{"x":2,"y":5,"n":4}]},{"kind":"place","x":0,"y":0,"dir":8}]',
    },
    /** Held on 12 of 2499 positions walked. */
    populate: "4x4dn:2aa10b1d,gXaUdRa",
    /** Held on 371 of 2499 positions walked. */
    clean: {
      id: "6x6dn:1aa1a2a1aa2a1aa3b1aa7b3a2b3,cLbUUDRDDaLbLDaUbDaUDUbDbRXb",
      moves: [{ kind: "pencilAll" }],
    },
    /** Held on 149 of 2499 positions walked. */
    note: {
      id: "5x5dt:2c1a9a1b7bca,dDaDcXaLaUURRg",
      moves:
        '[{"kind":"place","x":0,"y":4,"dir":32},{"kind":"pencilAdd","marks":[{"x":4,"y":1,"n":2},{"x":4,"y":1,"n":3}]},{"kind":"pencilStrike","marks":[{"x":4,"y":1,"n":2}]},{"kind":"place","x":4,"y":1,"dir":16},{"kind":"pencilAdd","marks":[{"x":3,"y":1,"n":1},{"x":3,"y":1,"n":2}]},{"kind":"pencilAdd","marks":[{"x":1,"y":2,"n":2},{"x":1,"y":2,"n":3}]},{"kind":"pencilAdd","marks":[{"x":3,"y":3,"n":1},{"x":3,"y":3,"n":2},{"x":3,"y":3,"n":4}]},{"kind":"place","x":1,"y":4,"dir":4},{"kind":"place","x":2,"y":1,"dir":4}]',
    },
    /** Held on 2257 of 2499 positions walked. */
    dup: "5x5dt:a1a2aaa3b2a2aa1aaaab,bXdRaUmRa",
    /** Held on 2490 of 2499 positions walked. */
    single: {
      id: "6x6dn:1aa1a2a1aa2a1aa3b1aa7b3a2b3,cLbUUDRDDaLbLDaUbDaUDUbDbRXb",
      moves:
        '[{"kind":"pencilAll"},{"kind":"pencilStrike","marks":[{"x":4,"y":0,"n":3},{"x":4,"y":0,"n":4},{"x":5,"y":0,"n":2},{"x":2,"y":2,"n":1},{"x":3,"y":2,"n":3},{"x":0,"y":3,"n":1},{"x":2,"y":3,"n":1},{"x":3,"y":3,"n":3},{"x":5,"y":3,"n":2},{"x":3,"y":4,"n":1},{"x":4,"y":4,"n":2},{"x":0,"y":5,"n":1}]}]',
    },
    /** Held on 218 of 2499 positions walked. */
    regionsFull: "5x5dt:a8c2bad4aa4a,aLDbXbLDaUdUDLaUd",
    /** Held on 214 of 2499 positions walked. */
    hiddenSingle: "5x5dt:a1a2aaa3b2a2aa1aaaab,bXdRaUmRa",
    /** Held on 2347 of 2499 positions walked. */
    loop: "5x5dt:a1a2aaa3b2a2aa1aaaab,bXdRaUmRa",
    /** Held on 1595 of 2499 positions walked. */
    reach: {
      id: "5x5dt:ba4aa2a9a1ba2a1a,DdRaLLeLbUaDRUXb",
      moves:
        '[{"kind":"pencilAdd","marks":[{"x":1,"y":1,"n":2},{"x":1,"y":1,"n":4}]},{"kind":"pencilStrike","marks":[{"x":1,"y":1,"n":4}]},{"kind":"place","x":1,"y":1,"dir":8},{"kind":"pencilAdd","marks":[{"x":3,"y":2,"n":1},{"x":3,"y":2,"n":2}]},{"kind":"pencilAdd","marks":[{"x":1,"y":3,"n":3},{"x":1,"y":3,"n":4}]},{"kind":"place","x":4,"y":4,"dir":16},{"kind":"pencilAdd","marks":[{"x":3,"y":4,"n":1},{"x":3,"y":4,"n":3}]}]',
    },
    /** Held on 1181 of 2499 positions walked. */
    opposite: {
      id: "5x5dt:2c1a9a1b7bca,dDaDcXaLaUURRg",
      moves:
        '[{"kind":"place","x":0,"y":4,"dir":32},{"kind":"pencilAdd","marks":[{"x":4,"y":1,"n":2},{"x":4,"y":1,"n":3}]},{"kind":"pencilStrike","marks":[{"x":4,"y":1,"n":2}]},{"kind":"place","x":4,"y":1,"dir":16},{"kind":"pencilAdd","marks":[{"x":3,"y":1,"n":1},{"x":3,"y":1,"n":2}]},{"kind":"pencilAdd","marks":[{"x":1,"y":2,"n":2},{"x":1,"y":2,"n":3}]},{"kind":"pencilAdd","marks":[{"x":3,"y":3,"n":1},{"x":3,"y":3,"n":2},{"x":3,"y":3,"n":4}]},{"kind":"place","x":1,"y":4,"dir":4},{"kind":"place","x":2,"y":1,"dir":4},{"kind":"pencilAdd","marks":[{"x":0,"y":1,"n":1},{"x":0,"y":1,"n":4}]},{"kind":"pencilStrike","marks":[{"x":1,"y":2,"n":2}]},{"kind":"place","x":1,"y":2,"dir":16},{"kind":"pencilAdd","marks":[{"x":2,"y":0,"n":3},{"x":2,"y":0,"n":4}]}]',
    },
    /** Held on 0 of 2499 positions walked: a plan takes a pair on about one
     * board in six hundred. Pinned by hand on the board above whose plan does. */
    pair: { id: `6x6dt:${PAIR_DESC}`, moves: MARK_ALL },
  },
});

describe("rome loop sentence", () => {
  it("counts the arrows of the walk, and outlines only them", () => {
    // The walk runs from the square pointed at back to the struck square,
    // which is named by its own mark, so it is not among the outlined arrows.
    const at = { x: 1, y: 1 };
    const one = say.loop([{ x: 1, y: 2 }, at], 2, at);
    expect(one.text).toBe("The arrow in the square below points back to this square");
    expect(one.refs[0].elements).toEqual([{ x: 1, y: 2 }]);
    const two = say.loop([{ x: 1, y: 2 }, { x: 0, y: 2 }, at], 2, at);
    expect(two.text).toBe("The arrows from the square below lead back to this square");
    expect(two.refs[0].elements).toEqual([
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ]);
  });
});

describe("rome hint render", () => {
  it("crosses the marks it rules out, hatches its area, and outlines its arrow", () => {
    // The sentence follows a placement inside a plan, so its step is a later
    // leg and the frame is the board with the legs before it played.
    const { recording, hint } = renderPinnedHint(romeGame, pinned("dup"), {
      defaultBackground: DEFAULT_BACKGROUND,
    });
    expect(hint.explanation).toMatch(/^This area now has/);
    // The marks it rules out keep their own pencil color and take a
    // strikethrough in it, rather than being crossed off for the player.
    expect(
      recording.ops.some((o) => o.op === "line" && o.color === COL_ARROW_PENCIL),
    ).toBe(true);
    // "This area" is hatched, one hatch per square of it; the arrow already
    // placed there is the one square outlined.
    const area = (hint?.highlights as { hatch?: unknown[] }).hatch ?? [];
    expect(area.length).toBeGreaterThan(1);
    const hatches = opsOfKind(recording.ops, "hatch");
    expect(new Set(hatches.map((h) => `${h.x},${h.y}`)).size).toBe(area.length);
    expect(markSides(recording.ops, COL_HINT_CELL)).toHaveLength(4);
    // A strike step rings nothing: a ring marks what a step decides, and this
    // one decides the struck marks (`point-a-cell-reference-at-its-cell`, D1).
    expect(ringsOf(recording.ops)).toEqual([]);
    expect(recording.ops).toMatchSnapshot();
  });

  /**
   * The reachability frame — the one Rome was picked for. A `loop` firing's
   * evidence is the chain of arrows leading back to the struck square, drawn as
   * an outlined contour: "the arrows from the square below lead back to this
   * square" is a claim the player walks by following the arrows themselves.
   */
  it("outlines the arrow chain a loop deduction walks, with no number on it", () => {
    const { recording, hint } = renderPinnedHint(romeGame, pinned("opensOnLoop"), {
      defaultBackground: DEFAULT_BACKGROUND,
    });
    // The outline is the squares whose arrows make the walk, and the struck
    // square they lead back to, which "this square" names.
    type Cells = readonly { x: number; y: number }[];
    const { area, targets } = hint?.highlights as { area: Cells; targets: Cells };
    const at = (cs: Cells) => cs.map((c) => `${c.x},${c.y}`);
    expect(area.length).toBeGreaterThanOrEqual(2);
    expect(at(area)).toEqual(expect.arrayContaining(at(targets)));
    expect(
      recording.ops.filter((o) => o.op === "text" && o.color === COL_HINT_CELL),
    ).toEqual([]);
    // The struck square is shown by its struck mark, not a ring.
    expect(ringsOf(recording.ops)).toEqual([]);
    // The strike: an arrow is a shape, so one "\" through it, in the arrow's
    // ink, thick enough to read over stripes (`drawStrike`).
    expect(
      recording.ops.some(
        (o) =>
          o.op === "line" &&
          o.color === COL_ARROW_PENCIL &&
          o.thickness >= 2 &&
          o.x2 - o.x1 === o.y2 - o.y1,
      ),
    ).toBe(true);
    expect(recording.ops).toMatchSnapshot();
  });
});
