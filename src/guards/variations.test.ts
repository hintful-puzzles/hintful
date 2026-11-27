/**
 * A variation a description states is offered by its game under the word
 * the description's shape gives it: a ruleset where it replaces, a modifier
 * where it only adds (`variationWord`). The field is the declaration the
 * engine reads; the description is what makes the word computed.
 *
 * And a board is played with each variation off as well as on: dealt, drawn
 * with its hint, solved, checked and written as text through a real midend.
 * A capability a variation adds is built on a fixture's boards with it on;
 * Solo's flip found three engine defects only a board with it off reached
 * (its cages drawn, its rungs asked for, its units read by the rules).
 */

import { describe, expect, it } from "vitest";
import {
  isFormal,
  isLibrary,
  isPlanning,
  variationWord,
} from "../describe/description.ts";
import { loadDescriptionFile } from "../describe/load.ts";
import type { ParamConfigItem } from "../engine/contract/game.ts";
import { type BornModule, fillGame } from "../engine/fill/game.ts";
import { paramsError } from "../engine/game-id/params.ts";
import { rulesetField } from "../engine/game-id/ruleset.ts";
import { getTsGame } from "../engine/midend/registry.ts";
import { dealsPromptly, dealt } from "../engine/testing/dealt.ts";
import type { AnyGame } from "../engine/testing/enrollment.ts";
import { leafPresets } from "../engine/testing/presets.ts";
import { renderScenario } from "../engine/testing/render-scenario.ts";
import "../games/index.ts";

// A fixture is no registered game: it is built as its tests build it.
const fixtures = import.meta.glob<BornModule<Record<string, never>>>(
  "../generated/engine/testing/fixtures/*/*.compiled.ts",
  { eager: true },
);
const gameOf = (id: string): AnyGame | null => {
  const module =
    fixtures[`../generated/engine/testing/fixtures/${id}/${id}.compiled.ts`];
  return getTsGame(id) ?? (module === undefined ? null : fillGame(id, module));
};

const texts = import.meta.glob<string>("../**/*.description.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
});

// A born game's variation is switched by the setting of its name, which
// states the words its title and the dialog say it by; a hand-written game's
// variation is named by those words.
const varied = Object.entries(texts).flatMap(([path, text]) => {
  const d = loadDescriptionFile(text, path);
  if (isLibrary(d) || !(isFormal(d) || isPlanning(d)) || d.variations === undefined)
    return [];
  const settings = isFormal(d) ? (d.settings ?? {}) : {};
  const wordOf = (name: string): string => {
    const s = settings[name];
    return s !== undefined && "words" in s && typeof s.words === "string"
      ? s.words
      : name;
  };
  return [{ path, game: d.game, variations: d.variations, wordOf }];
});

/** How the game offers a variation by `name`: as a ruleset by its name, as
 * a modifier by its words, or not at all. */
function offered(id: string, name: string): string[] {
  const game = gameOf(id);
  if (game === null) return [`no game ${id}`];
  const config = game.paramConfig;
  return [
    ...(rulesetField(game)?.rulesets.some((r) => r.name === name) ? ["ruleset"] : []),
    ...config.filter((i) => i.modifier?.words === name).map(() => "modifier"),
  ];
}

describe("a stated variation is offered under the word its shape gives", () => {
  it("finds stated variations", () => {
    expect(varied.length).toBeGreaterThan(0);
  });

  for (const { path, game, variations, wordOf } of varied)
    for (const [name, v] of Object.entries(variations))
      it(`${path}: ${name}`, () => {
        expect(offered(game, wordOf(name))).toEqual([variationWord(v)]);
      });
});

type Value = string | number | boolean;

/** The boards variation `name` is played on: for each value of the dialog
 * item that sets it, a modifier's off and on or each ruleset of the choice,
 * the first preset that takes the value and deals. */
function switchedBoards(
  game: AnyGame,
  name: string,
): { title: string; params: unknown; held: boolean }[] {
  const ruleset = rulesetField(game);
  const item: ParamConfigItem<unknown> | null = ruleset?.rulesets.some(
    (r) => r.name === name,
  )
    ? ruleset
    : (game.paramConfig.find(
        (i: ParamConfigItem<unknown>) => i.modifier?.words === name,
      ) ?? null);
  if (item === null) return [];
  const values: [Value, string][] =
    item.type === "choices"
      ? item.choices.map((words, i): [Value, string] => [i, words])
      : [
          [false, "off"],
          [true, "on"],
        ];
  const presets = leafPresets(game);
  return values.map(([value, words]) => {
    for (const base of presets) {
      const params = structuredClone(base.params);
      (item.set as (p: unknown, v: Value) => void)(params, value);
      if (paramsError(game, params, true) !== null) continue;
      if (!dealsPromptly(game, params)) continue;
      return { title: `${base.title}, ${item.name}: ${words}`, params, held: true };
    }
    return { title: `${item.name}: ${words}`, params: null, held: false };
  });
}

describe("a board is played with each variation off and on", () => {
  for (const { path, game: id, variations, wordOf } of varied)
    for (const name of Object.keys(variations).map(wordOf))
      it(`${id}: ${name}, from ${path}`, () => {
        const game = gameOf(id);
        if (game === null) throw new Error(`no game ${id}`);
        const boards = switchedBoards(game, name);
        // A variation the dialog cannot set is the test above's refusal.
        expect(boards.length, `${name} has no dialog item`).toBeGreaterThan(0);
        let solved = 0;
        for (const { title, params, held } of boards) {
          expect(held, `${title}: no preset takes it and deals`).toBe(true);
          const { desc, aux } = dealt(game, params);
          const id = `${game.encodeParams(params, true)}:${desc}`;
          // Drawn, with the hint the midend shows on it.
          const { recording, midend } = renderScenario({ game, id, showHint: true });
          expect(recording.ops.length, `${title}: draws nothing`).toBeGreaterThan(0);
          midend.formatAsText();
          // Solve throws where its move leaves the board other than solved,
          // which reads the board's rules.
          const refused = midend.solve();
          if (refused !== null) continue;
          solved++;
          expect(midend.findMistakes(), `${title}: its answer has mistakes`).toBe(0);
          // The live errors read the rules, which Solve and the mistake
          // check do not: the answer breaks none of them.
          const { rules } = game;
          if (rules === undefined) continue;
          const start = game.newState(params, desc);
          const answer = game.solve(start, start, aux);
          if (!answer.ok) throw new Error(`${title}: Solve refused once and not twice`);
          const end = game.executeMove(start, answer.move);
          const g = rules.grid(end);
          expect(
            rules.violations(end, g),
            `${title}: its answer breaks a rule`,
          ).toEqual([]);
          expect(rules.isAnswer(end, g), `${title}: its answer is no answer`).toBe(
            true,
          );
        }
        // A game whose Solve refused every board would pass having read no
        // answer.
        expect(solved, `${name}: Solve refused every board`).toBeGreaterThan(0);
      });
});
