import { describe, expect, it } from "vitest";
import { readGameLink } from "./game-link.ts";

describe("readGameLink", () => {
  it("reads the game from a share link whatever its host and port", () => {
    const id = "7x7:OOPPPOOOOPPPOOPPPPPPPPPPHPPPPPPPPPPOOPPPOOOOPPPOO";
    for (const origin of [
      "http://localhost:5173",
      "https://hintful.click",
      "http://192.168.1.4:4173/sub/dir",
    ]) {
      expect(
        readGameLink(`${origin}/pegs?id=${encodeURIComponent(id)}`, "pegs"),
      ).toEqual({ gameId: id });
    }
    expect(readGameLink("https://example.com/pegs/?id=7x7%237", "pegs")).toEqual({
      gameId: "7x7#7",
    });
  });

  it("reads the # part of a link to Simon Tatham's online collection", () => {
    expect(
      readGameLink(
        "https://www.chiark.greenend.org.uk/~sgtatham/puzzles/js/solo.html#3x3db%23529619113385357",
        "solo",
      ),
    ).toEqual({ gameId: "3x3db#529619113385357" });
  });

  it("says why a link to another puzzle or to no one game opens nothing", () => {
    expect(readGameLink("https://hintful.click/solo?id=3x3:abc", "pegs")).toEqual({
      error: "That link is for a different puzzle.",
    });
    expect(
      readGameLink(
        "https://www.chiark.greenend.org.uk/~sgtatham/puzzles/js/solo.html#3x3:abc",
        "pegs",
      ),
    ).toEqual({ error: "That link is for a different puzzle." });
    expect(readGameLink("https://hintful.click/pegs?type=7x7", "pegs")).toEqual({
      error: "That link is to a puzzle type, not to one game.",
    });
  });

  it("leaves a bare ID, which is not a link, to be read as an ID", () => {
    expect(readGameLink("7x7:OOPPP", "pegs")).toBeNull();
    // A params string can look like a URL scheme.
    expect(readGameLink("w8h8m5M5:abcd", "blackbox")).toBeNull();
  });
});
