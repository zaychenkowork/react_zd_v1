# SETUP_PLAN — react_zd_v1

> **Status: setup complete (all phases 0–11 executed and committed).** This file is a
> historical record of the plan for future audits, not living documentation. The current
> description of the architecture, conventions, and layers is in `docs/` (see `README.md`);
> current rationale for decisions is spread across the relevant `docs/*.md` files, not only in
> the "Decision rationale" section below.

Setup plan for a React template for a marketplace (similar to fragment.com). Executed by an
agent phase by phase; each phase is followed by a review. All decisions below have already been
made and are **not** open to reconsideration by the executor (rationale and links are at the end
of the file).

## Rules for the executor (critical)

1. **Package versions are pinned** (see table). Install exactly with `pnpm add <pkg>@<version>`.
   Don't "update" anything or swap in versions you happen to know — your knowledge of the
   ecosystem may be stale; versions were checked against npm on 2026-07-13.
2. **Don't invent APIs.** If unsure about a signature — check the types in `node_modules` for the
   installed version. Especially: ESLint 9 flat config, TanStack Query v5 (`MutationCache`
   callbacks), Zod 4 (the `z.string()` API differs from v3), react-router 8, Storybook 10 CSF.
3. **No barrel files** (`index.ts` with re-exports) anywhere in `src/`. All imports are direct,
   via the `~/` alias.
4. **Each phase ends with green checks**: `pnpm build && pnpm lint && pnpm type-check && pnpm test run`
   (whichever of these are already set up by that phase) — and **a single conventional commit**
   for the phase: `feat(setup): phase N — <name>`.
5. Code comments — only where the code can't speak for itself (constraints, links to issues).
   Don't comment on the obvious.
6. UI text — only through i18n keys, no hardcoded strings (starting from phase 5).
7. If something in the plan can't be done exactly as written (version conflict, changed API) —
   do NOT improvise: stop and record the problem in `SETUP_NOTES.md` at the repo root, and
   continue with the next independent item.

## Versions (checked 2026-07-13, npm registry + peer deps)

### dependencies
| package | version |
|---|---|
| react / react-dom | 19.2.7 |
| react-router | 8.2.0 |
| @tanstack/react-query | 5.101.2 |
| zustand | 5.0.14 |
| axios | 1.18.1 |
| react-hook-form | 7.81.0 |
| zod | 4.4.3 |
| i18next | 26.3.6 |
| react-i18next | 17.0.9 |
| i18next-browser-languagedetector | 8.2.1 |
| radix-ui | 1.6.2 |
| react-toastify | 11.1.0 |
| classnames | 2.5.1 |

