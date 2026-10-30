import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { getTsGame } from "./registry.ts";
import { touchHelp } from "./touch-help.ts";

beforeAll(registerAllGames);

function sentence(id: string): string {
  const game = getTsGame(id);
  if (!game) throw new Error(`no game ${id}`);
  return touchHelp(game);
}

describe("the touch sentence opening a page's Controls", () => {
  it("names the long press and the keypad for a game with both", () => {
    expect(sentence("solo")).toMatch(/a long press what a right-click does/);
    expect(sentence("solo")).toMatch(/show as a button/);
  });

  it("says nothing of a right-click where the game ignores the button", () => {
    expect(sentence("fifteen")).toBe(
      "*On a touch screen, a tap does what a click does.*",
    );
  });

  it("says nothing of a keypad where the game has none", () => {
    expect(sentence("mines")).not.toMatch(/button/);
    expect(sentence("mines")).toMatch(/long press/);
  });
});
