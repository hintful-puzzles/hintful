/**
 * **A params string is read whole or refused**, in every game (`engine-params`,
 * "A params string is read whole or refused").
 *
 * Two populations, pulling opposite ways:
 *
 * 1. **Strings no game reads.** Each of a game's own encodings, with a
 *    character its grammar has no use for appended, inserted at every index and
 *    written over every character. Every one is refused. This is what catches a
 *    decoder that skips what it does not know, reads a default for a letter its
 *    tag does not list, or stops reading before the string does.
 * 2. **Strings upstream's encoder writes.** A game ID made by the C collection
 *    opens here, so each of these decodes: the letters upstream writes for a
 *    setting this app has no field for are read by name, never by a skip.
 */

import { describe, expect, it } from "vitest";
import { UnreadableParams } from "./params.ts";
import { REGISTERED_GAMES } from "./testing/enrollment.ts";
import { paramsCorpus } from "./testing/params-corpus.ts";

/** Characters no game's params grammar reads; the first test holds that true. */
const STRANGERS = ["q", "Q", "?"];

/** `s` with `c` appended, inserted at every index, and written over every
 * character. */
function mutants(s: string, c: string): string[] {
  const out = new Set<string>([s + c]);
  for (let i = 0; i < s.length; i++) {
    out.add(s.slice(0, i) + c + s.slice(i));
    out.add(s.slice(0, i) + c + s.slice(i + 1));
  }
  return [...out];
}

/** A game's encodings, full and brief, of every corpus case that decodes: a
 * perturbed case may hold a choice the game has no letter for. */
function encodings(game: (typeof REGISTERED_GAMES)[number][1]): string[] {
  const out = new Set<string>();
  for (const c of paramsCorpus(game)) {
    for (const full of [true, false]) {
      const s = game.encodeParams(c.params, full);
      try {
        game.decodeParams(s);
        out.add(s);
      } catch (e) {
        if (!(e instanceof UnreadableParams)) throw e;
      }
    }
  }
  return [...out];
}

const ENCODINGS = REGISTERED_GAMES.map(
  ([id, game]) => [id, game, encodings(game)] as const,
);

describe("a character no game's grammar reads", () => {
  it("is in no game's own encodings, and there are encodings to try", () => {
    let total = 0;
    for (const [id, , strings] of ENCODINGS) {
      expect(`${id}:${strings.length >= 3}`).toBe(`${id}:true`);
      total += strings.length;
      for (const s of strings)
        for (const c of STRANGERS) expect(s, id).not.toContain(c);
    }
    expect(total).toBeGreaterThanOrEqual(600);
  });

  for (const [id, game, strings] of ENCODINGS) {
    it(`is refused wherever it stands: ${id}`, () => {
      const read: string[] = [];
      for (const s of strings) {
        for (const c of STRANGERS) {
          for (const mutant of mutants(s, c)) {
            try {
              game.decodeParams(mutant);
              read.push(mutant);
            } catch (e) {
              if (!(e instanceof UnreadableParams)) throw e;
              expect(e.message).toMatch(/^The parameters .+\.$/);
            }
          }
        }
      }
      expect(read).toEqual([]);
    });
  }
});

/**
 * What upstream's `encode_params` writes, per game: forms chosen so that every
 * optional piece and every letter the C encoder can emit appears, with the
 * legacy forms its `decode_params` still reads. Read from the C on 2026-10-11
 * (`../puzzles/*.c`, and `puzzles-web`'s `unreleased/` for the games that are
 * not Simon Tatham's).
 */
