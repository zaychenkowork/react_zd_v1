# Tests

Stack: `vitest` + `@testing-library/react` + `jsdom`.

## `__tests__/` mirrors `src/`

The test for `src/ui/components/Button/Button.tsx` lives at
`__tests__/ui/components/Button/Button.test.tsx` — the same path as the file in `src/`, only with
`__tests__/` as the root instead of `src/`. Plus two service subdirectories with no counterpart in `src/`:

- `__tests__/setup/setupTests.ts` — `setupFiles` for vitest.
- `__tests__/test-utils.tsx` — `renderWithProviders`.

`stories/` (Storybook, `docs` isn't required — see `.storybook/main.ts`) mirrors `src/` on the
same principle.

## What we must cover

`vitest.config.ts`, `coverage.include`: `src/utils/**`, `src/ui/components/**`, `src/store/**`.
Thresholds (`coverage.thresholds`): lines/statements 80, branches 75, functions 70. This isn't
"cover everything" — it's specifically pure utilities, presentational UI building blocks, and
client-state stores, i.e. code with no network side effects that can be tested quickly and
deterministically. `config/env.ts` is deliberately outside `coverage.include` — its only logic
(`import.meta.env`) can't be isolated from the Vite runtime without breaking module isolation;
instead the pure Zod schema `schemas/env.ts` is tested (`__tests__/schemas/env.test.ts`), which
holds all the testable logic.

The remaining layers (`api/queries/*`, `blocks/*`, `pages/*`) aren't covered by tests in the
template — these are integration/network scenarios, and the testing approach for them is up to
the specific team's future work.

## Test names and queries

- Test name is "what + when + expected": `'shows the translated validation error under each field
  when submitting an empty form'`, not `'test 1'`/`'renders correctly'`.
- Queries — `screen.getByRole`/`getByText`/`getByPlaceholderText` etc., **not** `data-testid`.
  `data-testid="icon-svg"` in `ui/icons/Icon.tsx` is the one exception (SVG icons have no
  suitable role/text to query by).

## `renderWithProviders`

`__tests__/test-utils.tsx` wraps `render` in a `QueryClientProvider` (with `retry: false` for
both queries and mutations — tests shouldn't wait for real retries). i18n needs no provider —
the default `i18next` instance is initialized as a side effect of importing `~/i18n/index` in
`setupTests.ts`, and `useTranslation()` reads from it directly.

## Nuance: `vite-plugin-svgr` and vitest

`vite.config.ts` transforms **any** `**/*.svg` import into a React component via
`vite-plugin-svgr` (`exportType: 'default'`, no `?react` suffix — see `docs/theming.md`/
`src/ui/icons/types.ts`). The suffix-based `?react` import (`import Chevron from './chevron.svg?react'`),
common in `vite-plugin-svgr` examples, **doesn't work under vitest**: an import with that suffix
resolves to a data-URI string (the default `vite/client` behavior for assets), not a component,
even though the same file transforms correctly under `vite build` — the suffix itself doesn't
trigger the plugin's transform under vitest. A workaround via `resolve.alias`/`test.alias`
(a regex on `\.svg\?react$`) didn't work either — the alias didn't match at all.

**Solution used in the template:** icons are imported without a suffix
(`~/ui/icons/svg/chevron.svg`, not `chevron.svg?react`), and `vitest.config.ts` loads the **same**
`vite-plugin-svgr` with an identical config to `vite.config.ts` (`include: '**/*.svg'`). Then
the transform applies the same way in dev/build and in vitest — icons render for real in tests,
with no separate SVG mock. When adding a new Vite-based config (Storybook —
`.storybook/main.ts`, see `docs/architecture.md` about Storybook), the same rule applies: the
Storybook framework (`@storybook/react-vite`) **doesn't read** `vite.config.ts` automatically —
the svgr plugin needs to be explicitly repeated in `viteFinal` (or in any other separate Vite pipeline).

## Nuance: fully-covered files aren't shown in the `pnpm test:coverage` table

`@vitest/coverage-v8` enables `skipFull: true` in the default text reporter when it detects a
CI/agent environment — files with 100% statements/branches/functions coverage drop out of the
printed table (this doesn't mean they aren't instrumented: the full list is in
`coverage/coverage-final.json`). Final percentages and thresholds are computed against the full
set of files regardless of what shows up in the table — if a file "disappears" from
`pnpm test:coverage` output after some change, that's not a coverage regression, just this case.

## Commands

- `pnpm test` — watch mode.
- `pnpm test run` — a single run, use in CI/pre-push.
- `pnpm test:coverage` — a run with a coverage report and thresholds.
