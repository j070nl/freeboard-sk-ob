# Freeboard OpenBridge architecture and theme audit

Baseline: 2026-09-26, Freeboard 3.2.0-beta.4, branch jrg-openbridge.
The sections marked baseline describe the original application. Implementation
and verification status is maintained in FREEBOARD_OPENBRIDGE_HANDOFF.md.

## Application architecture

| Area | Source and responsibility |
| --- | --- |
| Bootstrap | `src/main.ts`: standalone Angular bootstrap, coalesced zone change detection, optional performance probe |
| Shell | `src/app/app.component.{ts,html,css}`: full-screen appframe, floating left/right control strips, navigation drawer, menus, instruments and status/alarm panels |
| Shared state | `src/app/app.facade.ts`, `app.config.ts`, `types/`: configuration, UI signals, server connection and shared operations |
| Map | `modules/map/fb-map.component.*` composes chart, vessel, route and overlay layers; `modules/map/ol/lib/map.component.ts` owns OpenLayers lifetime |
| Drawers/panels | Shell navigation sidenav, 315px left resource panel, `modules/info-panel`, `modules/plotterext/panel-drawer.component.ts` |
| Dialogs | Material/CDK overlay infrastructure; shared dialogs through AppFacade and feature-owned dialogs |
| Settings | `modules/settings/settings.facade.ts`, `components/settings-dialog.{ts,html,css}`; tabbed display, vessel/map/resource preferences |
| Alerts | `modules/alarms/notification-manager.ts`, alert components, anchor service; AppFacade snackbar/message helpers |
| Widgets | `modules/plotterext/widget-overlay.component.ts` and extension service; provider content must retain its own rendering contracts |
| Autopilot | `modules/autopilot/autopilot.component.ts`, stylesheet and service; domain controls deferred |
| AIS/radar | `modules/skstream`, map OL layers and popovers; radar panel under `modules/radar/components`; deferred |
| Routes/waypoints | `modules/skresources/components`, map resource popovers/interactions, GPX dialogs; calculations/persistence deferred |
| Server helper | `helper/`; separate TypeScript build and plugin entry, outside UI migration |

## Theme and storage baseline

- `src/app-theme.scss` defines Material light azure/blue and dark red/orange
  palettes, Roboto typography and density -1. It also contains global button,
  icon, popover and scrollbar rules with literal colors.
- `AppComponent.setDarkTheme()` resolves `display.darkMode.source`: 0 OS,
  1 Signal K night mode, -1 manual On. It caches the result because it is called
  on realtime deltas. `.dark-theme` appears on the shell and CDK overlay container.
- `src/styles.scss` defines `.app-night` using brightness/sepia/hue filtering.
  The root template applies it for automatic/forced night presentation. This is
  distinct from the dark palette and from chart `invertColor` behavior.
- Settings expose both dark-mode source and auto night mode. Preserve their
  intent during migration; do not silently couple UI palette to chart inversion.
- Configuration cleaning lives in `app.config.ts`; defaults and legacy cleaning
  must both support new settings. AppFacade saves configuration via the existing
  LocalStorage service and, when logged in, Signal K app-data storage.
  The new palette must use that configuration path, not a second localStorage key.
- LocalStorage wraps namespace-prefixed JSON. Other feature-specific keys exist
  for extension/widget state, feature notices and track API notices.
- Existing styles sometimes consume `--mat-sys-*` fallbacks even though the
  current theme does not emit a system palette. The lessons log records the
  resulting dark-surface issue; the migration needs explicit semantic tokens.
- Hardcoded surfaces include shell black/white, translucent gray resource panel,
  white status-icon backgrounds, silver/gray outlines and loading indicator blue.
  Domain icon/alert colors also exist: blanket replacement would exceed scope.

## Surface classification

| Existing UI | Intended semantic surface |
| --- | --- |
| Body/appframe/loading | Page/application background |
| OpenLayers chart/radar canvas | Dynamic viewport; retain source cartography |
| Settings and ordinary composite panels | Component/global surface |
| Explicit grouped settings | Section surface, no redundant card nesting |
| Menus, dialogs, popovers, temporary editors | Context surface |
| Floating buttons/status instruments | Standalone controls; no added surrounding card |
| Resource grouping or extension container | Explicit group surface only when needed |

Do not apply chart-wide CSS recoloring. The legacy night filter is an existing
behavior whose migration requires a user decision, not permission to add filters.
Provider iframe contents cannot inherit host CSS and are outside this pass.

## Icons and controls

Material ligature icons, MatIcon SVG registration, Material buttons/FABs,
menu items, checkboxes, selects, sliders and tabs are used throughout the shell
and settings. `modules/icons/openbridge.ts` already registers bundled OpenBridge
SVGs under `src/assets/img/ob` for centering, heading, routes, sound, alarms,
autopilot and radar. Vessel/ATON/waypoint/custom symbol catalogs are separate.

Prefer official OpenBridge elements for migrated controls and their official
icons. Retain Material/CDK behavior where it still hosts unmigrated components;
any transitional token adapter must be clearly recorded, not presented as a
completed native component migration. Preserve disabled/selected states,
keyboard activation, accessible labels, tooltip and menu focus behavior.

## Responsive and touch baseline

