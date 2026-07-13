# react-zd-v1

React SPA-тимплейт (маркетплейс юзернеймов, аналог fragment.com). Готов каркас: темизация,
i18n (en/uk/ar + RTL), роутинг, UI-кит, модалки, api-слой на TanStack Query, тесты, Storybook.
Бэкенда пока нет — `api/`/`schemas/` собраны под контракт, который появится.

## Стек

| Категория | Пакет | Версия |
|---|---|---|
| Runtime | React / React DOM | 19.2.7 |
| Сборка | Vite | 8.1.4 |
| Язык | TypeScript | 5.9.3 |
| Роутинг | react-router | 8.2.0 |
| Server state | @tanstack/react-query | 5.101.2 |
| Client state | zustand | 5.0.14 |
| HTTP | axios | 1.18.1 |
| Формы | react-hook-form | 7.81.0 |
| Валидация | zod | 4.4.3 |
| i18n | i18next / react-i18next | 26.3.6 / 17.0.9 |
| UI-примитивы | radix-ui | 1.6.2 |
| Тосты | react-toastify | 11.1.0 |
| Тесты | vitest / @testing-library/react | 4.1.10 / 16.3.2 |
| Документация компонентов | storybook / @storybook/react-vite | 10.5.0 |
| Линт/формат | eslint / prettier | 9.39.5 / 3.9.5 |
| Git hooks | husky / lint-staged / commitlint | 9.1.7 / 17.0.8 / 21.2.1 |

Полный список версий — `package.json`. Версии в этом шаблоне зафиксированы под конкретные
peer-ограничения (`typescript <6.1.0` у `typescript-eslint`, `eslint ^9.7` у `eslint-plugin-react`)
— перед мажорным апгрейдом см. `.claude/skills/code-review/SKILL.md`.

## Быстрый старт

```bash
corepack enable
corepack prepare pnpm@11.12.0 --activate

pnpm install
cp .env.example .env.development   # заполнить VITE_API_URL и т.п.
pnpm dev
```

Node — `.nvmrc` (24.13.1), `engines.node: ">=22.13.0"`. См. «Troubleshooting» ниже, если
`pnpm`/`node` в системе расходятся.

## Скрипты

| Скрипт | Назначение |
|---|---|
| `pnpm dev` | dev-server (Vite) |
| `pnpm build` | `tsc -b && vite build` — типы + прод-сборка |
| `pnpm preview` | превью прод-сборки локально |
| `pnpm lint` / `pnpm lint:fix` | ESLint (flat config, `eslint.config.js`) |
| `pnpm format` / `pnpm format:check` | Prettier |
| `pnpm type-check` | `tsc -b --noEmit` |
| `pnpm test` | vitest в watch-режиме |
| `pnpm test:coverage` | vitest + отчёт покрытия (пороги — `vitest.config.ts`) |
| `pnpm storybook` | Storybook dev-server, порт 6006 |
| `pnpm build-storybook` | статическая сборка Storybook (`storybook-static/`) |

## Структура

```
src/
├── app/        main.tsx, App.tsx, router.tsx, providers/
├── pages/      страницы + layouts/
├── blocks/     переиспользуемые блоки с бизнес-логикой (= widgets из FSD)
├── ui/         components/ (без бизнес-логики), icons/, styles/, fonts/
├── api/        client.ts, api.ts, fetcher.ts, queryKeys.ts, queries/<domain>/
├── store/      zustand
├── hooks/      обёртки над store/i18n
├── i18n/       en/uk/ar + RTL
├── schemas/    zod (env + формы)
├── config/     env.ts, config.ts, routes.ts, query.ts
├── constants/
├── types/
└── utils/
__tests__/      зеркалит src/
stories/        зеркалит src/ (Storybook)
docs/           архитектура, конвенции, api-слой, формы, темизация, i18n, модалки, тесты
```

Подробности — `docs/architecture.md` (слои, направление импортов, «куда класть новый код»),
`docs/conventions.md` (нейминг, барели, коммиты), `docs/api-layer.md`, `docs/forms.md`,
`docs/theming.md`, `docs/i18n.md`, `docs/modals.md`, `docs/testing.md`.

## Git hooks (husky)

- `pre-commit` → `lint-staged` (ESLint --fix + Prettier на staged-файлах).
- `commit-msg` → `commitlint` (conventional commits, `commitlint.config.mjs`).
- `pre-push` → `pnpm type-check && pnpm test run`.

## Тесты и Storybook

`pnpm test run` — 46+ тестов в `__tests__/` (зеркало `src/`), покрытие обязательно для
`src/utils/**`, `src/ui/components/**`, `src/store/**` (пороги — `docs/testing.md`).
`pnpm storybook` — стори на каждый компонент `ui/components/**` + `ui/icons/Icon`, с
переключателем тем (`data-theme`) в тулбаре.

## Troubleshooting

**`pnpm` падает с `Error [ERR_UNKNOWN_BUILTIN_MODULE]: No such built-in module: node:sqlite`.**
pnpm 11.x использует `node:sqlite`, доступный только в Node ≥ 22.13 — независимо от того, какой
Node таргетит само приложение (`.nvmrc`/`engines.node`). Если в системе несколько версий Node
через `nvm` и активная — старше 22.13, запускайте pnpm с явным префиксом `PATH` на бинарники
нужной версии, не переключая `nvm use` глобально:

```bash
export PATH="$HOME/.nvm/versions/node/v24.13.1/bin:$PATH"
pnpm install
```

(Подставьте свою установленную версию ≥ 22.13 — необязательно именно 24.13.1.) Это меняет только
то, каким Node исполняется сам `pnpm`-процесс; `.nvmrc`/`engines.node` проекта остаются
ориентированными на минимально поддерживаемую версию из `package.json`.

**`pnpm install`/`pnpm <script>` падает с `[ERR_PNPM_IGNORED_BUILDS]`.** Postinstall-скрипты
транзитивных зависимостей (например `esbuild`) блокируются pnpm по умолчанию. Разрешить их
для этого проекта: `pnpm approve-builds --all` (пишет `allowBuilds` в `pnpm-workspace.yaml`,
коммитится в репозиторий — повторный `pnpm install` на чистой машине больше не спросит).
