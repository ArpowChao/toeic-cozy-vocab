import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('../../public/sw.js', import.meta.url), 'utf8');

describe('service worker update strategy', () => {
  it('uses a new cache version and network-first navigation so deployments are visible', () => {
    expect(source).toContain("const CACHE_NAME = 'cozy-toeic-v4'");
    expect(source).toContain("event.request.mode === 'navigate'");
    expect(source).toContain('fetch(event.request)');
  });
});
