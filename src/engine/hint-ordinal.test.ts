/**
 * Cross-game guarantee: **an ordered chain reaches the canvas with its order on
 * it**.
 *
 * A Tactic-tier deduction is a bounded chain of forced consequences, and its
 * hint owes the player the chain *shown* — each link marked in the order it
 * falls — rather than a claim they can only check by redoing the deduction.
 *
 * The mechanism is shared (`OrderedCell.order` → `OverlaySidecar.setOrder` →
 * `drawHintOrdinal`), but **the wiring is not**: each game's tile painter has to
 * take `ds.hint.order[i]` and pass it on, and a game that forgot would shade its
 * chain, narrate "cell 3 is driven to 4", and draw no numbers at all — a
 * sentence pointing at labels that do not exist. That is one line per game, so
 * it is guarded once here for all of them.
 *
 * Two assertions, and the second is the one a shared mechanism cannot supply:
 *
 *  - **the data is well-formed** — an area carrying any ordinal carries exactly
 *    `1..n`, each once. A chain that numbered only its first cell, numbered from
 *    zero, or repeated a digit would read as a different chain from the one the
 *    solver found;
 *  - **the ordinals are on the canvas** — the frame's text ops *in the ordinal's
 *    own color* are exactly the declared numbers. Asserted against the resolved
 *    `rgb`, not against a palette index, because an index is a name for a color
 *    and not the color (the lesson `clusters-hint.test.ts` records at length).
 *
 * **The color clause is load-bearing**; the assertion says why.
 *
 * Each game is checked on one pinned position (`testing/hint-chain-pins.ts`),
 * so a normal run searches for nothing. Which games owe a pin is held by
 * `hint-quality.test.ts`, whose walk fails on a numbered chain from a game
 * without one.
 */
import { describe, expect, it } from "vitest";
import { HINT_EVIDENCE } from "./color/palette.ts";
import { difficultyTiers, withTier } from "./difficulty.ts";
import { paramsError } from "./params.ts";
import { CHAIN_PINS, declaredOrder } from "./testing/hint-chain-pins.ts";
import { type AnyGame, gatePresets, HINT_GAMES } from "./testing/hint-games.ts";
import { describeHintPins } from "./testing/hint-positions.ts";
import { firstLeaf, leafPresets } from "./testing/presets.ts";
import { DEFAULT_BACKGROUND, renderScenario } from "./testing/render-scenario.ts";
import { itOverWholeSweep } from "./testing/slow.ts";
import type { Color } from "./types.ts";

/** A palette color as the `rgb(r, g, b)` label `RecordingDrawing` records. */
function rgbOf(color: Color): string {
  const c = (v: number): number => Math.round(v * 255);
  return `rgb(${c(color[0])}, ${c(color[1])}, ${c(color[2])})`;
}

/** The ordinal's color as that label — computed once, so a game whose palette
 * index drifted would fail rather than quietly match a neighbor.
 *
 * It is `HINT_EVIDENCE`, and by construction rather than by coincidence: the
 * number is an *index into* the evidence, so it is the same role as the evidence
 * outline it numbers rather than a fourth hint color. */
const ORDINAL_RGB = rgbOf(HINT_EVIDENCE);

/**
 * The boards the scan looks for a chain on: **the gate slice, every tier of
 * the smallest preset, and the largest preset at its hardest taught tier.**
 *
 * The slice alone is not enough here, and the measurement is the argument.
 * A two-candidate chain needs a board *tight* enough that cells run out of
 * candidates in a line, which is a **small grid at a hard tier** — and a
 * presets menu never offers that pairing, because menus climb size and
 * difficulty together. Keen is the case: across **all ten** of its presets at
 * eight seeds each, a chain opened a plan **zero** times, and it does so
 * readily on the 4x4 its first preset gives once the tier is turned up.
 *
 * **A synthesized tier is not a fiction here**, and that is what separates this
 * from `docs/games/testing.md` § "How a cross-game guard finds its population"
 * rule 6. Rule 6's case asked whether a *board* carries the difficulty its
 * params claim, which a 4x4 cannot; this asks whether a renderer draws what its
 * hint declares, and 4x4 Hard is a configuration the Custom dialog offers and
 * `validateParams` accepts, so a player can sit in front of one.
 *
 * What the slice adds on top is the *modes*: Salad's Number Ball, Solo's
 * Killer, X and jigsaw, Unequal's Adjacent — each a rung of its own, and none
 * of them reachable by writing a tier onto the first preset.
 */
