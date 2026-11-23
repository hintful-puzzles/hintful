import { describe, expect, it } from "vitest";
import { fakeGame } from "./fake-game.ts";
import { checkId, checkParams, checkPosition, parseGameCases } from "./game-cases.ts";

const PATH = "src/games/x/x.cases.yaml";
const read = (text: string) => parseGameCases(text, PATH);

describe("a cases file, read", () => {
  it("names the file and the line of a malformed entry", () => {
    expect(() => read("positions:\n  - id: t3:g3-1\n    mistakes: one\n")).toThrow(
      `${PATH}:3: positions[0].mistakes is not a whole number`,
    );
    expect(() => read("ids:\n  - id: t3:g3-1\n    opens: t3\n    wrong: 1\n")).toThrow(
      `${PATH}:4: ids[0] has no "wrong"`,
    );
    expect(() => read("cases: []\n")).toThrow(`${PATH}:1: ${PATH} has no "cases"`);
    expect(() => read("ids:\n  - id: t3:x\n    refused: DESC_NO_SUCH\n")).toThrow(
      `${PATH}:3: ids[0].refused: no refusal DESC_NO_SUCH`,
    );
  });

  it("reads a value's name as its number in moves and in what a board holds", () => {
    const cases = read(
      "values:\n  shaded: 1\npositions:\n  - id: a\n    moves: [{ set: [4, shaded] }]\n    holds: { values: [shaded, 0] }\n",
    );
    expect(cases.positions[0].moves).toEqual([{ set: [4, 1] }]);
    expect(cases.positions[0].holds).toEqual({ values: [1, 0] });
  });
});

/** The failures the one case of `section` in `text` gives on the fake game. */
const failures = (text: string): string[] => {
  const cases = read(text);
  return [
    ...cases.ids.flatMap((c) => checkId(fakeGame, c)),
    ...cases.params.flatMap((c) => checkParams(fakeGame, c)),
    ...cases.positions.flatMap((c) => checkPosition(fakeGame, c)),
  ];
};

describe("a case, checked", () => {
  it("holds of the game where it says what the game does, and fails where not", () => {
    // Each pair: the case as the game does it, then one thing written wrong.
    const pairs: [string, string][] = [
      [
        "ids:\n  - id: t3:g3-1\n    opens: t3\n",
        "ids:\n  - id: t3:g3-1\n    opens: t4\n",
      ],
      [
        "ids:\n  - id: t3:x\n    refused: DESC_MALFORMED\n",
        "ids:\n  - id: t3:g3-1\n    refused: DESC_MALFORMED\n",
      ],
      [
        "ids:\n  - id: t3:x\n    refused: /./\n",
        "ids:\n  - id: t3:x\n    refused: /^No/\n",
      ],
      [
        "ids:\n  - id: t3:g3-1\n    holds: { target: 3 }\n",
        "ids:\n  - id: t3:g3-1\n    holds: { target: 4 }\n",
      ],
      [
        "params:\n  - read: t3\n    full: t3\n",
        "params:\n  - read: t3\n    full: t4\n",
      ],
      [
        'params:\n  - read: t0\n    refused: "Target must be positive."\n',
        "params:\n  - read: t3\n    refused: /./\n",
      ],
      [
        "positions:\n  - id: t3:g3-1\n    moves: [inc, inc]\n    status: ongoing\n    statusbar: count 2/3\n    text: count=2\n",
        "positions:\n  - id: t3:g3-1\n    moves: [inc, inc]\n    text: count=3\n",
      ],
      [
        "positions:\n  - id: t3:g3-1\n    solve: true\n    status: solved\n",
        "positions:\n  - id: t3:g3-1\n    status: solved\n",
      ],
      [
        "positions:\n  - id: t3:g3-1\n    moves: [inc]\n    steps: [{ rung: inc, says: Increment the counter to 2 }, { says: /to 3$/ }]\n",
        "positions:\n  - id: t3:g3-1\n    moves: [inc]\n    steps: [{ says: /to 3$/ }]\n",
      ],
    ];
    for (const [right, wrong] of pairs) {
      expect(failures(right), right).toEqual([]);
      expect(failures(wrong), wrong).not.toEqual([]);
    }
  });

  it("reads a null status bar as none shown, and an absent one as not checked", () => {
    const none = { ...fakeGame, statusbarText: undefined };
    const check = (game: typeof fakeGame, text: string) =>
      read(text).positions.flatMap((c) => checkPosition(game, c));
    const position = "positions:\n  - id: t3:g3-1\n";
    expect(check(none, `${position}    statusbar: null\n`)).toEqual([]);
    expect(check(fakeGame, `${position}    statusbar: null\n`)).not.toEqual([]);
    expect(check(fakeGame, `${position}    status: ongoing\n`)).toEqual([]);
  });

  it("reads what a board refused as unplayable holds", () => {
    const stuck = { ...fakeGame, finishesByDeduction: () => false };
    const check = (text: string) => read(text).ids.flatMap((c) => checkId(stuck, c));
    const id = "ids:\n  - id: t3:g3-1\n    refused: DESC_NOT_DEDUCIBLE\n";
    expect(check(`${id}    holds: { target: 3 }\n`)).toEqual([]);
    expect(check(`${id}    holds: { target: 4 }\n`)).not.toEqual([]);
    expect(check("ids:\n  - id: t3:g3-1\n    holds: { target: 3 }\n")).not.toEqual([]);
  });
});
