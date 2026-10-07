/**
 * Sokoban's solver, Solve and hint (`judge-rivals-for-search-hints`).
 *
 * Each sentence the hint says on generated boards is pinned by a position it
 * fires on, so a change to the generator cannot quietly stop a branch being
 * exercised. Which push the hint offers follows the line the search finds, so
 * a change to the search moves these, and `testing/hint-positions.ts` scans
 * 10×12 boards for them again. The refusals are small boards built by hand.
 */

import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { isDeadEnd } from "../../engine/hint-refusal.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import {
  bindingDefects,
  deadEndBindingDefects,
} from "../../engine/testing/hint-binding.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { hint, hintKeepTrack, pushMove, type SokobanRung } from "./hint.ts";
import { BARREL, GOAL, PUSH, type Stuck } from "./hint-text.ts";
import { executeMove, sokobanGame } from "./index.ts";
import { COL_HINT, COL_HINT_EVIDENCE } from "./render.ts";
import { DIRS, SokobanBoard, search, searchFrom } from "./solver.ts";
import {
  encodeBoard,
  isBarrel,
  isOnTarget,
  type SokobanMove,
  type SokobanState,
  status,
  WALL,
} from "./state.ts";

const G = sokobanGame;

function load(id: string): SokobanState {
  const [params, desc] = id.split(":");
  return G.newState(G.decodeParams(params), desc);
}

/** Positions the scan found, each with how many of the positions it walked
 * hold the pin's rung or case: of 937 on 40 boards (2026-10-04), or of 3824
 * on the 160 boards it took to reach `alsoThese` (2026-10-05). A const,
 * because the tests below read the pins by id. */
const PINNED = {
  /** This barrel's other push would jam it where it can never move.
   * Held on 86 of 937. */
  trapFrozen:
    "10x12:w12s3twf2w3b2s5w2stsfs4w2bs2btsbsw2t2st2stbw2sb2sbs2tw2s3fs4w2bs4fsfw2t2sbus3w3tbs5w11",
  /** This barrel's other push would freeze a barrel beside it.
   * Held on 21 of 937. */
  trapVictim:
    "10x12:w11fs4fs2w2stwbsusbw2sbwtbtstw2s3tbs2w3fw3s4w2fs4fs2w2s5fwfw2s2fs3wfw2fws6w3fs2w2s2w11",
  /** This barrel's other push would wedge it in a corner.
   * Held on 51 of 937. */
  trapCorner:
    "10x12:w11fs4fs2w2sfws4bw2s2wfsfstw2s3fus2w3fw3s4w2fs4fs2w2s5fwfw2s2fs3wfw2fws6w3fs2w2s2w11",
  /** This barrel's other push would leave it where no target can be reached.
   * Held on 5 of 937. */
  trapDead:
    "10x12:w11f3sfs2fw2s2fs4fw2f2s4fsw2sfsfs4w2s4fs3w2s3fs4w2s2f2sfsfw2f2s3us2w2tbs2ftbsw2s8w11",
  /** A push of this barrel strands a barrel, whichever and however. */
  trap: "10x12:w12s3twf2w3b2s5w2stsfs4w2bs2btsbsw2t2st2stbw2sb2sbs2tw2s3fs4w2bs4fsfw2t2sbus3w3tbs5w11",
  /** Every other push of this barrel was searched to the end, and none
   * finishes.
   * Held on 109 of 3824. */
  only: "10x12:w24s2tw7sbw8s3btw7stsw7sb2w4tbs3tw6s2b2w6sbt2w5futbtw11",
  /** Every other push of this barrel settled, and more than one finishes.
   * Held on 6 of 937. */
  onlyThese:
    "10x12:w11s2fsfs2fw2s5fs2w2s2fsfs2fw2us2ts2btw2fs2bs4w2fbt2sbt2w2tsb2tbsbw2ts4tbsw2bs2bs4w2s3tsfs2w11",
  /** Some other pushes of this barrel finish, one is lost, and one the search
   * could not settle.
   * Held on 4 of 3824. */
  alsoThese:
    "10x12:w13tbsw6tbs3w7tbtbtw5bsbtw3tw2sus2w3bs3fs3w2s2wstswsw2tbs2bsbtw4sbtsbsw6tbstw11",
  /** The push fills a target at the end of a corridor, which a barrel on the
   * target before it would shut off.
   * Held on 8 of 937. */
  fillFirst:
    "10x12:w11tbtbs2btw3s4btw4fws2bstw3s3fs3w2tbs4tbw2s2tsfbstw2sb2susf2w2fsts5w2s2fs4fw3fs3w14",
  /** Another barrel cannot be pushed to a target until this one moves.
   * Held on 77 of 937. */
  clearsWay:
    "10x12:w11tbtbs2btw3s4btw4fws4tw3s3tbs2w2tbs2bstbw2s2tstbstw2sb2sbsf2w2tbts5w2s2fus3fw3fs3w14",
  /** Nothing settled worth saying; the push lands on a target.
   * Held on 454 of 937. */
  onTarget:
    "10x12:w11s2tsfs2fw2sbs3fs2w2s2fstbufw2bs2ts2btw2ts2bsbs2w2fbt2s2t2w2ts2btbsbw2tsbs2tbsw2sbsbsbs2w2s3tsts2w11",
  /** Barrels shut the player into a corner of the board, and this push lets
   * them out (owner, 2026-10-03).
   * Held on 22 of 937. */
  freesYou:
    "10x12:w12s3twt2w3b2s2bsbw2stsfs4w2bs3tsbsw2t2sftstbw2sb2ubs2tw2s3fs4w2bs4fsfw2t2s3bs2w3tbs5w11",
  /** The plan pushes one barrel twice or more, onto a target.
   * Held on 119 of 937. */
  run: "10x12:w11tbtbs2btw3s4btw4fws4tw3s3tbs2w2tbs2bstbw2s2tstbstw2sb2sbsf2w2tbtsbs3w2s2ts3ufw3fs3w14",
  /** Nothing settled worth saying, the push lands on floor, and no run to a
   * target opens with it.
   * Held on 66 of 937. */
  plain:
    "10x12:w11s2fsfs2fw2s5fs2w2s2fsfs2fw2s3fs3fw2fs2us4w2fbt2sbt2w2tsb2tbsbw2ts4tbsw2bs2bs4w2s3tsfs2w11",
};

