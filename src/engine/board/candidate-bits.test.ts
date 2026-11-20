import { describe, expect, it } from "vitest";
import { MAX_CANDIDATE_VALUE, valueBit, valuesOneTo } from "./candidate-bits.ts";

describe("candidate bits", () => {
  it("gives every value from 0 to 31 its own bit", () => {
    const bits = Array.from({ length: MAX_CANDIDATE_VALUE + 1 }, (_, n) => valueBit(n));
    expect(new Set(bits).size).toBe(32);
    expect(bits.reduce((a, b) => a | b, 0)).toBe(-1);
  });

  it("refuses a value that would wrap onto another value's bit", () => {
    expect(() => valueBit(32)).toThrow(RangeError);
    expect(() => valueBit(-1)).toThrow(RangeError);
    expect(() => valuesOneTo(32)).toThrow(RangeError);
  });

  it("the full set is bits 1..n, and never bit 0, up to 31", () => {
    for (let n = 0; n <= MAX_CANDIDATE_VALUE; n++) {
      let expected = 0;
      for (let v = 1; v <= n; v++) expected |= valueBit(v);
      expect(valuesOneTo(n), `n = ${n}`).toBe(expected);
      expect(valuesOneTo(n) & 1).toBe(0);
    }
  });
});
