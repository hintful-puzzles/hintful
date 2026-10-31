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

## What Changes

Make the test leave nothing behind (remove what it rendered in an
`afterAll`, or await the elements' `updateComplete` before it ends), and see
it hold: run the main pass several times under load, and plant the leak back
to see the error return. Whether any other test renders Web Awesome elements
the same way is checked by the shape (a `render(` into `document.body` with
no removal), not by name.
