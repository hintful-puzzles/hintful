# steady-project-identity-test

**Status: filed 2026-10-31**, from a commit the gate refused in
`add-patches` with every test passing.

## Why

The gate's main vitest pass failed with 8 unhandled rejections and no failed
test: 197 files and 3,983 tests passed, then "Errors 8 errors" failed the
run. Each was

> TypeError: Cannot read properties of undefined (reading 'validity')
> at WaButton.get validity (webawesome chunk.KBXNFZQL.js)
> at WaButton.performUpdate (reactive-element)

which vitest attributed to `src/project-identity.test.ts`. Run alone it
passed three times out of three with no error. The machine's load was about 7
on 8 cores. Nothing in the commit touched that test, Web Awesome or the About
dialog. So it fails at random: any commit whose plan includes the file can be
refused, and only under load.

## What is known

`project-identity.test.ts` renders the About dialog's blurb and credits, Web
Awesome buttons among them, into `document.body` in a `beforeAll`, and never
removes them. A `wa-button` schedules a Lit update; when that update runs
after the environment no longer gives the element what `validity` reads (its
form internals), the getter throws, and nothing awaits the promise. Under
`isolate: false` the worker goes on to other files with the elements still
attached. That it depends on timing fits the load.

## What was found (2026-10-31)

The suspect was a bystander: its templates hold no `wa-button`, and vitest
names whichever file is running when a rejection lands. All 18 `happy-dom`
files in one worker (`VITEST_MAX_WORKERS=1`, `--sequence.shuffle.files
--sequence.seed=5`) reproduce the 8 errors every time, named against
`back-closes.test.ts`.

A `happy-dom` worker keeps one window and one module graph for all its files.
`errors.test.ts` imports the crash dialog, which defines `wa-dialog` and
`wa-button`, and does not import `element-internals.ts`, the stub for
`attachInternals`. `back-closes.test.ts` then creates a bare `<wa-dialog>` as
a stand-in, which is upgraded to the real dialog, and the `wa-button` in its
shadow root updates with no internals. The stub, and `resize-and-animations.ts`,
were imported per file, so whether they were installed depended on which files
a worker had already run.

## What Changes

`src/test-setup/dom.ts`, a setup file, installs both stubs for every
`happy-dom` file and empties `document.body` after each, and the eight per-file
imports are gone. Seen to hold: 16 shuffle seeds clean, seed 5 among them. With
the stub planted out, 257 errors under seeds 5 and 1. With the emptying planted
out, `back-closes.test.ts` started with 11 leftover elements in 2 of 4 seeds,
and 0 in all 4 with it.

The plan as filed:

Make the test leave nothing behind (remove what it rendered in an
`afterAll`, or await the elements' `updateComplete` before it ends), and see
it hold: run the main pass several times under load, and plant the leak back
to see the error return. Whether any other test renders Web Awesome elements
the same way is checked by the shape (a `render(` into `document.body` with
no removal), not by name.
