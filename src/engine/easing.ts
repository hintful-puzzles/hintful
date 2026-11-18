/**
 * The curve a move's animation takes its time through, so every game that
 * moves a piece in answer to the player moves it the same way.
 *
 * Motion that answers an input starts fast and settles gently into place;
 * a constant speed reads as mechanical, and one that starts slowly reads as
 * lag (Material Design 3, "Easing and duration": emphasized decelerate).
 */

/** Share `t` of an animation's time, as the share of its way covered: cubic
 * ease-out, `t` clamped to [0, 1]. */
export function easeOut(t: number): number {
  const u = 1 - Math.min(1, Math.max(0, t));
  return 1 - u * u * u;
}
