// Read-only check after a Signal K server update; fails on reintroduced stock FSK.
import { existsSync } from 'node:fs';
const expected = '@j070nl/freeboard-openbridge';
const origin = process.argv[2] ?? 'http://127.0.0.1:3000';
for (const path of [
  '/home/pi/.signalk/node_modules/@signalk/freeboard-sk',
  '/usr/lib/node_modules/signalk-server/node_modules/@signalk/freeboard-sk'
]) {
  if (existsSync(path)) throw new Error('Stock Freeboard reintroduced: ' + path);
}
const response = await fetch(new URL('/skServer/webapps', origin));
if (!response.ok) throw new Error('Cannot read application inventory');
const apps = (await response.json()).filter((app) => app.name.includes('freeboard'));
if (apps.length !== 1 || apps[0].name !== expected) throw new Error('Unexpected Freeboard discovery');
const legacy = await fetch(new URL('/@signalk/freeboard-sk/?embed=true', origin), { redirect: 'manual' });
if (legacy.status !== 307 || legacy.headers.get('location') !== '/@j070nl/freeboard-openbridge/?embed=true') {
  throw new Error('Legacy Freeboard URL is not redirected');
}
const current = await fetch(new URL('/@j070nl/freeboard-openbridge/', origin));
if (!current.ok) throw new Error('Own Freeboard is not served');
console.log('PASS: sole own Freeboard, canonical URL and legacy redirect');
