import { describe, it, expect } from 'vitest';
import { resolveLegacyHash } from './legacyRedirect';

const map = { '167': 'control-your-home', '2': 'coffeescript-js-done-right' };

describe('resolveLegacyHash (feature 004 TC-04)', () => {
  it('maps static legacy hash routes to new paths', () => {
    expect(resolveLegacyHash('#talks', map)).toBe('/talks');
    expect(resolveLegacyHash('#present', map)).toBe('/talk-requests');
    expect(resolveLegacyHash('#jobs', map)).toBe('/jobs');
    expect(resolveLegacyHash('#contact', map)).toBe('/contact');
    expect(resolveLegacyHash('#findus', map)).toBe('/find-us');
    expect(resolveLegacyHash('#conduct', map)).toBe('/code-of-conduct');
    expect(resolveLegacyHash('#home', map)).toBe('/');
  });

  it('tolerates a missing leading #', () => {
    expect(resolveLegacyHash('talks', map)).toBe('/talks');
  });

  it('maps #talk-<id> to the talk slug when known', () => {
    expect(resolveLegacyHash('#talk-167', map)).toBe('/talks/control-your-home');
    expect(resolveLegacyHash('#talk-2', map)).toBe('/talks/coffeescript-js-done-right');
  });

  it('falls back to /talks for an unknown talk id (no hard error)', () => {
    expect(resolveLegacyHash('#talk-99999', map)).toBe('/talks');
  });

  it('returns null for the bare root and unknown hashes (no redirect loop)', () => {
    expect(resolveLegacyHash('', map)).toBeNull();
    expect(resolveLegacyHash('#', map)).toBeNull();
    expect(resolveLegacyHash('#something-else', map)).toBeNull();
  });
});
