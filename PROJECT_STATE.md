# Project state

## Standalone Freeboard OpenBridge ACTIVE — 2026-10-07

Installed @j070nl/freeboard-openbridge 3.2.1-openbridge.2, code commit 7d6884f7,
branch openbridge/standalone. Canonical /@j070nl/freeboard-openbridge/; legacy URL
307-redirect preserves SKIP. One own webapp verified; both local stock 3.1.1 and
server-bundled stock 2.24.2 archived outside module discovery. Removed only the
stock optional dependency from server package metadata; no server code patched.
Existing helper ID freeboard-sk/profile ID freeboard retained. Two short Signal K
restarts were needed after discovering the global fallback; PyPilot PID unchanged.
3139 package files and 538 HTTP assets verified, both HTTPS routes verified;
23 helper/profile/resource files unchanged. 21 helper and 18 selected UI tests,
full build, packed-helper load and lint passed. No field test or production rollback.
[Release/rollback](/home/pi/openplotter-project/releases/2026-10-07_121845_freeboard-standalone/README.md).
Next: operator reload/field check. After Signal K updates run
`node dev-tools/openbridge-release/check-active.mjs` to catch stock reintroduction.
Earlier source/package/deployment identities below are historical.

## Standalone package prepared — 2026-10-07

Branch openbridge/standalone; @j070nl/freeboard-openbridge 3.2.1-openbridge.2.
Own app name/URL/PWA scope; helper ID and app/profile ID retained. Legacy URL
redirect preserves SKIP and bookmarks without a second package. Dependencies
bundled in installation archive. 21 helper tests, 18 targeted UI tests, complete
helper/web build and packed-helper load pass. Targeted lint/diff checks apply.
Deployment/rollback evidence will be recorded in central SYSTEM_STATE.md.
See STANDALONE_PACKAGE.md; prior package identity notes below are historical.

## Freeboard OpenBridge 3.2.1 LIVE — 2026-10-07

User-authorized static frontend deployment from integration commit 53ace85a.
300 files verified on disk and Signal K HTTP; same /@signalk/freeboard-sk/ URL.
Helper/package metadata 3.1.1 unchanged; no restart, profile/resource change or
hardware commands. Original source checkout remains the baseline; the integration
worktree supplies the live artifact. Full previous 487-file frontend was restored
and hash-verified in a temporary directory before publication; production rollback
not executed. Prior 101 focused tests/build apply; field checks remain with user.
[Release and exact rollback](/home/pi/openplotter-project/releases/2026-10-07_112348_freeboard-3.2.1-openbridge.1/README.md).
Next: operator reload/field check. User wants eventual upstream-package removal;
that requires a separate own-package migration preserving helper/settings/SKIP
URLs. Do not uninstall the current package while these still depend on it.
Earlier candidate/not-deployed statements below are historical.

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
