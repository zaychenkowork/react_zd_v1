# Conventions

## `type` over `interface`

Throughout `src/`, types are declared with `type`. `interface` is used only where declaration
merging / augmenting an existing type is needed (the one thing `type` can't do):

- `interface Register` in `src/types/tanstack-query.d.ts` — extends TanStack Query types
  (`queryMeta`, `mutationMeta`, `defaultError`).
- `interface ImportMetaEnv`/`ImportMeta` in `src/vite-env.d.ts` — Vite type augmentation.
- `interface CustomTypeOptions` in `src/i18n/i18n.d.ts` — i18next type augmentation.

Component props may be declared next to the component (`export type ButtonProps = {...}`
in `Button.tsx`) — there's no need to move them into `types/`. API request/response DTOs, on
the other hand, are not inlined in code files — they live in `types/api.ts` (or
`types/<domain>.ts` once it grows), see `docs/api-layer.md`.

## Barrels are forbidden

There is no `index.ts` with re-exports anywhere in `src/` (or in `stories/`). All imports are
direct, through the file, via the `~/` alias: `import { Button } from '~/ui/components/Button/Button'`,
not `import { Button } from '~/ui/components'`.

**Rule: a barrel makes sense only at a package boundary** (its own `package.json`, imported by
package name — an npm library or a monorepo package), **not at a folder boundary**. In the app, a
folder boundary is e.g. `src/ui/`, `src/api/`: they aren't published and aren't imported from
outside by name, so a barrel there doesn't provide what it exists for (a stable public package
API) and only adds:

- **extra code in the module graph** — a barrel file imports (and therefore includes in the
  graph) the entire layer, even when only one file is needed from outside;
- **a slower dev server/tests** — a known case from Vercel: 11,000 modules instead of
  3,000 with a membrane barrel → 500 without one
  ([marvinh.dev, "Speeding up the JavaScript ecosystem — Barrel Files"](https://marvinh.dev/blog/speeding-up-javascript-ecosystem-part-7/));
- **easier accidental reverse imports** (a barrel from `ui/` mixes in anything, including
  an accidental import of `store`/`api`) — something `import-x/no-restricted-paths` is meant to catch.

Detailed breakdown — [tkdodo.eu, "Please Stop Using Barrel Files"](https://tkdodo.eu/blog/please-stop-using-barrel-files).
bulletproof-react also reversed its recommendation on this at some point
(`project-structure.md` in their repository now explicitly advises against feature/layer-level barrels).

Infrastructure instead of a barrel:

- **Import order** — `eslint-plugin-simple-import-sort` with groups by layer
  (`eslint.config.js`, `simple-import-sort/imports`): side-effects → `react`/external packages →
  `~/app` → `~/pages` → `~/blocks` → `~/ui` → `~/api` → `~/store` → `~/hooks` → `~/i18n` →
  `~/schemas` → `~/utils` → `~/types` → `~/config` → `~/constants` → relative → `.css`.
- **Layer encapsulation** — `import-x/no-restricted-paths` (zones, see `docs/architecture.md`)
  and `no-restricted-imports` (bans bare-importing a whole layer, `~/ui` without a path to a
  file) — the second is precisely a defense against barrels: if a `ui/index.ts` ever appeared,
  `import ~/ui` still wouldn't pass lint, barrel or not.

`import-x/no-restricted-paths` doesn't resolve the `~/*` alias without a separate resolver —
without the `eslint-import-resolver-typescript` package (configured in `eslint.config.js`,
`settings['import-x/resolver-next']`) the rule stays silent on any `~/...` import, without
reporting an error. Don't remove this package when cleaning up dependencies — it isn't used
directly in code, but without it layer boundaries aren't checked.

## ESLint directive comments and TODO

`sonarjs/recommended` enables `sonarjs/todo-tag` (any comment containing the word `TODO` is a
lint error) and `sonarjs/void-use` (bans the `void` operator entirely). Neither rule is relaxed
in the shared config (they aren't in the list of deliberate relaxations in `eslint.config.js`),
so:

- A legitimate `TODO` comment — a targeted `// eslint-disable-next-line sonarjs/todo-tag -- <reason>`
  right before the line with `TODO`, not above a `/** JSDoc */` block (the directive only
  affects the following line — if `TODO` isn't on the first line of a block comment, it won't
  take effect).
- A fire-and-forget promise (a call that's deliberately not awaited) — just a bare statement
  expression without `await`/`void`; don't add `void` before the call.

## Import groups

See `simple-import-sort/imports` above — `pnpm lint:fix` sorts automatically, there's no need
to maintain the order by hand.

## i18n keys instead of strings

Any user-visible text goes through `t('namespace.key')`, not a hardcoded string. Details
and key typing — `docs/i18n.md`.

## Language endonyms

The language name in the language switcher is an **endonym** (a language's name for itself,
never translated): `constants/languages.ts`:

```ts
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  uk: 'Українська',
  ar: 'العربية',
};
```

Reason: a user who ends up in the wrong locale by accident should be able to recognize the name
of **their own** language visually — "Українська" is recognizable even if the rest of the UI is
in Arabic; a name translated into the current UI language ("Ukrainian" on an Arabic screen)
doesn't achieve that.

## Conventional commits

Commit format is checked by `commitlint` (`commitlint.config.mjs`, `@commitlint/config-conventional`,
`header-max-length: 120`) via the husky `commit-msg` hook:

```
<type>(<scope>): <description>
```

`type` is one of `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `build`,
`ci`, `revert` (full list — `@commitlint/config-conventional`). `scope` is optional but used
consistently in this repo (`setup`, `ui`, `api`, …).

## Language

All code, comments, documentation, and commit messages in this repository are in English. This
applies to everything: source files, config, docs, README/CLAUDE.md, PR descriptions.

UI-facing text is the one exception in *form*, not in *language*: it's never hardcoded at all —
it goes only through i18n keys (`t('namespace.key')`, see "i18n keys instead of strings" above),
and the underlying `en` locale strings are still English.

Not violations:

- `src/i18n/locales/uk/**` and `src/i18n/locales/ar/**` — translated UI content, that's their job.
- `constants/languages.ts` — language endonyms (`Українська`, `العربية`) are content, not stray
  non-English text (see "Language endonyms" above).
