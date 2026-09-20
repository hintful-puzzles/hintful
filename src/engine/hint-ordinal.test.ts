/**
 * Cross-game guarantee: **an ordered chain reaches the canvas with its order on
 * it**.
 *
 * A Tactic-tier deduction is a bounded chain of forced consequences, and its
 * hint owes the player the chain *shown* — each link marked in the order it
 * falls — rather than a claim they can only check by redoing the deduction.
 * {@link ORDERING_GAMES} is the set reachable under this sweep.
 *
 * The mechanism is shared (`OrderedCell.order` → `OverlaySidecar.setOrder` →
 * `drawHintOrdinal`), but **the wiring is not**: each game's tile painter has to
 * take `ds.hint.order[i]` and pass it on, and a game that forgot would shade its
 * chain, narrate "cell 3 is driven to 4", and draw no numbers at all — a
 * sentence pointing at labels that do not exist. That is one line per game, in
 * seven renderers, so it is guarded once here for all of them.
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
 * A forcing chain is tier-gated, so the sweep walks every tier — the reason
 * `hint-quality.test.ts` grew its own per-tier block. Games that never produce
 * one are skipped, and the set that *did* produce one is asserted, so this file
 * can never quietly go from guarding six games to guarding none.
 */
import { describe, expect, it } from "vitest";
import { HINT_EVIDENCE } from "./color/palette.ts";
import { difficultyTiers } from "./difficulty.ts";
import { randomNew } from "./random/index.ts";
import {
  type AnyGame,
  firstLeaf,
  gatePresets,
  HINT_GAMES,
} from "./testing/hint-games.ts";
import { DEFAULT_BACKGROUND, renderScenario } from "./testing/render-scenario.ts";
import type { Color } from "./types.ts";

const SEEDS = ["ord-a", "ord-b", "ord-c"];

/**
 * Games **measured** to emit an ordered chain under this sweep. A game leaving
 * the set means a hint stopped numbering its chain — the regression this file
 * exists for — so the set is asserted rather than merely used to skip.
 *
 * It is six, not the seven that ship the code. **Group is absent by
 * measurement, not by oversight**: its forcing rung comes from the same shared
 * `latin.ts` as Keen's and Unequal's, but at its first preset's `w = 6` it fires
 * on 0 of 8 seeds at *every one* of its five tiers — a 6-element Cayley table
 * settles before a two-candidate chain can form. Larger boards were not swept
 * because generating them is minutes per seed. Written down rather than left
 * implicit, so a later reader does not add Group back and spend the afternoon
 * wondering why it fails. Solo reaches it on `3x3 Extreme`, a preset of its
 * own, which {@link chainBoards} picks up from the menu.
 */
const ORDERING_GAMES = new Set([
  "clusters",
  "keen",
  "salad",
  "solo",
  "towers",
  "unequal",
]);

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
 * The ordinals a step declares, or null when it declares none.
 *
 * Reads **any** array field carrying `order`, not `area` specifically: the six
 * Latin games put their chain in `area` because that is their evidence channel,
 * while Clusters has a `chain` field of its own (its links carry the color the
 * hypothesis would force them to, which no other game has). The invariant is
 * *where a game declares an order it must draw it* — naming one field would make
 * this guard a check on a spelling rather than on the property, which is the
 * shape this repo has now been bitten by five times.
 */
function declaredOrder(highlights: unknown): number[] | null {
  if (typeof highlights !== "object" || highlights === null) return null;
  const orders: number[] = [];
  for (const value of Object.values(highlights)) {
    if (!Array.isArray(value)) continue;
    for (const entry of value) {
      const k = (entry as { order?: unknown } | null)?.order;
      if (typeof k === "number") orders.push(k);
    }
  }
  return orders.length > 0 ? orders : null;
}

