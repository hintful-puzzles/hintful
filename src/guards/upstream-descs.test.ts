/*
 * A game ID upstream's own generator wrote still loads here.
 *
 * Compatibility with Simon Tatham's collection and the forks of it is
 * best-effort (docs/doctrine.md § "Upstream"): a player may paste a link to a
 * game on Simon Tatham's site, and the descs are close enough that keeping them
 * loading costs little. So each desc upstream's C dealt, kept with the params
 * it was dealt under, must load (`loadVerdict`): parse, and have the one answer
 * loading asks of a game with a mistake check, under params loading accepts. A parser tightened past what
 * upstream writes fails here, naming the desc.
 *
 * The corpus, `__fixtures__/upstream-descs.json`, maps a game to a params
 * string to the descs dealt under it. It was drawn from recordings of the C
 * that are retired, and nothing can add to it: upstream is never run here. A
 * params string is upstream's own where the recording kept one, and otherwise
 * this app's full encoding of the params the recording named. Three Mathrax
 * descs were left out: upstream's Recursive tier deals boards with several
 * answers, which no game here loads.
 *
 * A game born from its description also writes each desc back byte for
 * byte, through the codec its description compiles to: a link it shares
 * reads the same on upstream's site. Its IDs from elsewhere (the hand-written
 * port's) are its cases' `ids`, with `writesBack`.
 */
import { expect, it } from "vitest";
import { loadVerdict } from "../engine/contract/desc-error.ts";
import { paramsError } from "../engine/game-id/params.ts";
import { BORN_GAMES } from "../engine/testing/born-games.ts";
import { REGISTERED_GAMES } from "../engine/testing/enrollment.ts";
import { writtenBack } from "../engine/testing/game-cases.ts";
import corpus from "./__fixtures__/upstream-descs.json" with { type: "json" };

it("every desc upstream's generator wrote loads", () => {
  const games = new Map(REGISTERED_GAMES);
  const refused: string[] = [];
  let descs = 0;
  for (const [id, byParams] of Object.entries(
    corpus as Record<string, Record<string, string[]>>,
  )) {
    const game = games.get(id);
    if (!game) throw new Error(`upstream-descs.json: no registered game ${id}`);
    for (const [params, list] of Object.entries(byParams)) {
      const p = game.decodeParams(params);
      // As loading a game ID asks it, for a board that arrives written.
      const bad = paramsError(game, p, false);
      if (bad !== null) refused.push(`${id} ${params}: ${bad}`);
      for (const desc of list) {
        descs++;
        const err = loadVerdict(game, p, desc);
        if (err !== null) refused.push(`${id} ${params}:${desc}: ${err}`);
      }
    }
  }
  // 48 games and 711 descs when drawn.
  expect(descs).toBeGreaterThanOrEqual(700);
  expect(refused).toEqual([]);
});

it("a born game writes each of upstream's descs back as upstream wrote it", () => {
  const differ: string[] = [];
  let descs = 0;
  for (const { id, game, compiled } of BORN_GAMES) {
    const byParams = (corpus as Record<string, Record<string, string[]>>)[id] ?? {};
    for (const [params, list] of Object.entries(byParams))
      for (const desc of list) {
        descs++;
        const written = writtenBack(game, compiled, params, desc);
        if (written !== desc) differ.push(`${id} ${params}:${desc} written ${written}`);
      }
  }
  // 126 descs of nine born games on 2026-11-23.
  expect(descs).toBeGreaterThanOrEqual(100);
  expect(differ).toEqual([]);
});
