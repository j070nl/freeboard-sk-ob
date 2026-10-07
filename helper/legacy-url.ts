import type { Application } from 'express';

const LEGACY = '/@signalk/freeboard-sk';
const CURRENT = '/@j070nl/freeboard-openbridge';

/** Preserve SKIP/bookmarks on either HTTP or HTTPS without a second package. */
export function registerLegacyUrl(server: Pick<Application, 'get'>) {
  server.get(/^\/@signalk\/freeboard-sk(?:\/.*)?$/, (req, res) => {
    const suffix = req.originalUrl.slice(LEGACY.length);
    res.setHeader('Cache-Control', 'no-store');
    res.redirect(307, CURRENT + (suffix.startsWith('/') ? suffix : '/' + suffix));
  });
}
