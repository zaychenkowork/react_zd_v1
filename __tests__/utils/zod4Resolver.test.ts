import { describe, expect, it } from 'vitest';
import * as z from 'zod';

import { zod4Resolver } from '~/utils/zod4Resolver';

const defaultOptions = {
  fields: {},
  shouldUseNativeValidation: false,
} as const;

describe('zod4Resolver', () => {
  it('returns parsed values and no errors when input is valid', async () => {
    const schema = z.object({
      email: z
        .string('required')
        .min(1, 'required')
        .pipe(z.email('invalidEmail')),
      password: z.string('required').min(1, 'required').min(8, 'minLength'),
    });
    type FormValues = z.infer<typeof schema>;
    const resolver = zod4Resolver<FormValues>(schema);

    const result = await resolver(
      { email: 'test@mail.com', password: '12345678' },
      undefined,
      defaultOptions,
    );

    expect(result.values).toEqual({
      email: 'test@mail.com',
      password: '12345678',
    });
    expect(result.errors).toEqual({});
  });

  it('returns a translation-key message for each invalid field when input is invalid', async () => {
    const schema = z.object({
      email: z
        .string('required')
        .min(1, 'required')
        .pipe(z.email('invalidEmail')),
      password: z.string('required').min(1, 'required').min(8, 'minLength'),
    });
    type FormValues = z.infer<typeof schema>;
    const resolver = zod4Resolver<FormValues>(schema);

    const result = await resolver(
      { email: '', password: '' },
      undefined,
      defaultOptions,
    );

    expect(result.values).toEqual({});
    expect(result.errors.email?.message).toBe('required');
    expect(result.errors.password?.message).toBe('required');
  });

  it('resolves a single field error without affecting valid sibling fields', async () => {
    const schema = z.object({
      email: z
        .string('required')
        .min(1, 'required')
        .pipe(z.email('invalidEmail')),
      password: z.string('required').min(1, 'required').min(8, 'minLength'),
    });
    type FormValues = z.infer<typeof schema>;
    const resolver = zod4Resolver<FormValues>(schema);

    const result = await resolver(
      { email: 'test@mail.com', password: '123' },
      undefined,
      defaultOptions,
    );

    expect(result.errors.email).toBeUndefined();
    expect(result.errors.password?.message).toBe('minLength');
  });

  it('unwraps the first branch error when every union member fails', async () => {
    const unionSchema = z.object({
      id: z.union([
        z.string().min(3, 'tooShort'),
        z.number().min(10, 'tooSmall'),
      ]),
    });
    type UnionValues = z.infer<typeof unionSchema>;
    const unionResolver = zod4Resolver<UnionValues>(unionSchema);

    const result = await unionResolver(
      { id: true } as unknown as UnionValues,
      undefined,
      defaultOptions,
    );

    expect(result.errors.id).toBeDefined();
    expect(result.errors.id?.type).toBe('invalid_type');
  });

  it('collects every failing criterion for a field when criteriaMode is "all"', async () => {
    const strictSchema = z.object({ code: z.string().min(3, 'tooShort') });
    type StrictValues = z.infer<typeof strictSchema>;
    const strictResolver = zod4Resolver<StrictValues>(strictSchema);

    const result = await strictResolver(
      { code: '' } as StrictValues,
      undefined,
      {
        ...defaultOptions,
        criteriaMode: 'all',
      },
    );

    expect(result.errors.code?.types).toBeDefined();
  });
});
