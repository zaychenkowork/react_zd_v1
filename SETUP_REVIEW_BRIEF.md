# SETUP_REVIEW_BRIEF — brief for an independent setup audit

You are a fresh auditor agent. This file is the complete history of the react_zd_v1 template
setup (2026-07-13): every decision, its rationale, disputes, and trade-offs. Your job is to
scrutinize everything with a clean slate: whether versions and sources are still current, whether
conclusions still hold, and whether best practices are followed. **Argue with decisions if you
see something better** — but back every objection with current authoritative sources
(documentation, npm peer deps, live issues, top projects with links).

**Source-verification rule (mandatory):** for every source, check its DATE and whether it's
still alive. A blog post from any authority is a secondary source: re-verify its conclusion
against the library's current official docs. Account for renames and moves (react-query →
TanStack Query, calcom/cal.com → cal.diy, etc.) — a link may redirect to different content. A
2021 article can still be correct (maintainers do keep posts up to date), but that has to be
SHOWN by cross-checking with the docs, not assumed. The same applies to your own knowledge: it
goes stale — "I recall that's how it works" doesn't count as proof for any library in
package.json. Related files: `SETUP_PLAN.md` (the final plan the project was built against),
`SETUP_NOTES.md` (deviations by the executors), git history (one commit per phase), `docs/*`.

## 1. What this project is

A React SPA template for a username marketplace (similar to fragment.com, different ecosystem).
There's no backend yet — this was scaffolding. The team builds on top of it going forward.
References this all started from:
- `/Users/zeddz/Desktop/Projects/FRONT/zedxbroker` — the team's production project (React 19 +
  Vite 6, RTK+saga+RTK Query, apisauce, ~60 UI components, CSS Modules + tokens + data-theme,
  i18next+RTL, RHF Controlled wrappers, a custom zod4Resolver, tests in a root-level `__tests__/`).
- `/Users/zeddz/Desktop/Projects/TEAMPLATES/react-native_zd_v1` — the lead's own Expo template
  (thin routes + feature modules, TanStack Query + zustand, query-key enums, typed i18n,
  schemas/env.ts + zod env validation, docs/ included).

Lead's requirements: theme switching, languages (en/uk/ar + RTL-readiness), modals, tests in a
root-level `__tests__/`, husky+commitlint+lint-staged, ESLint+prettier, CSS Modules + global
tokens, RHF+Zod+Controlled wrappers, TanStack Query with keys in constants and wrapper hooks,
**every decision backed by current sources**.

## 2. Decision log (what, why, what it was backed by)

All versions were checked against the npm registry and peer deps on **2026-07-13**. Re-verify at
audit time — anything may have moved on since.

