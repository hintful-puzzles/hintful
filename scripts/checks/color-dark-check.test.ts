/**
 * The dark-mode measuring instrument for `colour-tokens-per-scheme` — the thing
 * task 3.1 means by "verify with the same pairwise metric, not by eye".
 *
 * `hand-author-dark-palette` F2 is the reason it exists: a screenshot said Flood
 * had regressed, the measurement said it had improved by nearly 3×, and the
 * screenshot was about to cost a correct change. An eye comparing two dark greens
 * adjacent to seven other colors is not a reliable instrument.
 *
 * It reproduces `components/view.ts`'s dark-mode pipeline exactly — including that
 * games are handed **pure white** as their background in dark mode — and reports
 * the background relationship: `ΔL(color, background)` in each scheme. A color
 * that is a subtle tint of the board in light mode should be one in dark mode
 * too; `hand-author-dark-palette` drove violations of this from 150 to 2.
 *
 * How far apart a set's members stand (the free colors, the region fills,
 * Mines' six colored digits) is not measured here: each is a set of named colors whose dark
 * values are authored and used as they are, so `colors.test.ts` ("a set meant
 * to be told apart is designed as a set") measures it in both schemes, in the
 * gate.
 *
 * Not part of the gate. Run it with:
 *
 *     npx vitest run -c scripts/checks/diff.vitest.config.mts color-dark-check
 */
import { writeFileSync } from "node:fs";
import { it } from "vitest";
import { darkValue } from "../../src/engine/color/color-token.ts";
import type { Color } from "../../src/engine/contract/types.ts";
import { getTsGame } from "../../src/engine/midend/registry.ts";
import { puzzleIds } from "../../src/puzzle/catalog.ts";
import { darkModePalette } from "../../src/puzzle/dark-palette.ts";
import { schemeOf } from "../../src/puzzle/scheme-palettes.ts";
import { colorToOKLCH, type OKLCH, oklchToColor } from "../../src/utils/color.ts";
import "../../src/games/index.ts";

const OUT = "/tmp/color-dark-check.md";

/** A light host: the app's own surface lightness, as a neutral gray. */
const LIGHT_BG_L = 0.9;
/** A dark host. `utils/color.ts` names ~0.18 as the realistic off-black. */
const DARK_BG_L = 0.2;

/** What `components/view.ts` passes a game in each scheme. In **dark** mode it passes
 * pure white, precisely because games derive colors by scaling the background
 * down; the whole palette is inverted afterwards. */
const lightInput = oklchToColor([LIGHT_BG_L, 0, 0]);
const darkInput = oklchToColor([1, 0, 0]);

/** The view's dark-mode pass (`dark-palette.ts`) — the real one, called rather than copied:
 * a second copy kept in step by instruction is a rule with no owner. */
function darkPalette(id: string, palette: Color[]): OKLCH[] {
  const authored: Record<number, Color> = {};
  palette.forEach((c, i) => {
    const d = c && darkValue(c);
    if (d) authored[i] = [...d];
  });
  return darkModePalette(
    palette.map((c) => colorToOKLCH(c)),
    schemeOf(id),
    authored,
    DARK_BG_L,
  );
}

/** The indices a game exchanges between schemes. An entry here does **not**
 * denote the same role in both, so a light-vs-dark comparison of one such index
 * is comparing a highlight with a lowlight — see the note in the report. */
const swapped = (id: string): Set<number> => new Set(schemeOf(id).darkSwaps.flat());

it("measures dark mode", () => {
  const lines: string[] = ["# Dark-mode measurement\n"];

  lines.push("## Colors that change their relationship to the board\n");
  lines.push(
    "A color within 0.15 lightness of the board in light mode should stay close",
    "to it in dark mode, and one far from it should stay far. Listed: every entry",
    "whose distance-from-background moves by more than 0.25.\n",
    "A row marked **swap** is one of a `darkSwaps` pair, and for those this",
    "measurement does not mean what it means elsewhere: the two indices exchange",
    "**roles** between schemes, so the light and dark values compared here belong",
    "to a bevel's highlight and its lowlight. What such a pair owes the player is",
    "that the highlight stays lighter than the surface it sits on and the lowlight",
    "darker — which is a relationship to that surface, not to the board, and is",
    "asserted directly in `src/puzzle/dark-palette.test.ts`.\n",
  );
  lines.push("| game | # | ΔL light | ΔL dark | authored? | swap? |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  let violations = 0;
  let swapRows = 0;
  for (const id of [...puzzleIds].sort()) {
    const game = getTsGame(id);
    if (!game) continue;
    const lightPal = game.colors(lightInput);
    const light = lightPal.map((c) => (c ? colorToOKLCH(c) : null));
    const dark = darkPalette(id, game.colors(darkInput));
    const swaps = swapped(id);
    const bgIndex = schemeOf(id).board;
    const lbg = light[bgIndex]?.[0] ?? LIGHT_BG_L;
    const dbg = dark[bgIndex]?.[0] ?? DARK_BG_L;
    light.forEach((lch, i) => {
      if (!lch || i === bgIndex) return;
      const dl = Math.abs(lch[0] - lbg);
      const dd = Math.abs(dark[i][0] - dbg);
      if (Math.abs(dl - dd) > 0.25) {
        violations += 1;
        if (swaps.has(i)) swapRows += 1;
        lines.push(
          `| ${id} | ${i} | ${dl.toFixed(3)} | ${dd.toFixed(3)} |` +
            ` ${darkValue(lightPal[i]) ? "yes" : "no"} |` +
            ` ${swaps.has(i) ? "**swap**" : ""} |`,
        );
      }
    });
  }
  lines.push(
    `\n**${violations} colors** move their relationship to the board` +
      ` (${swapRows} of them across a role swap, which this measurement cannot read).\n`,
  );
  writeFileSync(OUT, `${lines.join("\n")}\n`);
  console.log(
    `wrote ${OUT}: ${violations} background-relationship violations` +
      ` (${swapRows} across a role swap)`,
  );
});
