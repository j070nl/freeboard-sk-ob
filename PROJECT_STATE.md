# Project state

## Freeboard 3.2.1 OpenBridge candidate — 2026-10-07

This checkout is the isolated integration worktree at
`/home/pi/openplotter-project/worktrees/freeboard-3.2.1`, branch
`openbridge/upstream-3.2.1`, version **3.2.1-openbridge.1**.
The original `/home/pi/freeboard-openbridge` checkout retains its baseline branch.
Own fork: https://github.com/j070nl/freeboard-sk-ob.

Baseline commit `d61be436` records all 152 previously modified/untracked custom
files. Upstream v3.2.1 (`7620379c`) merged without textual conflicts; 16 overlapping
source/package files reviewed. OpenBridge components, four palettes, local fonts,
SKIP handshake/visibility and AIS repair contracts retained. Plotter Extensions
bus is now 0.15.0; OpenBridge remains 2.0.0-next.162.

## Verification

- `npm run test:openbridge`: **101 tests, 15 files passed**. Themes, brightness,
  controls, iframe visibility/map retention, AIS filters/expiry/identity recovery,
  magnetic orientation, app/panel behavior, settings, trail return and extension
  route metadata. App HTTP explicitly mocked; no hardware command verification.
- Existing recovery test extended: expired magnetic data is not restored, and
  fresh heading/variation correctly reorients the recovered target.
- Upstream panel tests adapted to OpenBridge selectors. Two AIS leaf specs load
  through the app root to avoid the existing circular import graph, with isolation
  retained. No production logic changed for these test adjustments.
- Targeted ESLint and integration `git diff --check` passed.
- `npm run build:web` passed with strict templates; initial bundle 4.76 MB.
  Warnings: 4 MB advisory budget exceeded, CommonJS dependencies and the
  upstream template warning below. None treated as a passed field test.
- Known upstream warning: active-resource-dialog lacks a cdkDragPlaceholder import.
  Full upstream test suite and physical/browser field checks were not performed.

## Live state — unchanged by this task

Installed `/home/pi/.signalk/node_modules/@signalk/freeboard-sk` still reports
package metadata 3.1.1 with custom later-based frontend. Latest verified frontend:
`/home/pi/freeboard-releases/20260929-180555-ais-recovery-live`, 293 manifest files.
Frontend deployment does not imply upgrading the installed helper/package.
Do not install stock upstream over the custom frontend. This candidate has not
been deployed, published to npm or linked into Signal K.

## Contracts to retain

- `freeboard:theme` v1 / `freeboard:theme-ready`: exact parent/origin validation;
  bright/day/dusk/night, manual override, browser brightness.
- Rendering can pause in a retained iframe without stopping navigation data or
  losing map view/geometry. Signal K resources and route-point metadata are shared.
- AIS age comes from position timestamps; reject old positions, timer-driven
  cleanup, six/nine-minute stale/expiry defaults, bounded 2000-entry identity cache.
  Do not restore expired motion/position. Preserve startup settings-before-replay,
  radius handling and unknown classification guard.
- Canonical WGS84 data must remain separate from rendered world copies.
- Helper source matches upstream 3.2.1; installed compiled helper equivalence has
  not been established. Keep helper replacement separate from frontend publication.

## Next step and recovery limits

See [integration guide](OPENBRIDGE_INTEGRATION.md) for reproducible checks.
After successful candidate verification, prepare the frontend release and verified
rollback inputs for a separately reviewed deployment. Preserve runtime resources,
profiles and browser-local state before any migration. No restore rehearsal was
performed in this task; source recovery is not whole-system recovery.

Historical deployment/repair evidence remains in
[handoff](FREEBOARD_OPENBRIDGE_HANDOFF.md),
[UI guidelines](OPENBRIDGE_FREEBOARD_GUIDELINES.md), and
[release guide](dev-tools/openbridge-release/README.md).
The central system state is `/home/pi/openplotter-project/SYSTEM_STATE.md`.