/**
 * The boards this sweep looks for a chain on: **the gate slice, plus every
 * tier of the smallest preset.**
 *
 * The slice alone is not enough here, and the measurement is the argument.
 * A two-candidate chain needs a board *tight* enough that cells run out of
 * candidates in a line, which is a **small grid at a hard tier** — and a
 * presets menu never offers that pairing, because menus climb size and
 * difficulty together. Keen is the case: across **all ten** of its presets at
 * eight seeds each, a chain fires **zero** times, and it fires readily on the
 * 4x4 its first preset gives once the tier is turned up. So dropping the tier
 * sweep would have taken Keen's renderer out of this guard entirely, which is
 * the one line per game the file exists to hold.
 *
 * **A synthesized tier is not a fiction here**, and that is what separates this
 * from `docs/games/testing.md` § "How a cross-game guard finds its population"
 * rule 6. Rule 6's case asked whether a *board* carries the difficulty its
 * params claim, which a 4x4 cannot; this asks whether a renderer draws what its
 * hint declares, and 4x4 Hard is a configuration the Custom dialog offers and
 * `validateParams` accepts, so a player can sit in front of one. It is the same
 * corner `hint-quality.test.ts`'s `lintCases` walks for the same reason.
 *
 * What the slice adds on top is the *modes*: Salad's Number Ball, Solo's
 * Killer, X and jigsaw, Unequal's Adjacent — each a rung of its own, and none
 * of them reachable by writing a tier onto the first preset.
 *
 * **It also retires a roster.** `BIGGER_BOARD = { solo: "3x3 Extreme" }` stood
 * here because the tier sweep keeps the first preset's *size*, and Solo's
 * `2x2 Trivial` 4x4 has no room for a chain. The entry was honest and
 * well-argued, and it was still a hand-maintained list a second game could join
 * only by being remembered. The slice picks `3x3 Extreme` on its own, because
 * Extreme is a value of Solo's difficulty axis and that is the smallest preset
 * offering it — the board the roster named by hand is the board the derivation
 * names, and Solo is still in {@link ORDERING_GAMES} with the roster deleted.
 */
function chainBoards(id: string, game: AnyGame): { title: string; params: unknown }[] {
  const out = gatePresets(id, game);
  const contract = game.difficulty;
  const tiers = difficultyTiers(game);
  if (!contract || !tiers) return out;
  const base = firstLeaf(game.presets());
  const seen = new Set(out.map((e) => JSON.stringify(e.params)));
  for (const [tier, tierName] of tiers.entries()) {
    const params = contract.withTier(base, tier);
    const key = JSON.stringify(params);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ title: `first preset at ${tierName}`, params });
  }
  return out;
}

describe("an ordered hint chain carries its order to the canvas", () => {
  const sawOrdinals = new Set<string>();

  for (const [name, game] of HINT_GAMES) {
    it(`${name}: every numbered chain is 1..n, and every number is drawn`, () => {
      for (const { title, params } of chainBoards(name, game)) {
        if (game.validateParams(params, true)) continue; // refused at this size
        for (const seed of SEEDS) {
          let board: { desc: string; aux?: string };
          try {
            board = game.newDesc(params, randomNew(`${name}-${title}-${seed}`));
          } catch {
            continue; // ungenerable here; difficulty-contract.test.ts owns that
          }
          const { desc, aux } = board;
          const res = game.hint?.(game.newState(params, desc), aux);
          if (!res?.ok) continue;

          for (const step of res.steps) {
            const orders = declaredOrder(step.highlights);
            if (!orders) continue;

            // (a) the chain is 1..n, each exactly once.
            expect(
              [...orders].sort((a, b) => a - b),
              `${name}: chain ordinals are not 1..${orders.length}`,
            ).toEqual(orders.map((_o, i) => i + 1));

            // (b) …and the frame actually draws them. Reached through a real
            // Midend so this is the production render path, not a double.
            const scenario = renderScenario({
              game,
              id: `${game.encodeParams(params, true)}#${name}-${title}-${seed}`,
              defaultBackground: DEFAULT_BACKGROUND,
              showHint: true,
              hintUntil: (s) => s.explanation === step.explanation,
            });
            // **In the ordinal's own color.** The first cut asked only whether
            // the *text* "1" reached the canvas, and passed with Keen's ordinal
            // draw deleted outright — because a Keen cell already prints "1" as
            // a pencil mark. It was proved vacuous by removing the wiring and
            // watching it stay green, which is the only way that class of
            // assertion is ever caught. Matching the resolved `rgb` rather than
            // the palette index keeps it off the other proxy: an index is a
            // name for a color, not the color.
            //
            // Compared as **sets**, not as a multiset: Towers repaints each tile
            // up to four times inside one clip rect (its 3D towers spill into
            // their neighbors, so a cache miss redraws a 2x2 block and lets the
            // clip trim it), which draws a chain cell's ordinal four times over.
            // That is the renderer working as designed, and the property here is
            // *which numbers are on the board*, not how many draw calls put them
            // there. Set equality still catches both real failures: none drawn,
            // and a number drawn that the chain never declared.
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
            sawOrdinals.add(name);
            return; // one confirmed chain per game is the guarantee
          }
        }
      }
    });
  }

  // The "how many did I actually look at?" guard. Without it, a change that
  // stopped every game numbering its chains would leave this file green with
  // zero assertions run — the silent-shrink shape the probe's test-file floor
  // and `touch-input.test.ts`'s registry count both exist to catch.
  it("the set of games that number a chain has not shrunk", () => {
    for (const name of ORDERING_GAMES) {
      expect(sawOrdinals.has(name), `${name} no longer numbers its forcing chain`).toBe(
        true,
      );
    }
  });
});
