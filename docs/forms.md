# Forms

Stack: `react-hook-form` + `zod` (v4) via a custom resolver + Controlled wrappers around ui components.

## Why a custom resolver instead of `@hookform/resolvers`

`@hookform/resolvers` — the official package with schema adapters (`zodResolver` etc.) for RHF — at
setup time **doesn't correctly support Zod 4**: [react-hook-form/resolvers#842](https://github.com/react-hook-form/resolvers/issues/842)
is open (the type overload breaks on Zod 4.3+), and the proposed fix (#840) wasn't merged at setup time.

The solution — `src/utils/zod4Resolver.ts`, a copy of the resolver with the same signature (`Resolver<TFieldValues>`),
written directly against Zod 4's `z.core.$ZodIssue`/`safeParse`, with no dependency on `@hookform/resolvers`.

**Migration criterion for the official resolver:** issue #842 is closed **and** a released
version of `@hookform/resolvers` with the fix is published on npm with a peer range that
includes `zod@4.x`. Checking whether this condition still holds is part of the checklist in
`.claude/skills/code-review/SKILL.md`. Once the condition is met, migrating is just swapping the
import (`import { zod4Resolver } from '~/utils/zod4Resolver'` → `import { zodResolver } from '@hookform/resolvers/zod'`)
with no changes to schemas or Controlled components.

## Schemas

Form Zod schemas live in `src/schemas/`, alongside the env schema (`schemas/env.ts`) — not in
`types/`, since these are runtime validators, not just types. Error messages in the schema are
**i18n keys**, not text hardcoded in the development language:

```ts
// src/schemas/loginSchema.ts
export const loginSchema = z.object({
  email: z.string('required').min(1, 'required').pipe(z.email('invalidEmail')),
  password: z.string('required').min(1, 'required').min(8, 'minLength'),
});
```

`'required'`, `'invalidEmail'`, `'minLength'` are keys under the `validation.*` namespace in
`i18n/locales/*/translation.json`, not text on their own.

## Controlled pattern

`ui/components/Input/ControlledInput.tsx` wraps `ui/components/Input/Input.tsx` (a presentational
component with no RHF) in `useController` from RHF and translates the error:

```ts
const { field, fieldState } = useController({ name, control, rules, defaultValue });
const errorMessage = fieldState.error?.message;

<Input
  name={field.name}
  value={field.value ?? ''}
  setValue={(value) => field.onChange(value)}
  errorText={errorMessage ? t(`validation.${errorMessage}` as never) : undefined}
  {...rest}
/>
```

`fieldState.error.message` is a runtime string (a key from the schema), so it can't be statically
typed as a literal union of translation keys — the same pattern as `showErrorToast` in
`app/providers/queryClient.ts` (see `docs/api-layer.md`), hence the `as never` before `t(...)`.

Usage in a form — `src/utils/zod4Resolver.ts` as the `resolver`, `ControlledInput` for each
field (example — `__tests__/ui/components/Input/ControlledInput.test.tsx` and
`stories/ui/components/Input/ControlledInput.stories.tsx`):

```tsx
const { control, handleSubmit } = useForm<LoginFormValues>({
  resolver: zod4Resolver<LoginFormValues>(loginSchema),
  defaultValues: { email: '', password: '' },
});

<ControlledInput name="email" control={control} placeholder="Email" />
```

A new form field = a new key-pair in the schema (`schemas/<name>Schema.ts`) + a `ControlledInput`
with the same `name` — no manual type syncing needed, `LoginFormValues` is inferred from the
schema via `z.infer`.