function chainBoards(id: string, game: AnyGame): unknown[] {
  const out = gatePresets(id, game).map((e) => e.params as unknown);
  const tiers = difficultyTiers(game);
  if (game.difficulty && tiers) {
    const base = firstLeaf(game.presets());
    const seen = new Set(out.map((params) => JSON.stringify(params)));
    // And the last preset at the hardest tier a hint teaches, the corner
    // `hint-quality.test.ts`'s `lintCases` walks: Group numbers a chain at
    // 12x12 Hard and on no board above.
    const top = tiers.length - (tiers.at(-1) === "Unreasonable" ? 2 : 1);
    const last = leafPresets(game).at(-1);
    const corner = last && top >= 0 ? [withTier(game, last.params, top)] : [];
    for (const params of [
      ...[...tiers.keys()].map((tier) => withTier(game, base, tier)),
      ...corner,
    ]) {
      const key = JSON.stringify(params);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(params);
    }
  }
  return out.filter((params) => !paramsError(game, params, true));
}

describe("an ordered hint chain carries its order to the canvas", () => {
  // The "how many did I actually look at?" guard: a pin for a game that left
  // the registry would be skipped below, and a file skipping every game would
  // be green.
  itOverWholeSweep("every pinned game ships a hint", () => {
    const hinted = new Set(HINT_GAMES.map(([name]) => name));
    const pinned = Object.keys(CHAIN_PINS);
    expect(pinned.length).toBeGreaterThan(0);
    expect(pinned.filter((name) => !hinted.has(name))).toEqual([]);
  });

  for (const [name, game] of HINT_GAMES) {
    const pin = CHAIN_PINS[name];
    if (pin === undefined) continue;

    const pinned = describeHintPins({
      game,
      params: chainBoards(name, game),
      seeds: 3,
      kinds: { numberedChain: (step) => declaredOrder(step.highlights) !== null },
      pins: { numberedChain: pin },
    });

    it(`${name}: the numbered chain is 1..n, and every number is drawn`, () => {
      const { id, moves, step } = pinned("numberedChain");
      const orders = declaredOrder(step.highlights) ?? [];

      // (a) the chain is 1..n, each exactly once.
      expect(
        [...orders].sort((a, b) => a - b),
        `${name}: chain ordinals are not 1..${orders.length}`,
      ).toEqual(orders.map((_o, i) => i + 1));

      // (b) …and the frame actually draws them. Reached through a real Midend
      // so this is the production render path, not a double.
      const scenario = renderScenario({
        game,
        id,
        moves,
        defaultBackground: DEFAULT_BACKGROUND,
        showHint: true,
      });
      expect(scenario.hint?.explanation).toBe(step.explanation);
      // **In the ordinal's own color.** The first cut asked only whether the
      // *text* "1" reached the canvas, and passed with Keen's ordinal draw
      // deleted outright — because a Keen cell already prints "1" as a pencil
      // mark. It was proved vacuous by removing the wiring and watching it
      // stay green, which is the only way that class of assertion is ever
      // caught. Matching the resolved `rgb` rather than the palette index
      // keeps it off the other proxy: an index is a name for a color, not the
      // color.
      //
      // Compared as **sets**, not as a multiset: Towers repaints each tile up
      // to four times inside one clip rect (its 3D towers spill into their
      // neighbors, so a cache miss redraws a 2x2 block and lets the clip trim
      // it), which draws a chain cell's ordinal four times over. The property
      // here is *which numbers are on the board*, not how many draw calls put
      // them there. Set equality still catches both real failures: none
      // drawn, and a number drawn that the chain never declared.
      const drawn = new Set(
        scenario.recording.ops.flatMap((o) =>
          o.op === "text" && o.rgb === ORDINAL_RGB ? [o.text] : [],
        ),
      );
      expect(
        [...drawn].sort(),
        `${name}: the chain's ordinals are not on the canvas — ` +
          `the renderer is not passing OverlaySidecar.order to its tile painter`,
      ).toEqual([...new Set(orders.map(String))].sort());
    });
  }
});
