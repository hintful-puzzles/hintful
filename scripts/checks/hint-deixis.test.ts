/**
 * The check a grep cannot do: **which hint steps point at a square with a bare
 * word while a second mark is on the board?** (`disambiguate-hint-deixis` task
 * 4.)
 *
 * The sweep that opened that change grepped the narrations for a deictic
 * co-occurring with a second-mark word (`ringed`/`shaded`/`highlighted`), which
 * finds only the sentences that *mention* the second mark. One that is bare
 * while a mark is **displayed and unmentioned** shows the player the same two
 * marks and says nothing about either — invisible to that grep, and the reason
 * for this file.
 *
 * It reads the *frame* instead: every hinting game, **every board the gate
 * slice offers** (a rung is tier-gated, and `audit-guessing-tier-names` §3.2
 * found a planted violation staying green because a sweep looked only at
 * `firstLeaf(presets())`), each step's declared marks counted by role, and each
 * explanation tested for a bare deictic.
 *
 * It earned its keep once already: Light Up's *"This square is still dark, and
 * every square that could light it … is crossed out or already lit"* shades that
 * corridor on the board and never said so, and no grep for a second-mark word
 * could have found a sentence that contains none.
 *
 * **It is a report, not a gate, and its own numbers are why.** After the four
 * games' sentences were fixed it flagged **230 sentence shapes across 20
 * games**, and reading all of them found **nothing further to change**.
 *
 * It widened to **505 shapes across 27 games**, over 25,670 steps, when
 * `slice-the-first-leaf-hint-guards-by-axis` pointed it at the presets menu
 * instead of at tiers written onto the first preset: seven games appeared that
 * never had a board here, and Loopy alone contributed 29 from twenty tilings.
 * Reading all 505 (`read-the-widened-deixis-report`) again found **nothing
 * further to change**: every row tied by one of the four classes below — 122 by
 * a continuation leg, 82 by naming the second mark the way the board draws it,
 * 184 by a line, region or run, and the rest by value, by state (Boats' filled
 * segment against an empty square) or by kind. The report itself states the
 * figure of the day; these are what that reading covered.
 *
 * Two things that read found are worth carrying. **A row can mark one place,
 * not two**: `markRoles` counts declared role *fields*, and a step whose
 * evidence is the acted-on square itself declares two of them — which is why
 * Sticks can name a clue of the same value as its target (46 of 49 such steps)
 * with nothing ambiguous on the board. And the sweep's blind spot is the
 * inverse of its subject: a sentence that points at cells the frame never
 * marks. Keying on a *plural* deictic over the same corpus found six shapes,
 * four of them Loopy's, where the pair connector the move draws is the mark;
 * the two real ones were Solo's, and `mark-the-cells-solo-points-at` marked
 * what they name — which is why one of Solo's rows is gone from the report and
 * another became three, one per region kind.
 *
 * The false positives are not noise to be tuned away; they
 * are four legitimate ways to tie a deictic that no lexical rule recognizes:
 *
 * - **by value** — Singles' *"This 3 shares a line with the ringed white 3"*;
 * - **by line or region context** — Group's *"In this row, c can go in only this
 *   cell — every other cell in the row has ruled it out"*;
 * - **by a continuation leg's antecedent** — Slant's *"The same clue forces this
 *   square too"*, Spokes' *"And rule this one out too"*;
 * - **by the marks being different kinds of thing.** This is the big one, and it
 *   is the rule a future port should carry: the ambiguity needs two marks of the
 *   **same kind**. Palisade marks an *edge* against *regions*, Spokes a *spoke*
 *   against *hubs*, Sticks a *square* against a *clue* — in each, the noun in
 *   "this edge" / "this line" / "this square" already picks the target out. All
 *   four genuine cases (Clusters, Bricks, Range, Light Up) marked a cell against
 *   another cell.
 *
 * Counting *rendered* hint-role colors instead of declared roles was the
 * originally-proposed instrument; it would not separate those cases either
 * (Spokes' spoke and hub are still two hint colors), and costs a full
 * `renderScenario` per step. What rendering would add is the one thing this
 * cannot see: a role declared but never drawn, or drawn but never declared.
 *
 * So the gate lives per game, next to the vocabulary that can judge it —
 * `clusters-hint.test.ts`, `bricks-hint.test.ts`, `range-hint.test.ts`,
 * `lightup-hint.test.ts` — and this file is the periodic sweep that says where
 * to look next. Run it with:
 *
 *     npx vitest run -c scripts/checks/diff.vitest.config.mts hint-deixis
 */
import { writeFileSync } from "node:fs";
import { expect, it } from "vitest";
import { randomNew } from "../../src/engine/random/index.ts";
import {
  gatePresets,
  HINT_GAMES,
  markRoles,
} from "../../src/engine/testing/hint-games.ts";

const OUT = "metrics/hint-deixis.md";

/** A bare pointer at the acted-on element: a demonstrative plus a board noun,
 * or the vaguest of them all, "here". */
const DEICTIC =
  /\b(this|that) (cell|square|tile|dot|region|line|edge|clue|one|piece|domino|block|number|digit|color|column|row|gap|space|island|shape|corner|end|move|tent|light|bulb|wall|arrow|node|circle|group|face|brick|slot|peg|junction|word|letter|monster|spoke|segment|run|hub|set)\b|\bhere\b/i;

