/**
 * Wordtrail's dictionary: what it lists, each word's status as the player's
 * lines and crosses leave it, the spotlight on the board, and its agreement
 * with the hint, whose words must be ones it shows as still fitting.
 */
import { describe, expect, it } from "vitest";
import { edgeBetween, squareEdges } from "../../engine/board/square-edges.ts";
import type { ReferenceItem } from "../../engine/contract/types.ts";
import { LEFT_BUTTON } from "../../engine/input/pointer.ts";
import { CROSS } from "../../engine/mechanics/line-drawing.ts";
import { randomNew } from "../../engine/random/index.ts";
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { commonWords } from "../../engine/word-list/index.ts";
import { dictionary } from "./dictionary.ts";
import { wordtrailGame } from "./index.ts";
import { COL_SPOTLIGHT, layout } from "./render.ts";
import {
  DIFF_NORMAL,
  encodeParams,
  executeMove,
  newState,
  type WordtrailParams,
  type WordtrailState,
} from "./state.ts";
import { spell } from "./trails.ts";

const P: WordtrailParams = { w: 5, h: 5, words: 4, diff: DIFF_NORMAL };

function deal(seed: string): { state: WordtrailState; id: string } {
  const { desc } = wordtrailGame.newDesc(P, randomNew(seed));
  return { state: newState(P, desc), id: `${encodeParams(P, true)}:${desc}` };
}

const reference = (state: WordtrailState) =>
  dictionary.model(state, wordtrailGame.newUi(state));
const items = (state: WordtrailState): ReferenceItem[] =>
  reference(state).sections.flatMap((s) => s.items);

describe("wordtrail dictionary", () => {
  it("lists every common word of each asked length, once, a group a length", () => {
    const { state } = deal("dictionary list");
    const model = reference(state);
    expect(dictionary.title).toBe("Dictionary");
    expect(model.search).toBe(true);
    expect(model.filters.map((f) => [f.label, f.statuses])).toEqual([
      ["Fits", ["outstanding"]],
      ["Found", ["placed"]],
    ]);
    const lengths = [...new Set(state.lengths)];
    expect([...new Set(model.sections.map((s) => s.group))]).toEqual(
      lengths.map((n) => `${n} letters`),
    );
    for (const s of model.sections) {
      expect(s.items.every((i) => `${i.key.length} letters` === s.group)).toBe(true);
      expect(s.items.every((i) => i.label[0] === s.heading)).toBe(true);
    }
    expect(items(state).map((i) => i.key)).toEqual(
      lengths.flatMap((n) => commonWords(n)),
    );
    // Every word a trail spells fits a bare board, and no other word does.
    const words = new Set(state.trails.map((t) => spell(state.letters, t)));
    const fits = items(state).filter((i) => i.status === "outstanding");
    expect(fits.map((i) => i.key).sort()).toEqual([...words].sort());
    expect(items(state).length).toBeGreaterThan(fits.length);
    const other = items(state).find((i) => !words.has(i.key));
    expect(other?.status).toBe("ruledOut");
  });

  it("rules a word out where a cross cuts its only trail, and back in on undo", () => {
    const { state } = deal("dictionary cross");
    const g = squareEdges(state.w, state.h);
    const count = new Map<string, number>();
    for (const t of state.trails)
      count.set(spell(state.letters, t), (count.get(spell(state.letters, t)) ?? 0) + 1);
    const k = state.trails.findIndex((t) => count.get(spell(state.letters, t)) === 1);
    expect(k).toBeGreaterThanOrEqual(0);
    const trail = state.trails[k];
    const word = spell(state.letters, trail);
    const edge = edgeBetween(g, trail[0], trail[1]);
    const crossed = executeMove(state, {
      kind: "edges",
      changes: [{ edge, mark: CROSS }],
    });
    expect(items(crossed).find((i) => i.key === word)?.status).toBe("ruledOut");
    expect(items(state).find((i) => i.key === word)?.status).toBe("outstanding");
  });

  it("marks a word placed once its trail is drawn", () => {
    const { state } = deal("dictionary placed");
    const answer = wordtrailGame.solve(state, state);
    if (!answer?.ok) throw new Error("no answer");
    const solved = executeMove(state, answer.move);
    const placed = items(solved).filter((i) => i.status === "placed");
    expect(placed.length).toBeGreaterThan(0);
    expect(placed.length).toBeLessThanOrEqual(state.lengths.length);
  });

  it("names, on every step of a plan, words it shows as still fitting", () => {
    let named = 0;
    let counted = 0;
    for (const seed of ["agree a", "agree b", "agree c", "agree d", "agree e"]) {
      let state = deal(seed).state;
      for (let asked = 0; wordtrailGame.status(state) !== "solved"; asked++) {
        expect(asked).toBeLessThan(state.edges.length);
        const result = wordtrailGame.hint.plan(state);
        if (!result?.ok) throw new Error(`refused on ${seed}`);
        for (const step of result.steps) {
          const keys = step.reference ?? [];
          expect(keys.length, step.explanation).toBeGreaterThan(0);
          const fitting = new Set(
            items(state)
              .filter((i) => i.status !== "ruledOut")
              .map((i) => i.key),
          );
          for (const key of keys) expect(fitting.has(key), step.explanation).toBe(true);
          if (step.explanation.startsWith("Just ")) counted++;
          else if (keys.length > 2) named++;
          // A sentence that names its words names each of them.
          if (!step.explanation.startsWith("Just "))
            for (const key of keys)
              expect(step.explanation, step.explanation).toContain(key.toUpperCase());
          state = executeMove(state, step.move);
        }
      }
    }
    // Both forms of the sentence past two words were seen.
    expect({ named: named > 0, counted: counted > 0 }).toEqual({
      named: true,
      counted: true,
    });
  });
});

describe("wordtrail dictionary spotlight", () => {
  it("outlines the selected word's letters, and a press on the board ends it", () => {
    const { state, id } = deal("spotlight");
    const word = items(state).find((i) => i.status === "outstanding")?.key ?? "";
    const lit = renderScenario({ game: wordtrailGame, id, selectReference: word });
    expect(lit.recording.ops.some((op) => paintsWith(op, COL_SPOTLIGHT))).toBe(true);
    const plain = renderScenario({ game: wordtrailGame, id });
    expect(plain.recording.ops.some((op) => paintsWith(op, COL_SPOTLIGHT))).toBe(false);
    // A word no trail spells has nowhere to light.
    const nowhere = items(state).find((i) => i.status === "ruledOut")?.key ?? "";
    const dark = renderScenario({ game: wordtrailGame, id, selectReference: nowhere });
    expect(dark.recording.ops.some((op) => paintsWith(op, COL_SPOTLIGHT))).toBe(false);

    const ui = { ...wordtrailGame.newUi(state), spotlight: word };
    const ts = 48;
    const ds = wordtrailGame.newDrawState(state, ts);
    const b = layout(ts).border;
    expect(
      wordtrailGame.interpretMove(
        state,
        ui,
        ds,
        { x: b + ts / 2, y: b + ts / 2 },
        LEFT_BUTTON,
      ),
    ).not.toBeNull();
    expect(ui.spotlight).toBeNull();
  });
});
