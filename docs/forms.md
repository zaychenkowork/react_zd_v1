# Формы

Стек: `react-hook-form` + `zod` (v4) через кастомный резолвер + Controlled-обёртки ui-компонентов.

## Почему кастомный резолвер, а не `@hookform/resolvers`

`@hookform/resolvers` — официальный пакет с адаптерами схем (`zodResolver` и т.п.) для RHF — на
момент сетапа **не поддерживает Zod 4** корректно: открыт
[react-hook-form/resolvers#842](https://github.com/react-hook-form/resolvers/issues/842)
(типовой оверлоад ломается на Zod 4.3+), предложенный фикс (#840) на момент сетапа не смержен.

Решение — `src/utils/zod4Resolver.ts`, копия резолвера с той же сигнатурой (`Resolver<TFieldValues>`),
написанная под `z.core.$ZodIssue`/`safeParse` Zod 4 напрямую, без зависимости от `@hookform/resolvers`.

**Критерий миграции на официальный резолвер:** issue #842 закрыт **и** вышедшая версия
`@hookform/resolvers` с фиксом опубликована на npm с peer-диапазоном, включающим `zod@4.x`.
Проверка актуальности этого условия — часть чек-листа `.claude/skills/code-review/SKILL.md`.
Когда условие выполнено — миграция это замена импорта
(`import { zod4Resolver } from '~/utils/zod4Resolver'` → `import { zodResolver } from '@hookform/resolvers/zod'`)
без изменения схем или Controlled-компонентов.

## Схемы

Zod-схемы форм живут в `src/schemas/`, рядом со схемой env (`schemas/env.ts`) — не в `types/`,
так как это runtime-валидаторы, а не только типы. Сообщения ошибок в схеме — **i18n-ключи**, не
готовый текст на языке разработки:

```ts
// src/schemas/loginSchema.ts
export const loginSchema = z.object({
  email: z.string('required').min(1, 'required').pipe(z.email('invalidEmail')),
  password: z.string('required').min(1, 'required').min(8, 'minLength'),
});
```

`'required'`, `'invalidEmail'`, `'minLength'` — ключи под неймспейсом `validation.*` в
`i18n/locales/*/translation.json`, не текст сам по себе.

## Controlled-паттерн

`ui/components/Input/ControlledInput.tsx` оборачивает `ui/components/Input/Input.tsx` (презентационный
компонент без RHF) в `useController` из RHF и переводит ошибку:

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

`fieldState.error.message` — это runtime-строка (ключ из схемы), поэтому её нельзя типизировать
как литеральный union ключей перевода статически — тот же паттерн, что `showErrorToast` в
`app/providers/queryClient.ts` (см. `docs/api-layer.md`), поэтому `as never` перед `t(...)`.

Использование в форме — `src/utils/zod4Resolver.ts` как `resolver`, `ControlledInput` на каждое
поле (пример — `__tests__/ui/components/Input/ControlledInput.test.tsx` и
`stories/ui/components/Input/ControlledInput.stories.tsx`):

```tsx
const { control, handleSubmit } = useForm<LoginFormValues>({
  resolver: zod4Resolver<LoginFormValues>(loginSchema),
  defaultValues: { email: '', password: '' },
});

<ControlledInput name="email" control={control} placeholder="Email" />
```

Новое поле формы = новая ключевая пара в схеме (`schemas/<name>Schema.ts`) + `ControlledInput` с
тем же `name` — без ручной синхронизации типов, `LoginFormValues` выводится из схемы через
`z.infer`.
