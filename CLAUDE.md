# CLAUDE.md

React SPA-тимплейт (Vite + TS + React 19). Подробности — в `docs/`.

## Команды

`pnpm` — с `export PATH="$HOME/.nvm/versions/node/v24.13.1/bin:$PATH"` (см. README, раздел
troubleshooting) на машинах, где активный `node` в PATH старше 22.13.

```
pnpm dev              # dev-server
pnpm build             # tsc -b && vite build
pnpm lint / lint:fix
pnpm format:check / format
pnpm type-check        # tsc -b --noEmit
pnpm test run          # один прогон vitest
pnpm test:coverage
pnpm storybook / build-storybook
```

## Правила слоёв (см. docs/architecture.md)

```
app → pages → blocks → api → store → ui → { i18n, schemas, utils, types, config, constants }
```

- `ui/` не знает о `store`/`api`/`blocks`/`pages`/`app` — только пропсы.
- `hooks/` может обёртывать `store`/`i18n`, не может импортировать `api`/`blocks`/`pages`/`app`.
- Границы — линтером (`import-x/no-restricted-paths`, `eslint.config.js`), не только на словах.
- **Барелей (`index.ts` с реэкспортами) нет нигде в `src/` и `stories/`.** Импорт — прямым
  путём до файла через `~/`. Подробнее и почему — `docs/conventions.md`.
- Новый connected-компонент: нужен в одном месте → `pages/<Page>/components/`; нужен в
  нескольких → `blocks/`.

## Версии — не менять без причины

`typescript` зафиксирован на 5.9.x (`typescript-eslint@8.63` требует `<6.1.0`), `eslint` на
9.x (`eslint-plugin-react@7.37.5` требует `^9.7`). Прежде чем предлагать `tsc`/`eslint` мажорный
апгрейд — проверить актуальные peer deps (`npm view <pkg> peerDependencies`), см. чек-лист
`.claude/skills/code-review/SKILL.md`.

## Тесты и коммиты

- Тест на каждый файл в `src/utils/`, `src/ui/components/`, `src/store/` — зеркально в
  `__tests__/`, см. `docs/testing.md`. `pnpm test run`/`pnpm type-check` гоняются в pre-push
  (husky) — не отключать.
- Коммиты — conventional commits (`commitlint`, husky `commit-msg`), см. `docs/conventions.md`.
- Тексты UI — только через i18n-ключи (`t('namespace.key')`), не хардкод-строки.

## Документация

`docs/architecture.md`, `docs/conventions.md`, `docs/api-layer.md`, `docs/forms.md`,
`docs/theming.md`, `docs/i18n.md`, `docs/modals.md`, `docs/testing.md`.