/** A board as dealt, whose walk by hints says each of the three things the
 * hint says about order (2026-10-04). */
const DEALT =
  "10x12:w11tbtsbubtw3s4btw4fws4tw3s3tbs2w2tbs2bstbw2s2tstbstw2sb2sbsf2w2tbtsbs3w2s2ts3btw3tsbsw14";

/** One push from here the line the search finds is a push longer, and it
 * opens by undoing that push: following first pushes alone, a barrel went
 * right and then back left for ever (2026-10-04). Four positions in 1,366 of
 * hint-guided play on 10×12 boards were of this kind when this one was found. */
const CYCLED_BACK =
  "10x12:w11s2fs2ts2w2sbusbsfbw2tbsbs3tw2tbs2ts3w2tfs3tstw2s4fsb2w2s2b2st3w2bt2sbsbsw2sbs3tsfw2s3tsbs2w11";

/** Pushing first pushes alone, a barrel here went up and then back down for
 * ever (`judge-rivals-for-search-hints` design D3). */
const CYCLED =
  "16x20:w17s2w3tw10btsbsbwtw8ts6bw3tw5twtsws5bw5bwbsw5s2tw3s6btw4bw3sbswsw5tbsw3fvbtsw5tws2w2sbw2sw2sbtbs2bw2stswsw2sts3wtw2sbt2sw2sb2ts2w3sbtbsw2s2wtbsw3bs7btbtw4twsws2wsbtwtw6swsbws2tsbw6swbts3bs2w5s2wtws6w5sbtwtbswtbsw19";

/** A barrel in a corner off its target, beside the target it needed. */
const CORNERED = "5x4:w6bsuw2stsw6";
/** Two barrels side by side under a wall, the left one a push from its target
 * on an empty board: each holds the other still. */
const FROZEN = "6x4:w7tb2uw2s2tsw7";

/**
 * Whether pushing only the barrel at `barrel` can bring it to an empty target,
 * by the game's own moves: every board a key's push of that barrel reaches,
 * the player walking wherever a tap would take them.
 */
function pushedHome(start: SokobanState, barrel: number): boolean {
  const seen = new Set<string>();
  const todo = [{ s: start, at: barrel }];
  for (let cur = todo.pop(); cur; cur = todo.pop()) {
    const { s, at } = cur;
    const x = at % s.w;
    const y = Math.floor(at / s.w);
    for (const { dx, dy } of DIRS) {
      const move = { type: "push", x, y, dx, dy, n: 1 } as const;
      let next: SokobanState;
      try {
        next = executeMove(s, move);
      } catch {
        continue;
      }
      const to = (y + dy) * s.w + x + dx;
      if (isOnTarget(next.grid[to])) return true;
      const key = encodeBoard(next);
      if (seen.has(key)) continue;
      seen.add(key);
      todo.push({ s: next, at: to });
    }
  }
  return false;
}

