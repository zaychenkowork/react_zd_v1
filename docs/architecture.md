# Architecture

## Layers

```
src/
├── app/          main.tsx, App.tsx, router.tsx, providers/, ProtectedRoute
├── pages/        pages + layouts/; local parts — pages/<Page>/components/
├── blocks/       reusable blocks WITH business logic (= widgets from FSD)
├── ui/
│   ├── components/  building blocks WITHOUT business logic (Button, Input, ModalCore…)
│   ├── icons/       svg + Icon registry (SVGR)
│   ├── fonts/
│   └── styles/      tokens.css, typography.css, base.css
├── api/          client.ts, api.ts, fetcher.ts, queryKeys.ts, queries/<domain>/
├── store/        zustand: useThemeStore, useAuthStore
├── hooks/        shared hooks without business logic (wrappers over store/i18n)
├── i18n/         index.ts, i18n.d.ts, resources.ts, locales/{en,uk,ar}
├── schemas/      zod schemas: env.ts + form schemas
├── config/       env.ts, config.ts, routes.ts, query.ts
├── constants/
├── types/
└── utils/        zod4Resolver.ts etc.
```

`__tests__/` (repo root) and `stories/` (repo root) mirror the `src/` structure 1:1 —
the test/story for `src/ui/components/Button/Button.tsx` lives at
`__tests__/ui/components/Button/Button.test.tsx` and `stories/ui/components/Button/Button.stories.tsx`.

## Import direction

Unidirectional, downward:

```
app → pages → blocks → api → store → ui → { i18n, schemas, utils, types, config, constants }
```

The rules are enforced by the linter (`eslint.config.js`, `import-x/no-restricted-paths` +
`no-restricted-imports`), not just described:

- **`ui`** does not import `api`, `store`, `blocks`, `pages`, `app` — a component from `ui/`
  doesn't know about stores and the API, everything comes through props. `i18n` may be imported:
  Controlled wrappers translate error keys (see `docs/forms.md`).
- **`blocks`** does not import `pages`/`app`.
- **`api`** does not import `ui`/`blocks`/`pages`/`app` (`store` is allowed: interceptors in
  `api/client.ts` need the token from `useAuthStore`).
- **`store`** — client state only, does not import `api`/`ui`/`blocks`/`pages`/`app`.
- **`hooks`** — an auxiliary layer off to the side of the chain: may import `store`/`i18n`/`utils`
  (wrappers like `useTheme`/`useLanguage`), may not import `api` (query hooks live in `api/queries`),
  `blocks`, `pages`, `app`. A hook that uses the store should not be used inside `ui` components
  — that's a coupling question rather than an import one, so it's caught by review, not the linter.
- There are no barrels (`index.ts` with re-exports) anywhere in `src/` — for why, and how the
  import order and layer encapsulation survive without them, see `docs/conventions.md`.

## `blocks/` = widgets from FSD

`blocks/` are reusable blocks **with** business logic (unlike `ui/`, which has no business
logic at all). This is the same layer as `widgets` in
[Feature-Sliced Design](https://feature-sliced.design/docs/reference/layers) — "large
self-sufficient UI blocks that represent a complete interface fragment and
use other layers (primarily `api`) to fetch data."

Example in this repo — `src/blocks/UserProfileCard/UserProfileCard.tsx`: calls
`useUserProfileQuery` (the `api` layer) and is composed from `ui/components/Skeleton`. Rendered on
`pages/Home/HomePage.tsx`.

## Promotion rule

Where to put a new connected component (i.e. a component that knows about store/api) is decided
not by "does it have business logic" but by **where it's used**:

1. Needed in one place → `pages/<Page|Layout>/components/` (page-local).
2. Needed in two or more places → promote to `blocks/`.

A component with zero third-party dependencies (store/api/i18n doesn't count as a dependency) is
a candidate for `ui/components/`, regardless of how many places use it.

### Live example: ThemeSwitcher and LanguageSwitcher

`src/pages/layouts/MainLayout/components/ThemeSwitcher/` and `.../LanguageSwitcher/` are not in
`ui/`, but live locally in the layout. Both read the store (`useThemeStore` via `useTheme`) or
i18n (`useLanguage`) and call their setters directly — meaning they **know about stores**, and
therefore by definition can't be in `ui/` (per the rule "`ui` doesn't know about stores and the
API"). They're used only inside `MainLayout`, so they aren't promoted to `blocks/` — as soon as a
second layout/page needs them, that's the signal to promote them to `blocks/`.

## Routing and layouts

`app/router.tsx` — `<BrowserRouter>` + declarative `<Routes>`, pages via `React.lazy` +
a shared `<Suspense fallback={<PageLoader />}>`. Layouts — `pages/layouts/MainLayout/` (header with
a logo, `ThemeSwitcher`, `LanguageSwitcher`, an auth slot; footer; `<Outlet/>`) and
`pages/layouts/AuthLayout/` (a centered card for login/registration forms — not yet wired into
the router, there are no auth pages yet). `app/ProtectedRoute.tsx` — `isAllowed` +
`redirectPath` + `<Outlet/>` on `useAuthStore`, also not yet wired in (will arrive together with
the protected pages).

## Where to put new code

| What you're writing | Where | Example in the repo |
|---|---|---|
| Page | `pages/<Page>/` | `pages/Home/HomePage.tsx` |
| Part of a page, needed only there | `pages/<Page>/components/` | — |
| Layout | `pages/layouts/<Layout>/` | `pages/layouts/MainLayout/` |
| Connected layout component (knows store/i18n) | `pages/layouts/<Layout>/components/` | `ThemeSwitcher/` |
| Reusable block with business logic (data from api) | `blocks/<Block>/` | `blocks/UserProfileCard/` |
| UI building block without store/api | `ui/components/<Name>/` | `ui/components/Button/` |
| Icon | `ui/icons/svg/*.svg` + entry in `ui/icons/types.ts` | `ui/icons/svg/chevron.svg` |
| HTTP endpoint | `api/api.ts` (method in the right domain) | `api.user.profile` |
| Query/mutation hook | `api/queries/<domain>/use<Name>{Query,Mutation}.ts` | `api/queries/profile/useUserProfileQuery.ts` |
| Request/response DTO | `types/api.ts` (or `types/<domain>.ts`) | `UserProfile` |
| Client state | `store/use<Name>Store.ts` | `store/useThemeStore.ts` |
| Wrapper over store/i18n without business logic | `hooks/use<Name>.ts` | `hooks/useTheme.ts` |
| Zod schema (env or forms) | `schemas/<name>.ts` | `schemas/loginSchema.ts` |
| Constant | `constants/<name>.ts` | `constants/languages.ts` |
| Test | `__tests__/<path mirroring src>` | `__tests__/ui/components/Button/Button.test.tsx` |
| Storybook story | `stories/<path mirroring src>` | `stories/ui/components/Button/Button.stories.tsx` |

## Rationale

- Layers/boundaries: [bulletproof-react](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md).
- `blocks` = `widgets`: [feature-sliced.design/docs/reference/layers](https://feature-sliced.design/docs/reference/layers).
