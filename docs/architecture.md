# Архитектура

## Слои

```
src/
├── app/          main.tsx, App.tsx, router.tsx, providers/, ProtectedRoute
├── pages/        страницы + layouts/; локальные части — pages/<Page>/components/
├── blocks/       переиспользуемые блоки С бизнес-логикой (= widgets из FSD)
├── ui/
│   ├── components/  кирпичики БЕЗ бизнес-логики (Button, Input, ModalCore…)
│   ├── icons/       svg + Icon-реестр (SVGR)
│   ├── fonts/
│   └── styles/      tokens.css, typography.css, base.css
├── api/          client.ts, api.ts, fetcher.ts, queryKeys.ts, queries/<domain>/
├── store/        zustand: useThemeStore, useAuthStore
├── hooks/        общие хуки без бизнес-логики (обёртки над store/i18n)
├── i18n/         index.ts, i18n.d.ts, resources.ts, locales/{en,uk,ar}
├── schemas/      zod-схемы: env.ts + схемы форм
├── config/       env.ts, config.ts, routes.ts, query.ts
├── constants/
├── types/
└── utils/        zod4Resolver.ts и пр.
```

`__tests__/` (корень репо) и `stories/` (корень репо) зеркалят структуру `src/` 1:1 —
тест/стори для `src/ui/components/Button/Button.tsx` лежит в
`__tests__/ui/components/Button/Button.test.tsx` и `stories/ui/components/Button/Button.stories.tsx`.

## Направление импортов

Однонаправленно, вниз:

```
app → pages → blocks → api → store → ui → { i18n, schemas, utils, types, config, constants }
```

Правила зафиксированы линтером (`eslint.config.js`, `import-x/no-restricted-paths` +
`no-restricted-imports`), не только описанием:

- **`ui`** не импортирует `api`, `store`, `blocks`, `pages`, `app` — компонент из `ui/` не
  знает о сторах и API, всё приходит через пропсы. `i18n` импортировать можно: Controlled-обёртки
  переводят ключи ошибок (см. `docs/forms.md`).
- **`blocks`** не импортирует `pages`/`app`.
- **`api`** не импортирует `ui`/`blocks`/`pages`/`app` (`store` — можно: интерсепторам в
  `api/client.ts` нужен токен из `useAuthStore`).
- **`store`** — client state только, не импортирует `api`/`ui`/`blocks`/`pages`/`app`.
- **`hooks`** — вспомогательный слой сбоку от цепочки: можно импортировать `store`/`i18n`/`utils`
  (обёртки вроде `useTheme`/`useLanguage`), нельзя — `api` (query-хуки живут в `api/queries`),
  `blocks`, `pages`, `app`. Хук, использующий store, не должен применяться внутри `ui`-компонентов
  — это уже вопрос связанности, а не импортов, поэтому его контролирует ревью, а не линтер.
- Барелей (`index.ts` с реэкспортами) нигде в `src/` нет — почему, и как без них живёт порядок
  импортов и инкапсуляция слоёв, см. `docs/conventions.md`.

## `blocks/` = widgets из FSD

