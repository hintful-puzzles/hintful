import { afterEach, describe, expect, it } from "vitest";
import { abcdGame } from "../../games/abcd/index.ts";
import type { RandomState } from "../random/index.ts";
import { randomUpto } from "../random/index.ts";
import { RetryLimitExceeded } from "../retry-limit.ts";
import {
  beginDealt,
  type DealStore,
  dealt,
  inheritedDealCost,
  type StoredDeal,
  shareDealsThrough,
} from "./dealt.ts";

/** A game that counts its deals, and deals nothing at size 0. */
function counting() {
  let deals = 0;
  return {
    get deals() {
      return deals;
    },
    encodeParams: (p: { size: number }) => `s${p.size}`,
    newDesc(p: { size: number }, rng: RandomState) {
      deals++;
      if (p.size === 0) throw new RetryLimitExceeded("no board", 1);
      return { desc: `${p.size}:${randomUpto(rng, 1_000_000)}`, aux: `aux${deals}` };
    },
  };
}

describe("the shared dealer", () => {
  it("deals a board of given params once, whoever asks", () => {
    const game = counting();
    const first = dealt(game, { size: 3 });
    // A second params object of the same encoding: the key is the encoding.
    expect(dealt(game, { size: 3 })).toBe(first);
    expect(game.deals).toBe(1);
  });

  it("deals another board for another n, and for other params", () => {
    const game = counting();
    const descs = new Set([
      dealt(game, { size: 3 }).desc,
      dealt(game, { size: 3 }, 1).desc,
      dealt(game, { size: 4 }).desc,
    ]);
    expect(descs.size).toBe(3);
    expect(game.deals).toBe(3);
  });

  it("keeps each game's boards apart", () => {
    const a = counting();
    const b = counting();
    dealt(a, { size: 3 });
    dealt(b, { size: 3 });
    expect([a.deals, b.deals]).toEqual([1, 1]);
  });

  it("throws a failed deal again without dealing again", () => {
    const game = counting();
    expect(() => dealt(game, { size: 0 })).toThrow(RetryLimitExceeded);
    expect(() => dealt(game, { size: 0 })).toThrow(RetryLimitExceeded);
    expect(game.deals).toBe(1);
  });
});

describe("beginning a midend on a shared board", () => {
  /** A midend's dealing surface, recording what it was begun on. */
  function midend(refuses: string | null = null, deals: string | null = null) {
    let chosen = "";
    const kept: unknown[] = [];
    return {
      kept,
      setParams(p: string) {
        if (refuses === null) chosen = p;
        return refuses;
      },
      dealParams: () => deals ?? chosen,
      newGame(_fitTo?: undefined, board?: unknown) {
        kept.push(board);
        return null;
      },
    };
  }

  it("hands the midend the board with its aux, at the params asked for", () => {
    const game = counting();
    const m = midend();
    expect(beginDealt(m, game, { size: 3 })).toBeNull();
    const { desc, aux } = dealt(game, { size: 3 });
    expect(m.kept).toEqual([{ params: "s3", desc, aux }]);
  });

  it("returns the midend's refusal of the params, and deals nothing", () => {
    const game = counting();
    const m = midend("too big");
    expect(beginDealt(m, game, { size: 3 })).toBe("too big");
    expect(game.deals).toBe(0);
    expect(m.kept).toEqual([]);
  });

  it("reports a board the generator could not find, as the midend would", () => {
    const m = midend();
    expect(beginDealt(m, counting(), { size: 0 })).toMatch(/no board/);
    expect(m.kept).toEqual([]);
  });

  it("throws where the midend would deal at other params", () => {
    // `newGame` deals afresh, from a random seed, when the kept board's params
    // are not the ones it is about to deal at.
    expect(() => beginDealt(midend(null, "s9"), counting(), { size: 3 })).toThrow(
      /s9, not s3/,
    );
  });
});

describe("sharing deals between a run's workers", () => {
  /** A store holding `held`, recording what is put into it. */
  function memoryStore(held: Record<string, StoredDeal> = {}) {
    const put: Record<string, StoredDeal> = {};
    const store: DealStore = {
      take: (key) => held[key] ?? null,
      put(key, deal) {
        put[key] = deal;
      },
    };
    return { store, put };
  }

  let before: DealStore | null = null;
  afterEach(() => {
    shareDealsThrough(before);
  });

  /** Params no other file deals at the `n` the tests below ask for. */
  const params = abcdGame.defaultParams();
  const at = (n: number) => `abcd|${abcdGame.encodeParams(params, true)}#${n}`;

  it("takes a board another worker dealt, and is charged for it", () => {
    const { store } = memoryStore({ [at(7)]: { cpu: 5e6, board: { desc: "kept" } } });
    before = shareDealsThrough(store);
    const charged = inheritedDealCost();
    expect(dealt(abcdGame, params, 7)).toEqual({ desc: "kept" });
    expect(inheritedDealCost() - charged).toBe(5e6);
  });

  it("hands the others a board it dealt", () => {
    const { store, put } = memoryStore();
    before = shareDealsThrough(store);
    const board = dealt(abcdGame, params, 8);
    expect(put[at(8)]).toMatchObject({ board });
  });

  it("throws a refusal another worker met, as the generator threw it", () => {
    const message = "abcd: gave up after 3 attempts, at the third";
    const { store } = memoryStore({
      [at(9)]: { cpu: 1, retryLimit: { label: "abcd", max: 3, message } },
    });
    before = shareDealsThrough(store);
    expect(() => dealt(abcdGame, params, 9)).toThrow(
      expect.objectContaining({ name: "RetryLimitExceeded", message, max: 3 }),
    );
  });

  it("shares nothing of a copy of a game, whose generator may differ", () => {
    const { store, put } = memoryStore({
      [at(10)]: { cpu: 1, board: { desc: "kept" } },
    });
    before = shareDealsThrough(store);
    const copy = { ...abcdGame, newDesc: () => ({ desc: "the copy's" }) };
    expect(dealt(copy, params, 10)).toEqual({ desc: "the copy's" });
    expect(put).toEqual({});
  });
});
