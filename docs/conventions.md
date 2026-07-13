# Конвенции

## `type` предпочтительнее `interface`

Во всём `src/` типы объявляются через `type`. `interface` — только там, где нужен
declaration merging / аугментация существующего типа (это единственное, чего `type` не умеет):

- `interface Register` в `src/types/tanstack-query.d.ts` — расширяет типы TanStack Query
  (`queryMeta`, `mutationMeta`, `defaultError`).
- `interface ImportMetaEnv`/`ImportMeta` в `src/vite-env.d.ts` — аугментация типов Vite.
- `interface CustomTypeOptions` в `src/i18n/i18n.d.ts` — аугментация типов i18next.

Пропсы компонентов допустимо объявлять рядом с компонентом (`export type ButtonProps = {...}`
в `Button.tsx`) — не обязательно выносить в `types/`. DTO запросов/ответов API, наоборот,
не инлайнятся в код-файлы — они живут в `types/api.ts` (или `types/<domain>.ts`, когда
разрастётся), см. `docs/api-layer.md`.

## Барели запрещены

Нигде в `src/` (и в `stories/`) нет `index.ts` с реэкспортами. Все импорты — прямые, через файл,
через алиас `~/`: `import { Button } from '~/ui/components/Button/Button'`, не
`import { Button } from '~/ui/components'`.

**Правило: барел уместен только на границе пакета** (свой `package.json`, импорт по имени пакета
— npm-библиотека или пакет монорепы), **не на границе папки**. В приложении граница папки —
это `src/ui/`, `src/api/` и т.п.: они не публикуются и не импортируются извне по имени, поэтому
барел там не даёт того, для чего он существует (стабильный публичный API пакета), а только
добавляет:

- **лишний код в графе модулей** — barrel-файл импортирует (и потому включает в граф) весь
  слой целиком, даже если снаружи нужен один файл;
- **более медленный dev-server/тесты** — известный кейс от Vercel: 11 000 модулей вместо
  membrane-барела → 3000 с барелом → 500 без него
  ([marvinh.dev, «Speeding up the JavaScript ecosystem — Barrel Files»](https://marvinh.dev/blog/speeding-up-javascript-ecosystem-part-7/));
- **более лёгкий обратный импорт** (barrel из `ui/` подмешивает в него что угодно, включая
  случайный импорт `store`/`api`) — то, что должен ловить `import-x/no-restricted-paths`.

Подробный разбор — [tkdodo.eu, «Please Stop Using Barrel Files»](https://tkdodo.eu/blog/please-stop-using-barrel-files).
bulletproof-react в какой-то момент тоже развернул рекомендацию в эту сторону
(`project-structure.md` в их репозитории явно советует не заводить барелы уровня фичи/слоя).

Инфраструктура вместо барела:

- **Порядок импортов** — `eslint-plugin-simple-import-sort` с группами по слоям
  (`eslint.config.js`, `simple-import-sort/imports`): side-effects → `react`/внешние пакеты →
  `~/app` → `~/pages` → `~/blocks` → `~/ui` → `~/api` → `~/store` → `~/hooks` → `~/i18n` →
  `~/schemas` → `~/utils` → `~/types` → `~/config` → `~/constants` → relative → `.css`.
- **Инкапсуляция слоёв** — `import-x/no-restricted-paths` (зоны, см. `docs/architecture.md`)
  и `no-restricted-imports` (запрет bare-импорта слоя целиком, `~/ui` без пути до файла) —
  вторая защита это как раз защита именно от барелов: если бы `ui/index.ts` появился, импорт
  `~/ui` не прошёл бы линт независимо от того, барел это или нет.

`import-x/no-restricted-paths` не резолвит алиас `~/*` без отдельного резолвера — без пакета
`eslint-import-resolver-typescript` (настроен в `eslint.config.js`, `settings['import-x/resolver-next']`)
правило молчит на любом `~/...`-импорте, не сообщая об ошибке. Не удалять этот пакет при чистке
зависимостей — он не используется напрямую в коде, но без него граница слоёв не проверяется.

## Комментарии-директивы ESLint и TODO

`sonarjs/recommended` включает `sonarjs/todo-tag` (любой комментарий со словом `TODO` — ошибка
линта) и `sonarjs/void-use` (запрещает оператор `void` целиком). Оба правила не смягчены в общем
конфиге (не входят в список сознательных послаблений `eslint.config.js`), поэтому:

- Легитимный `TODO`-комментарий — точечный `// eslint-disable-next-line sonarjs/todo-tag -- <причина>`
  непосредственно перед строкой с `TODO`, не над блоком `/** JSDoc */` (директива действует только
  на следующую строку — если `TODO` не на первой строке блочного комментария, она не сработает).
- Fire-and-forget промис (вызов, который сознательно не ожидается) — просто statement-выражение
  без `await`/`void`, `void` перед вызовом не добавлять.

## Импорт-группы

См. `simple-import-sort/imports` выше — `pnpm lint:fix` сортирует автоматически, руками
поддерживать порядок не нужно.

## i18n-ключи вместо строк

Любой текст, видимый пользователю, — через `t('namespace.key')`, не хардкод-строка. Подробности
и типизация ключей — `docs/i18n.md`.

## Эндонимы языков

Название языка в переключателе языка — **эндоним** (язык называет сам себя, никогда не
переводится): `constants/languages.ts`:

```ts
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  uk: 'Українська',
  ar: 'العربية',
};
```

Причина: пользователь, случайно попавший в чужую локаль, должен узнать название **своего**
языка визуально — «Українська» узнаваемо, даже если весь остальной интерфейс на арабском;
переведённое на текущий язык интерфейса название («Ukrainian» на арабском экране) для этого
не годится.

## Conventional commits

Формат коммитов проверяется `commitlint` (`commitlint.config.mjs`, `@commitlint/config-conventional`,
`header-max-length: 120`) через husky `commit-msg`-хук:

```
<type>(<scope>): <описание>
```

`type` — один из `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `build`,
`ci`, `revert` (полный список — `@commitlint/config-conventional`). `scope` опционален, но в
этом репо используется последовательно (`setup`, `ui`, `api`, …).