| Decision | Rationale | What could invalidate it |
|---|---|---|
| Vite 8.1.4 + React 19.2.7 SPA, NOT Next.js | Content is mostly behind login, SEO isn't critical (fragment.com is server-rendered, but lives on direct/TG traffic); the team is used to SPA. Discussed with the lead, he chose SPA deliberately | A future SEO/public-pages requirement |
| pnpm 11.12.0 | Speed, strict node_modules, the standard for new projects | — |
| Node: .nvmrc 24.13.1, engines >=22.13 | pnpm 11 requires Node >=22.13 (node:sqlite); Node 20 EOL 04.2026. Originally 20.19.1 — fixed during batch-1 review | — |
| TypeScript 5.9.3, NOT 6/7 | typescript-eslint@8.63 peer: `typescript <6.1.0`. TS 7 (the Go port) has shipped, but the linting ecosystem hasn't caught up | typescript-eslint gaining TS 7 support → migration possible |
| ESLint 9.39.5 flat, NOT 10 | eslint-plugin-react@7.37.5 peer: `eslint ^9.7` max | A release of eslint-plugin-react supporting 10 |
| TanStack Query 5.101.2 + zustand 5.0.14 instead of the broker's RTK+saga | Server state in Query, client state in zustand (the pattern from the lead's RN template). Sagas are covered: the restHelper factory ≙ built-in isPending/isError; orchestration ≙ async mutationFn; toasts ≙ global QueryCache/MutationCache callbacks. Primary proof — the CURRENT docs: tanstack.com/query/latest/docs/reference/MutationCache + typescript.md (Register/meta), checked 2026-07-13 against the tanstack/query repo. Secondary — tkdodo.eu/blog/react-query-error-handling (2021, author is a maintainer; conclusions re-verified against current docs, no divergence found) | Future changes to the Query cache/meta API |
| axios 1.18.1 (not fetch/ky) | ~60M weekly downloads, interceptors for the future refresh flow; the client is thin — easy to swap out later | — |
| RHF 7.81.0 + Zod 4.4.3 + **custom zod4Resolver** (copied from the broker project), NOT @hookform/resolvers | KEY DISPUTE: I proposed the official resolver (v5.1+ claims Zod 4 support), the lead didn't buy it — and was right: react-hook-form/resolvers#842 is open (the type overload breaks on zod 4.3+, fix #840 unmerged as of 02.2026, confirmed by comments up to 06.2026) | **CHECK THE STATUS OF #842** — if closed, migrate to the official `zodResolver` by swapping the import |
| Structure: layers `app → pages → blocks → api → store → ui → shared`; hooks off to the side (may use store/i18n, may not use api) | Research from bulletproof-react (35.5k★, app-level feature composition, ESLint boundaries) vs FSD v2.1 (the widgets layer = "large self-sufficient reusable UI blocks"). A hybrid: `blocks/` = widgets from FSD (the lead chose the name blocks, the broker project had a folder like that). The "promotion rule": pages/<Page>/components → blocks → ui. Links: feature-sliced.design/docs/reference/layers, github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md | — |
| Boundaries enforced by the linter: import-x/no-restricted-paths + eslint-import-resolver-typescript | The bulletproof-react pattern. The resolver was added beyond the plan — without it the rule silently does nothing (doesn't resolve `~/*`), verified empirically (SETUP_NOTES item 3) | — |
| Barrels banned throughout src/ | "A barrel makes sense at a package boundary, not a folder boundary." Proof: tkdodo.eu/blog/please-stop-using-barrel-files, marvinh.dev/blog/speeding-up-javascript-ecosystem-part-7 (50k modules = 48s), the recommendation reversal in bulletproof-react. Enforcement: no-restricted-imports on layer roots | — |
| Scale-based tokens (grey-100..950, red/green/blue-50/400/500/950, coral), dark = value inversion under `[data-theme='dark']`, WITHOUT semantic names | Palette from the Figma design (the lead provided a screenshot, hex values in the phase-3 plan table). The lead explicitly rejected shadcn-style semantics | A design-system change |
| No shadcn/Tailwind | shadcn is Tailwind-first, the team has CSS Modules + its own ~60 components on the same Radix primitives. Porting from the broker project | — |
| config: schemas/env.ts (zod schema) → config/env.ts (the sole reader of import.meta.env, fail-fast) → config/config.ts (APP_NAME, APP_VERSION via define) | The bulletproof-react apps/react-vite/src/config/env.ts pattern + the lead's RN template. t3-env was deliberately rejected (its value is server/client separation, which doesn't exist in an SPA). ESLint bans import.meta.env outside env.ts | — |
| Toasts STRICTLY opt-in: meta.errorToast/successToast/invalidates, silent by default | The lead's requirement (I initially made error toasts on-by-default with a suppress flag — reworked). A Register augmentation in types/tanstack-query.d.ts | — |
| api/client.ts minimal; refresh single-flight — a ready-made recipe in docs/api-layer.md, NOT in code | The lead's requirement: don't carry speculative code for a backend that doesn't exist yet | A backend refresh endpoint appearing |
| api/queries/<domain>/ subfolders; DTOs via type in types/api.ts; type over interface everywhere (except merging augmentations) | The lead's requirements from the batch-2 review | — |
| Modals: only ModalCore (radix-ui@1.6.2 Dialog, parent-owned); the global manager — a recipe in docs/modals.md | The lead trimmed scope: "just a minimal modal and that's it." Both patterns are described in the docs | — |
| i18n: i18next 26 + detector, typed keys, RTL (dir+lang on languageChanged), endonyms in constants/languages.ts | Endonyms are the lead's requirement (recognize your own language from a foreign locale). The lang attribute was added during the batch-3 review | — |
| Tests: Vitest 4.1.10, root-level __tests__/ mirroring src, coverage 80/75/70/80 scope utils+ui+store | The lead's convention (as in both reference projects). 46 tests, coverage 92/76/93/95 | — |
| Storybook 10.5.0, stories in root-level stories/ (NOT co-located) | The lead: "same as __tests__ at the root" | — |
| Commitlint conventional, body ≤100 chars; pre-commit lint-staged; pre-push type-check+test | Same as the reference projects, verified with negative tests | — |

## 3. Timeline of disputes and fixes (important for understanding "why it's this way")

