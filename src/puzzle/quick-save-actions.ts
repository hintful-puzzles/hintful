/**
 * Quick-save actions shared by every surface that triggers them — the
 * game menu, the bottom-right toolbar button (`puzzle-history`), and the
 * Cmd/Ctrl+S shortcut (`puzzle-screen`). One implementation so the
 * check→save→confirm behavior is identical wherever it's invoked.
 */
import { signal } from "@lit-labs/signals";
import { showAlert } from "../dialogs/alert-dialog.ts";
import { announce, showToast } from "../dialogs/toast.ts";
import { savedGames } from "../store/saved-games.ts";
import type { Puzzle } from "./puzzle.ts";

/** How long the Check & save button reads "Saved" after a save succeeds. */
const SAVED_FLASH_MS = 1500;

/** The puzzle whose Check & save just succeeded, while its button says so. */
const savedPuzzleId = signal<string | null>(null);
let savedFlashTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Whether `puzzleId`'s Check & save button should read "Saved" right now.
 * Reactive: a `SignalWatcher` that reads it redraws when the moment passes.
 */
export function justSaved(puzzleId: string): boolean {
  return savedPuzzleId.get() === puzzleId;
}

function flashSaved(puzzleId: string): void {
  savedPuzzleId.set(puzzleId);
  if (savedFlashTimer !== null) clearTimeout(savedFlashTimer);
  savedFlashTimer = setTimeout(() => {
    savedPuzzleId.set(null);
    savedFlashTimer = null;
  }, SAVED_FLASH_MS);
}

/** What the check says beside a save it could not settle: the hint's search
 * ran past its reach, which establishes nothing, so the save goes ahead. */
export const CHECK_OUT_OF_REACH =
  "This position is further ahead than the check can search, so it couldn't tell whether it can still be finished.";

/** "3 mistakes found", "1 mistake found". */
export function mistakesFound(n: number): string {
  return `${n} mistake${n === 1 ? "" : "s"} found`;
}

/**
 * Combined Check-&-Save. On a game that can check (`Puzzle.canCheck`), check
 * first (`Puzzle.check`) and quick-save only a board the check passes: on
 * mistakes, or a position the hint calls a dead end, leave the previous
 * quick-save intact and say why (the engine has already highlighted what it
 * found) via an interrupting modal. On a game that cannot check, this is a
 * plain quick-save.
 *
 * **Success is confirmed on the button itself** (owner, 2026-09-25: the save
 * "shouldn't be that special"): it reads "Saved" for a moment through
 * {@link justSaved}, and a screen reader hears the same thing. Only a refused
 * save interrupts.
 *
 * **"Checkpoint" is the history panel's word and only its word**: this is the
 * one-slot quick-save, a different feature from the panel's numbered,
 * rewindable checkpoints (`help/features.md` §Checkpoints).
 *
 * The spoken confirmation reports the *check*, not only the save, where there
 * was one to run: a player who pressed "Check and save" asked whether the board
 * is still sound, and the answer is the part they cannot see for themselves.
 * A save the check could not settle says so in a toast, which is announced in
 * its place (owner, 2026-10-02).
 */
export async function checkAndSave(puzzle: Puzzle): Promise<void> {
  const verdict = puzzle.canCheck ? await puzzle.check() : null;
  if (verdict?.kind === "mistakes") {
    const n = verdict.count;
    await showAlert({
      label: "Not saved",
      message: `${mistakesFound(n)} — the problem ${
        n === 1 ? "cell is" : "cells are"
      } highlighted. Fix ${n === 1 ? "it" : "them"} before quick-saving.`,
      type: "warning",
      lightDismiss: true,
    });
    return;
  }
  if (verdict?.kind === "dead-end") {
    await showAlert({
      label: "Not saved",
      message: verdict.reason,
      type: "warning",
      lightDismiss: true,
    });
    return;
  }
  await savedGames.quickSave(puzzle);
  flashSaved(puzzle.puzzleId);
  if (verdict?.kind === "out-of-reach") {
    showToast({
      label: "Saved",
      message: CHECK_OUT_OF_REACH,
      type: "info",
      duration: 6000,
    });
  } else {
    announce(
      verdict?.kind === "sound" && verdict.mistakesChecked
        ? "No mistakes. Saved."
        : "Saved.",
    );
  }
}

/** Restore the quick-save slot for `puzzle`, confirming success with a
 * toast and reporting an unreadable/absent slot with a modal. */
export async function quickLoadPuzzle(puzzle: Puzzle): Promise<void> {
  if (!savedGames.hasQuickSave(puzzle.puzzleId)) return;
  const { found, error } = await savedGames.quickLoad(puzzle);
  if (error) {
    await showAlert({
      label: "Unable to quick-load",
      message: error,
      type: "error",
    });
  } else if (!found) {
    await showAlert({
      label: "No quick-save",
      message: "There is no quick-save for this puzzle yet.",
      type: "info",
      lightDismiss: true,
    });
  } else {
    showToast({
      label: "Quick-save restored",
      message: "Back to your saved position.",
      type: "success",
    });
  }
}