function step(id: string) {
  const s = load(id);
  const r = hint(s);
  if (!r.ok) throw new Error(`${id}: ${r.error}`);
  return { s, step: r.steps[0] };
}

type Step = HintStep<SokobanMove, unknown, SokobanRung>;

/** A trap's case: whether the striped push strands the pushed barrel itself
 * or another, and how that barrel is stuck. */
function trapCase(st: Step, s: SokobanState): { own: boolean; why: Stuck } | null {
  if (st.rung !== "trap") return null;
  const [rival] = stepMarks(st).of("stripes", PUSH);
  const board = new SokobanBoard(s);
  const after = board.apply(board.positionOf(s), rival);
  const landed = board.step(rival.barrel, rival.dir);
  const victim = board.stuck(after, landed);
  const kind = board.stuckKind(after, victim);
  if (kind === null) return null;
  const why = kind === "dead" && board.cornered(victim) ? "corner" : kind;
  return { own: victim === landed, why };
}
const trapOf = (own: boolean, why: Stuck) => (st: Step, s: SokobanState) => {
  const c = trapCase(st, s);
  return c !== null && c.own === own && c.why === why;
};

/** The cases of a trap that read differently. */
const KINDS = {
  trapFrozen: trapOf(true, "frozen"),
  trapVictim: trapOf(false, "frozen"),
  trapCorner: trapOf(true, "corner"),
  trapDead: trapOf(true, "dead"),
};

/** Each pin's plan speaks its rung or opens with its case, and the scan finds
 * the pins again when a change to the search moves them. */
const pinned = describeHintPins({
  game: G,
  params: [G.decodeParams("10x12")],
  seeds: 160,
  descOf: encodeBoard,
  kinds: KINDS,
  pins: PINNED,
});

