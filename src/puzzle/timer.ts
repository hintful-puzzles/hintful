import type { TimerReadout } from "../engine/types.ts";

/** `M:SS`, or `H:MM:SS` from an hour — the one spelling of a solve time, so
 * the chrome and the completion message cannot disagree. */
export function formatElapsed(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const ss = String(s % 60).padStart(2, "0");
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}:${ss}`;
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}:${ss}`;
}

export function sameTimer(a: TimerReadout | null, b: TimerReadout | null): boolean {
  if (a === null || b === null) return a === b;
  return a.seconds === b.seconds && a.assisted === b.assisted;
}
