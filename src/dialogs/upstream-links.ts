import { puzzleDataMap } from "../puzzle/catalog.ts";

export interface UpstreamLink {
  url: URL;
  hint: string | null;
}

/**
 * Links to the board on screen in Simon Tatham's online collection, or `[]`
 * for a game his site does not carry.
 *
 * There is deliberately no link by random seed. A seed names a board only
 * through a generator, and ours diverge from upstream's wherever a better game
 * was worth it (`link-upstream-by-game-id-only`), so a seed link can open a
 * different board from the player's. A game ID carries the board itself.
 */
export function upstreamLinks({
  puzzleId,
  puzzleParams,
  gameId,
}: {
  puzzleId: string | null;
  puzzleParams: string | null;
  gameId: string | null;
}): UpstreamLink[] {
  if (!puzzleId || puzzleDataMap[puzzleId]?.collection !== "original") return [];

  const base = `https://www.chiark.greenend.org.uk/~sgtatham/puzzles/js/${encodeURIComponent(puzzleId)}.html`;
  const at = (hash: string) =>
    Object.assign(new URL(base), { hash: encodeURIComponent(hash) });
  const links: UpstreamLink[] = [];
  if (gameId) links.push({ url: at(gameId), hint: "by game ID" });
  if (puzzleParams) links.push({ url: at(puzzleParams), hint: "by puzzle type" });
  // Show *some* link even when there is neither.
  if (links.length === 0) links.push({ url: new URL(base), hint: null });
  return links;
}
