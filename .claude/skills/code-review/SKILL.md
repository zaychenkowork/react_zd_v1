---
name: code-review
description: Проектный чек-лист ревью для react_zd_v1 (слои, барели, query-паттерны, формы,
  i18n, тесты) + проверка актуальности версийных ограничений. Использовать при ревью PR/диффа
  в этом репозитории — до или вместо общего /code-review.
---

# Code review — react_zd_v1

Чек-лист специфичен для этого шаблона; общие вопросы стиля/безопасности вне него — через
обычный `/code-review`. Основания каждого пункта — в `docs/`.

## Границы слоёв (docs/architecture.md)

- [ ] Направление импортов не нарушено: `app → pages → blocks → api → store → ui → {i18n, schemas, utils, types, config, constants}`.
- [ ] `ui/**` не импортирует `api`, `store`, `blocks`, `pages`, `app` (только пропсы).
- [ ] `hooks/**` не импортирует `api`, `blocks`, `pages`, `app`.
- [ ] `pnpm lint` зелёный — `import-x/no-restricted-paths` уже проверяет всё это механически;
      ручная проверка нужна только если диф трогает `eslint.config.js`.

## Барели (docs/conventions.md)

- [ ] Нет новых `index.ts` с реэкспортами в `src/`, `__tests__/`, `stories/`.
- [ ] Импорты — прямым путём до файла через `~/`, не bare-импорт слоя.

## Связанность (docs/architecture.md)

- [ ] Новый компонент, читающий `store`/`api`, лежит в `pages/<Page>/components/` (один
      потребитель) или `blocks/` (несколько), а не в `ui/`.
- [ ] Хук, использующий store (`useTheme`-подобный), не импортируется внутри `ui/components/**`
      (линтер это не ловит — только ревью).

## Query-паттерны (docs/api-layer.md)

- [ ] Новый эндпоинт — метод в `api/api.ts`, не прямой вызов `axios`/`apiClient` из компонента.
- [ ] Query-ключи — через фабрику в `api/queryKeys.ts`, не строковый литерал в компоненте.
- [ ] `queryFn`/`mutationFn` оборачивает вызов `api.*` в `fetcher(...)`.
- [ ] Тосты — только через `meta.errorToast`/`meta.successToast`/`meta.invalidates`, не
      локальный `onError`/`onSuccess` с `toast.*` в компоненте.
- [ ] DTO — в `types/api.ts` (или `types/<domain>.ts`), не инлайн в файле хука.

## Формы (docs/forms.md)

- [ ] Поле формы — `ControlledInput` (или аналогичная Controlled-обёртка), не сырой `<input>`
      с ручным `useState`.
- [ ] Ошибки схемы — i18n-ключи (`'required'`, не `'This field is required'`).
- [ ] Резолвер — `~/utils/zod4Resolver`, не `@hookform/resolvers` (см. проверку актуальности
      ниже).

## i18n (docs/i18n.md)

- [ ] Нет хардкод-строк, видимых пользователю, — только `t('namespace.key')`.
- [ ] Новый ключ добавлен во все локали (`en`/`uk`/`ar`) — `satisfies Translation` в
      `i18n/resources.ts` должен упасть при рассинхроне, но проверить, что диф действительно
      правит все три файла, а не только `en`.
- [ ] Название языка в UI — эндоним (`constants/languages.ts`), не перевод.

## Тесты (docs/testing.md)

- [ ] Новый файл в `src/utils/`, `src/ui/components/`, `src/store/` — есть тест в `__tests__/`
      по тому же пути.
- [ ] Имя теста — «what + when + expected», запросы — `getByRole`/`getByText`, не `data-testid`.
- [ ] `pnpm test:coverage` не проваливает пороги (lines/statements 80, branches 75, functions 70).

## Storybook

- [ ] Новый компонент в `ui/components/` — стори в `stories/` по тому же пути
      (`stories/ui/components/<Name>/<Name>.stories.tsx`).

## Проверка актуальности версийных ограничений

Версии в `package.json` пинятся под конкретные peer-ограничения — они могут устареть. Проверять
при любом ревью, где диф трогает эти зависимости, либо периодически:

1. **`react-hook-form/resolvers#842`** (причина кастомного `zod4Resolver`, см. `docs/forms.md`):
   `curl -s https://api.github.com/repos/react-hook-form/resolvers/issues/842 | grep '"state"'`
   (или `gh api repos/react-hook-form/resolvers/issues/842 --jq .state`, если установлен `gh`).
   Если `"closed"` — проверить, вышла ли версия `@hookform/resolvers` с поддержкой Zod 4
   (`npm view @hookform/resolvers versions peerDependencies --json`), и если да — завести задачу
   на миграцию (сама миграция — см. критерий в `docs/forms.md`).
2. **ESLint 10 в `eslint-plugin-react`** (сейчас пин `eslint@9.x`, `docs/conventions.md`/
   `CLAUDE.md`): `npm view eslint-plugin-react peerDependencies` — искать диапазон `eslint`.
   Если верхняя граница расширилась до `^10`, апгрейд ESLint возможен.
3. **TS 6+ в `typescript-eslint`** (сейчас пин `typescript@5.9.x`): `npm view typescript-eslint peerDependencies`
   — искать диапазон `typescript`. Если нижняя/верхняя граница включает `6.x`/`7.x`, апгрейд
   TypeScript возможен (проверить также `@vitejs/plugin-react`, `vite-tsconfig-paths` на
   совместимость).

Если `gh`/`npm` недоступны в среде ревью — команды выше можно выполнить через `WebFetch`/браузер
(GitHub issue page, npmjs.com/package/<pkg>).