- Shell is 100vw × 100vh with fixed-position overlay controls and z-index tiers.
- Navigation sidenav is 200px; left resource panel is 315px; control strips 50px.
  Toolbar item allocation is 48px plus padding. Preserve usable hit targets.
- Bottom sheet starts at 15% left with 400px minimum; below 650px it becomes
  full width. Instrument panel toggle disappears below 800px.
- Below 600px height, navigation readout shifts away from the left controls.
- Settings opens at 1000px × 80vh; tab body supplies scrolling and flex rows wrap.
  Existing field stacks use a 220px basis. Small screens add percentage padding.
- Existing style breakpoint groups include 1280 and 1920, but several groups are
  empty: their presence does not prove usability at those sizes.
- Extension panel drawer uses flex layout to reduce available map width.
- Map popover world-copy placement uses dedicated offset machinery; leave intact.

Review at 1280×800 and 1920×1080 in all palettes, plus narrow portrait/split
layout. Check resource panel + toolbar collisions, overflow, dialog footer reach,
focus visibility, scroll regions and touch targets. Screenshots are collected in the milestone review matrix; see the handoff.

## Performance audit

OpenLayers construction and listeners already run in `NgZone.runOutsideAngular`;
its Angular wrapper detaches change detection and re-enters only where needed.
Widget gesture work also uses an outside-zone section. Stream computation has a
worker and polling timers; map saves, chart animation and tidal playback have
separate timers. Interaction directives contain explicit detectChanges calls.
These are measurement candidates, not evidence of defects.

`setDarkTheme()` currently performs matchMedia resolution on realtime callbacks
but guards DOM updates. Keep theme DOM changes low-frequency and add OS change
listener cleanup if introduced. Do not reconstruct the map or register new
per-frame theme subscriptions. Use the existing `?perfprobe` and
`dev-tools/perf-harness` if later measurements justify optimization.

## Package strategy

Freeboard had no OpenBridge package at baseline. Lockfile versions are Angular 21.2.23,
Material 21.2.14 and OL 10.10.0. Local Skip pins core 2.0.0-next.162.
Registry inspected 2026-09-26: core and Angular wrapper Next are 2.0.0-next.167.
The wrapper declares Angular core/common ^20.0.1, which excludes Angular 21.
Do not use --force/--legacy-peer-deps or downgrade Angular to install it.

Implemented choice: exact-pin official core 2.0.0-next.162 to match Skip,
use direct Lit custom elements with scoped Angular integration and import only
used element modules. Load official openbridge.css once and set
`data-obc-theme` on html. Verify typings/template compilation and browser events.
The current newer Next remains an explicit upgrade candidate after parity review.

Core dependencies: Lit 3, Lit localization/observers, chart.js, uplot and semver.
Published unpacked package is about 67 MB; do not import its full bundle.
Prerelease APIs and tokens may change, so exact pinning is deliberate.
The installed reference package declares AGPL-3.0-only and documents a separate
commercial/time-delayed Apache licensing scheme. Record this metadata before
any future upstream distribution; this audit makes no legal compatibility claim.
Core is now installed as an exact development dependency for the application
build. Angular and OpenLayers versions are unchanged.

Sources: official npm registry metadata (`npm view`), local installed Skip
package, and [official OpenBridge repository](https://github.com/Ocean-Industries-Concept-Lab/openbridge-webcomponents).
DeepWiki was attempted but returned an internal error.

## Decisions and remaining acceptance

The revised user brief resolves the layout and night-mode questions: retain
floating toolbars and separate application palettes from existing dimming.
The implementation preserves automatic OS and Signal K options, migrates manual
On to Dusk, and adds four explicit themes to the existing stored preference.
User accepted the milestone 1 visual result. This is not approval to migrate domain
rendering or begin milestone 2.

## Verified token inventory for implementation

Checked directly against Skip's installed core `2.0.0-next.162`
`dist/openbridge.css`. All names below exist; this verifies availability, not
visual acceptance. Context and scrollbar assignments are implemented in
`src/openbridge-theme.scss` and included in browser review. Native components own their state tokens.

| Semantic role | Official token |
| --- | --- |
| Application background | `--container-background-color` |
| Dynamic viewport backing | `--integration-container-background-color` |
| Component surface | `--container-global-color` |
| Grouped section | `--container-section-color` |
| Context surface | `--container-global-color` |
| Primary text/icon | `--on-normal-active-color` |
| Secondary text/icon | `--on-normal-neutral-color` |
| Disabled text/icon | `--on-normal-disabled-color` |
| Active foreground | `--element-active-color` |
| Selected background | `--selected-enabled-background-color` |
| Selected foreground | `--on-selected-active-color` |
| Warning | `--alert-warning-color` |
| Alarm | `--alert-alarm-color` |
| Success/running | `--alert-running-color` |
| Normal outline | `--border-outline-color` |
| Selected outline | `--selected-enabled-border-color` |
| Keyboard focus | `--border-focus-color` |
| Scrollbar thumb | `--element-neutral-color` |
| Scrollbar hover | `--element-active-color` |

Scrollbar tracks should use the owning panel's semantic surface rather than a
fixed global color. The official stylesheet declares all four data-obc-theme
selectors. Its regular-size touch target token is
`--global-size-spacing-touch-target-min: 48px`; the visual target is 32px, so
visual size alone must not be used to judge the hit area. Theme token names
should be revalidated if the package version changes.
