/**
 * Singles, born from its description: what only this game's statements
 * decide. The engine's own tests read fill games for the board, the input,
 * the deal and the hint (`engine/fill/*.test.ts`), and the cross-game guards
 * reach it as a registered game. What is left here is upstream's IDs, the
 * numbers a deal lays, the corner's wordings and each rung's pinned board,
 * the number a shaded square hides, a wrong square outlined by Check & Save,
 * and the cursor that wraps.
 */

import { describe, expect, it } from "vitest";
import { COL_ERROR } from "../../engine/color/roles.ts";
import { DESC_OUT_OF_RANGE } from "../../engine/contract/desc-error.ts";
import { UI_UPDATE } from "../../engine/contract/game.ts";
import { spaceOf } from "../../engine/fill/board.ts";
import { encodeDesc } from "../../engine/fill/game-id.ts";
import { CURSOR_RIGHT, LEFT_BUTTON } from "../../engine/input/pointer.ts";
import { Midend } from "../../engine/midend/midend.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeAbsentTiers } from "../../engine/testing/absent-tiers.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import * as singles from "../../generated/games/singles/singles.compiled.ts";
import { game } from "../../generated/games/singles/singles.game.ts";

const SHADED = 1;
const CLEAR = 2;

/** Boards upstream's generator and the hand-written port dealt. */
const UPSTREAM = [
  "6x6dk:146214162623436526534361613462465334",
  "6x6dk:614262562311433246423351441133651123",
  "5x5de:1154415435251455411244252",
];

/** A 3x3 board whose one answer shades its four corners. */
const SMALL = "111321331";

/** A board from its game ID. */
const loaded = (id: string) => {
  const [params, desc] = id.split(":");
  return game.newState(game.decodeParams(params), desc);
};

/** What a pasted ID opens as: its params, or the refusal. */
const opened = (id: string) => {
  const me = new Midend(game);
  return me.newGameFromId(id) ?? me.getParams();
};

/** The hand-written port's moves, as the fill board's edits: `circle` is
 * clear and `black` shaded, at `y * w + x`. */
const edits = (
  w: number,
  sets: readonly (readonly [number, number, "circle" | "black"])[][],
) =>
  sets.map((s) => ({
    set: s.flatMap(([x, y, v]) => [y * w + x, v === "black" ? SHADED : CLEAR]),
  }));

/** The first step of the hint's plan on `id`. */
const firstStep = (id: string) => {
  const plan = game.hint.plan(loaded(id));
  if (!plan?.ok) throw new Error(`${id}: no hint`);
  return plan.steps[0];
};