const UPSTREAM: Record<string, string[]> = {
  abcd: ["4x4n4", "4x4n4D", "4x4n4R", "5x5n4DR"],
  ascent: [
    "7x6mR",
    "7x6mRde",
    "10x8mRdhS",
    "5x5mEEdn",
    "7x6mCdt",
    "7x6mHEdnS",
    "7x6mOde",
  ],
  blackbox: ["w5h5m3M3", "w8h8m3M6"],
  boats: ["6x6f3,3,2,1", "6x6f3de,3,2,1", "10x12f5dhS,5,4,3,2,1", "6x6f3de"],
  bricks: ["7x6", "7x6de", "7x6dn", "10x8dt"],
  bridges: ["7x7m2", "7x7m2L", "7x7i30e10m2d0", "7x7i30e10m2Ld2"],
  clusters: ["7x7", "10x10"],
  crossing: ["5x5", "7x7S"],
  cube: ["c4x4", "t1x3", "o2x2", "i3x3", "4x4"],
  dominosa: ["6", "6dt", "6db", "6dh", "9de", "6da", "6a"],
  fifteen: ["4x4", "5x4"],
  filling: ["9x7"],
  flip: ["3x3", "3x3c", "5x5r"],
  flood: ["12x12", "12x12c6m5", "12x12c3m0"],
  galaxies: ["7x7", "7x7dn", "7x7du"],
  group: ["6", "6i", "6dn", "6dni", "8dh", "6dt", "12dx", "6dui"],
  guess: ["c6p4g10Bm", "c6p4g10bm", "c6p4g10BM", "c6p4g10bM"],
  inertia: ["10x8"],
  keen: ["6", "4de", "6dn", "6dh", "6dx", "6du", "6dnm"],
  lightup: ["7x7", "7x7b20s4d0", "7x7b20s4d2", "10x10b20s2d1", "7x7b20s4r", "7x7r"],
  loopy: [
    "7x7t0",
    "7x7t0de",
    "10x10t0dn",
    "10x10t0dt",
    "10x10t0dh",
    "6x6t2dn",
    "7x7de",
  ],
  magnets: ["6x5", "6x5de", "6x5dt", "6x5dtS", "10x9deS"],
  map: [
    "20x15n30",
    "20x15n30de",
    "20x15n30dn",
    "30x25n75dh",
    "20x15n30du",
    "20x15n30.5de",
  ],
  mathrax: ["5", "5de", "6dn", "5dt", "5drASMD", "6dnAEO", "5deS"],
  mines: ["9x9", "9x9n10", "9x9n10a", "9x9n10X4Y4", "30x16n99aX12Y7", "9x9n10.5"],
  mosaic: ["3x3", "10x10h0", "10x10h1"],
  net: ["5x5", "7x7w", "5x5b0.1", "13x11wb0.5", "5x5a", "11x11wb0.25a", "5x5b1e-05"],
  netslide: ["3x3", "3x3w", "3x3b1", "4x4wm12", "5x5wb0.5m8", "3x3b1e-05m5"],
  palisade: ["5x5n5", "15x12n10"],
  pattern: ["10x10"],
  pearl: ["6x6", "6x6de", "6x6dt", "6x6den", "12x8dtn"],
  pegs: ["7x7", "7x7cross", "7x7octagon", "5x5random"],
  range: ["9x6"],
  rect: ["7x7", "7x7e0.5", "7x7a", "11x11e0.25a", "7x7e1e-05a"],
  rome: ["4x4", "4x4de", "6x6dn", "10x10dt"],
  salad: ["4n3L", "5n3B", "4n3Lde", "8n5Ldx", "7n4Bdx"],
  samegame: ["5x5c3s2", "15x10c4s1", "15x10c4s2r"],
  seismic: ["4x4", "4x4T", "4x4de", "6x6Tde", "7x7dh"],
  separate: ["5x5n5", "8x6n4"],
  signpost: ["4x4", "4x4c"],
  singles: ["5x5", "5x5de", "5x5dk"],
  sixteen: ["3x3", "4x4m10"],
  slant: ["5x5", "5x5de", "8x8dh"],
  slide: ["7x6m25", "7x6u"],
  sokoban: ["12x10"],
  solo: [
    "3x3",
    "9j",
    "3x3x",
    "3x3xkm8db",
    "9jxmd4di",
    "3x3m4da",
    "3x3kmd2de",
    "3x3m2du",
    "3x3r4",
    "3x3ada",
    "9jka",
    "3x3dt",
    "3x3r2",
    "3x3j",
  ],
  spokes: ["4x4", "4x4de", "4x4dt", "6x6dh"],
  sticks: ["7x7", "7x7b20s2", "7x7b20s4", "7x7b30s0"],
  subsets: ["4x4n4", "6x6n5"],
  tents: ["8x8", "8x8de", "8x8dt"],
  towers: ["5", "4de", "5dh", "6dx", "6du"],
  tracks: ["8x8", "8x8de", "8x8dt", "15x15dh", "8x8dto", "10x8deo"],
  twiddle: ["3x3n2", "3x3n2r", "3x3n2o", "3x3n2rom10", "4x4n2m5"],
  undead: ["4x4", "4x4de", "4x4dn", "4x4dt"],
  unequal: ["4", "5a", "4de", "5dk", "5ade", "5dx", "6adr", "4dt"],
  unruly: ["8x8", "8x8u", "8x8dt", "8x8de", "10x10dn", "8x8udn"],
  untangle: ["6", "25"],
};

describe("a params string upstream's encoder writes", () => {
  it("is recorded for every registered game", () => {
    expect(
      REGISTERED_GAMES.map(([id]) => id).filter((id) => !(id in UPSTREAM)),
    ).toEqual([]);
  });

  for (const [id, game] of REGISTERED_GAMES) {
    it(`is read: ${id}`, () => {
      for (const s of UPSTREAM[id] ?? []) {
        expect(() => game.decodeParams(s), `${id} ${s}`).not.toThrow();
      }
    });
  }
});
