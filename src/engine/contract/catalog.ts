/**
 * What a game declares about itself for the catalog, in its
 * `src/games/<id>/catalog.ts`: the shape of the entry, and the families it
 * names one of. The app assembles the entries (`src/puzzle/catalog.ts`);
 * the engine and the game import nothing of the app, so this is where a game
 * reads the shape from.
 *
 * The upstream games' entries came from upstream's `puzzle()` calls in its
 * CMake files, verified field for field against the last catalog generated
 * from them.
 */

/**
 * The families, in the order the home screen offers them: every game is in
 * exactly one (owner, 2026-09-19). The order runs from pure pencil-and-paper
 * logic toward games of moving pieces and hidden information.
 *
 * A family's `label` is the player's word for it, so it is also a search term:
 * typing "shading" finds the shading puzzles whether or not their objectives
 * say so.
 */
export const puzzleFamilies = [
  { id: "latin", label: "Latin squares" },
  { id: "numbers", label: "Numbers & letters" },
  { id: "objects", label: "Placing objects" },
  { id: "shading", label: "Shading" },
  { id: "lines", label: "Lines & paths" },
  { id: "regions", label: "Regions" },
  { id: "rearranging", label: "Rearranging" },
  { id: "moves", label: "Moves & planning" },
  { id: "hidden", label: "Hidden information" },
] as const;

export type PuzzleFamily = (typeof puzzleFamilies)[number]["id"];

export interface PuzzleData {
  name: string;
  /**
   * Other names this puzzle is widely known by, for search to match on.
   *
   * A player hunts for the word they know a puzzle by, and this collection
   * renames most of them: Sudoku is Solo, Nonogram is Pattern, Minesweeper is
   * Mines. Without this the home screen's search box answers "no puzzle
   * matches" to the single most likely first query anyone types.
   *
   * **A declaration a mechanism consumes, not a manifest** — search reads it,
   * nothing asserts a game's membership from it, and a game with no other name
   * simply has none. Where a game's own help page states one ("known as
   * *Hakyuu*"), `catalog-aliases.test.ts` requires it to appear here, so the
   * two cannot disagree; the rest are the standard names the puzzle is
   * documented under everywhere. A name nobody could verify is left out, since
   * a wrong alias sends a player to the wrong game.
   */
  aliases?: readonly string[];
  description: string;
  objective: string;
  /** Where the puzzle comes from: Simon Tatham's collection, the unreleased
   * puzzles ported with it, or this app's own, which has no upstream. */
  collection: "original" | "unreleased" | "own";
  /**
   * The one family this puzzle belongs to — what a player browses the
   * collection by ("what else is like this one?"), and what maintenance work
   * names a corpus by ("the Latin squares").
   *
   * **A declaration a mechanism consumes, not a manifest**: the home screen's
   * family chips, the search box and the quick-switch all read it, and nothing
   * enrolls a game in a guard from it. Where code can vouch for a family,
   * `catalog-families.test.ts` holds the tag to the code, so the two cannot
   * disagree. `description` looks like this field and is not one: it is a
   * per-game subtitle, nearly unique per game.
   */
  family: PuzzleFamily;
  /**
   * The puzzles a reader may know this one as elsewhere, as the "All the
   * puzzles" help page shows them (`game-lists.ts`): markdown,
   * with a trademark marked ® and a name in its own script beside it.
   *
   * Not `aliases`, which are what a player types into search: plain
   * spellings, and names of the puzzle itself only. This names related
   * puzzles too (Killer Sudoku beside Solo), and a search for one should not
   * find the other.
   */
  similar?: string;
  // Whether a game is a draft is not here: the home screen reads it from the
  // game's own contract sections, computed at build time
  // (`vite-plugins/draft-puzzles.ts`).
}
