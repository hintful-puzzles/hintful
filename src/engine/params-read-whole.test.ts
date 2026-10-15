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
 * 2. **Strings upstream's encoder writes**, each of which decodes. They are
 *    held in `src/puzzle/upstream-params.test.ts`, beside the catalog that
 *    says which games have an upstream.
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