/** The tie forms this project has actually used, as a *relation* rather than a
 * role name. Deliberately excludes `ringed`/`shaded`/`highlighted`: those name
 * the **other** mark, and a sentence containing one is exactly what the
 * co-occurrence grep already flagged.
 *
 * Every alternative here excuses at least one row, which is the property to
 * preserve when one is added: an alternative pinned to a sentence that later
 * changed goes on matching nothing while reading as coverage. Three did.
 * `except this one` and `could light it are marked` were Light Up's, and the
 * 120-character pass (`hold every hint step to 120 characters`) rewrote both
 * sentences out from under them — which is why Light Up's *"The ringed square
 * is still dark and only this square can still light it"* is a row today. It
 * ties by naming the other mark, so it stays a row rather than a phrase.
 *
 * The liveness is asserted below rather than left to this paragraph, over the
 * alternatives read back off the source so there is one copy of them. */
const RELATIONAL =
  /\bbeside\b|\bnext to\b|\bneighbor|\babove\b|\bbelow\b|\bbetween\b|\bpast\b|\bbeyond\b|\baround it\b|\bfrom it\b|\breaches\b|\bsits\b|\btouch|\bas far as this\b/i;

/** Each alternative of {@link RELATIONAL}, on its own, so the sweep can say
 * which one excused a step. None contains a top-level `|`. */
const RELATIONAL_ALTS = RELATIONAL.source
  .split("|")
  .map((alt) => [alt, new RegExp(alt, "i")] as const);

const SEEDS = ["deixis-a", "deixis-b"];

it("reports every hint step that points bare while a second mark is displayed", () => {
  const rows: string[] = [];
  const perGame = new Map<string, number>();
  const excused = new Map<string, number>();
  let examined = 0;
  let withSecondMark = 0;

  for (const [name, game] of HINT_GAMES) {
    const shapes = new Set<string>();
    // Every board the gate slice offers, rather than every tier written onto
    // the first preset. This sweep's whole subject is *sentences beside marks*,
    // and the `withTier` form it used to build produced no board with a cage, a
    // jigsaw block, an X diagonal, an Adjacent clue, a Tectonic region or any
    // Loopy tiling but Squares — so the modes' narration, which is where a
    // deictic is most likely to point at one of two marks of the same kind, was
    // outside the report it is a report about.
    for (const { title, params } of gatePresets(name, game)) {
      if (game.validateParams(params, true)) continue; // refused at this size
      for (const seed of SEEDS) {
        let board: { desc: string; aux?: string };
        try {
          board = game.newDesc(params, randomNew(`${name}-${title}-${seed}`));
        } catch {
          continue; // ungenerable at this size; difficulty-contract.test.ts owns that
        }
        const { desc, aux } = board;
        const res = game.hint?.(game.newState(params, desc), aux);
        if (!res?.ok) continue;
        for (const step of res.steps) {
          examined++;
          if (markRoles(step.highlights) < 2) continue;
          withSecondMark++;
          if (!DEICTIC.test(step.explanation)) continue;
          if (RELATIONAL.test(step.explanation)) {
            for (const [alt, re] of RELATIONAL_ALTS)
              if (re.test(step.explanation))
                excused.set(alt, (excused.get(alt) ?? 0) + 1);
            continue;
          }
          // Collapse to a sentence *shape* — the formulaic games (Keen, Salad,
          // Subsets) otherwise report the same sentence once per value.
          const shape = step.explanation.replace(/\d+/g, "#");
          if (shapes.has(shape)) continue;
          shapes.add(shape);
          rows.push(`| ${name} | ${shape.replace(/\|/g, "\\|")} |`);
          perGame.set(name, (perGame.get(name) ?? 0) + 1);
        }
      }
    }
  }

  // The "how many did I look at?" guard. Without it a sweep whose every
  // generator threw would report a clean bill of health.
  expect(examined, "no hint step was examined at all").toBeGreaterThan(500);
  expect(withSecondMark, "no step displayed a second mark").toBeGreaterThan(200);

  // A tie phrase excuses rows from the report, so one that matches nothing is
  // a hole in the report's own coverage that reads as filter. Three had gone
  // dead under a rewording before anyone looked (see {@link RELATIONAL}).
  expect(
    RELATIONAL_ALTS.filter(([alt]) => (excused.get(alt) ?? 0) === 0).map(
      ([alt]) => alt,
    ),
    "a RELATIONAL alternative excuses no row: the sentence it was written for has changed",
  ).toEqual([]);

  const lines = [
    "# Hint deixis sweep",
    "",
    "Generated by `npx vitest run -c scripts/checks/diff.vitest.config.mts hint-deixis`.",
    "**Advisory.** Read the file's header before acting on a row: most rows are",
    "legitimate ties this lexical filter cannot recognize, and the question to ask",
    "of each is *are the two marks the same kind of thing?*",
    "",
    `${examined} steps examined, ${withSecondMark} of them displaying a second mark;`,
    `${rows.length} distinct sentence shapes flagged across ${perGame.size} games.`,
    "",
    "| game | sentence shape |",
    "| --- | --- |",
    ...rows,
    "",
    "## Flagged shapes per game",
    "",
    ...[...perGame].sort((a, b) => b[1] - a[1]).map(([g, n]) => `- ${g}: ${n}`),
  ];
  writeFileSync(OUT, `${lines.join("\n")}\n`);
  console.log(
    `wrote ${OUT}: ${rows.length} flagged shapes in ${perGame.size} games` +
      ` (${withSecondMark}/${examined} steps show a second mark)`,
  );
});
