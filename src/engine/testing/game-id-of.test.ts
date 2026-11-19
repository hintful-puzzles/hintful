import { describe, expect, it } from "vitest";
import { gameIdOf } from "./game-id-of.ts";

describe("gameIdOf", () => {
  it("prints a desc back as the full ID the midend announces", () => {
    expect(gameIdOf("wordtrail", "4x3n2de", { desc: "45,namedlgo3p" })).toEqual({
      ok: true,
      id: "4x3n2de:45,namedlgo3p",
    });
  });

  it("deals a seed at the default params into an ID that loads as itself", () => {
    const dealt = gameIdOf("palisade", null, { seed: "1" });
    if (!dealt.ok) throw new Error(dealt.error);
    const sep = dealt.id.indexOf(":");
    expect(sep).toBeGreaterThan(0);
    expect(
      gameIdOf("palisade", dealt.id.slice(0, sep), { desc: dealt.id.slice(sep + 1) }),
    ).toEqual(dealt);
  });

  it("refuses an unknown game and a desc the game cannot read", () => {
    expect(gameIdOf("nope", null, { seed: "1" }).ok).toBe(false);
    const bad = gameIdOf("net", "5x5", { desc: "garbage" });
    expect(bad.ok).toBe(false);
  });
});