### devDependencies
| package | version |
|---|---|
| vite | 8.1.4 |
| @vitejs/plugin-react | 6.0.3 |
| vite-plugin-svgr | 5.2.0 |
| vite-tsconfig-paths | 6.1.1 |
| typescript | 5.9.3 (**NOT 6/7** — typescript-eslint supports <6.1) |
| @types/react | 19.2.17 |
| @types/react-dom | 19.2.3 |
| @types/node | 26.1.1 |
| eslint | 9.39.5 (**NOT 10** — eslint-plugin-react doesn't support it) |
| @eslint/js | ^9.39.0 (**NOT 10.x**) |
| typescript-eslint | 8.63.0 |
| eslint-plugin-react | 7.37.5 |
| eslint-plugin-react-hooks | 7.1.1 |
| eslint-plugin-react-refresh | 0.5.3 |
| eslint-plugin-simple-import-sort | 13.0.0 |
| eslint-plugin-sonarjs | 4.1.0 |
| eslint-plugin-import-x | 4.17.1 |
| @tanstack/eslint-plugin-query | 5.101.2 |
| eslint-config-prettier | 10.1.8 |
| globals | 17.7.0 |
| prettier | 3.9.5 |
| husky | 9.1.7 |
| lint-staged | 17.0.8 |
| @commitlint/cli | 21.2.1 |
| @commitlint/config-conventional | 21.2.0 |
| vitest | 4.1.10 |
| @vitest/coverage-v8 | 4.1.10 |
| jsdom | 29.1.1 |
| @testing-library/react | 16.3.2 |
| @testing-library/dom | 10.4.1 |
| @testing-library/jest-dom | 6.9.1 |
| @testing-library/user-event | 14.6.1 |
| @tanstack/react-query-devtools | 5.101.2 |
| storybook / @storybook/react-vite / @storybook/addon-themes | 10.5.0 |

Do NOT install: `@hookform/resolvers` (issue #842, use the custom resolver instead),
`@tanstack/react-virtual` (add once long lists appear), `@t3-oss/env-core` (plain zod is enough
in an SPA).

## Target structure

```
react_zd_v1/
├── __tests__/                  # ALL tests, mirrors src/ (+ setup/, test-utils.tsx)
├── stories/                    # ALL Storybook stories, mirrors src/ (like __tests__)
├── docs/
├── public/
├── src/
│   ├── app/                    # main.tsx, App.tsx, router.tsx, providers/, ModalHost
│   ├── pages/                  # pages + layouts/; local parts — pages/<Page>/components/
│   ├── blocks/                 # reusable blocks WITH business logic (like widgets from FSD)
│   ├── ui/
│   │   ├── components/         # building blocks WITHOUT business logic (Button, Input, ModalCore…)
│   │   ├── icons/              # svg + Icon registry (SVGR)
│   │   ├── fonts/
│   │   └── styles/             # tokens.css, typography.css, base.css
│   ├── api/                    # client.ts, api.ts, fetcher.ts, queryKeys.ts, queries/
│   ├── store/                  # zustand: useThemeStore, useAuthStore
│   ├── hooks/                  # shared hooks without business logic
│   ├── i18n/                   # index.ts, i18n.d.ts, locales/{en,uk,ar}/translation.json
│   ├── schemas/                # zod schemas: env.ts + form schemas
│   ├── config/                 # env.ts, config.ts, routes.ts, query.ts
│   ├── constants/
│   ├── types/
│   └── utils/                  # zod4Resolver.ts etc.
├── .claude/skills/code-review/SKILL.md
├── CLAUDE.md
└── README.md
```

**Import direction (unidirectional, downward):**
`app → pages → blocks → api → store → ui → { i18n, schemas, utils, types, config, constants }`
- `hooks` is an auxiliary layer off to the side of the chain: MAY import store/i18n/utils
  (wrappers useTheme/useLanguage), MAY NOT import api (query hooks live in api/queries), blocks,
  pages, app. A hook that uses the store should not be used inside ui components (enforced by
  review, not the linter).
- `ui` does NOT import: api, store, blocks, pages, app (i18n is fine — Controlled wrappers
  translate error keys).
- `blocks` does NOT import pages/app. `api` does NOT import ui/blocks/pages (store is fine:
  interceptors need the token).
- Statement of the `ui` rule: a component from `ui/` **doesn't know about stores and the API**
  (everything through props). It's not about "business logic" but about coupling: a component
  connected to store/api lives in `pages/<Page|Layout>/components/` (while needed in one place)
  or in `blocks/` (once reused).

---

## Phase 0 — initialization

- pnpm via corepack: `corepack enable && corepack prepare pnpm@11.12.0 --activate` (if corepack
  is unavailable — `npm i -g pnpm@11.12.0`).
- `package.json`: name `react-zd-v1`, private, type module, `"packageManager": "pnpm@11.12.0"`,
  `engines.node: ">=20.19.0"`.
- `.nvmrc` → `20.19.1`. `.gitignore` (node_modules, dist, coverage, *.local, .env*, !.env.example,
  storybook-static).
- Scripts: `dev`, `build` (`tsc -b && vite build`), `preview`, `lint`, `lint:fix`, `format`,
  `format:check`, `type-check` (`tsc -b --noEmit`), `test` (`vitest`), `test:coverage`,
  `storybook`, `build-storybook`, `prepare` (`husky`).

**Acceptance:** `pnpm install` succeeds, git is clean after the commit.

## Phase 1 — Vite + TypeScript

- Install react, react-dom, vite, @vitejs/plugin-react, vite-plugin-svgr, vite-tsconfig-paths,
  typescript, @types/*.
- `vite.config.ts`: plugins `react()`, `tsconfigPaths()`, `svgr({ svgrOptions: { exportType: 'default', ref: true, titleProp: true, replaceAttrValues: { '#0B0B0C': 'currentColor' } }, include: '**/*.svg' })`
  — the currentColor trick from the broker project.
- tsconfig project references as in the broker project: `tsconfig.json` (refs) +
  `tsconfig.app.json` + `tsconfig.node.json`. In app: `strict`, `noUnusedLocals`,
  `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`,
  `moduleResolution: bundler`, `jsx: react-jsx`, paths `"~/*": ["./src/*"]`, include: `src`,
  `__tests__`.
- `src/vite-env.d.ts`: `/// <reference types="vite/client" />` + augment `ImportMetaEnv`
  (VITE_API_URL: string, VITE_ENABLE_DEVTOOLS?: string) + types for `*.svg?react`.
- `index.html`, `src/app/main.tsx`, `src/app/App.tsx` (placeholder for now).

**Acceptance:** `pnpm dev` starts up, `pnpm build` is green.

## Phase 2 — code quality

- ESLint 9 **flat** config `eslint.config.js` via `tseslint.config()`: `@eslint/js` recommended,
  tseslint recommended, react flat recommended, react-hooks recommended, react-refresh, sonarjs
  recommended, config-prettier last.
- `simple-import-sort/imports` with groups by layer: side-effects → react/external →
  `~/app` → `~/pages` → `~/blocks` → `~/ui` → `~/api` → `~/store` → `~/hooks` → `~/i18n` →
  `~/schemas` → `~/utils` → `~/types` → `~/config` → `~/constants` → relative → css.
- **Layer boundaries** — `import-x/no-restricted-paths` zones (a rule from bulletproof-react,
  adapted to the layers in the "Import direction" section).
- `no-restricted-syntax`: ban `import.meta.env` outside `src/config/env.ts` (message:
  "Use env from ~/config/env").
- `no-restricted-imports`: ban importing whole layers (`~/ui`, `~/blocks` etc. without a path to
  a file) — a barrel guard.
- Relaxations, as in the broker project: `@typescript-eslint/no-explicit-any: off`,
  `no-unused-vars` with `args: 'none'`, react `prop-types`/`display-name` off; sonarjs
  cognitive-complexity off.
- `.prettierrc` as in the RN template (singleQuote, trailingComma all, tabWidth 2, semi,
  arrowParens always) + `.editorconfig`.
- husky: `pre-commit` → `pnpm lint-staged`; `commit-msg` → `npx --no -- commitlint --edit "$1"`;
  `pre-push` → `pnpm type-check && pnpm test run`.
- `.lintstagedrc.json`: `*.{ts,tsx}` → eslint --fix + prettier --write; `*.{json,md,css}` →
  prettier --write. A separate full type-check runs on pre-push (not in lint-staged — tsc
  doesn't work on a file list with project refs).
- `commitlint.config.mjs`: config-conventional, header-max-length 120.

**Acceptance:** `pnpm lint` is green; a test commit with a bad message is rejected; the boundary
rule catches a planted import of `~/api` from `src/ui/` (verify and remove the plant).

## Phase 3 — styles and theming

- `src/ui/styles/tokens.css` — palette from the design, scale-based tokens, dark mode by
  inverting values under `[data-theme='dark']`:

| token | light | dark |
|---|---|---|
| --color-primary-0 | #FFFFFF | #0A0A0A |
| --color-primary-950 | #0A0A0A | #FFFFFF |
| --color-grey-100 | #F7F7F7 | #1A1A1A |
| --color-grey-200 | #E6E6E6 | #292929 |
| --color-grey-300 | #D6D6D6 | #434343 |
| --color-grey-400 | #A5A5A5 | #575757 |
| --color-grey-500 | #767676 | #767676 |
| --color-grey-600 | #575757 | #A5A5A5 |
| --color-grey-700 | #434343 | #D6D6D6 |
| --color-grey-800 | #292929 | #E6E6E6 |
| --color-grey-900 | #1A1A1A | #F7F7F7 |
| --color-grey-950 | #0A0A0A | #FFFFFF |
| --color-red-500 | #FF3A3D | #FF6466 |
| --color-red-400 | #FF6466 | #FF3A3D |
| --color-red-50 | #FFF1F1 | #4B0405 |
| --color-red-950 | #4B0405 | #FFF1F1 |
| --color-green-500 | #18B359 | #4ADE87 |
| --color-green-400 | #4ADE87 | #18B359 |
| --color-green-50 | #F0FDF5 | #052E18 |
| --color-green-950 | #052E18 | #F0FDF5 |
| --color-blue-500 | #37A3FA | #5DC1FD |
| --color-blue-400 | #5DC1FD | #37A3FA |
| --color-blue-50 | #EFF9FF | #163055 |
| --color-blue-950 | #163055 | #EFF9FF |
| --color-coral-100 | #D07979 | #866060 |
| --color-coral-50 | #866060 | #D07979 |

  Plus `--gradient-linear` (a placeholder, TODO comment: exact stops from Figma).
  **This phase is deliberately minimal**: palette tokens + reset + theme-switching mechanics.
  Full typography, spacing/radius scales, and font files will be handled after setup via Jira
  tickets — stub out an empty `typography.css` (a couple of base classes) and `ui/fonts/` with a TODO.
- `base.css`: reset, `color-scheme: light dark`, body on tokens.
- `src/store/useThemeStore.ts` (zustand + persist to localStorage, keys in
  `constants/storageKeys.ts`): initial value — localStorage → `prefers-color-scheme`; the setter
  sets `document.documentElement.dataset.theme`. RTL: `document.documentElement.dir` is set from
  i18n (phase 4).

**Acceptance:** toggling `data-theme` in devtools changes the background/text; build is green.

## Phase 4 — infrastructure (config, api, store, i18n, providers)

- `schemas/env.ts` — a zod schema for env variables (schemas live in schemas/, like forms).
- `config/env.ts` — the ONLY file reading `import.meta.env` (the bulletproof-react pattern):
  gathers variables, `safeParse`s against the schema from `~/schemas/env`, throws listing invalid
  ones, exports a typed `env`. `.env.example` + `.env.development` (VITE_API_URL=http://localhost:3000).
- `config/config.ts` — application config: `APP_NAME`, `APP_VERSION` (via
  `define: { __APP_VERSION__: JSON.stringify(pkg.version) }` in vite.config + a declaration in
  vite-env.d.ts), values derived from `env`. Imports `config/env.ts`; app code mostly imports `config.ts`.
- `config/routes.ts` — a `ROUTES` object (home, login, notFound + an example parameterized `username(name)`).
- `config/query.ts` — staleTime 60s, gcTime 5m, retry: queries 2 / mutations 0.
- `api/client.ts` — MINIMAL: an axios instance (baseURL from env), a request interceptor
  (Authorization from useAuthStore.getState()), a response interceptor that normalizes errors
  into `ApiError { code, status, message, details }` (the class lives in `types/api.ts`). We do
  NOT keep refresh single-flight in code (there's no backend yet) — the full ready-made recipe
  with a queue and `_retry` goes into `docs/api-layer.md` (phase 10).
- `api/fetcher.ts` — `fetcher<T>(promise: Promise<AxiosResponse<T>>): Promise<T>`.
- `api/api.ts` — a single object organized by domain (like apiSauce.ts in the broker project):
  `api.auth.*`, `api.user.*` — 2–3 sample endpoints.
- `api/queryKeys.ts` — a key factory (the TkDodo pattern): `export const userKeys = { all: ['user'] as const, profile: () => [...userKeys.all, 'profile'] as const, ... }`.
- `api/queries/<domain>/` — hooks are grouped into domain subfolders:
  `api/queries/profile/useUserProfileQuery.ts`, `api/queries/profile/useUpdateProfileMutation.ts`
  (a mutation example — with `meta.successToast`); future admin ones — `api/queries/admin/...`.
- Request/response DTO types — NOT in `api/api.ts`, but in `types/api.ts` (or
  `types/<domain>.ts` once it grows), declared via `type`.
- `store/useAuthStore.ts` — accessToken/refreshToken in memory + refresh persisted to
  localStorage (TODO comment: switch to an httpOnly cookie if the backend allows it), selector pattern.
- `i18n/index.ts` — i18next + LanguageDetector (localStorage → navigator),
  `supportedLngs: ['en','uk','ar']`, fallback en; `applyTextDirection(lang)` →
  `document.documentElement.dir = i18n.dir(lang)` (RTL for ar) on `languageChanged`.
  `i18n/i18n.d.ts` — key typing via `CustomTypeOptions` (as in the RN template). Locales:
  `locales/{en,uk,ar}/translation.json` — shared keys (common, validation, errors) +
  `uk/ar satisfies` shape check against en.
- `QueryClient` and its caches — in `app/providers/queryClient.ts`;
  `app/providers/QueryProvider.tsx` — just a wrapper component (kept lean). Toasts **strictly
  opt-in**: NO toasts by default; `meta.errorToast: true` → a localized error
  `t('errors.' + error.code, { defaultValue: t('errors.generic') })`, `meta.successToast: '<i18n-key>'` →
  success; `meta.invalidates: QueryKey[]` → invalidateQueries in onSuccess. `meta` typing (the
  `Register` interface) — NOT in the provider, but in `src/types/tanstack-query.d.ts`. Devtools
  gated behind `env.VITE_ENABLE_DEVTOOLS`.
- `app/providers/ToastProvider.tsx` — a ToastContainer using theme tokens.
- `hooks/useLanguage.ts`, `hooks/useTheme.ts` — thin wrappers over stores/i18n.

**Acceptance:** the app starts with a missing VITE_API_URL → fails with a readable error; with
env set — it works; phase 8's unit tests will cover fetcher/env.

## Phase 5 — router and pages

- `app/router.tsx`: `<BrowserRouter>` + `<Routes>` (declarative, as the team is used to), pages
  via `React.lazy` + `<Suspense>` with a PageLoader.
- `pages/layouts/MainLayout/` (header: logo placeholder, ThemeSwitcher, LanguageSwitcher, an auth
  slot; footer; `<Outlet/>`), `pages/layouts/AuthLayout/`.
- `app/ProtectedRoute.tsx` — `isAllowed`/`redirectPath`/`<Outlet/>` as in the broker project, on useAuthStore.
- Example pages: `pages/Home/HomePage.tsx`, `pages/NotFound/NotFoundPage.tsx`.
- One demonstration block, so the blocks/ layer is represented in code:
  `blocks/UserProfileCard/` — uses `useUserProfileQuery` + ui building blocks (Skeleton while
  loading), rendered on Home. Minimal, with a comment linking to docs/architecture.md.
- `pages/layouts/MainLayout/components/ThemeSwitcher/` and `.../LanguageSwitcher/` — connected to
  stores, composed from ui building blocks; live locally in the layout per the promotion rule
  (needed in one place). Note in docs/architecture.md as a live example of the "ui doesn't know
  about stores" rule.

**Acceptance:** navigation works, lazy chunks show up in network, theme/language switching is
live, ar switches dir=rtl.

## Phase 6 — UI kit (ported from zedxbroker, re-themed onto the new tokens)

Port from `/Users/zeddz/Desktop/Projects/FRONT/zedxbroker/src/components/`, adapting to the
phase-3 tokens and the `ui/components/<Name>/{Name.tsx, NameStyles.module.css}` structure (no
index.ts!). Scope (ONLY this list, the rest of the kit will be ported by devs after setup):
Button, Input + ControlledInput, ToastMessage (styling react-toastify with tokens), Skeleton,
Tooltip, Loaders (Spinner, Dots), Icon (SVGR registry with an enum, 2–3 sample svg icons:
chevron/arrow, search).
Each ported component gets a test in `__tests__/` (phase 8) and a story in `stories/` (phase 9);
existing ones from the broker project may be carried over and adapted.
- `utils/zod4Resolver.ts` — copy as-is from the broker project (reference to issue #842 in JSDoc).
- `schemas/loginSchema.ts` — an example schema with i18n error keys.
- Controlled wrappers translate errors: `t('validation.' + fieldState.error.message)`.

**Acceptance:** every component renders in both themes (checked via phase 8/9 stories),
lint/type-check are green.

## Phase 7 — modals (minimal)

- Only `ui/components/ModalCore/` — on radix-ui Dialog: props isOpen/setOpen/title/description/confirmAction/cancelAction/loading/hasCloseButton
  (the same interface as the broker project), parent-owned usage.
- A small parent-owned example on the Home page (button → modal).
- Don't implement the global manager — describe it as a recipe in `docs/modals.md`
  (useModalStore + a typed registry + ModalHost), to be added when needed.

**Acceptance:** the Home example works, focus trap and Escape work (Radix), a story exists for ModalCore.

## Phase 8 — tests

- `vitest.config.ts`: globals, jsdom, `setupFiles: './__tests__/setup/setupTests.ts'`, css: true;
  coverage v8, thresholds: lines/statements 80, branches 75, functions 70, scope: `src/utils`,
  `src/ui/components`, `src/store`.
- `__tests__/setup/setupTests.ts`: jest-dom, initI18n('en'), ResizeObserver/matchMedia stubs, mock SVG.
- `__tests__/test-utils.tsx`: `renderWithProviders` (QueryClientProvider with retry off + i18n).
- Tests (mirrored): `__tests__/utils/zod4Resolver.test.ts`, `__tests__/api/fetcher.test.ts`,
  `__tests__/config/env.test.ts`, `__tests__/store/useThemeStore.test.ts` + a test for each
  phase-6/7 ui component (`__tests__/ui/Button.test.tsx`, `ControlledInput.test.tsx` with RHF+zod
  integration: invalid submit → translated error, `ModalCore.test.tsx`,
  Skeleton/Tooltip/Loaders/Icon — render tests).
- Test naming: "what + when + expected", queries by role/text (not testId) — the rule from the RN template.

**Acceptance:** `pnpm test run` and `pnpm test:coverage` are green, thresholds pass.

## Phase 9 — Storybook 10

- `pnpm dlx storybook@10.5.0 init --builder vite`, then adjust the config:
  `.storybook/preview.ts` imports the global styles, `withThemeByDataAttribute({ themes: { light, dark }, defaultTheme: 'light', attributeName: 'data-theme' })`
  from @storybook/addon-themes.
- Stories — in the root `stories/`, mirroring src (like `__tests__/`): `stories/ui/Button.stories.tsx`
  etc. for all phase 6–7 components. `.storybook/main.ts`: `stories: ['../stories/**/*.stories.@(ts|tsx)']`.
  Add `stories` to the tsconfig.app.json include and make sure lint covers them.

**Acceptance:** `pnpm storybook` starts up, the theme switcher works, `pnpm build-storybook` is green.

## Phase 10 — documentation and agent tooling

- `README.md`: stack with versions, quick start (corepack/pnpm, .env), scripts, a structure
  overview linking to docs/.
- `docs/architecture.md`: layers and import direction, **blocks (= widgets from FSD, link to the
  definition)**, the promotion rule (page-local → blocks → ui), routing/layouts.
- `docs/conventions.md`: naming, **`type` over `interface`** (interface — only for declaration
  merging/augmentations like Register/ImportMetaEnv); types aren't inlined in code files — DTOs
  in `types/`, component props may live next to the component; **the barrel rule**: "a barrel
  makes sense only at a package boundary (its own package.json, imported by package name — an
  npm library or a monorepo package), not at a folder boundary; there are no barrels in the app's
  src/ — import order comes from simple-import-sort, layer encapsulation from
  import-x/no-restricted-paths" + why (links to marvinh/TkDodo/bulletproof-react), import
  sorting, conventional commits.
- `docs/api-layer.md`: client/api/fetcher/queryKeys factory/queries hooks, the toast and error
  scheme (meta, error codes → errors.* keys, **the requirement that the backend return code**),
  the refresh flow blueprint.
- `docs/forms.md`: RHF + Zod 4 + zod4Resolver (why custom: issue #842 + the migration criterion
  for the official one), the Controlled pattern, i18n error keys.
- `docs/theming.md` (scale tokens, inversion, how to add a token), `docs/i18n.md` (languages,
  RTL, key typing, locale satisfies-check), `docs/modals.md` (ModalCore parent-owned + the recipe
  for a future global manager: useModalStore, a typed registry, ModalHost), `docs/testing.md`
  (__tests__ mirror, what must be covered: utils and ui/components; thresholds).
- `CLAUDE.md`: a condensed set of rules for agents (layers, barrels, TS/ESLint version
  constraints, tests, commits) — modeled on the RN template, kept brief.
- `.claude/skills/code-review/SKILL.md`: a project review skill — checklist: layer boundaries,
  no barrels, coupling (store/api) not in ui/, store-using hooks not used inside ui components,
  query patterns (fetcher, key factory, meta toasts), forms via Controlled+schemas, i18n keys
  instead of strings, tests mirrored in __tests__, **+ a freshness check: status of
  react-hook-form/resolvers#842 (migration to the official resolver), ESLint 10 support in
  eslint-plugin-react, TS 6+ support in typescript-eslint**.
- Delete `SETUP_PLAN.md` and `SETUP_NOTES.md` (if empty) in the final commit — their content will
  by then be spread across docs/.

**Acceptance:** all links in docs are valid, README commands are reproducible.

## Phase 11 — final verification

- Clean install: `rm -rf node_modules && pnpm install --frozen-lockfile`.
- Full run: build, lint, format:check, type-check, test:coverage, build-storybook.
- Verify hooks on a live commit (a bad message is rejected, lint-staged fires).

---

## Decision rationale (for docs/, just links for the executor)

- Layers/boundaries: bulletproof-react <https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md>;
  blocks = widgets from FSD <https://feature-sliced.design/docs/reference/layers>.
- Barrels: <https://tkdodo.eu/blog/please-stop-using-barrel-files>,
  <https://marvinh.dev/blog/speeding-up-javascript-ecosystem-part-7/>, the recommendation
  reversal in bulletproof-react (project-structure.md).
- Query keys factory: <https://tkdodo.eu/blog/effective-react-query-keys>.
- Global toasts/errors: <https://tanstack.com/query/latest/docs/reference/MutationCache>,
  <https://tkdodo.eu/blog/react-query-error-handling>.
- env validation: <https://vite.dev/guide/env-and-mode>, example
  <https://github.com/alan2207/bulletproof-react/blob/master/apps/react-vite/src/config/env.ts>.
- Custom zod resolver: <https://github.com/react-hook-form/resolvers/issues/842>.
- TS 5.9 / ESLint 9 pins: peer deps typescript-eslint 8.63 (`typescript <6.1.0`),
  eslint-plugin-react 7.37.5 (`eslint ^9.7`).
