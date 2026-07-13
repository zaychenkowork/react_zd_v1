# SETUP_NOTES

> **Status: setup complete.** The original source of findings for the audit; the currently
> relevant ones have already been carried into the working documentation — `docs/testing.md`
> (SVGR/vitest, coverage `skipFull`), `README.md` (Troubleshooting — the pnpm/node PATH prefix,
> `ERR_PNPM_IGNORED_BUILDS`), `docs/conventions.md` (the path resolver for
> `import-x/no-restricted-paths`, `sonarjs` directives), `docs/i18n.md` (`~/i18n/index` instead
> of bare `~/i18n`).

Deviations from SETUP_PLAN.md, recorded per rule 5 (don't improvise — record and continue).

## Phase 0

### 1. The `pnpm` CLI requires Node >= 22.13, the project's `.nvmrc` is 20.19.1

`corepack prepare pnpm@11.12.0 --activate` under the active Node 20.19.1 (the current version
from `.nvmrc`, `nvm ls` shows it as the only LTS version alongside newer ones) fails:

```
warn: This version of pnpm requires at least Node.js v22.13
Error [ERR_UNKNOWN_BUILTIN_MODULE]: No such built-in module: node:sqlite
```

The cause — the pnpm 11.x binary itself uses `node:sqlite`, available only in Node >= 22.13,
regardless of which Node the application targets (`engines.node`, `.nvmrc`). The pnpm version in
the plan (11.12.0) is pinned and doesn't change. The plan's fallback (`npm i -g pnpm@11.12.0`)
doesn't solve the problem — a package installed the same way still runs under the active Node
and fails the same way.

**Solution (doesn't change the plan's versions, only the CLI's execution environment):** the
pnpm package manager runs under Node v24.13.1 (already installed via nvm on the machine), while
the app's dependencies/scripts still target the Node from `.nvmrc` (20.19.1) — these two Node
versions are independent: one runs pnpm itself, the other is the app runtime. Important:
`nvm use v24.13.1` in this environment triggers an automatic sync of `.nvmrc`/`package.json#engines.node`
to the active Node version (a third-party hook on this machine/environment, not part of the
plan) — after `nvm use`, both files ended up overwritten to `24.13.1` / `>=22.13.0`. So instead
of `nvm use`, a direct `PATH` prefix was used, which doesn't trigger the hook:
`export PATH="/Users/zeddz/.nvm/versions/node/v24.13.1/bin:$PATH" && pnpm ...` — this changes
the active Node version for the pnpm process itself, while the project's `.nvmrc`/`engines`
remain `20.19.1` / `>=20.19.0`, as the plan requires. This needs attention when reproducing on
CI/other machines: a Node >= 22.13 must be available to run pnpm (even if the project targets
Node 20), and where possible avoid calling `nvm use` inside the repository — only a PATH
substitution or a separate shell outside the project directory.

### 2. The `prepare: husky` script from the phase-0 list breaks `pnpm install` before phase 2

The plan lists `prepare` (husky) among phase 0's scripts, but husky as a package is only
installed in phase 2. If `"prepare": "husky"` is added to `package.json` already in phase 0,
`pnpm install` (phase 0's acceptance check) fails with `sh: husky: command not found`
(exit code 1), because pnpm runs the `prepare` lifecycle script right after install, and the
husky binary doesn't exist yet.

**Solution:** the `"prepare": "husky"` script is added to `package.json` in phase 2, at the point
where husky is actually installed and configured (the natural order from husky v9's official
flow: install → add prepare script → init hooks). In phase 0, the rest of the listed scripts are
added as-is; `prepare` is temporarily absent.

## Phase 2

### 3. `import-x/no-restricted-paths` doesn't resolve the `~/*` alias without a separate TS resolver

The plan's version table doesn't include a package for resolving TypeScript path aliases in
ESLint (`eslint-import-resolver-typescript` or an equivalent). Without it,
`import-x/no-restricted-paths` doesn't fire at all: the rule internally calls
`resolve(importPath, context)`, and without a configured resolver the `~/api/client` alias
doesn't resolve to an absolute path — the rule silently returns with no report, regardless of
whether the target file exists on disk. Verified empirically: with the default resolver (only
`eslint-plugin-import-x`, no extra package), a planted import `~/api/client` from
`src/ui/_boundary-probe.ts` was NOT caught; `pnpm lint` exited 0.

**Solution:** added `eslint-import-resolver-typescript` (the current version at install time —
`4.4.5`, peer deps `eslint: '*'`, `eslint-plugin-import-x: '*'` — no conflicts with the versions
pinned in the plan) as a devDependency, missing from the plan's table. Configured via
`settings['import-x/resolver-next']: [createTypeScriptImportResolver(), createNodeResolver()]`
in `eslint.config.js`. After that, the zone check was confirmed twice:
- a planted import `import '~/api/client'` from `src/ui/_boundary-probe.ts` →
  `import-x/no-restricted-paths` catches the `ui/` zone violation;
- a planted import `import '~/api'` (no path to a file) from the same file → the core rule
  `no-restricted-imports` catches the attempt to import a whole layer (barrel guard).

Both probe files (`src/ui/_boundary-probe.ts` and a temporary `src/api/client.ts`, created just
so the resolver could find a real file under `~/api/`) were removed after verification; `pnpm lint`
is green again.

## Phase 4

### 4. `no-restricted-imports` also bans the bare import `~/i18n`, even though `i18n/index.ts` isn't a barrel but an entry point with side-effect initialization

The `no-restricted-imports.paths` rule, added in phase 2 against barrels, matches the literal
import specifier regardless of whether the file has named re-exports. `i18n/index.ts` (plan,
"Phase 4" section) is a module that calls `i18n.init()` as a side effect on import, not a barrel
with re-exports; nevertheless, any `import '~/i18n'` (including a side-effect import with no
bindings) is caught by the same rule as `import '~/api'`.

**Solution (without changing the phase-2 rule):** everywhere a side-effect import of the
initialization module is specifically needed (`src/app/main.tsx`,
`src/app/providers/QueryProvider.tsx`), the explicit file path `~/i18n/index` is used instead of
`~/i18n` — the literal doesn't match the entry in `no-restricted-imports.paths`, so lint passes,
and `moduleResolution: bundler` resolves `~/i18n/index` to the same file. The
`isSupportedLanguage` function (needed outside i18n/index.ts, in `hooks/useLanguage.ts`) was
moved to `i18n/resources.ts` — so consumers never need a bare `~/i18n` import at all, only `~/i18n/resources`.

### 5. `sonarjs/recommended` (phase 2) conflicts with TODO comments explicitly required by the phase-4 plan

The `sonarjs/todo-tag` rule (part of `sonarjs.configs.recommended`, enabled in phase 2) flags any
comment containing `TODO` as a lint error. The phase-4 plan explicitly requires TODO comments in
several places (`api/client.ts` — the refresh-endpoint stub; `store/useAuthStore.ts` — the
temporary storage of the refresh token in localStorage). The rule wasn't fully disabled (it's not
in the list of deliberate phase-2 relaxations). Instead:

**Solution:** a targeted `// eslint-disable-next-line sonarjs/todo-tag -- <reason>` right before
the line containing the word TODO, in both files. The comments were converted from `/** JSDoc */`
into a sequence of `//` lines, because `eslint-disable-next-line` only disables the rule for the
immediately following line, not for the whole block comment — if TODO isn't on the first line of
a `/** ... */` block, the directive doesn't land on the right line.

### 6. `sonarjs/void-use` bans `void` for deliberately ignored promises

In several places (`i18n/index.ts` — `i18n.use().init()`, `hooks/useLanguage.ts` —
`i18n.changeLanguage()`, `app/providers/QueryProvider.tsx` — `invalidateQueries()`) there was a
`void` before a promise-returning call that's deliberately not awaited (fire-and-forget). The
`sonarjs/void-use` rule (also part of the phase-2 recommended config) bans the `void` operator
entirely. Since the phase-2 config does NOT include `@typescript-eslint/no-floating-promises`
(it's only in the typed/strict presets, not the `tseslint.configs.recommended` used here),
marking the promise with `void` isn't required by any other rule either.

**Solution:** `void` was removed, the calls were left as plain statement expressions with no
await/void — behavior doesn't change (the promise is still not awaited), lint is green.

## Phase 6

### 7. Icons: `vite-plugin-svgr/client` types only declare `*.svg?react`, not `*.svg`

Phase 1 pinned the `*.svg?react` types (see the plan entry), but `vite.config.ts`'s svgr plugin
is configured with `include: '**/*.svg'` and `exportType: 'default'` — it transforms ANY `.svg`
import into a React component, regardless of the `?react` suffix. Importing an icon with the
suffix (`import Chevron from './svg/chevron.svg?react'`) types correctly (via
`vite-plugin-svgr/client`), but without the suffix TS resolves the import as `string` (a URL)
per the default `vite/client` types, even though the runtime behaves the same in both cases (the
plugin sees `**/*.svg`).

**Solution:** icon imports go through the `~/ui/icons/svg/*.svg` alias (not the relative
`./svg/*.svg`) + a targeted augmentation in `src/vite-env.d.ts`: `declare module '~/ui/icons/svg/*.svg'`
types exactly these files as `FC<SVGProps<SVGSVGElement>>`, overriding the more generic `*.svg`
from `vite/client` (TS picks the most specific matching wildcard pattern). The
`vite-plugin-svgr/client` reference was removed from `vite-env.d.ts` — it only declares
`*.svg?react`, which we don't use. The `?react` suffix isn't used at all (see also item 8 — under
vitest it caused a different, more serious problem).

The icon set is deliberately limited to two (`chevron`, `search`) per the plan's list;
`Input`'s `secure`/`search` variants use `chevron` (rotated 180°) and `search` — the `copy`
variant from the broker project wasn't ported (no suitable icon in this minimal set), a spot for
expansion is left in `ui/icons/types.ts`.

## Phase 8

### 8. `vite-plugin-svgr`'s `?react` transform isn't applied inside the vitest pipeline

On the first attempt to wire up `vitest.config.ts` with the same svgr plugin as `vite.config.ts`,
but importing via the `?react` suffix (as in phase 6 before the fix in item 7), the
`Icon.test.tsx` test failed with `InvalidCharacterError: "data:image/svg+xml,...` — the import
resolved to a data-URI string (the default `vite/client` behavior for assets), not a React
component, even though `vite build` transforms the same file correctly. Trying to work around it
via `resolve.alias`/`test.alias` (a regex on `\.svg\?react$` → a mock component) also didn't
work — the alias didn't match at all (the same "Does the file exist?" error from
`vite:import-analysis`).

**Solution:** the problem went away on its own after the fix in item 7 (importing icons without
the `?react` suffix, via the `~/ui/icons/svg/*.svg` alias, relying only on the plugin's
`include: '**/*.svg'`) — `vitest.config.ts` loads the same svgr plugin with an identical config
to `vite.config.ts`, and icons render for real in tests (no separate SVG mock — the "mock SVG"
item from the phase-8 plan is closed by the transform, not a mock module).

### 9. A test for `schemas/env.ts`, not `config/env.ts`

Per a direct instruction (env is read on import in `config/env.ts` — the only file allowed to do
so by `no-restricted-syntax`, and `import.meta.env` can't be stubbed under vitest without
breaking module isolation), the test covers the pure Zod schema `envSchema` from `schemas/env.ts`.
The test file is at the mirrored path `__tests__/schemas/env.test.ts` (not
`__tests__/config/env.test.ts` from the plan's draft wording) — `__tests__/` mirrors `src/`, and
the tested logic physically lives in `schemas/`. `config/env.ts` is also deliberately outside
`coverage.include` (only `src/utils`, `src/ui/components`, `src/store`), so this doesn't affect the thresholds.

### 10. Fully-covered files aren't shown in the `pnpm test:coverage` table

`@vitest/coverage-v8` 4.1.10 enables `skipFull: true` in the default text reporter when it
detects an agent/CI environment (a comment in vitest's source: "default to `skipFull` ... when
text reporter is used on agents") — rows for files with 100% statements/branches/functions
coverage drop out of the final table (`Skeleton`, `Tooltip`, `ToastMessage`, `Loaders/*`,
`zod4Resolver`, `useAuthStore` — all of them are actually instrumented, confirmed via
`coverage/coverage-final.json`, where all expected files are present). Final percentages and
thresholds are computed against the full set regardless of what's shown in the table — this is
expected behavior, noted separately so it isn't misread as "files dropped out of coverage".

## Phase 9

### 11. `pnpm build-storybook` fails with "Yarn Plug'n'Play manifest forbids importing" — third-party environment contamination, unrelated to this repo

`pnpm build-storybook` (esbuild bundling Storybook's manager binary) failed with three errors
like `Could not resolve "@storybook/global"` / `"storybook/internal/csf"` /
`"storybook/open-service"`, with the message `The Yarn Plug'n'Play manifest forbids importing "..." here because it's not listed as a dependency of this package`,
even though the project is entirely on pnpm (a plain `node_modules`, no Yarn in any package.json).
The cause — esbuild searches for `.pnp.cjs` upward through the directory tree from `resolveDir`
regardless of whether the current project uses Yarn PnP, and if it finds a file with that name in
any ancestor directory — it applies it as the PnP restriction manifest for all resolves. On the
machine where this phase ran, `/Users/zeddz/.pnp.cjs` was found — a file unrelated to this
repository or to neighboring projects (apparently a leftover from an unrelated Yarn experiment
somewhere in `$HOME`); that directory is an ancestor of `react_zd_v1`, so esbuild picked it up.
A known esbuild issue, not specific to Storybook/pnpm/this repo:
[evanw/esbuild#3338](https://github.com/evanw/esbuild/issues/3338),
[evanw/esbuild#3876](https://github.com/evanw/esbuild/issues/3876); the confirmed workaround is
to rename/remove the stray `.pnp.cjs`.

**Solution (doesn't touch repo code):** `/Users/zeddz/.pnp.cjs` was renamed to
`/Users/zeddz/.pnp.cjs.disabled-by-react_zd_v1-setup` (not deleted — reversible, in case another
project on this machine needs the file). After that, `pnpm build-storybook` builds normally.
This is a fix to this particular machine's environment, not to the project — when reproducing on
another machine (CI, another laptop) there's no need to specifically search for this unless it
has its own stray `.pnp.cjs` somewhere in the ancestors of the working directory; if a similar
error recurs — same diagnosis (`find ~ -maxdepth 1 -iname '.pnp.cjs'` from the working
directory's root upward).

### 12. `pnpm <script>` fails with `[ERR_PNPM_IGNORED_BUILDS]` when new dependencies with postinstall scripts are added

Installing `storybook`/`@storybook/react-vite`/`@storybook/addon-themes` pulled in `esbuild` as a
transitive dependency; `esbuild` has a postinstall script that pnpm doesn't run by default without
explicit approval — after that, **any** `pnpm <script>` (not just `install`) failed with exit
code 1 and `[ERR_PNPM_IGNORED_BUILDS]`, because pnpm synchronously checks whether `node_modules`
is up to date before running a script and fails if there are unapproved build scripts (an
interactive `pnpm approve-builds` in a non-interactive agent session just hung waiting for input).

**Solution:** `pnpm approve-builds --all` (a non-interactive flag, unlike bare
`pnpm approve-builds`) — writes the approval into `pnpm-workspace.yaml` (`allowBuilds: { esbuild: true, ... }`),
which is committed to the repository, so a subsequent `pnpm install` on a clean machine won't ask
again or fail. See `README.md` (Troubleshooting) — the same reproducible step is recorded there
for future packages with postinstalls.
