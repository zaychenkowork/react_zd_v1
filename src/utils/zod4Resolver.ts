import type {
  FieldError,
  FieldErrors,
  FieldValues,
  Resolver,
  ResolverResult,
} from 'react-hook-form';
import { appendErrors } from 'react-hook-form';
import * as z from 'zod';

type ZodIssue = z.core.$ZodIssue;

function parseZodIssues(
  zodErrors: ZodIssue[],
  validateAllFieldCriteria: boolean,
) {
  const errors: Record<string, FieldError> = {};

  while (zodErrors.length) {
    const error = zodErrors[0];
    const { code, message, path } = error;
    const fieldPath = path.join('.');

    if (!errors[fieldPath]) {
      if (
        code === 'invalid_union' &&
        'errors' in error &&
        Array.isArray(error.errors) &&
        error.errors.length
      ) {
        const unionError = error.errors[0][0];

        errors[fieldPath] = {
          message: unionError.message,
          type: unionError.code,
        };
      } else {
        errors[fieldPath] = {
          message,
          type: code,
        };
      }
    }

    if (
      code === 'invalid_union' &&
      'errors' in error &&
      Array.isArray(error.errors)
    ) {
      error.errors.forEach((unionErrors: ZodIssue[]) =>
        unionErrors.forEach((e) =>
          zodErrors.push({
            ...e,
            path: [...error.path, ...e.path],
          } as ZodIssue),
        ),
      );
    }

    if (validateAllFieldCriteria) {
      errors[fieldPath] = appendErrors(
        fieldPath,
        validateAllFieldCriteria,
        errors,
        code,
        error.message,
      ) as FieldError;
    }

    zodErrors.shift();
  }

  return errors;
}

/**
 * Zod v4 resolver for react-hook-form.
 * Replaces @hookform/resolvers, which does not support Zod v4 yet:
 * https://github.com/react-hook-form/resolvers/issues/842
 */
export const zod4Resolver =
  <TFieldValues extends FieldValues>(
    schema: z.ZodType,
  ): Resolver<TFieldValues> =>
  async (
    values: TFieldValues,
    _context: unknown,
    options: { criteriaMode?: 'firstError' | 'all' } = {},
  ): Promise<ResolverResult<TFieldValues>> => {
    const result = schema.safeParse(values);

    if (result.success) {
      return {
        values: result.data as TFieldValues,
        errors: {} as Record<string, never>,
      };
    }

    return {
      values: {} as Record<string, never>,
      errors: parseZodIssues(
        [...result.error.issues],
        options.criteriaMode === 'all',
      ) as FieldErrors<TFieldValues>,
    };
  };
