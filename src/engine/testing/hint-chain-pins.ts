/**
 * The games whose hints number a chain, each with a position on which one does.
 *
 * `hint-ordinal.test.ts` renders each position and checks the numbers reach
 * the canvas. `hint-quality.test.ts` holds the membership: its walk fails on a
 * step that numbers a chain in a game with no entry here, so a game joins by
 * being told to, and the search for a chain runs once, when the pin is made.
 *
 * Dev/test-only; never imported by production code.
 */
import type { HintPin } from "./hint-positions.ts";

/**
 * The ordinals a step declares, or null when it declares none.
 *
 * Reads any array field carrying `order`, not `area` alone: the Latin games
 * put their chain in `area`, their evidence channel, and Clusters has a `chain`
 * field of its own, whose links carry the color the hypothesis forces them to.
 * What is checked is that an order a game declares is drawn, wherever it
 * declares it.
 */
export function declaredOrder(highlights: unknown): number[] | null {
  if (typeof highlights !== "object" || highlights === null) return null;
  const orders: number[] = [];
  for (const value of Object.values(highlights)) {
    if (!Array.isArray(value)) continue;
    for (const entry of value) {
      const k = (entry as { order?: unknown } | null)?.order;
      if (typeof k === "number") orders.push(k);
    }
  }
  return orders.length > 0 ? orders : null;
}

/** One position a game, keyed by game id, on which the hint opens with a
 * numbered chain. Found again by
 * `npm run hint-scan -- src/engine/hint-ordinal.test.ts`, which prints them:
 * the pins are not written in the call, so they are pasted here by hand. */
