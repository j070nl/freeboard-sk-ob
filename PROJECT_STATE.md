# Project state

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

## Current source and tested integration — 2026-10-07

All prior custom tracked/untracked work was committed as baseline `d61be436`.
This original checkout remains on `fix/ais-target-lifecycle`, package version
3.2.0-beta.4; its application files have not been replaced by the integration.
The older descriptions of dirty/untracked work below are historical snapshots.

The separate candidate at `/home/pi/openplotter-project/worktrees/freeboard-3.2.1`
is version **3.2.1-openbridge.1**, branch `openbridge/upstream-3.2.1`, merge commit
`53ace85af81a5d7a8514542e5e2ce7b9292c1f36`. Pushed successfully to
https://github.com/j070nl/freeboard-sk-ob/tree/openbridge/upstream-3.2.1.
That history includes the baseline and upstream v3.2.1; no force-push or npm release.
101 focused tests in 15 files, targeted lint, strict-template production web build
and integration diff check passed. Build warnings: advisory bundle size, CommonJS,
and upstream cdkDragPlaceholder import. Tests use fixtures; no field validation.

All 293 live frontend manifest hashes still match the previous release. No runtime
files, configs, services or hardware changed. Next: prepare/review a frontend
release and rollback inputs before deployment. Source restore is documented in
central RECOVERY.md; no operational restore rehearsal occurred.
[Step 2 evidence](/home/pi/openplotter-project/recovery/freeboard-3.2.1-step2/REPORT.md).

## Historical state below — superseded where noted above

## Freeboard 3.2.1 step-1 comparison — 2026-10-07

Compared current tracked and untracked custom source with official 3.2.1
(7620379c). Zero textual conflicts; 16 overlapping source/package files need
focused semantic verification. All 293 live frontend files match the existing
release; source unchanged before documentation updates. No application tests,
build, install or deployment performed. Next: complete isolated candidate,
compact OpenBridge/SKIP/AIS and upstream-intersection checks, one strict web
build. User requests minimal unrelated upstream testing and will field-test.
[Plan and evidence](/home/pi/openplotter-project/recovery/freeboard-3.2.1-step1/PLAN.md).

## Purpose

Custom Freeboard chart application with OpenBridge presentation and AIS repairs.
Angular frontend with OpenLayers mapping and a separate Signal K helper plugin.
See [system overview](/home/pi/openplotter-project/PROJECT_STATE.md).

## Current live/deployed state

- Installed package: `/home/pi/.signalk/node_modules/@signalk/freeboard-sk`.
  Metadata reports **3.1.1**, but deployed frontend is custom later-based work.
- Latest verified frontend release:
  `/home/pi/freeboard-releases/20260929-180555-ais-recovery-live`.
  All 293 manifest files match installed `public/` by SHA-256.
- Frontend deployment did not imply upgrading helper/package metadata.
- OPENBRIDGE_RELEASE.md starts with an older icon release; use the newer
  handoff plus manifest evidence above when identifying the current deployment.

## Current development state

Source manifest: **3.2.0-beta.4**. HEAD at inspection:
`04d6ad65` (AIS expiry/restoration repair), after later upstream chart fixes.
88 tracked files were already modified; substantial untracked OpenBridge source,
styles, fonts, preview and release tooling also exists. A Git diff alone is
insufficient backup. This task only updates AGENTS.md and adds this state file.

## Important architecture

- `src/app/`: frontend; `helper/`: server helper; `public/`: generated webapp.
- OpenLayers 10.10.0 in local lock; MapLibre style handling is not MapLibre GL.
- Central theme service sets `html[data-obc-theme]`; bright/day/dusk/night.
- Chart imagery, symbols and UI have distinct brightness/semantic roles.
- Runtime settings/resources and browser storage are separate from source/build.

## Important integrations

- SKIP embeds `/@signalk/freeboard-sk/` and sends `freeboard:theme` v1;
  receiver replies `freeboard:theme-ready`. Inspect `/home/pi/skip-dev`
  before changing that contract.
