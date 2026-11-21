import { describe, expect, it } from "vitest";
import { apartByPosition } from "./apart-by-position.ts";

interface Clue {
  x: number;
  y: number;
  n: number;
}

const names = (clues: readonly Clue[]): string[] => {
  const name = apartByPosition(
    clues,
    (c) => c,
    (c) => String(c.n),
  );
  return clues.map(name);
};

describe("apartByPosition", () => {
  it("leaves a name no other thing shares as it is", () => {
    expect(
      names([
        { x: 0, y: 0, n: 3 },
        { x: 1, y: 0, n: 4 },
      ]),
    ).toEqual(["3", "4"]);
  });

  it("names two of one name by height, and by side where they are level", () => {
    expect(
      names([
        { x: 2, y: 5, n: 7 },
        { x: 0, y: 4, n: 7 },
      ]),
    ).toEqual(["lower 7", "upper 7"]);
    expect(
      names([
        { x: 2, y: 4, n: 7 },
        { x: 0, y: 4, n: 7 },
        { x: 1, y: 1, n: 2 },
      ]),
    ).toEqual(["right 7", "left 7", "2"]);
  });

  it("orders three or more, from the top where no two are level", () => {
    expect(
      names([
        { x: 0, y: 2, n: 1 },
        { x: 0, y: 0, n: 1 },
        { x: 0, y: 1, n: 1 },
      ]),
    ).toEqual([
      "1 third from the top",
      "1 first from the top",
      "1 second from the top",
    ]);
    expect(
      names([
        { x: 3, y: 0, n: 1 },
        { x: 0, y: 0, n: 1 },
        { x: 1, y: 1, n: 1 },
      ]),
    ).toEqual([
      "1 third from the left",
      "1 first from the left",
      "1 second from the left",
    ]);
  });

  it("counts a thing named twice once", () => {
    expect(
      names([
        { x: 0, y: 0, n: 5 },
        { x: 0, y: 0, n: 5 },
      ]),
    ).toEqual(["5", "5"]);
  });
});
