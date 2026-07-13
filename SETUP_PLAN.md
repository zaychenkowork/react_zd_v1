# SETUP_PLAN — react_zd_v1

План сетапа React-тимплейта для маркетплейса (аналог fragment.com). Исполняется агентом фаза за фазой; после каждой фазы — ревью. Все решения ниже уже приняты и обсуждению исполнителем **не подлежат** (обоснования и ссылки — в конце файла).

## Правила для исполнителя (критично)

1. **Версии пакетов прибиты** (см. таблицу). Устанавливать строго `pnpm add <pkg>@<version>`. Ничего не «обновлять» и не заменять на знакомые тебе версии — твои знания об экосистеме могут быть устаревшими, версии сверены с npm 13.07.2026.
2. **Не выдумывать API.** Если не уверен в сигнатуре — смотри types в `node_modules` установленной версии. Особенно: ESLint 9 flat config, TanStack Query v5 (`MutationCache` колбэки), Zod 4 (`z.string()` API отличается от v3), react-router 8, Storybook 10 CSF.
3. **Никаких barrel-файлов** (`index.ts` с реэкспортами) нигде в `src/`. Все импорты прямые, через алиас `~/`.
4. **Каждая фаза заканчивается зелёными проверками**: `pnpm build && pnpm lint && pnpm type-check && pnpm test run` (те, что уже настроены к этой фазе) — и **одним conventional-коммитом** фазы: `feat(setup): phase N — <название>`.
5. Комментарии в коде — только там, где код не может сказать сам (ограничения, ссылки на issue). Не комментировать очевидное.
6. Тексты UI — только через i18n-ключи, никаких хардкод-строк (с фазы 5).
7. Если что-то из плана невозможно выполнить точно как написано (конфликт версий, изменившийся API) — НЕ импровизировать: остановиться и записать проблему в `SETUP_NOTES.md` в корне, продолжить со следующего независимого пункта.

## Версии (сверены 13.07.2026, npm registry + peer deps)

### dependencies
| пакет | версия |
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
| пакет | версия |
|---|---|
| vite | 8.1.4 |
| @vitejs/plugin-react | 6.0.3 |
| vite-plugin-svgr | 5.2.0 |
| vite-tsconfig-paths | 6.1.1 |
| typescript | 5.9.3 (**НЕ 6/7** — typescript-eslint поддерживает <6.1) |
| @types/react | 19.2.17 |
| @types/react-dom | 19.2.3 |
| @types/node | 26.1.1 |
| eslint | 9.39.5 (**НЕ 10** — eslint-plugin-react не поддерживает) |
| @eslint/js | ^9.39.0 (**НЕ 10.x**) |
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