- Local keys: `freeboard-theme-override`, `freeboard-map-brightness`.
- Signal K REST/WebSocket supplies vessel/AIS, routes, waypoints, charts,
  tracks, notifications, course and autopilot APIs.
- Plotter Extensions API v1 serves route-planner and other plugins.
  Local bus lock is 0.13.0; proposed upstream 3.2.0 uses 0.15.0.
- Dev preview is proxied via SKIP 4200 to Freeboard 4201; installed files are
  served by Signal K separately.

## Local/custom modifications

- Theme services, native OpenBridge controls, panels, fonts, vessel/POI symbols
  and label contrast. Many are untracked; preserve them explicitly.
- AIS settings-before-subscription and replay on enable; identity retention
  before radius evaluation; unknown-type classification guard.
- Source-timestamp position age, out-of-order rejection, timer-driven cleanup
  before publication and bounded 2000-entry static identity recovery cache.
- Default stale/expiry ages remain six/nine minutes. Recovered identities
  must not restore expired motion or position.
- See [detailed handoff](FREEBOARD_OPENBRIDGE_HANDOFF.md) and
  [UI guidelines](OPENBRIDGE_FREEBOARD_GUIDELINES.md).

## Decisions that must be preserved

Integrate upstream deliberately; never overwrite this custom frontend with stock
npm code. Preserve repairs unless a verified upstream equivalent replaces them.
Keep canonical coordinates/route metadata separate from rendering transforms.
Preserve transport, resource and autopilot semantics during presentation work.
Build/test authorization does not imply live deployment.

## Known risks / blockers

**Freeboard-SK 3.1.1 → 3.2.0: BLOCKED.** Stock update overwrites OpenBridge/theme
work and lacks several installed AIS age/radius/identity/classification repairs.
Upstream also migrates legacy overlays to charts and can delete original overlay
resources after successful writes. Runtime has two legacy overlays.
Older profiles migrate COG preference and trail source; browser state is separate.
See [audit state](/home/pi/signalk-update-audit/PROJECT_STATE.md).

UNKNOWN / NEEDS VERIFICATION: complete merged 3.2.0 behavior, operator review of
all latest visuals, physical receiver-off/recovery behavior and browser-local state.

## Recently completed

Historical 2026-09-29 releases: AIS symbol/classification, startup/profile-transition,
radius filtering, position expiry and static-identity recovery repairs.
Latest handoff records 28 focused recovery/renderer tests plus type/lint/build
checks, and 293 HTTP-verified files. This task preserves those as historical
evidence and adds concise memory without rewriting existing technical contracts.

## Current task

Documentation initialization complete. No upstream integration, package update,
application-state migration or deployment performed.

## Next recommended actions

Before any update, preserve installed files, dirty/untracked source, profiles,
resources and browser-local state. Prepare an isolated 3.2.0 integration retaining
custom theme and AIS contracts; then run focused tests/build and four-palette,
AIS lifecycle, iframe, route-planner and resource migration checks against copies.

## Verification status

This task re-read source/package metadata, Git status/history, handoffs, guidelines,
release tooling and upstream diffs; reverified all 293 installed release hashes.
Documentation scope/path checks performed; no new build/test/browser/hardware run.
Historical worker-only typing had barrel/DOM issues; normal production build was
recorded passing. Do not silently turn that limitation into a passing claim.

## Important paths

- [Local release guide](dev-tools/openbridge-release/README.md).
- `src/app/lib/theme/`, `src/openbridge-theme.scss`, `src/openbridge-panels.scss`.
- `src/app/modules/skstream/skstream.worker.ts` and
  `src/app/modules/map/ol/lib/resources/layer-aisvessels.component.ts`.
- `/home/pi/freeboard-releases`: archived artifacts, source snapshots and rollback.
- `scripts/build-web.mjs`, `scripts/test-ci.mjs`: terminating build/test wrappers.

## Last updated

2026-10-04 (Europe/Amsterdam). Documentation only; existing custom work preserved.