`blocks/` — переиспользуемые блоки **с** бизнес-логикой (в отличие от `ui/`, где бизнес-логики
нет вообще). Это тот же слой, что `widgets` в
[Feature-Sliced Design](https://feature-sliced.design/docs/reference/layers) — «крупные
самодостаточные блоки UI, которые представляют собой законченный фрагмент интерфейса и
используют другие слои (в первую очередь `api`) для получения данных».

Пример в этом репо — `src/blocks/UserProfileCard/UserProfileCard.tsx`: вызывает
`useUserProfileQuery` (слой `api`) и собирается из `ui/components/Skeleton`. Рендерится на
`pages/Home/HomePage.tsx`.

## Правило повышения

Куда класть новый connected-компонент (т.е. компонент, знающий про store/api), решает не
«есть ли бизнес-логика», а **где он используется**:

1. Нужен в одном месте → `pages/<Page|Layout>/components/` (page-local).
2. Понадобился в двух и более местах → поднять в `blocks/`.

Компонент без единой сторонней зависимости (store/api/i18n не считается зависимостью) —
кандидат в `ui/components/`, независимо от того, сколько мест его используют.

### Живой пример: ThemeSwitcher и LanguageSwitcher

`src/pages/layouts/MainLayout/components/ThemeSwitcher/` и `.../LanguageSwitcher/` — не в `ui/`,
а лежат локально в лейауте. Оба читают store (`useThemeStore` через `useTheme`) или i18n
(`useLanguage`) и вызывают их сеттеры напрямую — то есть **знают о сторах**, а значит по
определению не могут быть в `ui/` (правило «`ui` не знает о сторах и API»). Они используются
только внутри `MainLayout`, поэтому не поднимаются в `blocks/` — как только появится второй
лейаут/страница, которым они нужны, это сигнал поднять их в `blocks/`.

## Роутинг и лейауты

`app/router.tsx` — `<BrowserRouter>` + декларативные `<Routes>`, страницы через `React.lazy` +
общий `<Suspense fallback={<PageLoader />}>`. Лейауты — `pages/layouts/MainLayout/` (хедер с
лого, `ThemeSwitcher`, `LanguageSwitcher`, слот под auth; футер; `<Outlet/>`) и
`pages/layouts/AuthLayout/` (центрированная карточка для форм логина/регистрации — пока не
подключён к роутеру, страниц авторизации ещё нет). `app/ProtectedRoute.tsx` — `isAllowed` +
`redirectPath` + `<Outlet/>` на `useAuthStore`, тоже пока не подключён (появится вместе с
защищёнными страницами).

## Куда класть новый код

| Что пишешь | Куда | Пример в репо |
|---|---|---|
| Страница | `pages/<Page>/` | `pages/Home/HomePage.tsx` |
| Часть страницы, нужна только на ней | `pages/<Page>/components/` | — |
| Лейаут | `pages/layouts/<Layout>/` | `pages/layouts/MainLayout/` |
| Connected-компонент лейаута (знает store/i18n) | `pages/layouts/<Layout>/components/` | `ThemeSwitcher/` |
| Переиспользуемый блок с бизнес-логикой (данные из api) | `blocks/<Block>/` | `blocks/UserProfileCard/` |
| UI-кирпичик без стора/api | `ui/components/<Name>/` | `ui/components/Button/` |
| Иконка | `ui/icons/svg/*.svg` + запись в `ui/icons/types.ts` | `ui/icons/svg/chevron.svg` |
| HTTP-эндпоинт | `api/api.ts` (метод в нужном домене) | `api.user.profile` |
| Query/mutation-хук | `api/queries/<domain>/use<Name>{Query,Mutation}.ts` | `api/queries/profile/useUserProfileQuery.ts` |
| DTO запроса/ответа | `types/api.ts` (или `types/<domain>.ts`) | `UserProfile` |
| Client state | `store/use<Name>Store.ts` | `store/useThemeStore.ts` |
| Обёртка над store/i18n без бизнес-логики | `hooks/use<Name>.ts` | `hooks/useTheme.ts` |
| Zod-схема (env или формы) | `schemas/<name>.ts` | `schemas/loginSchema.ts` |
| Константа | `constants/<name>.ts` | `constants/languages.ts` |
| Тест | `__tests__/<путь, зеркалящий src>` | `__tests__/ui/components/Button/Button.test.tsx` |
| Storybook-стори | `stories/<путь, зеркалящий src>` | `stories/ui/components/Button/Button.stories.tsx` |

## Обоснования

- Слои/границы: [bulletproof-react](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md).
- `blocks` = `widgets`: [feature-sliced.design/docs/reference/layers](https://feature-sliced.design/docs/reference/layers).
