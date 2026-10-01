import { describe, expect, it } from "vitest";
import { readGameLink } from "./game-link.ts";

describe("readGameLink", () => {
  it("reads the game and its puzzle from a share link, whatever its host and port", () => {
    const id = "7x7:OOPPPOOOOPPPOOPPPPPPPPPPHPPPPPPPPPPOOPPPOOOOPPPOO";
    for (const origin of [
      "http://localhost:5173",
      "https://hintful.click",
      "http://192.168.1.4:4173/sub/dir",
    ]) {
      expect(readGameLink(`${origin}/pegs?id=${encodeURIComponent(id)}`)).toEqual({
        gameId: id,
        puzzleId: "pegs",
      });
    }
    expect(readGameLink("https://example.com/solo/?id=3x3%237")).toEqual({
      gameId: "3x3#7",
      puzzleId: "solo",
    });
  });

  it("reads the # part of a link to Simon Tatham's online collection", () => {
    expect(
      readGameLink(
        "https://www.chiark.greenend.org.uk/~sgtatham/puzzles/js/solo.html#3x3db%23529619113385357",
      ),
    ).toEqual({ gameId: "3x3db#529619113385357", puzzleId: "solo" });
  });

  it("leaves the puzzle open when the page names none", () => {
    expect(readGameLink("https://example.com/play?id=7x7:OO")).toEqual({
      gameId: "7x7:OO",
      puzzleId: null,
    });
  });

  it("says a link to a puzzle type opens no one game", () => {
    expect(readGameLink("https://hintful.click/pegs?type=7x7")).toEqual({
      error: "That link is to a puzzle type, not to one game.",
    });
  });

  it("leaves a bare ID, which is not a link, to be read as an ID", () => {
    expect(readGameLink("7x7:OOPPP")).toBeNull();
    // A params string can look like a URL scheme.
    expect(readGameLink("w8h8m5M5:abcd")).toBeNull();
  });
});
