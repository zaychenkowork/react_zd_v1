import type { AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';

import { fetcher } from '~/api/fetcher';

function createResponse<T>(data: T): AxiosResponse<T> {
  return { data } as AxiosResponse<T>;
}

describe('fetcher', () => {
  it('returns the response data when the request resolves', async () => {
    const result = await fetcher(Promise.resolve(createResponse({ id: 1 })));

    expect(result).toEqual({ id: 1 });
  });

  it('rejects with the original error when the request rejects', async () => {
    await expect(
      fetcher(Promise.reject(new Error('network error'))),
    ).rejects.toThrow('network error');
  });
});