1. **Zod resolver**: I claimed "the official one supports v4" → the lead was skeptical →
   checking the issues showed #842 was still open → kept the custom one. Lesson: an unverified
   "supports" doesn't count.
2. **Toasts**: my version had "errors toast by default" → the lead flipped it to opt-in.
3. **client.ts**: my "ready-made refresh scaffold" (~60 lines) → the lead: "docs, not code."
4. **UI kit scope**: the plan had ~16 components → the lead trimmed it to 8 (Button,
   Input+Controlled, ToastMessage, Skeleton, Tooltip, 2 loaders, Icon) — the rest will be ported
   by devs as needed.
5. **Styling phase**: trimmed down to tokens+reset+theme mechanics; typography/fonts are Jira tickets.
6. **ThemeSwitcher/LanguageSwitcher**: a dispute over "blocks or ui" → the rule's wording was
   clarified: the criterion isn't "business logic" but COUPLING (knowledge of store/api); the
   switchers are local to the layout (the promotion rule), not in blocks and not in ui.
7. **baseUrl**: removed from tsconfig (deprecated in TS 6+, paths works without it) — the lead
   noticed it from his IDE's warning.
8. **Found during my own reviews**: the pnpm Node conflict (batch 1), gaps in the store/hooks
   zones (batch 1), a Times fallback font from a missing font-family (batch 3, found via a
   browser check), html lang not updating on language change (batch 3).

## 4. Known TODOs and trade-offs (not bugs)

- Font — the system-ui stack; typography is minimal; the exact `--gradient-linear` stops are a
  placeholder. All of it is waiting on values from Figma (Jira tickets).
- The refresh flow isn't implemented (no backend) — the recipe is in docs/api-layer.md.
- Only 2–3 icons; Input is trimmed relative to the broker project (no numeric/copy variants).
- No global modal manager — the recipe is in docs/modals.md.
- @tanstack/react-virtual wasn't installed (add it once long lists appear).
- SETUP_NOTES item 1: on this machine pnpm runs with a Node 24 PATH prefix
  (`export PATH="/Users/zeddz/.nvm/versions/node/v24.13.1/bin:$PATH"`), don't call `nvm use` in the repo.
- A requirement for the backend (to record once it exists): errors must carry a `code` field for
  mapping to `errors.*` keys.

## 5. Auditor checklist

Versions and ecosystem (all via `npm view <pkg> version peerDependencies` as of the audit date):
- [ ] None of the pins in package.json have fallen critically behind; safe minor updates.
- [ ] Is react-hook-form/resolvers#842 closed? → migrate to the official zodResolver.
- [ ] Does eslint-plugin-react support ESLint 10? → upgrade eslint + @eslint/js.
- [ ] Does typescript-eslint support TS 6/7? → upgrade typescript (and while at it, restore the
      deprecated-tsconfig-options check).
- [ ] Vite 8.x / Vitest 4.x / Storybook 10.x — minor patches, breaking changes in the changelog.
- [ ] Is Node 24 still an active LTS; any pnpm major bump.
- [ ] Every link from the decision log (§2) and docs/: alive, not redirecting elsewhere,
      publication date doesn't invalidate the conclusion; blog-post conclusions re-verified
      against current official docs.

Architecture and code:
- [ ] eslint.config.js zones ↔ docs/architecture.md ↔ SETUP_PLAN's "Import direction" —
      haven't drifted apart.
- [ ] No barrels/interfaces/hardcoded strings/import.meta.env outside env.ts (greps).
- [ ] en/uk/ar locales are in sync in shape (satisfies in resources.ts) and translations make sense.
- [ ] Full run: install --frozen-lockfile, build, lint, format:check, type-check,
      test:coverage, build-storybook.
- [ ] In the browser: both themes, ar→RTL+lang, the modal, lazy chunks.

Decisions WORTH re-arguing (deliberately debatable, the lead is open to arguments backed by proof):
- [ ] A central api/ vs. co-locating query hooks by feature (TkDodo recommends co-location;
      we chose centralized for reusability and team habit — still right?)
- [ ] Scale-based tokens with no semantic layer — has the design introduced non-invertible
      cases that need component-level tokens?
- [ ] SPA without SSR — have the product's SEO requirements changed?
- [ ] The blanket barrel ban — is it causing friction for the team in practice?

Audit result format: a report with sections "confirm / propose changing (with proof) /
outdated (with a migration)", + a PR with safe updates separate from disputed proposals.
