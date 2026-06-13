import { describe, it, expect, vi, afterEach } from 'vitest';
import { strapiFetch, populate, useFixtures } from './strapi';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('strapiFetch fail-loud (feature 002 TC-06)', () => {
  it('throws when STRAPI_API_URL is unset (no silent empty)', async () => {
    vi.stubEnv('STRAPI_API_URL', '');
    await expect(strapiFetch('/api/talks')).rejects.toThrow(/STRAPI_API_URL is not set/);
  });

  it('throws "unreachable" when the network fetch rejects', async () => {
    vi.stubEnv('STRAPI_API_URL', 'http://127.0.0.1:1');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('ECONNREFUSED')),
    );
    await expect(strapiFetch('/api/talks')).rejects.toThrow(/unreachable/i);
  });

  it('throws on a non-2xx response (does not return empty data)', async () => {
    vi.stubEnv('STRAPI_API_URL', 'https://cms.example');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'boom',
      }),
    );
    await expect(strapiFetch('/api/talks')).rejects.toThrow(/failed: 500/);
  });
});

describe('populate / useFixtures helpers', () => {
  it('builds populate query fragments', () => {
    expect(populate('*')).toBe('populate=*');
    expect(populate(['speakers', 'event'])).toBe(
      'populate[0]=speakers&populate[1]=event',
    );
  });

  it('uses fixtures when no STRAPI_API_URL is set', () => {
    vi.stubEnv('STRAPI_API_URL', '');
    expect(useFixtures()).toBe(true);
  });
});
