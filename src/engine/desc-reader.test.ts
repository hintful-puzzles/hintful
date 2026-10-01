import { describe, expect, it } from "vitest";
import { isDigit } from "./decimal.ts";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  type DescParse,
  descBadCharacter,
  descValue,
  descVerdict,
  puzzleDescError,
} from "./desc-error.ts";
import { type DescReader, readDesc } from "./desc-reader.ts";

/** A small grammar of the shape most games have: `n` numbers in `[1, 9]`
 * separated by commas, then the end. */
function numbers(desc: string, n: number): DescParse<number[]> {
  return readDesc(desc, (r) => {
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      if (i > 0) r.expect(",");
      out.push(r.int(1, 9));
    }
    r.end();
    return out;
  });
}

describe("readDesc", () => {
  it("returns what the reader built", () => {
    expect(numbers("1,2,3", 3)).toEqual({ ok: true, value: [1, 2, 3] });
  });

  it("calls a missing separator or number too short when the desc ended", () => {
    expect(numbers("1,2", 3)).toEqual({ ok: false, error: DESC_TOO_SHORT });
    expect(numbers("1,2,", 3)).toEqual({ ok: false, error: DESC_TOO_SHORT });
    expect(numbers("", 1)).toEqual({ ok: false, error: DESC_TOO_SHORT });
  });

  it("names the character standing where a separator or number belongs", () => {
    expect(numbers("1;2,3", 3)).toEqual({ ok: false, error: descBadCharacter(";") });
    expect(numbers("1,x,3", 3)).toEqual({ ok: false, error: descBadCharacter("x") });
  });

  it("calls a number outside its bounds out of range, however long it is", () => {
    expect(numbers("1,0,3", 3)).toEqual({ ok: false, error: DESC_OUT_OF_RANGE });
    expect(numbers(`1,${"9".repeat(400)},3`, 3)).toEqual({
      ok: false,
      error: DESC_OUT_OF_RANGE,
    });
  });

  it("calls anything after the board too long", () => {
    expect(numbers("1,2,3,", 3)).toEqual({ ok: false, error: DESC_TOO_LONG });
    expect(numbers("1,2,34", 3)).toEqual({ ok: false, error: DESC_OUT_OF_RANGE });
  });

  it("passes a game's own failure through", () => {
    const mine = puzzleDescError("This game ID has a test failure in it.");
    expect(readDesc("x", (r) => r.fail(mine))).toEqual({ ok: false, error: mine });
  });

  it("lets anything else a reader throws escape, since that is a bug", () => {
    expect(() =>
      readDesc("x", () => {
        throw new RangeError("bug");
      }),
    ).toThrow(RangeError);
  });
});

describe("DescReader", () => {
  const read = <T>(desc: string, f: (r: DescReader) => T): T =>
    descValue(readDesc(desc, f));

  it("peeks without reading", () => {
    read("ab", (r) => {
      expect(r.peek()).toBe("a");
      expect(r.peekIs((c) => c === "a")).toBe(true);
      expect(r.pos).toBe(0);
      r.char();
      r.char();
      expect(r.peek()).toBeNull();
      expect(r.peekIs(() => true)).toBe(false);
      expect(r.done).toBe(true);
    });
  });

  it("accepts only what comes next", () => {
    read("r12,", (r) => {
      expect(r.accept("x")).toBe(false);
      expect(r.accept("r")).toBe(true);
      expect(r.int(0, 99)).toBe(12);
      expect(r.accept(",")).toBe(true);
      expect(r.accept(",")).toBe(false);
    });
  });

  it("checks a character only when told what it may be", () => {
    expect(read("?", (r) => r.char())).toBe("?");
    expect(descVerdict(readDesc("?", (r) => r.char(isDigit)))).toBe(
      descBadCharacter("?"),
    );
    expect(descVerdict(readDesc("", (r) => r.char()))).toBe(DESC_TOO_SHORT);
  });

  it("expects a string a character at a time, so a cut-off one is too short", () => {
    expect(descVerdict(readDesc("ab", (r) => r.expect("abc")))).toBe(DESC_TOO_SHORT);
    expect(descVerdict(readDesc("abx", (r) => r.expect("abc")))).toBe(
      descBadCharacter("x"),
    );
  });

  it("reads leading zeros, as the hand loops did", () => {
    expect(read("007", (r) => r.int(0, 9))).toBe(7);
  });

  it("reads the rest, which may be nothing", () => {
    expect(
      read("ab", (r) => {
        r.char();
        return r.rest();
      }),
    ).toBe("b");
    expect(read("", (r) => r.rest())).toBe("");
  });
});

describe("descValue", () => {
  it("throws on a failed parse, which newState is never given", () => {
    expect(() => descValue({ ok: false, error: DESC_TOO_SHORT })).toThrow();
  });
});
