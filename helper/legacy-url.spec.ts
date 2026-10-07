import { describe, expect, it, vi } from 'vitest';
import type { Application } from 'express';
import { registerLegacyUrl } from './legacy-url';

describe('legacy Freeboard URL', () => {
  it.each([
    ['/ @signalk/freeboard-sk', false],
    ['/@signalk/freeboard-sk', true],
    ['/@signalk/freeboard-sk/', true],
    ['/@signalk/freeboard-sk/assets/icon.svg', true],
    ['/@signalk/freeboard-sk-other/', false]
  ])('matches only the exact old application prefix: %s', (path, matches) => {
    const get = vi.fn();
    registerLegacyUrl({ get } as unknown as Pick<Application, 'get'>);
    expect(get.mock.calls[0][0].test(path)).toBe(matches);
  });
  it.each([
    ['', '/'], ['?embed=true', '/?embed=true'],
    ['/main-old.js?x=1', '/main-old.js?x=1']
  ])('preserves suffix %s without caching the migration', (suffix, expected) => {
    const get = vi.fn();
    registerLegacyUrl({ get } as unknown as Pick<Application, 'get'>);
    const res = { setHeader: vi.fn(), redirect: vi.fn() };
    get.mock.calls[0][1]({ originalUrl: '/@signalk/freeboard-sk' + suffix }, res);
    expect(res.redirect).toHaveBeenCalledWith(307, '/@j070nl/freeboard-openbridge' + expected);
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
  });
});