describe("singles", () => {
  it("reads one character a square and writes the desc back", () => {
    const board = loaded(`3x3:${SMALL}`);
    expect(Array.from(board.dealt.number.v)).toEqual([1, 1, 1, 3, 2, 1, 3, 3, 1]);
    // A number past nine is a letter.
    expect(loaded("12x12:".padEnd(150, "c")).dealt.number.v[0]).toBe(12);
    for (const id of UPSTREAM) {
      const b = loaded(id);
      expect(encodeDesc(singles.deal, spaceOf(singles, b), b.dealt), id).toBe(
        id.split(":")[1],
      );
    }
  });

  it("refuses a desc that is not one", () => {
    expect(opened(`3x3:${SMALL}`)).toBe("3x3de");
    expect(opened("3x3:123231314")).toBe(DESC_OUT_OF_RANGE);
    expect(opened("3x3:12323131")).toMatch(/\.$/);
    expect(opened("3x3:1232313111")).toMatch(/\.$/);
    expect(opened("3x3:12323131_")).toMatch(/\.$/);
  });

  it("deals each tier, every number a repeat where it is shaded", () => {
    for (const id of ["5x5de", "6x6dk", "7x9dk", "4x4de"]) {
      const p = game.decodeParams(id);
      for (const seed of ["a", "b"]) {
        const { desc } = game.newDesc(p, randomNew(`singles-${id}-${seed}`));
        expect(opened(`${id}:${desc}`), `${id}:${desc}`).toBe(id);
        const board = game.newState(p, desc);
        const solved = game.solve(board, board);
        if (!solved.ok) throw new Error(`${id}:${desc}: ${solved.error}`);
        const done = game.executeMove(board, solved.move);
        expect(game.status(done), `${id}:${desc}`).toBe("solved");
        // Every number is one to the longer side, and a shaded one repeats
        // a number of its row or its column.
        const { w, h } = board;
        const n = board.dealt.number.v;
        for (let c = 0; c < w * h; c++) {
          expect(n[c]).toBeGreaterThanOrEqual(1);
          expect(n[c]).toBeLessThanOrEqual(Math.max(w, h));
          if (done.values[c] !== SHADED) continue;
          const [x, y] = [c % w, Math.floor(c / w)];
          const peers = [
            ...Array.from({ length: w }, (_, i) => y * w + i),
            ...Array.from({ length: h }, (_, j) => j * w + x),
          ].filter((d) => d !== c);
          expect(peers.some((d) => n[d] === n[c])).toBe(true);
        }
      }
    }
  });

  it("writes its text with each number inside what its square holds", () => {
    const board = game.executeMove(loaded(`3x3:${SMALL}`), {
      set: [8, SHADED, 0, CLEAR],
    });
    expect(game.textFormat?.(board)).toBe(
      [
        "+---+---+---+",
        "|(1)| 1 | 1 |",
        "+---+---+---+",
        "| 3 | 2 | 1 |",
        "+---+---+---+",
        "| 3 | 3 |[1]|",
        "+---+---+---+",
        "",
      ].join("\n"),
    );
  });

  it("hides a shaded square's number until the preference shows it", () => {
    const board = game.executeMove(loaded(`3x3:${SMALL}`), { set: [8, SHADED] });
    const ui = game.newUi(board);
    const pref = game.prefs?.find((p) => p.kw === "show-black-nums");
    expect(pref?.type).toBe("boolean");
    if (pref?.type !== "boolean") return;
    expect(pref.get(ui)).toBe(false);
    // A press off the grid flips it, and makes no move.
    const ds = preferredDrawState(game, board);
    expect(game.interpretMove(board, ui, ds, { x: 0, y: 0 }, LEFT_BUTTON)).toBe(
      UI_UPDATE,
    );
    expect(pref.get(ui)).toBe(true);
  });

  it("outlines a square Check & Save finds wrong, which breaks no rule yet", () => {
    const id = UPSTREAM[0];
    const fresh = loaded(id);
    const solved = game.solve(fresh, fresh);
    if (!solved.ok) throw new Error("no answer");
    const answer = game.executeMove(fresh, solved.move).values;
    const count = (r: ReturnType<typeof renderScenario>) =>
      r.recording.ops.filter((o) => "color" in o && o.color === COL_ERROR).length;
    for (let c = 0; c < answer.length; c++) {
      const moves = [{ set: [c, answer[c] === SHADED ? CLEAR : SHADED] }];
      if (count(renderScenario({ game, id, moves })) > 0) continue;
      const shown = renderScenario({ game, id, moves, showMistakes: true });
      expect(shown.mistakeCount).toBe(1);
      expect(count(shown)).toBeGreaterThan(0);
      return;
    }
    throw new Error("no wrong square that breaks no rule");
  });

  it("carries the cursor over the grid's edge", () => {
    const board = loaded(`3x3:${SMALL}`);
    const ui = game.newUi(board);
    const ds = preferredDrawState(game, board);
    for (let i = 0; i < 3; i++)
      game.interpretMove(board, ui, ds, { x: -1, y: -1 }, CURSOR_RIGHT);
    expect([ui.cursor.x, ui.cursor.y]).toEqual([0, 0]);
  });

  it("tells a sandwich, a pair and each corner by its own rung", () => {
    expect(firstStep("3x2:121312")).toMatchObject({
      rung: "sandwich",
      move: { set: [1, CLEAR] },
    });
    expect(firstStep("5x2:1122134512")).toMatchObject({
      rung: "pair",
      move: { set: [4, SHADED] },
    });
    const four = firstStep("2x2:2222");
    expect(four.rung).toBe("corner.four");
    expect(four.move.set).toEqual([0, SHADED, 3, SHADED]);
    // What singles out the four: the square inside matches too, which the
    // corner that matches its neighbors alone never says.
    expect(four.explanation).toContain("diagonally inside");
    expect(four.explanation).not.toContain("beside it");
    const rungs = (id: string) => {
      const plan = game.hint.plan(loaded(id));
      return plan?.ok ? plan.steps.map((s) => s.rung) : [];
    };
    expect(
      rungs("2x2:1112").some((r) => r === "corner.apex" || r === "corner.across"),
    ).toBe(true);
    expect(
      rungs("2x2:1122").some((r) => r === "corner.pairAtS" || r === "corner.pairAtT"),
    ).toBe(true);
  });
});

