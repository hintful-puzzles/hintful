// The kept-board store against fake-indexeddb. The setup import comes first,
// so the global `indexedDB` is in place when the store opens its database.
import "../test-setup/indexeddb.ts";
import Dexie from "dexie";
import { beforeEach, describe, expect, it } from "vitest";
import type { DealtBoard } from "../engine/types.ts";
import { KeptBoards } from "./kept-boards.ts";

const board = (params: string, desc: string): DealtBoard => ({
  params,
  desc,
  aux: `aux of ${desc}`,
});

describe("kept boards", () => {
  const store = new KeptBoards("build-1");
  beforeEach(() => store.clear());

  it("hands a kept board over once", async () => {
    await store.keep("group", board("6dh", "first"), 40);
    expect(await store.dealTimes("group", "6dh")).toEqual([40]);
    expect(await store.take("group", "6dh")).toEqual(board("6dh", "first"));
    expect(await store.dealTimes("group", "6dh")).toEqual([]);
    expect(await store.take("group", "6dh")).toBeNull();
  });

  it("keeps boards for each type of each puzzle", async () => {
    await store.keep("group", board("6dh", "a"), 1);
    await store.keep("group", board("8dx", "b"), 2);
    await store.keep("keen", board("6dh", "c"), 3);
    expect((await store.take("group", "8dx"))?.desc).toBe("b");
    expect((await store.take("keen", "6dh"))?.desc).toBe("c");
    expect((await store.take("group", "6dh"))?.desc).toBe("a");
  });

  it("keeps several boards of one type, and hands out the one kept longest", async () => {
    await store.keep("group", board("6dh", "oldest"), 7000);
    await store.keep("group", board("8dx", "another type's"), 5);
    await store.keep("group", board("6dh", "middle"), 300);
    await store.keep("group", board("6dh", "newest"), 35000);
    expect(await store.dealTimes("group", "6dh")).toEqual([7000, 300, 35000]);
    expect((await store.take("group", "6dh"))?.desc).toBe("oldest");
    expect((await store.take("group", "6dh"))?.desc).toBe("middle");
    expect(await store.dealTimes("group", "6dh")).toEqual([35000]);
    expect((await store.take("group", "6dh"))?.desc).toBe("newest");
    expect(await store.take("group", "6dh")).toBeNull();
    expect(await store.dealTimes("group", "8dx")).toEqual([5]);
  });

  it("reads another build's boards as absent, and takes them out of the way", async () => {
    await store.keep("group", board("6dh", "old solver's"), 1);
    await store.keep("group", board("6dh", "and another"), 1);
    const next = new KeptBoards("build-2");
    expect(await next.dealTimes("group", "6dh")).toEqual([]);
    expect(await next.take("group", "6dh")).toBeNull();
    // The refused rows are gone for the build that wrote them too.
    expect(await store.dealTimes("group", "6dh")).toEqual([]);
  });

  it("clears every other build's boards when it keeps one", async () => {
    await store.keep("group", board("6dh", "stale"), 1);
    await store.keep("keen", board("5", "stale too"), 1);
    const next = new KeptBoards("build-2");
    await next.keep("group", board("8dx", "fresh"), 1);
    expect(await store.dealTimes("group", "6dh")).toEqual([]);
    expect(await store.dealTimes("keen", "5")).toEqual([]);
    expect(await next.dealTimes("group", "8dx")).toEqual([1]);
  });

  // A store that failed to open would fail every New game, since each asks it
  // for a board first.
  it("opens over the database an earlier build left, dropping its rows", async () => {
    await Dexie.delete("PuzzleKeptBoards");
    const earlier = new Dexie("PuzzleKeptBoards");
    earlier.version(1).stores({ boards: "&[puzzleId+params]" });
    await earlier.table("boards").put({
      ...board("6dh", "one row a type"),
      puzzleId: "group",
      build: "build-1",
    });
    earlier.close();

    const reopened = new KeptBoards("build-1");
    expect(await reopened.take("group", "6dh")).toBeNull();
    await reopened.keep("group", board("6dh", "a"), 1);
    await reopened.keep("group", board("6dh", "b"), 1);
    expect(await reopened.dealTimes("group", "6dh")).toEqual([1, 1]);
  });
});
