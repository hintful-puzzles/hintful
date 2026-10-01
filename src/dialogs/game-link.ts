import { puzzleIds } from "../puzzle/catalog.ts";

const knownPuzzles = new Set<string>(puzzleIds);

/**
 * What a pasted link says about the game to open: its game ID and, when the link
 * names one, which puzzle it is for; why it opens no game; or `null` when the
 * text is not a link at all and should be read as an ID itself.
 */
export type GameLinkReading =
  | { gameId: string; puzzleId: string | null }
  | { error: string }
  | null;

/**
 * Read the game out of a link a player pasted. The host and port are ignored,
 * so a link works whichever address it was shared from: the game is this app's
 * `?id=`, or the `#` part of a link to Simon Tatham's online collection
 * (`…/js/solo.html#3x3db%23529…`), and the page names the puzzle.
 */
export function readGameLink(text: string): GameLinkReading {
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  // A game ID such as `w8h8m5M5:…` also parses as a URL with a made-up scheme.
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const page = (url.pathname.replace(/\/+$/, "").split("/").pop() ?? "").replace(
    /\.html$/,
    "",
  );
  const gameId = url.searchParams.get("id") || decodeURIComponent(url.hash.slice(1));
  if (!gameId) return { error: "That link is to a puzzle type, not to one game." };
  return { gameId, puzzleId: knownPuzzles.has(page) ? page : null };
}
