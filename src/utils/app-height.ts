/**
 * `--app-height`: the window's height as measured, for the puzzle page to fill.
 *
 * Neither viewport unit fits every mode. In an Android Chrome tab, `100vh` is
 * the height with the toolbars hidden, so the page overflows while the URL bar
 * shows; `100dvh` fixes that. In the same phone's installed app, `100dvh`
 * came out about 64px taller than the window, and the bottom command bar sat
 * below the screen with only its top edge showing (test-touch-on-a-real-device,
 * 2026-09-24). `innerHeight` is the height of the window the page actually
 * has. CSS keeps `100dvh` as the fallback until this runs.
 */
export function trackAppHeight(
  root: HTMLElement = document.documentElement,
): () => void {
  const update = () => {
    root.style.setProperty("--app-height", `${window.innerHeight}px`);
  };
  update();
  window.addEventListener("resize", update);
  window.visualViewport?.addEventListener("resize", update);
  return () => {
    window.removeEventListener("resize", update);
    window.visualViewport?.removeEventListener("resize", update);
  };
}
