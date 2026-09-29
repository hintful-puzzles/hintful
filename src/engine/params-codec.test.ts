import { describe, expect, it } from "vitest";
import type { ParamConfigItem } from "./game.ts";
import { dimensionParamConfig } from "./params.ts";
import { dims, letters, num, paramsCodec } from "./params-codec.ts";

interface P {
  w: number;
  h: number;
  mode: number;
  islands: number;
}

const config: ParamConfigItem<P>[] = [
  ...dimensionParamConfig<P>({ doc: "Size." }),
  {
    kw: "mode",
    name: "Mode",
    type: "choices",
    choices: ["Plain", "Tall", "Wide"],
    doc: "Plain, Tall or Wide.",
    get: (p) => p.mode,
    set: (p, v) => {
      p.mode = v;
    },
  },
];

const defaults = (): P => ({ w: 5, h: 5, mode: 1, islands: 30 });

describe("num with its own accessors", () => {
  const codec = paramsCodec(defaults, [
    dims(config),
    num(config, "i", {
      get: (p: P) => p.islands,
      set: (p: P, v: number) => {
        p.islands = v;
      },
    }),
  ]);

  it("writes and reads the stored number, not a field of the dialog", () => {
    expect(codec.encodeParams({ ...defaults(), islands: 15 }, true)).toBe("5x5i15");
    expect(codec.decodeParams("7x7i20").islands).toBe(20);
  });

  it("leaves the default when the tag is absent", () => {
    expect(codec.decodeParams("7x7").islands).toBe(30);
  });
});

describe("letters", () => {
  it("writes one bare letter per choice, and nothing for a silent one", () => {
    const codec = paramsCodec(defaults, [
      dims(config),
      letters(config, "mode", ["", "T", "W"]),
    ]);
    expect(codec.encodeParams({ ...defaults(), mode: 0 }, true)).toBe("5x5");
    expect(codec.encodeParams({ ...defaults(), mode: 2 }, true)).toBe("5x5W");
    expect(codec.decodeParams("5x5T").mode).toBe(1);
    // Absent reads as the silent choice, not the default (which is Tall).
    expect(codec.decodeParams("5x5").mode).toBe(0);
  });

  it("leaves the default when no choice is silent and none is written", () => {
    const codec = paramsCodec(defaults, [
      dims(config),
      letters(config, "mode", ["P", "T", "W"]),
    ]);
    expect(codec.decodeParams("5x5").mode).toBe(1);
    expect(codec.decodeParams("5x5P").mode).toBe(0);
  });
});
