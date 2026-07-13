# Тесты

Стек: `vitest` + `@testing-library/react` + `jsdom`.

## `__tests__/` зеркалит `src/`

Тест для `src/ui/components/Button/Button.tsx` лежит в
`__tests__/ui/components/Button/Button.test.tsx` — тот же путь, что у файла в `src/`, только с
корнем `__tests__/` вместо `src/`. Плюс два служебных подкаталога, не имеющих пары в `src/`:

- `__tests__/setup/setupTests.ts` — `setupFiles` для vitest.
- `__tests__/test-utils.tsx` — `renderWithProviders`.

`stories/` (Storybook, `docs` не требуется — см. `.storybook/main.ts`) зеркалит `src/` по тому
же принципу.

## Что покрываем обязательно

`vitest.config.ts`, `coverage.include`: `src/utils/**`, `src/ui/components/**`, `src/store/**`.
Пороги (`coverage.thresholds`): lines/statements 80, branches 75, functions 70. Это не «покрыть
всё» — а конкретно чистые утилиты, презентационные ui-кирпичики и client-state сторы, то есть
код без сетевых сайд-эффектов, который можно протестировать быстро и детерминированно.
`config/env.ts` осознанно вне `coverage.include` — единственная логика в нём (`import.meta.env`)
не изолируется от рантайма Vite без порчи модульной изоляции; вместо этого тестируется чистая
Zod-схема `schemas/env.ts` (`__tests__/schemas/env.test.ts`), которая содержит всю проверяемую
логику.

Остальные слои (`api/queries/*`, `blocks/*`, `pages/*`) тестами не покрываются в шаблоне — это
интеграционные/сетевые сценарии, тестовый подход для них закладывается по задачам конкретной
команды.

## Имена тестов и запросы

- Имя теста — «what + when + expected»: `'shows the translated validation error under each field
  when submitting an empty form'`, не `'test 1'`/`'renders correctly'`.
- Запросы — `screen.getByRole`/`getByText`/`getByPlaceholderText` и т.п., **не** `data-testid`.
  `data-testid="icon-svg"` в `ui/icons/Icon.tsx` — единственное исключение (SVG-иконки не имеют
  подходящей роли/текста для запроса).

## `renderWithProviders`

`__tests__/test-utils.tsx` оборачивает `render` в `QueryClientProvider` (с `retry: false` и на
queries, и на mutations — тесты не должны ждать реальных ретраев). i18n не требует провайдера —
дефолтный экземпляр `i18next` инициализируется как side-effect импорта `~/i18n/index` в
`setupTests.ts`, `useTranslation()` читает из него напрямую.

## Нюанс: `vite-plugin-svgr` и vitest

`vite.config.ts` транслирует **любой** импорт `**/*.svg` в React-компонент через `vite-plugin-svgr`
(`exportType: 'default'`, без суффикса `?react` — см. `docs/theming.md`/`src/ui/icons/types.ts`).
Suffix-based `?react` импорт (`import Chevron from './chevron.svg?react'`), который часто
встречается в примерах `vite-plugin-svgr`, **не работает под vitest**: импорт с этим суффиксом
резолвится в data-URI строку (дефолтное поведение `vite/client` для ассетов), а не в компонент,
хотя тот же файл в `vite build` транслируется корректно — сам суффикс не подключает трансформ
плагина под vitest. Обходной путь через `resolve.alias`/`test.alias` (regex на `\.svg\?react$`)
тоже не сработал — алиас не матчился вообще.

**Решение, применённое в шаблоне:** иконки импортируются без суффикса
(`~/ui/icons/svg/chevron.svg`, не `chevron.svg?react`), а `vitest.config.ts` подключает **тот же**
`vite-plugin-svgr` с идентичным конфигом, что и `vite.config.ts` (`include: '**/*.svg'`). Тогда
трансформ применяется одинаково и в dev/build, и в vitest — иконки в тестах рендерятся по-настоящему,
без отдельного SVG-мока. При добавлении новой конфигурации, где участвует Vite (Storybook —
`.storybook/main.ts`, см. `docs/architecture.md` про Storybook), это правило то же самое: framework
Storybook (`@storybook/react-vite`) **не читает** `vite.config.ts` автоматически — svgr-плагин
нужно явно повторить в `viteFinal` (или в любом другом отдельном Vite-пайплайне).

## Нюанс: полностью покрытые файлы не показаны в таблице `pnpm test:coverage`

`@vitest/coverage-v8` включает `skipFull: true` в текстовом репортере по умолчанию, когда
определяет CI/агентское окружение — файлы с 100% по statements/branches/functions выпадают из
печатаемой таблицы (это не значит, что они не инструментированы: полный список — в
`coverage/coverage-final.json`). Итоговые проценты и пороги считаются по полному набору файлов
независимо от того, что попало в таблицу — если после изменений какой-то файл «пропал» из вывода
`pnpm test:coverage`, это не регрессия покрытия, а именно этот случай.

## Команды

- `pnpm test` — watch-режим.
- `pnpm test run` — один прогон, использовать в CI/pre-push.
- `pnpm test:coverage` — прогон с отчётом покрытия и порогами.