describe("the hint's sentences", () => {
  for (const name of Object.keys(PINNED) as (keyof typeof PINNED)[]) {
    it(`${name}: says what it checked, and draws what it says`, () => {
      const { state: s, step: st } = pinned(name);
      expect(bindingDefects(G, s, G.newUi(s), st)).toEqual([]);
      // The push is the board's to make, and leaves a board that still finishes.
      const after = G.executeMove(s, st.move);
      expect(search(after, 100_000).kind).toBe("found");
    });
  }

  it("stripes a push of the ringed barrel that really strands one", () => {
    const { s, step: st } = step(PINNED.trapCorner);
    const marks = stepMarks(st);
    const [ringed] = marks.of("ring", PUSH);
    const [striped] = marks.of("stripes", PUSH);
    expect(striped.barrel).toBe(ringed.barrel);
    const board = new SokobanBoard(s);
    const after = board.apply(board.positionOf(s), striped);
    expect(board.stuckBarrels(after)).not.toEqual([]);
  });

  it("says a push lets the player out only where it opens far more of the board", () => {
    const { s, step: st } = step(PINNED.freesYou);
    const board = new SokobanBoard(s);
    const [ringed] = stepMarks(st).of("ring", PUSH);
    const before = board.region(board.positionOf(s)).length;
    const after = board.region(board.apply(board.positionOf(s), ringed)).length;
    expect(after).toBeGreaterThanOrEqual(4 * before);
  });

  /** What "would wall off the ringed one" claims, read off the grid. */
  function expectWalledOff(s: SokobanState, st: HintStep<SokobanMove>) {
    const marks = stepMarks(st);
    const [ringed] = marks.of("ring", PUSH);
    const [later] = marks.of("outline", GOAL);
    const { dx, dy } = DIRS[ringed.dir];
    const at = (x: number, y: number) =>
      x < 0 || y < 0 || x >= s.w || y >= s.h ? -1 : y * s.w + x;
    const tx = (ringed.barrel % s.w) + dx;
    const ty = Math.floor(ringed.barrel / s.w) + dy;
    expect(isOnTarget(s.grid[at(tx, ty)])).toBe(true);
    expect(isOnTarget(s.grid[later])).toBe(true);
    expect(isBarrel(s.grid[later])).toBe(false);
    // A push onto the target comes from the square beside it, the player on
    // the square beyond: from every side one of the two is a wall, off the
    // board, or the outlined target.
    const shut = (c: number) => c < 0 || s.grid[c] === WALL || c === later;
    let viaLater = 0;
    for (const d of DIRS) {
      const from = at(tx - d.dx, ty - d.dy);
      const stand = at(tx - 2 * d.dx, ty - 2 * d.dy);
      expect(shut(from) || shut(stand)).toBe(true);
      if (from === later || stand === later) viaLater++;
    }
    expect(viaLater).toBeGreaterThan(0);
  }

  /** What "keeps the outlined barrel from reaching a target" and "that opens
   * a way" claim. */
  function expectWayOpened(s: SokobanState, st: HintStep<SokobanMove>) {
    const marks = stepMarks(st);
    const [ringed] = marks.of("ring", PUSH);
    const [blocked] = marks.of("outline", BARREL);
    const board = new SokobanBoard(s);
    const here = board.positionOf(s);
    const home = (p: typeof here) =>
      board
        .routes(p, blocked)
        .some((r, c) => r === 1 && board.target[c] && !p.barrels[c]);
    expect(home(here)).toBe(false);
    expect(home(board.apply(here, ringed))).toBe(true);
    // And the player can do it: pushing only that barrel from the board the
    // hinted push leaves, some line of its pushes ends with it on a target.
    expect(pushedHome(G.executeMove(s, st.move), blocked)).toBe(true);
    expect(pushedHome(s, blocked)).toBe(false);
  }

  it("outlines a target whose barrel would leave no way to push one onto the ringed target", () => {
    const { s, step: st } = step(PINNED.fillFirst);
    expectWalledOff(s, st);
  });

  it("outlines a barrel that only this push lets reach a target", () => {
    const { s, step: st } = step(PINNED.clearsWay);
    expectWayOpened(s, st);
  });

  it("claims nothing about the order that does not hold, along a dealt board", () => {
    let s = load(DEALT);
    const said = { walledOff: 0, wayOpened: 0, runs: 0 };
    while (status(s) !== "solved") {
      const r = hint(s);
      if (!r.ok) throw new Error(r.error);
      const [st] = r.steps;
      if (st.rung === "fillFirst") {
        expectWalledOff(s, st);
        said.walledOff++;
      } else if (st.rung === "clearsWay") {
        expectWayOpened(s, st);
        said.wayOpened++;
      } else if (r.steps.length > 1) {
        // Every leg is a push the board takes, and the last one lands.
        let end = s;
        for (const leg of r.steps) end = executeMove(end, leg.move);
        const m = r.steps[r.steps.length - 1].move;
        if (m.type !== "push") throw new Error("a hint step is a push");
        expect(isOnTarget(end.grid[(m.y + m.dy) * s.w + m.x + m.dx])).toBe(true);
        said.runs++;
      }
      s = executeMove(s, st.move);
    }
    expect(said.walledOff).toBeGreaterThan(0);
    expect(said.wayOpened).toBeGreaterThan(0);
    expect(said.runs).toBeGreaterThan(0);
  });

  it("tells a barrel's run to a target as one journey, each leg its own push", () => {
    const s0 = load(PINNED.run);
    const r = hint(s0);
    if (!r.ok) throw new Error(r.error);
    expect(r.steps.length).toBeGreaterThan(1);
    expect(r.steps[0].explanation).toMatch(
      new RegExp(`^${["", "", "Two", "Three", "Four", "Five"][r.steps.length]} pushes`),
    );
    let s = s0;
    let barrel = -1;
    r.steps.forEach((st, i) => {
      expect(st.continuesPrevious === true).toBe(i > 0);
      expect(bindingDefects(G, s, G.newUi(s), st)).toEqual([]);
      const m = st.move;
      if (m.type !== "push") throw new Error("a hint step is a push");
      // One barrel, pushed on from where the last leg left it.
      if (i > 0) expect(m.y * s.w + m.x).toBe(barrel);
      barrel = (m.y + m.dy) * s.w + m.x + m.dx;
      expect(hintKeepTrack(m, st, s)).toBe("completed");
      const last = i === r.steps.length - 1;
      expect(st.explanation).toMatch(
        i === 0
          ? /First, push it \w+\.$/
          : last
            ? /^Last, push this barrel \w+: that puts it on a target\.$/
            : /^Next, push this barrel \w+\.$/,
      );
      expect(isOnTarget(s.grid[barrel])).toBe(last);
      s = G.executeMove(s, m);
    });
    expect(isBarrel(s.grid[barrel]) && isOnTarget(s.grid[barrel])).toBe(true);
  });

  it("draws arrows on the ringed barrel's pushes that finish, its own among them", () => {
    const { s, step: st } = step(PINNED.onlyThese);
    const marks = stepMarks(st);
    const [ringed] = marks.of("ring", PUSH);
    const arrows = marks.of("outline", PUSH);
    expect(arrows.length).toBeGreaterThan(1);
    expect(arrows.every((a) => a.barrel === ringed.barrel)).toBe(true);
    expect(arrows).toContainEqual(ringed);
    // Each arrow's push leaves a board the search still finishes.
    const board = new SokobanBoard(s);
    for (const a of arrows) {
      const after = board.apply(board.positionOf(s), a);
      expect(searchFrom(board, after, 100_000, { left: Infinity }).kind).toBe("found");
    }
  });
});

