# CLAUDE.md

React SPA template (Vite + TS + React 19). Details — in `docs/`.

## Commands

`pnpm` — with `export PATH="$HOME/.nvm/versions/node/v24.13.1/bin:$PATH"` (see README, the
troubleshooting section) on machines where the active `node` in `PATH` is older than 22.13.

```
pnpm dev              # dev server
pnpm build             # tsc -b && vite build
pnpm lint / lint:fix
pnpm format:check / format
pnpm type-check        # tsc -b --noEmit
pnpm test run          # single vitest run
pnpm test:coverage
pnpm storybook / build-storybook
```

## Layer rules (see docs/architecture.md)

```
app → pages → components → api → store → components/ui → { i18n, schemas, utils, types, config, constants }
```

(`assets/` and `styles/` are static bottom-level folders anyone may import.)

- `components/ui/` is the presentational tier: doesn't know about `store`/`api`/connected
  components — props only.
- `components/` (outside `ui/`) — shared connected components + `layouts/`; doesn't import
  `pages`/`app`.
- `api/` doesn't import `store`/`pages`/`app`; may import `components/ui` (e.g. `showToast`).
- `hooks/` may wrap `store`/`i18n`, may not import `api`/`components`/`pages`/`app`.
- Boundaries are enforced by the linter (`import-x/no-restricted-paths`, `eslint.config.js`), not just by convention.
- **No barrels (`index.ts` with re-exports) anywhere in `src/` or `stories/`.** Imports go
  by direct path to the file via `~/`. Details and rationale — `docs/conventions.md`.
- New connected component: needed in one place → `pages/<Page>/components/`; needed in
  several → `components/`.

## Versions — don't change without a reason

`typescript` is pinned to 5.9.x (`typescript-eslint@8.63` requires `<6.1.0`), `eslint` to
9.x (`eslint-plugin-react@7.37.5` requires `^9.7`). Before proposing a major `tsc`/`eslint`
upgrade — check current peer deps (`npm view <pkg> peerDependencies`), see the checklist in
`.claude/skills/code-review/SKILL.md`.

## Tests and commits

- A test for every file in `src/utils/`, `src/components/ui/`, `src/store/` — mirrored in
  `__tests__/`, see `docs/testing.md`. `pnpm test run`/`pnpm type-check` run on pre-push
  (husky) — don't disable.
- Commits — conventional commits (`commitlint`, husky `commit-msg`), see `docs/conventions.md`.
- UI text — only through i18n keys (`t('namespace.key')`), no hardcoded strings.
- All code, comments, and documentation in the repository are in English — see the
  "Language" section in `docs/conventions.md`.

## Documentation

`docs/architecture.md`, `docs/conventions.md`, `docs/api-layer.md`, `docs/forms.md`,
`docs/theming.md`, `docs/i18n.md`, `docs/modals.md`, `docs/testing.md`.
