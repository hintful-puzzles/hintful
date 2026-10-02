import { describe, expect, it } from "vitest";
import { puzzleDataMap } from "../puzzle/catalog.ts";
import { readGameLink } from "./game-link.ts";
import { upstreamLinks } from "./upstream-links.ts";

const byCollection = (original: boolean) =>
  Object.keys(puzzleDataMap).filter(
    (id) => (puzzleDataMap[id]?.collection === "original") === original,
  );

describe("upstreamLinks", () => {
  it("links the board on screen by its game ID, never by a seed", () => {
    const gameId = "8x8dt:baaaaaaaaaaaaaaaaaaaaa,1,2,3,4,5,6,7,8,1,2,3,4,5,6,7,8";
    const links = upstreamLinks({ puzzleId: "tracks", puzzleParams: "8x8dt", gameId });

    expect(links.map((l) => l.hint)).toEqual(["by game ID", "by puzzle type"]);
    // The game ID survives the link's encoding.
    expect(readGameLink(links[0].url.href)).toEqual({ gameId, puzzleId: "tracks" });
    // Each link names the board or its type, so none is a `params#seed` id.
    expect(links.map((l) => decodeURIComponent(l.url.hash.slice(1)))).toEqual([
      gameId,
      "8x8dt",
    ]);
  });

  it("offers the bare page when there is no ID or type", () => {
    const links = upstreamLinks({
      puzzleId: "tracks",
      puzzleParams: null,
      gameId: null,
    });
    expect(links).toEqual([
      {
        url: new URL(
          "https://www.chiark.greenend.org.uk/~sgtatham/puzzles/js/tracks.html",
        ),
        hint: null,
      },
    ]);
  });

  it("links every upstream game, and no other", () => {
    const original = byCollection(true);
    const other = byCollection(false);
    expect(original.length).toBeGreaterThan(0);
    expect(other.length).toBeGreaterThan(0);
    const args = { puzzleParams: "3x3", gameId: "3x3:a" };
    for (const puzzleId of original) {
      expect(upstreamLinks({ puzzleId, ...args }), puzzleId).toHaveLength(2);
    }
    for (const puzzleId of other) {
      expect(upstreamLinks({ puzzleId, ...args }), puzzleId).toEqual([]);
    }
  });
});