describe("refusals", () => {
  it("outlines a barrel already stuck, and asks to undo", () => {
    for (const [id, words] of [
      [CORNERED, /^The outlined barrel is wedged in a corner it can never leave\./],
      [FROZEN, /^The outlined barrel is jammed/],
    ] as const) {
      const s = load(id);
      const r = hint(s);
      if (r.ok || !r.words) throw new Error(`${id}: expected a marked refusal`);
      expect(r.error).toMatch(words);
      expect(isDeadEnd(r.error)).toBe(true);
      expect(deadEndBindingDefects(G, s, G.newUi(s), r)).toEqual([]);
      expect(stepMarks(r).of("outline", BARREL).length).toBe(1);
    }
  });
});

describe("following the hint", () => {
  it("never comes back to a position, where first pushes alone cycled", () => {
    let s = load(CYCLED);
    const seen = new Set<string>();
    let pushes = 0;
    while (status(s) !== "solved") {
      const key = encodeBoard(s);
      expect(seen.has(key), `back at a position after ${pushes} pushes`).toBe(false);
      seen.add(key);
      const r = hint(s);
      expect(r.ok, `refused after ${pushes} pushes`).toBe(true);
      if (!r.ok) return;
      s = executeMove(s, r.steps[0].move);
      pushes++;
    }
    expect(pushes).toBeGreaterThan(20);
  });

  it("walks on where the line found after a push comes straight back", () => {
    let s = load(CYCLED_BACK);
    // The trap is here: the search's line after its own first push is longer,
    // and opens by undoing it.
    const board = new SokobanBoard(s);
    const here = board.positionOf(s);
    const line = searchFrom(board, here, 100_000, { left: Infinity });
    if (line.kind !== "found") throw new Error("the pinned board has a line");
    const pushed = board.apply(here, line.line[0]);
    const back = searchFrom(board, pushed, 100_000, { left: Infinity });
    if (back.kind !== "found") throw new Error("and one after its first push");
    expect(back.line.length).toBeGreaterThan(line.line.length);
    expect(board.key(board.apply(pushed, back.line[0]))).toBe(board.key(here));

    const seen = new Set<string>();
    let pushes = 0;
    while (status(s) !== "solved") {
      const key = encodeBoard(s);
      expect(seen.has(key), `back at a position after ${pushes} pushes`).toBe(false);
      if (seen.has(key)) return;
      seen.add(key);
      const r = hint(s);
      if (!r.ok) throw new Error(`refused after ${pushes} pushes: ${r.error}`);
      s = executeMove(s, r.steps[0].move);
      pushes++;
    }
    expect(pushes).toBeGreaterThan(3);
  });

  it("keeps the step while the player walks, completes on its push, drops any other", () => {
    const { s, step: st } = step(PINNED.plain);
    const want = st.move;
    if (want.type !== "push") throw new Error("a hint step is a push");
    // A tap walks behind the barrel; a key's push then completes the step, as
    // the drag's own push does.
    const walk = { type: "walk", x: want.x - want.dx, y: want.y - want.dy } as const;
    expect(hintKeepTrack(walk, st, s)).toBe("onTrack");
    const at = executeMove(s, walk);
    const key = { type: "move", dx: want.dx, dy: want.dy } as const;
    expect(hintKeepTrack(key, st, at)).toBe("completed");
    expect(hintKeepTrack(want, st, at)).toBe("completed");
    // The walk and the hint's own move reach the same board.
    expect(encodeBoard(executeMove(at, key))).toBe(encodeBoard(executeMove(s, want)));
    // A longer push of the same barrel was never judged.
    expect(hintKeepTrack({ ...want, n: 2 }, st, at)).toBe("off");
  });
});

