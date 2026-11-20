import { easeOut } from "./easing.ts";
import { type Flash, NO_FLASH, ownFlash, WinWave } from "./win-wave.ts";

/** Wall-clock duration (seconds) of a hint-executed move's slow-motion
 * animation, whatever the game's own move-animation time. Keep it equal to
 * `puzzle.ts`'s `AUTO_HINT_STEP_MS`, the auto-hint loop's per-step dwell, so
 * auto-hint flows as continuous motion with no frozen gap between steps. A game
 * with no move animation (`animLength` 0) stays instant; the dwell paces it. */
const HINT_ANIM_S = 1.0;

/** What a frame of a transition draws beside the state it lands on. */
export interface AnimationFrame<State> {
  /** The state animated from, while a move is animating. */
  prev: State | null;
  dir: number;
  /** The animation's time at the game's own scale, eased. */
  time: number;
  flash: Flash;
  /** The win's highlight, drawn this frame; told when the frame ends. */
  wave: WinWave | null;
}

/**
 * The animation and flash of the last transition, mirroring midend.c. While a
 * move is animating, `prev` is the state being animated *from*; the game is
 * drawn with (prev, state, time, the flash). Outside animation all are
 * zero/null and the game draws its final state.
 */
export class MoveAnimation<State> {
  private prev: State | null = null;
  private time = 0;
  private length = 0;
  // Hint-executed moves play the game's own move animation in slow
  // motion so the user can follow what the hint did: the duration is
  // stretched to `HINT_ANIM_S` and the game is shown proportionally
  // scaled time (`scale`), so it needs no awareness of the stretch.
  private scale = 1;
  private hintPending = false;
  // A flash of the game's own (`flashLength`): a death, a loss, a reveal.
  private flashTime = 0;
  private flashLength = 0;
  // The win's highlight, while it travels. Never alongside a flash of the
  // game's own.
  private wave: WinWave | null = null;
  public reducedMotion = false;
  private dir = 1;

  /** The next transition is a hint's move, played in slow motion. */
  public armHint(): void {
    this.hintPending = true;
  }

  /** Arm animation/flash for a transition from `prev`: a move of the game's
   * `move` seconds and a flash of its own of `flash`, absent ⇒ 0 ⇒ none. A
   * win's flash is the engine's, the same in every game, and is asked of
   * `won` only where the game flashes nothing of its own. */
  public begin(
    prev: State,
    dir: number,
    move: number,
    flash: number,
    won: () => boolean,
  ): void {
    this.dir = dir;
    this.wave = flash === 0 && won() ? new WinWave(this.reducedMotion) : null;
    // A hint move stretches the game's base animation to the uniform
    // `HINT_ANIM_S`; `scale` (= stretched / base) is what a frame
    // divides `time` by so the game, which only knows its own base
    // anim length, still spans the full stretched duration. A
    // non-animated game (move = 0) can't be stretched — leave it instant.
    if (this.hintPending && move > 0) {
      this.length = HINT_ANIM_S;
      this.scale = HINT_ANIM_S / move;
    } else {
      this.length = move;
      this.scale = 1;
    }
    this.hintPending = false;
    this.time = 0;
    this.flashLength = flash;
    this.flashTime = 0;
    // Keep the from-state only while a move is actually animating; a
    // flash-only transition draws the final state with a flash overlay.
    this.prev = move > 0 ? prev : null;
  }

  public clear(): void {
    this.prev = null;
    this.time = 0;
    this.length = 0;
    this.scale = 1;
    this.flashTime = 0;
    this.flashLength = 0;
    this.wave = null;
    this.dir = 1;
  }

  /** Whether the last move's own animation is over (or it had none), which a
   * flash after it does not change. */
  public get atRest(): boolean {
    return this.time >= this.length;
  }

  public get running(): boolean {
    return (
      this.time < this.length || this.flashTime < this.flashLength || this.wave !== null
    );
  }

  /** The move's animation, in milliseconds: the auto-hint loop's unit. */
  public get ms(): number {
    // `length` is already the scaled duration (base × scale), in seconds.
    return this.length * 1000;
  }

  /** Run the animation on by `tplus` seconds. */
  public advance(tplus: number): void {
    this.time += tplus;
    this.flashTime += tplus;
    // As midend.c does, end the flash once it has caught up with
    // `flashLength`, or at once when none was armed: otherwise `flashTime`
    // grows on every animated move, and a game's redraw (`flashTime ? … :
    // -1`) flashes during ordinary animations.
    if (this.flashTime >= this.flashLength || this.flashLength === 0) {
      this.flashTime = 0;
      this.flashLength = 0;
    }
    if (this.wave !== null) {
      this.wave.seek(Math.max(0, this.time - this.length));
      if (this.wave.done) this.wave = null;
    }
    if (this.length > 0 && this.time >= this.length) {
      // Move animation finished; flash (if any) continues without
      // the from-state, exactly as midend.c drops oldstate.
      this.prev = null;
    }
  }

  /** `time` through the shared curve: the same span, with its progress
   * front-loaded. Outside a move's animation it is `time` itself. */
  private easedTime(): number {
    if (this.length <= 0 || this.time >= this.length) return this.time;
    return easeOut(this.time / this.length) * this.length;
  }

  public frame(): AnimationFrame<State> {
    // The win's highlight is not shown its board until the move that won has
    // come to rest: it would cross a tile that is still sliding.
    const wave = this.atRest ? this.wave : null;
    return {
      prev: this.prev,
      dir: this.dir,
      // Report time at the game's own scale: a slow-motion (hint) move
      // has a stretched `length`, and dividing by the same factor
      // keeps the game's `time / its-anim-length` progress correct.
      // The time is eased, so every game's move starts fast and settles
      // while the game interpolates linearly (`easing.ts`).
      time: this.easedTime() / this.scale,
      flash: wave ?? (this.flashTime > 0 ? ownFlash(this.flashTime) : NO_FLASH),
      wave,
    };
  }
}
