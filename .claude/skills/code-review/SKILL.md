---
name: code-review
description: Project-specific review checklist for react_zd_v1 (layers, barrels, query patterns,
  forms, i18n, tests) + a freshness check for version constraints. Use when reviewing a PR/diff
  in this repository — before or instead of the general /code-review.
---

# Code review — react_zd_v1

This checklist is specific to this template; general style/security questions outside of it go
through the regular `/code-review`. The rationale for each item is in `docs/`.

## Layer boundaries (docs/architecture.md)

- [ ] Import direction is not violated: `app → pages → blocks → api → store → ui → {i18n, schemas, utils, types, config, constants}`.
- [ ] `ui/**` does not import `api`, `store`, `blocks`, `pages`, `app` (props only).
- [ ] `hooks/**` does not import `api`, `blocks`, `pages`, `app`.
- [ ] `pnpm lint` is green — `import-x/no-restricted-paths` already checks all of this
      mechanically; a manual check is only needed if the diff touches `eslint.config.js`.

## Barrels (docs/conventions.md)

- [ ] No new `index.ts` with re-exports in `src/`, `__tests__/`, `stories/`.
- [ ] Imports go by direct path to the file via `~/`, not a bare layer import.

## Coupling (docs/architecture.md)

- [ ] A new component reading `store`/`api` lives in `pages/<Page>/components/` (single
      consumer) or `blocks/` (multiple), not in `ui/`.
- [ ] A hook using the store (`useTheme`-like) is not imported inside `ui/components/**`
      (the linter doesn't catch this — review only).

## Query patterns (docs/api-layer.md)

- [ ] A new endpoint is a method in `api/api.ts`, not a direct `axios`/`apiClient` call from a component.
- [ ] Query keys go through the factory in `api/queryKeys.ts`, not a string literal in a component.
- [ ] `queryFn`/`mutationFn` wraps the `api.*` call in `fetcher(...)`.
- [ ] Toasts — only via `meta.errorToast`/`meta.successToast`/`meta.invalidates`, not a
      local `onError`/`onSuccess` with `toast.*` in a component.
- [ ] DTOs — in `types/api.ts` (or `types/<domain>.ts`), not inlined in the hook file.

## Forms (docs/forms.md)

- [ ] A form field is a `ControlledInput` (or a similar Controlled wrapper), not a raw `<input>`
      with manual `useState`.
- [ ] Schema errors are i18n keys (`'required'`, not `'This field is required'`).
- [ ] The resolver is `~/utils/zod4Resolver`, not `@hookform/resolvers` (see the freshness
      check below).

## i18n (docs/i18n.md)

- [ ] No hardcoded user-facing strings — only `t('namespace.key')`.
- [ ] A new key is added to all locales (`en`/`uk`/`ar`) — `satisfies Translation` in
      `i18n/resources.ts` should fail on a mismatch, but verify the diff actually
      touches all three files, not just `en`.
- [ ] The language name in the UI is an endonym (`constants/languages.ts`), not a translation.

## Tests (docs/testing.md)

- [ ] A new file in `src/utils/`, `src/ui/components/`, `src/store/` has a matching test in
      `__tests__/` at the same path.
- [ ] Test name is "what + when + expected"; queries are `getByRole`/`getByText`, not `data-testid`.
- [ ] `pnpm test:coverage` doesn't fail the thresholds (lines/statements 80, branches 75, functions 70).

## Storybook

- [ ] A new component in `ui/components/` has a story in `stories/` at the same path
      (`stories/ui/components/<Name>/<Name>.stories.tsx`).

## Freshness check for version constraints

Versions in `package.json` are pinned to specific peer constraints — they can go stale. Check
whenever a review's diff touches these dependencies, or periodically:

1. **`react-hook-form/resolvers#842`** (reason for the custom `zod4Resolver`, see `docs/forms.md`):
   `curl -s https://api.github.com/repos/react-hook-form/resolvers/issues/842 | grep '"state"'`
   (or `gh api repos/react-hook-form/resolvers/issues/842 --jq .state` if `gh` is installed).
   If `"closed"` — check whether a version of `@hookform/resolvers` with Zod 4 support has
   shipped (`npm view @hookform/resolvers versions peerDependencies --json`), and if so, file a
   migration task (for the migration itself see the criterion in `docs/forms.md`).
2. **ESLint 10 in `eslint-plugin-react`** (currently pinned to `eslint@9.x`, `docs/conventions.md`/
   `CLAUDE.md`): `npm view eslint-plugin-react peerDependencies` — look for the `eslint` range.
   If the upper bound has widened to `^10`, an ESLint upgrade becomes possible.
3. **TS 6+ in `typescript-eslint`** (currently pinned to `typescript@5.9.x`): `npm view typescript-eslint peerDependencies`
   — look for the `typescript` range. If the lower/upper bound includes `6.x`/`7.x`, a
   TypeScript upgrade becomes possible (also check `@vitejs/plugin-react`, `vite-tsconfig-paths`
   for compatibility).

If `gh`/`npm` are unavailable in the review environment — the commands above can be run through
`WebFetch`/a browser (GitHub issue page, npmjs.com/package/<pkg>).
