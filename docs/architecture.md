# Architecture

## Layers

```
src/
├── main.tsx      entry point (Vite scaffold / bulletproof-react convention)
├── app/          App.tsx, router.tsx, providers/
├── pages/        pages; local parts — pages/<Page>/components/
├── components/
│   ├── ui/          building blocks WITHOUT business logic (Button, Input, ModalCore, Icon…)
│   ├── layouts/     MainLayout, AuthLayout (+ their local components/)
│   └── <Name>/      shared CONNECTED components (know store/api), e.g. ProtectedRoute/
├── api/          client.ts, api.ts, fetcher.ts, queryClient.ts, queries/<domain>/
├── store/        zustand: useThemeStore, useAuthStore
├── hooks/        shared hooks without business logic (wrappers over store/i18n)
├── i18n/         index.ts, i18n.d.ts, resources.ts, locales/{en,uk,ar}
├── schemas/      zod schemas: env.ts + form schemas
├── config/       env.ts, config.ts, routes.ts, query.ts
├── constants/
├── types/        api.ts (DTOs), types.ts, enums.ts, tanstack-query.d.ts
├── utils/        zod4Resolver.ts etc.
├── assets/       icons/ (svg), fonts/
└── styles/       tokens.css, base.css, typography.css, toast.css
```

`__tests__/` (repo root) and `stories/` (repo root) mirror the `src/` structure 1:1 —
the test/story for `src/components/ui/Button/Button.tsx` lives at
`__tests__/components/ui/Button/Button.test.tsx` and `stories/components/ui/Button/Button.stories.tsx`.

## Import direction

Unidirectional, downward:

```
app → pages → components → api → store → components/ui → { i18n, schemas, utils, types, config, constants }
```

`components/ui/` appears below `api` on purpose: it's the presentational tier of
`components/` and sits near the bottom of the chain, while connected components (the rest
of `components/`) sit above `api`. `assets/` and `styles/` are static bottom-level folders
anyone may import.

The rules are enforced by the linter (`eslint.config.js`, `import-x/no-restricted-paths` +
`no-restricted-imports`), not just described:

- **`components/ui`** does not import `api`, `store`, `pages`, `app`, or connected
  components — a component from `components/ui/` doesn't know about stores and the API,
  everything comes through props. `i18n` may be imported: Controlled wrappers translate
  error keys (see `docs/forms.md`).
- **`components`** (outside `ui/`) does not import `pages`/`app`.
- **`api`** does not import `store`, connected `components`, `pages` or `app`.
  `components/ui` is allowed — the global query/mutation caches in `api/queryClient.ts`
  call `showToast` from `components/ui/ToastMessage/`. (The old `api → store` exception
  for the auth token is gone: `api/client.ts` is auth-agnostic, see `docs/api-layer.md`.)
- **`store`** — client state only, does not import `api`/`components`/`pages`/`app`.
- **`hooks`** — an auxiliary layer off to the side of the chain: may import `store`/`i18n`/`utils`
  (wrappers like `useTheme`/`useLanguage`), may not import `api` (query hooks live in `api/queries`),
  `components`, `pages`, `app`. A hook that uses the store should not be used inside
  `components/ui` — that's a coupling question rather than an import one, so it's caught
  by review, not the linter.
- There are no barrels (`index.ts` with re-exports) anywhere in `src/` — for why, and how the
  import order and layer encapsulation survive without them, see `docs/conventions.md`.

## One `components/` home instead of `blocks` + `ui`