describe("levels with pits, which only a hand-typed ID has", () => {
  // A barrel that fills a pit is gone, so these boards' deadlocks are not
  // the generated boards' (`SokobanBoard.tight` is false), and nothing else
  // here walks one.
  const LEVELS = [
    // Two barrels, a pit and a target: fill both.
    "7x4:w8ubspsw2s2bstw8",
    // A deep pit swallows a barrel and stays.
    "7x4:w8ubsdsw2s2bstw8",
  ];
  for (const id of LEVELS) {
    it(`${id}: the hint walks it to the end, and Solve finishes it`, () => {
      let s = load(id);
      const start = s;
      let pushes = 0;
      while (status(s) !== "solved") {
        const r = hint(s);
        if (!r.ok) throw new Error(`refused after ${pushes} pushes: ${r.error}`);
        expect(bindingDefects(G, s, G.newUi(s), r.steps[0])).toEqual([]);
        s = executeMove(s, r.steps[0].move);
        expect(++pushes).toBeLessThan(50);
      }
      expect(pushes).toBeGreaterThan(0);
      const solved = G.solve?.(start, start);
      expect(solved?.ok).toBe(true);
      if (solved?.ok) expect(status(executeMove(start, solved.move))).toBe("solved");
    });
  }
});

describe("Solve", () => {
  it("leaves the finished board, from the dealt one when the player's is lost", () => {
    const s = load(PINNED.onTarget);
    const r = G.solve?.(s, s);
    expect(r?.ok).toBe(true);
    if (!r?.ok) return;
    expect(status(executeMove(s, r.move))).toBe("solved");

    // A lost position, the trap's striped push made, falls back on the board
    // as dealt.
    const { s: deal, step: trap } = step(PINNED.trapCorner);
    const [striped] = stepMarks(trap).of("stripes", PUSH);
    const lost = executeMove(deal, pushMove(deal.w, striped));
    expect(hint(lost).ok).toBe(false);
    const back = G.solve?.(deal, lost);
    expect(back?.ok).toBe(true);
    if (back?.ok) expect(status(executeMove(lost, back.move))).toBe("solved");
  });

  it("refuses a board on different walls", () => {
    const s = load(PINNED.plain);
    expect(() => executeMove(s, { type: "solve", board: "w6s2uw2btsw6" })).toThrow();
  });
});

describe("rendering the marks (tier 2.5)", () => {
  const rings = (ops: readonly { op: string }[], color: number) =>
    ops.filter((o) => {
      const c = o as { op: string; fill?: number; outline?: number };
      return c.op === "circle" && c.fill === -1 && c.outline === color;
    }).length;

  it("rings the barrel and its square, and stripes the trap's two squares", () => {
    const { recording } = renderScenario({
      game: G,
      id: PINNED.trapCorner,
      showHint: true,
    });
    // Two strokes per ring.
    expect(rings(recording.ops, COL_HINT)).toBe(4);
    expect(recording.ops.filter((o) => o.op === "hatch").length).toBe(2);
    expect(recording.ops).toMatchSnapshot();
  });

  it("outlines the target to leave empty, and the barrel kept from one", () => {
    for (const [id, kind] of [
      [PINNED.fillFirst, GOAL],
      [PINNED.clearsWay, BARREL],
    ] as const) {
      const { recording, hint: st } = renderScenario({ game: G, id, showHint: true });
      expect(st ? stepMarks(st).of("outline", kind).length : 0).toBe(1);
      // Two strokes per ring: the push's two squares, and the one outline.
      expect(rings(recording.ops, COL_HINT)).toBe(4);
      expect(rings(recording.ops, COL_HINT_EVIDENCE)).toBe(2);
    }
  });

  it("draws an arrow for each push that finishes", () => {
    const { recording, hint: st } = renderScenario({
      game: G,
      id: PINNED.onlyThese,
      showHint: true,
    });
    const arrows = st ? stepMarks(st).of("outline", PUSH).length : 0;
    // Each arrow spans two squares, which paint its piece each.
    const heads = recording.ops.filter(
      (o) => o.op === "polygon" && o.fill === COL_HINT_EVIDENCE,
    ).length;
    expect(arrows).toBeGreaterThan(1);
    expect(heads).toBe(2 * arrows);
  });
});