export const CHAIN_PINS: Record<string, HintPin<unknown>> = {
  /** Held on 4 of 422 positions walked, on 9 boards. */
  clusters: {
    id: "7x7dt:dCjACaAPBbAdAa",
    moves:
      '[{"kind":"paint","cells":[{"index":13,"fill":2}]},{"kind":"paint","cells":[{"index":5,"fill":1}]},{"kind":"paint","cells":[{"index":4,"fill":1}]},{"kind":"paint","cells":[{"index":2,"fill":2}]},{"kind":"paint","cells":[{"index":1,"fill":2}]},{"kind":"paint","cells":[{"index":0,"fill":2}]},{"kind":"paint","cells":[{"index":7,"fill":2}]},{"kind":"paint","cells":[{"index":9,"fill":2}]},{"kind":"paint","cells":[{"index":8,"fill":2}]},{"kind":"paint","cells":[{"index":10,"fill":2}]},{"kind":"paint","cells":[{"index":12,"fill":1}]},{"kind":"paint","cells":[{"index":18,"fill":1}]},{"kind":"paint","cells":[{"index":11,"fill":1}]},{"kind":"paint","cells":[{"index":19,"fill":1}]},{"kind":"paint","cells":[{"index":24,"fill":1}]},{"kind":"paint","cells":[{"index":27,"fill":1}]},{"kind":"paint","cells":[{"index":26,"fill":1}]},{"kind":"paint","cells":[{"index":25,"fill":1}]},{"kind":"paint","cells":[{"index":34,"fill":1}]},{"kind":"paint","cells":[{"index":35,"fill":1}]},{"kind":"paint","cells":[{"index":28,"fill":1}]},{"kind":"paint","cells":[{"index":14,"fill":2}]},{"kind":"paint","cells":[{"index":15,"fill":2}]},{"kind":"paint","cells":[{"index":23,"fill":1}]},{"kind":"paint","cells":[{"index":29,"fill":1}]},{"kind":"paint","cells":[{"index":41,"fill":2}]},{"kind":"paint","cells":[{"index":33,"fill":1}]},{"kind":"paint","cells":[{"index":39,"fill":1}]},{"kind":"paint","cells":[{"index":32,"fill":1}]},{"kind":"paint","cells":[{"index":46,"fill":1}]}]',
  },
  /** Held on 3 of 1228 positions walked, on 27 boards. */
  group: {
    id: "12dx:1_2_3_4_5_6_7_8_9_10_11_12_2d5f3k4b10h5b3c11_7a4a6f10d7k8f9b7a9f6d10g1c11k12k",
    moves:
      '[{"type":"set","cells":[{"x":9,"y":1}],"n":11},{"type":"set","cells":[{"x":8,"y":10}],"n":2},{"type":"set","cells":[{"x":7,"y":10}],"n":7},{"type":"set","cells":[{"x":8,"y":7}],"n":6},{"type":"set","cells":[{"x":5,"y":4}],"n":2},{"type":"set","cells":[{"x":7,"y":6}],"n":2},{"type":"set","cells":[{"x":5,"y":5}],"n":1},{"type":"set","cells":[{"x":9,"y":5}],"n":8},{"type":"set","cells":[{"x":5,"y":7}],"n":10},{"type":"set","cells":[{"x":5,"y":9}],"n":8},{"type":"set","cells":[{"x":9,"y":6}],"n":5},{"type":"set","cells":[{"x":9,"y":9}],"n":9},{"type":"set","cells":[{"x":8,"y":8}],"n":10},{"type":"set","cells":[{"x":6,"y":7}],"n":2},{"type":"set","cells":[{"x":4,"y":7}],"n":11},{"type":"set","cells":[{"x":4,"y":10}],"n":4},{"type":"set","cells":[{"x":4,"y":3}],"n":3},{"type":"set","cells":[{"x":10,"y":2}],"n":10},{"type":"set","cells":[{"x":1,"y":2}],"n":1},{"type":"set","cells":[{"x":4,"y":2}],"n":6},{"type":"set","cells":[{"x":2,"y":4}],"n":6},{"type":"set","cells":[{"x":1,"y":5}],"n":5},{"type":"set","cells":[{"x":4,"y":5}],"n":2},{"type":"set","cells":[{"x":2,"y":1}],"n":1},{"type":"set","cells":[{"x":6,"y":9}],"n":5},{"type":"set","cells":[{"x":2,"y":10}],"n":10},{"type":"set","cells":[{"x":1,"y":9}],"n":11},{"type":"set","cells":[{"x":4,"y":8}],"n":7},{"type":"set","cells":[{"x":4,"y":9}],"n":12},{"type":"set","cells":[{"x":11,"y":1}],"n":4},{"type":"set","cells":[{"x":3,"y":2}],"n":12},{"type":"set","cells":[{"x":10,"y":5}],"n":12},{"type":"set","cells":[{"x":2,"y":3}],"n":12},{"type":"set","cells":[{"x":10,"y":8}],"n":2},{"type":"set","cells":[{"x":9,"y":8}],"n":1},{"type":"set","cells":[{"x":9,"y":4}],"n":12},{"type":"set","cells":[{"x":9,"y":11}],"n":7},{"type":"set","cells":[{"x":11,"y":8}],"n":5},{"type":"set","cells":[{"x":1,"y":7}],"n":12},{"type":"set","cells":[{"x":7,"y":1}],"n":12},{"type":"set","cells":[{"x":1,"y":11}],"n":4},{"type":"set","cells":[{"x":5,"y":11}],"n":11},{"type":"set","cells":[{"x":8,"y":11}],"n":5},{"type":"set","cells":[{"x":5,"y":10}],"n":12},{"type":"set","cells":[{"x":11,"y":2}],"n":8},{"type":"set","cells":[{"x":2,"y":11}],"n":8},{"type":"set","cells":[{"x":11,"y":5}],"n":11},{"type":"set","cells":[{"x":11,"y":9}],"n":7},{"type":"pencilAdd","marks":[{"x":8,"y":1,"n":3},{"x":8,"y":1,"n":8}]},{"type":"pencilAdd","marks":[{"x":8,"y":3,"n":8},{"x":8,"y":3,"n":11}]},{"type":"pencilAdd","marks":[{"x":8,"y":2,"n":4},{"x":8,"y":2,"n":11}]},{"type":"pencilAdd","marks":[{"x":7,"y":2,"n":4},{"x":7,"y":2,"n":5}]},{"type":"pencilAdd","marks":[{"x":7,"y":3,"n":1},{"x":7,"y":3,"n":5}]},{"type":"pencilAdd","marks":[{"x":7,"y":11,"n":1},{"x":7,"y":11,"n":3}]},{"type":"pencilAdd","marks":[{"x":7,"y":9,"n":3},{"x":7,"y":9,"n":4}]},{"type":"pencilAdd","marks":[{"x":2,"y":9,"n":2},{"x":2,"y":9,"n":4}]},{"type":"pencilAdd","marks":[{"x":3,"y":9,"n":2},{"x":3,"y":9,"n":6}]},{"type":"pencilAdd","marks":[{"x":10,"y":9,"n":3},{"x":10,"y":9,"n":6}]}]',
  },
  /** Held on 4 of 2557 positions walked, on 33 boards. */
  keen: {
    id: "4dx:_a_7a3ba3,a5m12d2m16s2s1a7",
    moves:
      '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":1},{"x":1,"y":0,"n":2}]},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":1},{"x":2,"y":0,"n":2}]},{"type":"pencilStrike","marks":[{"x":3,"y":0,"n":3}]},{"type":"pencilStrike","marks":[{"x":3,"y":1,"n":3}]},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":3}]},{"type":"pencilStrike","marks":[{"x":1,"y":2,"n":3}]},{"type":"pencilStrike","marks":[{"x":1,"y":3,"n":2},{"x":1,"y":3,"n":3}]},{"type":"pencilStrike","marks":[{"x":2,"y":3,"n":1},{"x":2,"y":3,"n":3},{"x":2,"y":3,"n":4}]},{"type":"set","x":2,"y":3,"n":2,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":2,"y":1,"n":2},{"x":2,"y":2,"n":2},{"x":0,"y":3,"n":2},{"x":3,"y":3,"n":2}]},{"type":"pencilStrike","marks":[{"x":0,"y":2,"n":1}]},{"type":"pencilStrike","marks":[{"x":3,"y":2,"n":1},{"x":3,"y":2,"n":2}]},{"type":"pencilStrike","marks":[{"x":3,"y":3,"n":1}]},{"type":"pencilStrike","marks":[{"x":3,"y":1,"n":4}]},{"type":"set","x":1,"y":0,"n":3,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":3},{"x":2,"y":0,"n":3}]},{"type":"set","x":2,"y":0,"n":4,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":4},{"x":3,"y":0,"n":4},{"x":2,"y":1,"n":4},{"x":2,"y":2,"n":4}]},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":1},{"x":0,"y":1,"n":2}]}]',
  },
  /** Held on 266 of 427 positions walked, on 12 boards. */
  rome: "4x4de:2aa10b1d,gXDUdRa",
  /** Held on 3 of 871 positions walked, on 12 boards. */
  salad: {
    id: "4n3Ldx:aABgCbCaC,p",
    moves:
      '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":2},{"x":1,"y":0,"n":3}]},{"type":"pencilStrike","marks":[{"x":1,"y":2,"n":1},{"x":1,"y":3,"n":1}]},{"type":"pencilStrike","marks":[{"x":3,"y":1,"n":1},{"x":3,"y":1,"n":2}]},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":3},{"x":0,"y":1,"n":3}]},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":1},{"x":2,"y":0,"n":3}]},{"type":"pencilStrike","marks":[{"x":2,"y":2,"n":2},{"x":2,"y":3,"n":2}]},{"type":"pencilStrike","marks":[{"x":2,"y":3,"n":1}]},{"type":"pencilStrike","marks":[{"x":2,"y":1,"n":3}]},{"type":"pencilStrike","marks":[{"x":3,"y":3,"n":1},{"x":3,"y":3,"n":2}]},{"type":"pencilStrike","marks":[{"x":1,"y":3,"n":3},{"x":0,"y":3,"n":3}]},{"type":"set","x":3,"y":1,"value":3},{"type":"pencilStrike","marks":[{"x":3,"y":0,"n":3},{"x":3,"y":2,"n":3},{"x":3,"y":3,"n":3}]},{"type":"set","x":3,"y":3,"value":"cross"},{"type":"set","x":0,"y":3,"value":"circle"},{"type":"set","x":1,"y":3,"value":"circle"},{"type":"set","x":2,"y":3,"value":"circle"},{"type":"set","x":3,"y":0,"value":"circle"},{"type":"set","x":3,"y":2,"value":"circle"},{"type":"pencilStrike","marks":[{"x":3,"y":0,"n":4},{"x":3,"y":2,"n":4},{"x":0,"y":3,"n":4},{"x":1,"y":3,"n":4},{"x":2,"y":3,"n":4}]},{"type":"set","x":1,"y":3,"value":2},{"type":"set","x":2,"y":3,"value":3},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":2},{"x":1,"y":2,"n":2},{"x":2,"y":2,"n":3},{"x":0,"y":3,"n":2}]},{"type":"set","x":0,"y":3,"value":1},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":1},{"x":0,"y":1,"n":1},{"x":0,"y":2,"n":1}]}]',
  },
  /** Held on 7 of 2256 positions walked, on 45 boards. */
  solo: {
    id: "3x3de:a3a8a6a7a7_8g1a6_7a5c3a8_9d4_6g2_2d4_7a9c3a9_8a5g6_7a2a4a7a9a",
    moves:
      '[{"type":"set","x":8,"y":0,"n":1,"pencil":false,"autoElim":false},{"type":"set","x":0,"y":6,"n":4,"pencil":false,"autoElim":false},{"type":"set","x":8,"y":8,"n":3,"pencil":false,"autoElim":false},{"type":"set","x":8,"y":1,"n":6,"pencil":false,"autoElim":false},{"type":"set","x":8,"y":2,"n":8,"pencil":false,"autoElim":false},{"type":"set","x":6,"y":8,"n":1,"pencil":false,"autoElim":false},{"type":"set","x":7,"y":6,"n":2,"pencil":false,"autoElim":false},{"type":"set","x":6,"y":7,"n":4,"pencil":false,"autoElim":false},{"type":"set","x":2,"y":8,"n":5,"pencil":false,"autoElim":false},{"type":"set","x":2,"y":5,"n":1,"pencil":false,"autoElim":false},{"type":"set","x":1,"y":5,"n":5,"pencil":false,"autoElim":false},{"type":"set","x":1,"y":3,"n":7,"pencil":false,"autoElim":false},{"type":"set","x":3,"y":5,"n":6,"pencil":false,"autoElim":false},{"type":"set","x":2,"y":6,"n":7,"pencil":false,"autoElim":false},{"type":"set","x":0,"y":8,"n":8,"pencil":false,"autoElim":false},{"type":"set","x":0,"y":7,"n":9,"pencil":false,"autoElim":false},{"type":"set","x":0,"y":0,"n":5,"pencil":false,"autoElim":false},{"type":"set","x":1,"y":7,"n":1,"pencil":false,"autoElim":false},{"type":"set","x":1,"y":6,"n":6,"pencil":false,"autoElim":false},{"type":"set","x":4,"y":6,"n":1,"pencil":false,"autoElim":false},{"type":"set","x":2,"y":7,"n":3,"pencil":false,"autoElim":false},{"type":"set","x":4,"y":8,"n":6,"pencil":false,"autoElim":false},{"type":"pencilAdd","marks":[{"x":3,"y":1,"n":1},{"x":3,"y":1,"n":2}]},{"type":"pencilAdd","marks":[{"x":3,"y":4,"n":1},{"x":3,"y":4,"n":5}]},{"type":"pencilAdd","marks":[{"x":4,"y":3,"n":2},{"x":4,"y":3,"n":5}]}]',
  },
  /** Held on 10 of 1126 positions walked, on 24 boards. */
  towers: {
    id: "4dx:4////////2//////1/3",
    moves:
      '[{"type":"set","x":0,"y":0,"n":1,"pencil":false,"autoElim":false},{"type":"set","x":0,"y":1,"n":2,"pencil":false,"autoElim":false},{"type":"set","x":0,"y":2,"n":3,"pencil":false,"autoElim":false},{"type":"set","x":0,"y":3,"n":4,"pencil":false,"autoElim":false},{"type":"set","x":3,"y":2,"n":4,"pencil":false,"autoElim":false},{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":1},{"x":2,"y":0,"n":1},{"x":3,"y":0,"n":1},{"x":3,"y":0,"n":4},{"x":1,"y":1,"n":2},{"x":2,"y":1,"n":2},{"x":3,"y":1,"n":2},{"x":3,"y":1,"n":4},{"x":1,"y":2,"n":3},{"x":1,"y":2,"n":4},{"x":2,"y":2,"n":3},{"x":2,"y":2,"n":4},{"x":1,"y":3,"n":4},{"x":2,"y":3,"n":4},{"x":3,"y":3,"n":4}]},{"type":"pencilStrike","marks":[{"x":3,"y":3,"n":3}]},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":2}]},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":3}]},{"type":"set","x":1,"y":0,"n":4,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":4},{"x":1,"y":1,"n":4}]},{"type":"pencilStrike","marks":[{"x":2,"y":3,"n":2}]}]',
  },
  /** Held on 9 of 1475 positions walked, on 27 boards. */
  unequal: {
    id: "4dx:0,0,0,0,3R,0,0U,0,0,0,0L,0L,0,0L,0R,0,",
    moves:
      '[{"type":"pencilAdd","marks":[{"x":1,"y":1,"n":1},{"x":1,"y":1,"n":2}]},{"type":"pencilAdd","marks":[{"x":0,"y":3,"n":1},{"x":0,"y":3,"n":2},{"x":0,"y":3,"n":4}]},{"type":"pencilAdd","marks":[{"x":1,"y":3,"n":2},{"x":1,"y":3,"n":3},{"x":1,"y":3,"n":4}]},{"type":"pencilStrike","marks":[{"x":0,"y":3,"n":4}]},{"type":"pencilAdd","marks":[{"x":2,"y":0,"n":1},{"x":2,"y":0,"n":2},{"x":2,"y":0,"n":3},{"x":2,"y":0,"n":4}]},{"type":"pencilAdd","marks":[{"x":2,"y":1,"n":2},{"x":2,"y":1,"n":4}]},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":4}]},{"type":"pencilAdd","marks":[{"x":1,"y":2,"n":1},{"x":1,"y":2,"n":2},{"x":1,"y":2,"n":3},{"x":1,"y":2,"n":4}]},{"type":"pencilAdd","marks":[{"x":2,"y":2,"n":2},{"x":2,"y":2,"n":3},{"x":2,"y":2,"n":4}]},{"type":"pencilStrike","marks":[{"x":1,"y":2,"n":4}]},{"type":"pencilAdd","marks":[{"x":3,"y":3,"n":1},{"x":3,"y":3,"n":2},{"x":3,"y":3,"n":3},{"x":3,"y":3,"n":4}]},{"type":"pencilAdd","marks":[{"x":2,"y":3,"n":2},{"x":2,"y":3,"n":3},{"x":2,"y":3,"n":4}]},{"type":"pencilStrike","marks":[{"x":3,"y":3,"n":4}]},{"type":"pencilAdd","marks":[{"x":3,"y":2,"n":3},{"x":3,"y":2,"n":4}]},{"type":"pencilStrike","marks":[{"x":2,"y":2,"n":4}]},{"type":"pencilStrike","marks":[{"x":1,"y":2,"n":3}]}]',
  },
};