Earlier revisions of the template had a separate `blocks/` layer (= `widgets` from
[Feature-Sliced Design](https://feature-sliced.design/docs/reference/layers)) next to a
top-level `ui/` folder. Two homes for components proved confusing, so the template now
follows [bulletproof-react](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)
instead: a single `src/components/` with `ui/` (presentational) and `layouts/` subfolders,
plus shared connected components at the top level (bulletproof-react's `components/`
contains `ui`, `layouts`, `errors` the same way). The pure/connected distinction didn't
disappear — it moved inside `components/` and is still enforced by the linter
(`components/ui` must not import store/api).

## Promotion rule

Where to put a new connected component (i.e. a component that knows about store/api) is decided
not by "does it have business logic" but by **where it's used**:

1. Needed in one place → `pages/<Page>/components/` (page-local) or
   `components/layouts/<Layout>/components/` (layout-local).
2. Needed in two or more places → promote to `components/`.

A component with zero third-party dependencies (store/api/i18n doesn't count as a dependency) is
a candidate for `components/ui/`, regardless of how many places use it.

### Live example: ThemeSwitcher and LanguageSwitcher

`src/components/ThemeSwitcher/` and `src/components/LanguageSwitcher/` are shared connected
components. Both read the store (`useThemeStore` via `useTheme`) or i18n (`useLanguage`) and
call their setters directly — meaning they **know about stores**, and therefore by definition
can't be in `components/ui/` (per the rule "`components/ui` doesn't know about stores and
the API"). Today only `MainLayout` renders them, but the template ships them as shared on
purpose: any future layout or settings page will want the same switchers, so they're the
canonical `components/<Name>/` example rather than a layout-local one.

## Routing and layouts

`app/router.tsx` — `<BrowserRouter>` + declarative `<Routes>`, pages via `React.lazy` +
a shared `<Suspense fallback={<PageLoader />}>`. Layouts — `components/layouts/MainLayout/`
(header with a logo, `ThemeSwitcher`, `LanguageSwitcher`, an auth slot; footer; `<Outlet/>`) and
`components/layouts/AuthLayout/` (a centered card for login/registration forms — not yet wired
into the router, there are no auth pages yet). `components/ProtectedRoute/ProtectedRoute.tsx` —
`isAllowed` + `redirectPath` + `<Outlet/>` on `useAuthStore`, also not yet wired in (will
arrive together with the protected pages).

## Where to put new code

| What you're writing | Where | Example in the repo |
|---|---|---|
| Page | `pages/<Page>/` | `pages/Home/HomePage.tsx` |
| Part of a page, needed only there | `pages/<Page>/components/` | — |
| Layout | `components/layouts/<Layout>/` | `components/layouts/MainLayout/` |
| Connected layout component (knows store/i18n), single layout | `components/layouts/<Layout>/components/` | — |
| Shared connected component (store/api/i18n, reused) | `components/<Name>/` | `components/ThemeSwitcher/`, `components/ProtectedRoute/` |
| UI building block without store/api | `components/ui/<Name>/` | `components/ui/Button/` |
| Icon | `assets/icons/*.svg` + entry in `components/ui/Icon/types.ts` | `assets/icons/chevron.svg` |
| HTTP endpoint | `api/api.ts` (flat `<subject><HttpVerb>` method) | `api.profileGet` |
| Query factory (keys + queryFn) | `api/queries/<domain>/<domain>Queries.ts` | `api/queries/profile/profileQueries.ts` |
| Query/mutation hook | `api/queries/<domain>/use<Name>{Query,Mutation}.ts` | `api/queries/profile/useUserProfileQuery.ts` |
| Request/response DTO | `types/api.ts` (or `types/<domain>.ts`) | `UserProfile` |
| Shared helper type / enum | `types/types.ts` / `types/enums.ts` | `WithBaseEntityFields` |
| Client state | `store/use<Name>Store.ts` | `store/useThemeStore.ts` |
| Wrapper over store/i18n without business logic | `hooks/use<Name>.ts` | `hooks/useTheme.ts` |
| Zod schema (env or forms) | `schemas/<name>.ts` | `schemas/loginSchema.ts` |
| Constant | `constants/<name>.ts` | `constants/languages.ts` |
| Test | `__tests__/<path mirroring src>` | `__tests__/components/ui/Button/Button.test.tsx` |
| Storybook story | `stories/<path mirroring src>` | `stories/components/ui/Button/Button.stories.tsx` |

## Rationale

- Layers/boundaries and the single `components/` home:
  [bulletproof-react](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)
  (its reference app keeps `main.tsx` at `src/` root and `components/{ui,layouts,errors}`).
- Entry point at `src/main.tsx`: matches the official Vite scaffold
  ([create-vite react-ts template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts))
  and bulletproof-react. (FSD would put it inside `app/` — the template follows the
  Vite/bulletproof convention instead.)
- Why not FSD `widgets`: see "One `components/` home" above —
  [feature-sliced.design/docs/reference/layers](https://feature-sliced.design/docs/reference/layers).
