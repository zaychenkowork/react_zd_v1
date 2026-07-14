# react-zd-v1

React SPA template (username marketplace, similar to fragment.com). Ready-made scaffold: theming,
i18n (en/uk/ar + RTL), routing, UI kit, modals, API layer on TanStack Query, tests, Storybook.
No backend yet — `api/`/`schemas/` are built against the contract that will follow.

## Stack

| Category | Package | Version |
|---|---|---|
| Runtime | React / React DOM | 19.2.7 |
| Build | Vite | 8.1.4 |
| Language | TypeScript | 5.9.3 |
| Routing | react-router | 8.2.0 |
| Server state | @tanstack/react-query | 5.101.2 |
| Client state | zustand | 5.0.14 |
| HTTP | axios | 1.18.1 |
| Forms | react-hook-form | 7.81.0 |
| Validation | zod | 4.4.3 |
| i18n | i18next / react-i18next | 26.3.6 / 17.0.9 |
| UI primitives | radix-ui | 1.6.2 |
| Toasts | react-toastify | 11.1.0 |
| Tests | vitest / @testing-library/react | 4.1.10 / 16.3.2 |
| Component docs | storybook / @storybook/react-vite | 10.5.0 |
| Lint/format | eslint / prettier | 9.39.5 / 3.9.5 |
| Git hooks | husky / lint-staged / commitlint | 9.1.7 / 17.0.8 / 21.2.1 |

Full version list — `package.json`. Versions in this template are pinned to specific
peer constraints (`typescript <6.1.0` from `typescript-eslint`, `eslint ^9.7` from
`eslint-plugin-react`) — before a major upgrade see `.claude/skills/code-review/SKILL.md`.

## Quick start

```bash
corepack enable
corepack prepare pnpm@11.12.0 --activate

pnpm install
cp .env.example .env.development   # fill in VITE_API_URL etc.
pnpm dev
```

Node — `.nvmrc` (24.13.1), `engines.node: ">=22.13.0"`. See "Troubleshooting" below if
the system's `pnpm`/`node` versions diverge.

## Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | dev server (Vite) |
| `pnpm build` | `tsc -b && vite build` — type-check + production build |
| `pnpm preview` | preview the production build locally |
| `pnpm lint` / `pnpm lint:fix` | ESLint (flat config, `eslint.config.js`) |
| `pnpm format` / `pnpm format:check` | Prettier |
| `pnpm type-check` | `tsc -b --noEmit` |
| `pnpm test` | vitest in watch mode |
| `pnpm test:coverage` | vitest + coverage report (thresholds — `vitest.config.ts`) |
| `pnpm storybook` | Storybook dev server, port 6006 |
| `pnpm build-storybook` | static Storybook build (`storybook-static/`) |

## Structure

```
src/
├── main.tsx    entry point
├── app/        App.tsx, router.tsx, providers/
├── pages/      pages (+ page-local components/)
├── components/ shared connected components, layouts/, ui/ (no business logic)
├── api/        client.ts, api.ts, fetcher.ts, queryClient.ts, queries/<domain>/
├── store/      zustand
├── hooks/      wrappers over store/i18n
├── i18n/       en/uk/ar + RTL
├── schemas/    zod (env + forms)
├── config/     env.ts, config.ts, routes.ts, query.ts
├── constants/
├── types/
├── utils/
├── assets/     icons/ (SVG), fonts/
└── styles/     tokens.css, base.css, typography.css, toast.css
__tests__/      mirrors src/
stories/        mirrors src/ (Storybook)
docs/           architecture, conventions, API layer, forms, theming, i18n, modals, tests
```

Details — `docs/architecture.md` (layers, import direction, "where to put new code"),
`docs/conventions.md` (naming, barrels, commits), `docs/api-layer.md`, `docs/forms.md`,
`docs/theming.md`, `docs/i18n.md`, `docs/modals.md`, `docs/testing.md`.

## Git hooks (husky)

- `pre-commit` → `lint-staged` (ESLint --fix + Prettier on staged files).
- `commit-msg` → `commitlint` (conventional commits, `commitlint.config.mjs`).
- `pre-push` → `pnpm type-check && pnpm test run`.

## Tests and Storybook

`pnpm test run` — 46+ tests in `__tests__/` (mirrors `src/`), coverage is required for
`src/utils/**`, `src/components/ui/**`, `src/store/**` (thresholds — `docs/testing.md`).
`pnpm storybook` — a story for every component in `components/ui/**` (including `Icon`), with
a theme switcher (`data-theme`) in the toolbar.

## Troubleshooting

**`pnpm` fails with `Error [ERR_UNKNOWN_BUILTIN_MODULE]: No such built-in module: node:sqlite`.**
pnpm 11.x uses `node:sqlite`, available only in Node ≥ 22.13 — regardless of which
Node the app itself targets (`.nvmrc`/`engines.node`). If the system has multiple Node
versions via `nvm` and the active one is older than 22.13, run pnpm with an explicit `PATH`
prefix pointing at the binaries of the required version, without switching `nvm use` globally:

```bash
export PATH="$HOME/.nvm/versions/node/v24.13.1/bin:$PATH"
pnpm install
```

(Substitute your own installed version ≥ 22.13 — it doesn't have to be 24.13.1.) This only changes
which Node the `pnpm` process itself runs on; the project's `.nvmrc`/`engines.node` remain
targeted at the minimum supported version from `package.json`.

**`pnpm install`/`pnpm <script>` fails with `[ERR_PNPM_IGNORED_BUILDS]`.** Postinstall scripts
of transitive dependencies (e.g. `esbuild`) are blocked by pnpm by default. To allow them
for this project: `pnpm approve-builds --all` (writes `allowBuilds` to `pnpm-workspace.yaml`,
committed to the repository — a subsequent `pnpm install` on a clean machine won't ask again).