НЕ ставить: `@hookform/resolvers` (issue #842, используем кастомный резолвер), `@tanstack/react-virtual` (добавим при появлении длинных списков), `@t3-oss/env-core` (plain zod достаточно в SPA).

## Целевая структура

```
react_zd_v1/
├── __tests__/                  # ВСЕ тесты, зеркалит src/ (+ setup/, test-utils.tsx)
├── stories/                    # ВСЕ Storybook-стори, зеркалит src/ (как __tests__)
├── docs/
├── public/
├── src/
│   ├── app/                    # main.tsx, App.tsx, router.tsx, providers/, ModalHost
│   ├── pages/                  # страницы + layouts/; локальные части — pages/<Page>/components/
│   ├── blocks/                 # переиспользуемые блоки С бизнес-логикой (аналог widgets из FSD)
│   ├── ui/
│   │   ├── components/         # кирпичики БЕЗ бизнес-логики (Button, Input, ModalCore…)
│   │   ├── icons/              # svg + Icon-реестр (SVGR)
│   │   ├── fonts/
│   │   └── styles/             # tokens.css, typography.css, base.css
│   ├── api/                    # client.ts, api.ts, fetcher.ts, queryKeys.ts, queries/
│   ├── store/                  # zustand: useThemeStore, useAuthStore
│   ├── hooks/                  # общие хуки без бизнес-логики
│   ├── i18n/                   # index.ts, i18n.d.ts, locales/{en,uk,ar}/translation.json
│   ├── schemas/                # zod-схемы: env.ts + схемы форм
│   ├── config/                 # env.ts, config.ts, routes.ts, query.ts
│   ├── constants/
│   ├── types/
│   └── utils/                  # zod4Resolver.ts и пр.
├── .claude/skills/code-review/SKILL.md
├── CLAUDE.md
└── README.md
```

**Направление импортов (однонаправленно, вниз):**
`app → pages → blocks → api → store → ui → { i18n, schemas, utils, types, config, constants }`
- `hooks` — вспомогательный слой сбоку от цепочки: МОЖНО импортировать store/i18n/utils (обёртки useTheme/useLanguage), НЕЛЬЗЯ — api (query-хуки живут в api/queries), blocks, pages, app. Хук, использующий store, не должен применяться внутри ui-компонентов (контролируется ревью, не линтером).
- `ui` НЕ импортирует: api, store, blocks, pages, app (i18n можно — Controlled-обёртки переводят ключи ошибок).
- `blocks` НЕ импортирует pages/app. `api` НЕ импортирует ui/blocks/pages (store — можно: интерсепторам нужен токен).
- Формулировка правила ui: компонент из `ui/` **не знает о сторах и API** (всё через пропсы). Дело не в «бизнес-логике», а в связанности: подключённый к store/api компонент живёт в `pages/<Page|Layout>/components/` (пока нужен в одном месте) или в `blocks/` (когда переиспользуется).

---

## Фаза 0 — инициализация

- pnpm через corepack: `corepack enable && corepack prepare pnpm@11.12.0 --activate` (если corepack недоступен — `npm i -g pnpm@11.12.0`).
- `package.json`: name `react-zd-v1`, private, type module, `"packageManager": "pnpm@11.12.0"`, `engines.node: ">=20.19.0"`.
- `.nvmrc` → `20.19.1`. `.gitignore` (node_modules, dist, coverage, *.local, .env*, !.env.example, storybook-static).
- Скрипты: `dev`, `build` (`tsc -b && vite build`), `preview`, `lint`, `lint:fix`, `format`, `format:check`, `type-check` (`tsc -b --noEmit`), `test` (`vitest`), `test:coverage`, `storybook`, `build-storybook`, `prepare` (`husky`).

**Приёмка:** `pnpm install` отрабатывает, git чистый после коммита.

## Фаза 1 — Vite + TypeScript

- Установить react, react-dom, vite, @vitejs/plugin-react, vite-plugin-svgr, vite-tsconfig-paths, typescript, @types/*.
- `vite.config.ts`: plugins `react()`, `tsconfigPaths()`, `svgr({ svgrOptions: { exportType: 'default', ref: true, titleProp: true, replaceAttrValues: { '#0B0B0C': 'currentColor' } }, include: '**/*.svg' })` — трюк с currentColor из брокера.
- tsconfig project references как в брокере: `tsconfig.json` (refs) + `tsconfig.app.json` + `tsconfig.node.json`. В app: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`, `moduleResolution: bundler`, `jsx: react-jsx`, paths `"~/*": ["./src/*"]`, include: `src`, `__tests__`.
- `src/vite-env.d.ts`: `/// <reference types="vite/client" />` + аугментация `ImportMetaEnv` (VITE_API_URL: string, VITE_ENABLE_DEVTOOLS?: string) + типы `*.svg?react`.
- `index.html`, `src/app/main.tsx`, `src/app/App.tsx` (пока заглушка).

**Приёмка:** `pnpm dev` поднимается, `pnpm build` зелёный.

## Фаза 2 — качество кода

- ESLint 9 **flat** config `eslint.config.js` через `tseslint.config()`: `@eslint/js` recommended, tseslint recommended, react flat recommended, react-hooks recommended, react-refresh, sonarjs recommended, config-prettier последним.
- `simple-import-sort/imports` с группами по слоям: side-effects → react/external → `~/app` → `~/pages` → `~/blocks` → `~/ui` → `~/api` → `~/store` → `~/hooks` → `~/i18n` → `~/schemas` → `~/utils` → `~/types` → `~/config` → `~/constants` → relative → css.
- **Границы слоёв** — `import-x/no-restricted-paths` zones (правило из bulletproof-react, адаптировать под слои из раздела «Направление импортов»).
- `no-restricted-syntax`: запрет `import.meta.env` вне `src/config/env.ts` (сообщение: «Use env from ~/config/env»).
- `no-restricted-imports`: запрет импорта слоёв целиком (`~/ui`, `~/blocks` и т.п. без пути до файла) — защита от барелей.
- Смягчения как в брокере: `@typescript-eslint/no-explicit-any: off`, `no-unused-vars` c `args: 'none'`, react `prop-types`/`display-name` off; sonarjs cognitive-complexity off.
- `.prettierrc` как в RN-тимплейте (singleQuote, trailingComma all, tabWidth 2, semi, arrowParens always) + `.editorconfig`.
- husky: `pre-commit` → `pnpm lint-staged`; `commit-msg` → `npx --no -- commitlint --edit "$1"`; `pre-push` → `pnpm type-check && pnpm test run`.
- `.lintstagedrc.json`: `*.{ts,tsx}` → eslint --fix + prettier --write; `*.{json,md,css}` → prettier --write. Отдельный полный type-check в pre-push (не в lint-staged — tsc не работает по списку файлов с project refs).
- `commitlint.config.mjs`: config-conventional, header-max-length 120.

**Приёмка:** `pnpm lint` зелёный; тестовый коммит с плохим сообщением отклоняется; правило границ ловит подставной импорт `~/api` из `src/ui/` (проверить и удалить подставку).

## Фаза 3 — стили и темизация

- `src/ui/styles/tokens.css` — палитра из дизайна, шкальные токены, дарк-мод инверсией под `[data-theme='dark']`:

| токен | light | dark |
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

  Плюс `--gradient-linear` (заглушка, TODO-коммент: точные стопы из Figma).
  **Фаза сознательно минимальная**: токены-палитра + reset + механика переключения темы. Полноценную типографику, spacing/radius-шкалы и шрифт девы сделают после сетапа по задачам из джиры — заготовить пустые `typography.css` (пара базовых классов) и `ui/fonts/` с TODO.
- `base.css`: reset, `color-scheme: light dark`, body на токенах.
- `src/store/useThemeStore.ts` (zustand + persist в localStorage, ключи в `constants/storageKeys.ts`): начальное значение — localStorage → `prefers-color-scheme`; сеттер ставит `document.documentElement.dataset.theme`. RTL: `document.documentElement.dir` выставляется из i18n (фаза 4).

**Приёмка:** переключение `data-theme` в devtools меняет фон/текст; build зелёный.

## Фаза 4 — инфраструктура (config, api, store, i18n, providers)

- `schemas/env.ts` — zod-схема env-переменных (схемы живут в schemas/, как формы).
- `config/env.ts` — ЕДИНСТВЕННЫЙ файл, читающий `import.meta.env` (паттерн bulletproof-react): сбор переменных, `safeParse` по схеме из `~/schemas/env`, throw с перечислением невалидных, экспорт типизированного `env`. `.env.example` + `.env.development` (VITE_API_URL=http://localhost:3000).
- `config/config.ts` — прикладной конфиг: `APP_NAME`, `APP_VERSION` (через `define: { __APP_VERSION__: JSON.stringify(pkg.version) }` в vite.config + декларация в vite-env.d.ts), производные от `env` значения. Импортирует `config/env.ts`; код приложения импортирует преимущественно `config.ts`.
- `config/routes.ts` — `ROUTES` объект (home, login, notFound + пример параметризованного `username(name)`).
- `config/query.ts` — staleTime 60s, gcTime 5m, retry: queries 2 / mutations 0.
- `api/client.ts` — МИНИМАЛЬНЫЙ: axios instance (baseURL из env), request-интерсептор (Authorization из useAuthStore.getState()), response-интерсептор с нормализацией ошибки в `ApiError { code, status, message, details }` (класс в `types/api.ts`). Refresh-single-flight в коде НЕ держим (бэка нет) — полный готовый рецепт с очередью и `_retry` кладётся в `docs/api-layer.md` (фаза 10).
- `api/fetcher.ts` — `fetcher<T>(promise: Promise<AxiosResponse<T>>): Promise<T>`.
- `api/api.ts` — единый объект по доменам (как apiSauce.ts в брокере): `api.auth.*`, `api.user.*` — 2–3 примерных эндпоинта.
- `api/queryKeys.ts` — фабрика ключей (паттерн TkDodo): `export const userKeys = { all: ['user'] as const, profile: () => [...userKeys.all, 'profile'] as const, ... }`.
- `api/queries/<domain>/` — хуки группируются по доменным подпапкам: `api/queries/profile/useUserProfileQuery.ts`, `api/queries/profile/useUpdateProfileMutation.ts` (пример мутации — с `meta.successToast`); будущие админские — `api/queries/admin/...`.
- DTO-типы запросов/ответов — НЕ в `api/api.ts`, а в `types/api.ts` (или `types/<domain>.ts` при разрастании), объявленные через `type`.
- `store/useAuthStore.ts` — accessToken/refreshToken в памяти + persist refresh в localStorage (TODO-коммент: заменить на httpOnly-cookie если бэк позволит), selectors-паттерн.
- `i18n/index.ts` — i18next + LanguageDetector (localStorage → navigator), `supportedLngs: ['en','uk','ar']`, fallback en; `applyTextDirection(lang)` → `document.documentElement.dir = i18n.dir(lang)` (RTL для ar) на `languageChanged`. `i18n/i18n.d.ts` — типизация ключей через `CustomTypeOptions` (как в RN-тимплейте). Локали: `locales/{en,uk,ar}/translation.json` — общие ключи (common, validation, errors) + `uk/ar satisfies` проверка формы по en.
- QueryClient и его кеши — в `app/providers/queryClient.ts`; `app/providers/QueryProvider.tsx` — только компонент-обёртка (лаконичный). Тосты **строго opt-in**: НИКАКИХ тостов по умолчанию; `meta.errorToast: true` → локализованная ошибка `t('errors.' + error.code, { defaultValue: t('errors.generic') })`, `meta.successToast: '<i18n-ключ>'` → успех; `meta.invalidates: QueryKey[]` → invalidateQueries в onSuccess. Типизация meta (`Register` interface) — НЕ в провайдере, а в `src/types/tanstack-query.d.ts`. Devtools за `env.VITE_ENABLE_DEVTOOLS`.
- `app/providers/ToastProvider.tsx` — ToastContainer на токенах темы.
- `hooks/useLanguage.ts`, `hooks/useTheme.ts` — тонкие обёртки над сторами/i18n.

**Приёмка:** приложение стартует с отсутствующей VITE_API_URL → падает с читаемой ошибкой; со env — работает; unit-тесты фазы 8 покроют fetcher/env.

## Фаза 5 — роутер и страницы

- `app/router.tsx`: `<BrowserRouter>` + `<Routes>` (декларативно, как привычно команде), страницы через `React.lazy` + `<Suspense>` c PageLoader.
- `pages/layouts/MainLayout/` (хедер: лого-заглушка, ThemeSwitcher, LanguageSwitcher, слот под auth; футер; `<Outlet/>`), `pages/layouts/AuthLayout/`.
- `app/ProtectedRoute.tsx` — `isAllowed`/`redirectPath`/`<Outlet/>` как в брокере, на useAuthStore.
- Страницы-примеры: `pages/Home/HomePage.tsx`, `pages/NotFound/NotFoundPage.tsx`.
- Один демонстрационный блок, чтобы слой blocks/ был показан кодом: `blocks/UserProfileCard/` — использует `useUserProfileQuery` + ui-кирпичики (Skeleton при загрузке), рендерится на Home. Минимальный, с комментом-ссылкой на docs/architecture.md.
- `pages/layouts/MainLayout/components/ThemeSwitcher/` и `.../LanguageSwitcher/` — подключённые к сторам, собраны из ui-кирпичиков; лежат локально в лейауте по правилу повышения (нужны в одном месте). В docs/architecture.md отметить их как живой пример правила «ui не знает о сторах».

**Приёмка:** навигация работает, lazy-чанки видны в network, переключение темы/языка живое, ar переключает dir=rtl.

## Фаза 6 — UI-кит (порт из zedxbroker, ретема на новые токены)

Портировать из `/Users/zeddz/Desktop/Projects/FRONT/zedxbroker/src/components/` с адаптацией под токены фазы 3 и структуру `ui/components/<Name>/{Name.tsx, NameStyles.module.css}` (без index.ts!). Состав (ТОЛЬКО этот список, остальной кит девы портируют после сетапа):
Button, Input + ControlledInput, ToastMessage (стилизация react-toastify под токены), Skeleton, Tooltip, Loaders (Spinner, Dots), Icon (SVGR-реестр с enum, 2–3 примерные svg-иконки: chevron/arrow, search).
На каждый портированный компонент — тест в `__tests__/` (фаза 8) и стори в `stories/` (фаза 9); можно переносить и адаптировать существующие из брокера.
- `utils/zod4Resolver.ts` — скопировать из брокера как есть (ссылка на issue #842 в JSDoc).
- `schemas/loginSchema.ts` — пример схемы с i18n-ключами ошибок.
- Controlled-обёртки переводят ошибки: `t('validation.' + fieldState.error.message)`.

**Приёмка:** каждый компонент рендерится в обеих темах (проверяется сторями фазы 8/9), lint/type-check зелёные.

## Фаза 7 — модалки (минимум)

- Только `ui/components/ModalCore/` — на `radix-ui` Dialog: пропсы isOpen/setOpen/title/description/confirmAction/cancelAction/loading/hasCloseButton (интерфейс как в брокере), parent-owned использование.
- Маленький parent-owned пример на странице Home (кнопка → модалка).
- Глобальный менеджер НЕ реализовывать — описать как рецепт в `docs/modals.md` (useModalStore + типизированный реестр + ModalHost), добавят при необходимости.

**Приёмка:** пример на Home работает, фокус-трап и Escape работают (Radix), стори для ModalCore есть.

## Фаза 8 — тесты

- `vitest.config.ts`: globals, jsdom, `setupFiles: './__tests__/setup/setupTests.ts'`, css: true; coverage v8, thresholds: lines/statements 80, branches 75, functions 70, scope: `src/utils`, `src/ui/components`, `src/store`.
- `__tests__/setup/setupTests.ts`: jest-dom, initI18n('en'), стабы ResizeObserver/matchMedia, mock SVG.
- `__tests__/test-utils.tsx`: `renderWithProviders` (QueryClientProvider с retry off + i18n).
- Тесты (зеркально): `__tests__/utils/zod4Resolver.test.ts`, `__tests__/api/fetcher.test.ts`, `__tests__/config/env.test.ts`, `__tests__/store/useThemeStore.test.ts` + по тесту на каждый ui-компонент фазы 6/7 (`__tests__/ui/Button.test.tsx`, `ControlledInput.test.tsx` с RHF+zod интеграцией: невалидный сабмит → переведённая ошибка, `ModalCore.test.tsx`, Skeleton/Tooltip/Loaders/Icon — рендер-тесты).
- Имена тестов: «what + when + expected», запросы by role/text (не testId) — правило из RN-тимплейта.

**Приёмка:** `pnpm test run` и `pnpm test:coverage` зелёные, пороги проходят.

## Фаза 9 — Storybook 10

- `pnpm dlx storybook@10.5.0 init --builder vite` затем привести конфиг: `.storybook/preview.ts` импортирует глобальные стили, `withThemeByDataAttribute({ themes: { light, dark }, defaultTheme: 'light', attributeName: 'data-theme' })` из @storybook/addon-themes.
- Стори — в рутовой `stories/`, зеркалящей src (как `__tests__/`): `stories/ui/Button.stories.tsx` и т.д. для всех компонентов фаз 6–7. `.storybook/main.ts`: `stories: ['../stories/**/*.stories.@(ts|tsx)']`. Добавить `stories` в include tsconfig.app.json и убедиться, что lint их покрывает.

**Приёмка:** `pnpm storybook` поднимается, переключатель тем работает, `pnpm build-storybook` зелёный.

## Фаза 10 — документация и агентские инструменты

- `README.md`: стек с версиями, быстрый старт (corepack/pnpm, .env), скрипты, обзор структуры со ссылками на docs/.
- `docs/architecture.md`: слои и направление импортов, **blocks (= widgets из FSD, ссылка на определение)**, правило повышения (page-local → blocks → ui), роутинг/лейауты.
- `docs/conventions.md`: нейминг, **`type` предпочтительнее `interface`** (interface — только для declaration merging/аугментаций вроде Register/ImportMetaEnv); типы не инлайнятся в код-файлы — DTO в `types/`, пропсы компонентов допустимы рядом с компонентом; **правило барелей**: «барел уместен только на границе пакета (свой package.json, импорт по имени пакета — npm-библиотека или пакет монорепы), не на границе папки; в src/ приложения барелей нет — порядок импортов даёт simple-import-sort, инкапсуляцию слоёв даёт import-x/no-restricted-paths» + почему (ссылки marvinh/TkDodo/bulletproof-react), сортировка импортов, conventional commits.
- `docs/api-layer.md`: client/api/fetcher/queryKeys-фабрика/queries-хуки, схема тостов и ошибок (meta, коды ошибок → errors.* ключи, **требование к бэку отдавать code**), заготовка refresh-флоу.
- `docs/forms.md`: RHF + Zod 4 + zod4Resolver (почему кастомный: issue #842 + критерий миграции на официальный), Controlled-паттерн, i18n-ключи ошибок.
- `docs/theming.md` (токены-шкалы, инверсия, как добавить токен), `docs/i18n.md` (языки, RTL, типизация ключей, satisfies-проверка локалей), `docs/modals.md` (ModalCore parent-owned + рецепт глобального менеджера на будущее: useModalStore, типизированный реестр, ModalHost), `docs/testing.md` (__tests__ зеркало, что покрываем обязательно: utils и ui/components; пороги).
- `CLAUDE.md`: выжимка правил для агентов (слои, барели, версии-ограничения TS/ESLint, тесты, коммиты) — по образцу RN-тимплейта, кратко.
- `.claude/skills/code-review/SKILL.md`: проектный ревью-скилл — чеклист: границы слоёв, отсутствие барелей, связанность (store/api) не в ui/, хуки со store не используются в ui-компонентах, query-паттерны (fetcher, фабрика ключей, meta-тосты), формы через Controlled+схемы, i18n-ключи вместо строк, тесты в __tests__ зеркально, **+ проверка актуальности: статус react-hook-form/resolvers#842 (миграция на официальный резолвер), поддержка ESLint 10 в eslint-plugin-react, поддержка TS 6+ в typescript-eslint**.
- Удалить `SETUP_PLAN.md` и `SETUP_NOTES.md` (если пуст) в финальном коммите — их содержимое к этому моменту размазано по docs/.

**Приёмка:** все ссылки в docs валидны, README-команды воспроизводимы.

## Фаза 11 — финальная верификация

- Чистая установка: `rm -rf node_modules && pnpm install --frozen-lockfile`.
- Полный прогон: build, lint, format:check, type-check, test:coverage, build-storybook.
- Проверить хуки на живом коммите (плохое сообщение отклоняется, lint-staged срабатывает).

---

## Обоснования решений (для docs/, исполнителю — просто ссылки)

- Слои/границы: bulletproof-react <https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md>; blocks = widgets из FSD <https://feature-sliced.design/docs/reference/layers>.
- Барели: <https://tkdodo.eu/blog/please-stop-using-barrel-files>, <https://marvinh.dev/blog/speeding-up-javascript-ecosystem-part-7/>, разворот рекомендации в bulletproof-react (project-structure.md).
- Query keys фабрика: <https://tkdodo.eu/blog/effective-react-query-keys>.
- Глобальные тосты/ошибки: <https://tanstack.com/query/latest/docs/reference/MutationCache>, <https://tkdodo.eu/blog/react-query-error-handling>.
- env-валидация: <https://vite.dev/guide/env-and-mode>, пример <https://github.com/alan2207/bulletproof-react/blob/master/apps/react-vite/src/config/env.ts>.
- Кастомный zod-резолвер: <https://github.com/react-hook-form/resolvers/issues/842>.
- Пины TS 5.9 / ESLint 9: peer deps typescript-eslint 8.63 (`typescript <6.1.0`), eslint-plugin-react 7.37.5 (`eslint ^9.7`).