// Under 4 squares both ways, at Normal.
describeAbsentTiers(game, ["2x2dk", "2x3dk", "3x2dk", "3x3dk"]);

describeHintPins({
  game,
  params: [game.decodeParams("6x6dk"), game.decodeParams("5x5de")],
  pins: {
    sandwich: UPSTREAM[0],
    sameLine: { id: UPSTREAM[0], moves: edits(6, [[[2, 1, "circle"]]]) },
    besideCovered: {
      id: UPSTREAM[0],
      moves: edits(6, [[[2, 1, "circle"]], [[4, 1, "black"]]]),
    },
    pair: {
      id: "6x6dk:445642432165334561225311213556453244",
      moves: edits(6, [[[3, 3, "circle"]]]),
    },
    "corner.four": {
      id: "6x6dk:663255261455611642532264154346416613",
      moves: edits(6, [[[0, 1, "circle"]], [[3, 4, "circle"]], [[4, 3, "circle"]]]),
    },
    "corner.apex": {
      id: UPSTREAM[2],
      moves: edits(5, [[[3, 4, "circle"]], [[3, 1, "circle"]]]),
    },
    "corner.across": {
      id: "6x6dk:455613345534323165563453556344231546",
      moves: edits(6, [[[1, 2, "circle"]], [[1, 5, "circle"]]]),
    },
    "corner.pairAtS": {
      id: "6x6dk:455613345534323165563453556344231546",
      moves: edits(6, [[[1, 2, "circle"]]]),
    },
    "corner.pairAtT": {
      id: "6x6dk:125136446533344162432351161354613145",
      moves: edits(6, [
        [[0, 2, "circle"]],
        [[1, 4, "circle"]],
        [[2, 3, "circle"]],
        [[2, 5, "circle"]],
        [[3, 1, "circle"]],
      ]),
    },
    boxedIn: {
      id: UPSTREAM[0],
      moves: edits(6, [
        [[2, 1, "circle"]],
        [[4, 1, "black"]],
        [
          [3, 1, "circle"],
          [5, 1, "circle"],
          [4, 0, "circle"],
          [4, 2, "circle"],
        ],
        [[0, 0, "black"]],
        [
          [1, 0, "circle"],
          [0, 1, "circle"],
        ],
        [[5, 0, "black"]],
        [[1, 1, "black"]],
        [[1, 2, "circle"]],
        [[1, 3, "black"]],
        [
          [0, 3, "circle"],
          [2, 3, "circle"],
          [1, 4, "circle"],
        ],
        [[3, 4, "circle"]],
        [[4, 5, "circle"]],
        [[3, 5, "black"]],
        [[2, 5, "circle"]],
        [[5, 4, "circle"]],
      ]),
    },
    split: {
      id: "6x6dk:231635324553435412511344463361362544",
      moves: edits(6, [
        [[0, 3, "circle"]],
        [[1, 1, "circle"]],
        [[4, 4, "circle"]],
        [[1, 4, "black"]],
        [
          [0, 4, "circle"],
          [2, 4, "circle"],
          [1, 3, "circle"],
          [1, 5, "circle"],
        ],
        [[2, 3, "black"]],
        [
          [3, 3, "circle"],
          [2, 2, "circle"],
        ],
        [[3, 4, "black"]],
        [[0, 2, "black"]],
        [
          [1, 2, "circle"],
          [0, 1, "circle"],
        ],
        [
          [5, 1, "black"],
          [0, 5, "black"],
        ],
        [
          [4, 1, "circle"],
          [5, 0, "circle"],
          [5, 2, "circle"],
        ],
        [[3, 1, "black"]],
        [
          [2, 1, "circle"],
          [3, 0, "circle"],
          [3, 2, "circle"],
        ],
        [[1, 0, "black"]],
        [
          [0, 0, "circle"],
          [2, 0, "circle"],
        ],
        [[3, 5, "circle"]],
        [[5, 4, "circle"]],
        [[4, 0, "circle"]],
        [[2, 5, "circle"]],
      ]),
    },
    offset: {
      id: "6x6dk:122513631454336424114662242615325532",
      moves: edits(6, [
        [[1, 4, "circle"]],
        [[4, 1, "circle"]],
        [[4, 2, "circle"]],
        [[5, 4, "circle"]],
      ]),
    },
  },
});
