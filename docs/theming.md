# Theming

## Tokens

`src/styles/tokens.css` — CSS custom properties on `:root`, scale-based, not semantic names
(`--color-grey-500`, not `--color-text-secondary`) — the palette came straight from the design as-is.
Scales:

- `--color-primary-{0,950}` — the endpoints of the primary scale (white/black).
- `--color-grey-{100..950}`, `--color-red-{50,400,500,950}`, `--color-green-{50,400,500,950}`,
  `--color-blue-{50,400,500,950}`, `--color-coral-{50,100}`.
- `--gradient-linear` — a placeholder (see `TODO(design)` in the file): exact color stops are
  waiting on final values from Figma.

## Dark theme = scale inversion

The dark theme doesn't introduce new tokens — it **overrides the same names** under
`[data-theme='dark']` by inverting the scale (what was `100` in light becomes the value that was
`900` in dark, and vice versa):

```css
:root {
  --color-grey-100: #f7f7f7;
  --color-grey-900: #1a1a1a;
}
[data-theme='dark'] {
  --color-grey-100: #1a1a1a; /* was --color-grey-900 in light */
  --color-grey-900: #f7f7f7; /* was --color-grey-100 in light */
}
```

Components only use the token name (`var(--color-grey-900)`) — switching themes requires no
changes to component CSS modules, only flipping the attribute on `<html>`.

## Switching mechanics

`document.documentElement.dataset.theme` is the single switch. It's set:

- on startup — `src/store/useThemeStore.ts` initializes the theme from `localStorage`
  (`STORAGE_KEYS.theme`, `zustand/middleware/persist`), and if there's nothing in storage,
  from `prefers-color-scheme`;
- on toggling — `setTheme`/`toggleTheme` from the store, wrapped by `hooks/useTheme.ts` (a thin
  wrapper with no business logic — the store itself holds that).

`ThemeSwitcher` (`components/ThemeSwitcher/`) is the sole
consumer of `useTheme` today; for why it isn't in `components/ui/`, see `docs/architecture.md`.

RTL is set separately, from i18n (`document.documentElement.dir`), not from the theme — see
`docs/i18n.md`.

## Adding a token

1. Add the variable to `:root` in `tokens.css` with the light value.
2. Add the same variable under `[data-theme='dark']` with the dark value (usually the mirrored
   value of the same scale, see the inversion table above).
3. Use `var(--token-name)` in the component's CSS module — don't hardcode hex values.

## Icons inherit the theme color

`vite.config.ts`, `svgr({ svgrOptions: { replaceAttrValues: { '#0B0B0C': 'currentColor' } } })` —
the SVGR transform replaces the fixed fill/stroke color in the source SVG (`#0B0B0C`, black —
the color icons are usually exported in from Figma) with `currentColor`, so `components/ui/Icon/Icon.tsx`
can control the icon's color via CSS (`stroke`/`color`) — including via theme tokens — without
touching the SVG file itself. A new icon added to `assets/icons/` must use the same source
color `#0B0B0C`, otherwise the transform won't pick it up.

Icons are imported via the alias (`~/assets/icons/chevron.svg`), not a relative path: typing for
`.svg` imports is ambiguous (the base `vite/client` types declare a generic `*.svg` → `string`,
while the SVGR transform turns **all** `**/*.svg` into a component regardless of whether the
`?react` suffix is present). A targeted augmentation, `declare module '~/assets/icons/*.svg'` in
`src/vite-env.d.ts`, overrides the generic `*.svg` pattern for exactly this path (TS picks the
most specific matching wildcard), typing the import as `FC<SVGProps<SVGSVGElement>>` without
relying on `vite-plugin-svgr/client` types (which only describe the `?react` suffix, which this
template doesn't use — see `docs/testing.md` for why `?react` doesn't work under vitest either).

## Typography and fonts — deliberately minimal

`styles/typography.css` contains only `.text-body`/`.text-heading` — a full scale
(weights, sizes, line-height) and font files in `assets/fonts/` will be added per design-ticket work
after setup, and aren't part of the template's scope.
