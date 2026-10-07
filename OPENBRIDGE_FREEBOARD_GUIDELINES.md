# Freeboard OpenBridge UI guidelines

Milestone 1 implementation guide, 2026-09-26; visual result accepted by the user.
The foundation retains automatic choices, separate night/chart presentation,
and floating toolbars. See FREEBOARD_OPENBRIDGE_HANDOFF.md for migrated areas
and transitional exceptions.

## Surfaces and themes

One resolved root theme: `html[data-obc-theme]`, with bright/day/dusk/night.
Persist the selection through Freeboard configuration. Resolve automatic sources
centrally; no component-owned dark booleans or duplicate browser preference.

| Role | Use |
| --- | --- |
| Page | Application background and empty shell |
| Dynamic viewport | Chart, radar, camera/video and spatial visualization backing |
| Component | Ordinary settings/control/composite panel |
| Section | Explicit group within a component |
| Context | Menu, dialog, popover, target information and temporary editor |
| Standalone | Native button, gauge, instrument/status; no automatic outer card |

Map semantic application variables to verified official OpenBridge tokens.
Include page, viewport, component, section and context surfaces; primary,
secondary and disabled text/icons; active, selected, warning, alarm and success;
normal/selected/focus outlines; scrollbar track/thumb/hover. Do not guess token
names or substitute an arbitrary palette when an official token exists.
Bright and Day must remain distinct, as must Dusk and Night.

## Components, icons and layout

Use official OpenBridge components first. Direct web components avoid the current
Angular wrapper peer mismatch. Import only used components/icons. Keep Angular
integration typed, and test property/event bindings rather than treating custom
elements as inert HTML. Preserve focus, keyboard activation, disabled behavior,
labels and tooltips. Material/CDK coexistence is transitional and must be listed
as remaining work until each relevant control is migrated.

Use official OpenBridge icons when an equivalent exists. Existing chart/vessel/
ATON/domain symbols are exceptions pending the later overlay phase. Do not change
an alarm's meaning through decorative icon or color replacement.

Follow native component spacing and sizes; use a consistent 8px layout rhythm
where application grouping needs spacing. Preserve at least 48px primary touch
targets for marine controls. Do not shrink native controls to fit a narrow panel.
Use the official typography foundation, loading fonts locally where available.
Remove redundant nested cards only in migrated chrome; explicit grouping remains.

## Scrollbars

All custom scrolling chrome uses one theme-aware rule: compact 6–8px width,
track matching its surface, visible thumb, and hover/active feedback. Provide
Firefox scrollbar-width/color and WebKit pseudo-elements. Avoid duplicate
scrolling parents: settings tabs or dialog content should own vertical scrolling.
Ensure keyboard scrolling and visible focus remain usable.

## Map and overlays

Chart sources own cartography. Theme switching must not rebuild OpenLayers,
recolor authoritative features, invert chart imagery, change coordinates, or
alter navigation calculations. Keep existing world-copy offset handling intact.
Use native chart night support where available in a later approved phase.
The legacy whole-app night filter is separate from the new palette and requires
an explicit migration decision. Do not add generic viewport filters.

Overlay controls use semantic chrome surfaces; navigation geometry and rendered
symbols stay unchanged in milestone one. Preserve alarm, active-route and target
selection meaning. Provider iframe content needs its own theme contract later.

## AIS symbol geometry

All AIS class variants now reuse the official OpenBridge activated-filled target
paths shared with Skip radar, with existing class colors and neutral unknown.
The inactive variant retains white fill/magenta outline. Map/detail/list consumers
share the SVGs; retain the existing 32px viewport and map anchor. Four-palette
mock asset matrix and live-data chart reviewed 2026-09-29; user review pending.
Own-ship/focus retains its OpenBridge own-ship symbol. Moored circles and the
separate flag annotation keep their existing semantic forms.

## AIS classification safety

The actual OpenLayers vessel renderer must validate the type before class grouping:
never take the absolute value of a negative unknown sentinel. Static AIS identity
and type arriving before positions must survive radius filtering until positions
permit evaluation. Incomplete records use the existing target-age cleanup.
Regression coverage includes the real OL feature changing unknown/passenger/unknown
and worker replay with a nonzero radius. Live-data visual review 2026-09-29:
KONINGIN JULIANA and ALEXANDER-M blue with names at zoom 18 and a 10 km radius.


A vessel class is presented only when `design.aisShipType.id` is a valid AIS code
from 1 through 99. Missing, zero, non-finite and out-of-range values use the
dedicated neutral `ais_unknown` symbol, the text `Unknown vessel type`, and the
Unspecified filter group. A received label without a valid numeric code cannot
classify the vessel. Valid unnamed codes display `AIS type N`. Theme and map
symbol brightness may dim this symbol but may not change its classification.

## Settings and responsive behavior

For touched settings groups, use Source/Data,
Behavior, Appearance, Layout/Visibility, Advanced. Appearance exposes semantic
theme/density/visibility/contrast choices; arbitrary color pickers need a real
use case. Do not reorder unrelated domain settings during foundation work.

Review 1280×800 and 1920×1080, then narrow portrait/split layouts. Panels must fit
available width, headers/footers remain reachable, and label reduction must retain
accessible names. Collapse groups or scroll before reducing touch targets.
Retain current floating toolbar placement; a top-bar redesign requires approval.
Record actual min sizes, collapse rules and icon-only behavior as each region is
implemented and visually verified; do not treat CSS breakpoints as proof.

## Performance and review

Theme changes are low frequency. No theme-driven per-frame DOM work, map rebuild,
duplicate stream subscriptions or animation of authoritative navigation data.
Measure before optimizing; preserve existing outside-Angular rendering.

Visual acceptance requires screenshots or live confirmation for every theme at
both target sizes: normal map chrome, menu, settings, dialog, drawer and alert list.
Check contrast, selected/disabled/focus/alert states, labels, scrolling, touch hit
areas, panel collisions and unchanged chart appearance. Later approved phases
add AIS, route/waypoint, radar, autopilot and widget review coverage.

Focused verification: theme resolution/migration/persistence tests, strict type
checking and Angular template build, targeted lint and git diff --check. Use the
repository build/test wrappers. Keep changes unstaged and uncommitted.

## Future Skip synchronization (proposal only)

Share resolved names bright/day/dusk/night, keeping each app's automatic source
policy explicit. A shared browser preference is simple for the same origin but
does not cross devices; storage events cover sibling tabs, and embedded apps
would need a validated message contract. A shared Signal K user preference can
span devices but needs agreed ownership, authorization and offline precedence.
A new Signal K control path adds a protocol contract and requires user approval.
Prefer a user preference for appearance, not a navigation/control datum. No sync
mechanism is implemented in milestone 1. Choose ownership and conflict behavior
with the user before adding either option.

## Current integration contract

`src/app/lib/theme/theme.service.ts` owns the resolved theme signal and the root
attribute. `display.darkMode.source` persists either a named theme or the existing
automatic selector (0 OS, 1 Signal K); legacy -1 normalizes to Dusk. The derived
legacy enabled flag supports existing consumers and is not a second preference.
OS changes have one cleaned-up listener. Unchanged themes do not write the DOM.

`src/openbridge-theme.scss` maps `--fb-*` roles to official tokens; the audit
contains the token table. `--fb-space` is the native label-spacing token,
panel padding is twice that value, section spacing three times. Native controls
own their internal spacing and states. The viewport role is a boundary contract,
not a stylesheet applied over chart pixels.

The typed `fb-checkbox`, `fb-select`/`fb-option` and `fb-slider` adapters implement
Angular forms with native OpenBridge controls. Persist callbacks run after model
updates. Dropdown option identities retain number/string/null distinctions.
The Next.162 dropdown and slider need accessible names on their inner controls;
recheck this adapter when upgrading. Await Lit `updateComplete` in DOM tests.
`OpenBridgeControlDirective` connects CDK host focus to native shadow controls,
restores it after Chromium host focus settles, and guards disabled activation.

Material/CDK still owns overlay placement, menu keyboard behavior, tab structure,
text inputs, multi-selects and selectors with disabled options. These use supported
Material token overrides. Keep these exceptions explicit; do not describe the
whole application as native OpenBridge. Domain instruments and map symbols remain
outside this milestone.

## Embedded Skip theme contract (implemented follow-up)

User-selected scope: only Freeboard embedded inside Skip follows Skip. A standalone
Freeboard window retains its existing persisted preference. Skip is the authority
for the resolved palette, including automatic selection and temporary overrides.
The receiver never saves a host palette into Freeboard configuration.

Same-origin window messages, version 1:
- Freeboard announces `{ type: 'freeboard:theme-ready', version: 1 }` once its
  listener is ready.
- Skip sends `{ type: 'freeboard:theme', version: 1, palette }` on iframe load,
  readiness, and changes to `activeOpenBridgePalette`.
- Palette is exactly bright/day/dusk/night. Freeboard validates type/version,
  origin and `event.source === window.parent`; standalone windows do not listen.
- Skip validates the iframe source/origin and uses the exact iframe target origin
  for palette messages. Both sides clean up listeners when destroyed.

The override is in-memory for the embedded lifetime and wins over Freeboard's
local/automatic resolver. The settings UI explains that Skip controls the theme
and disables the local theme picker while inherited. Existing night-dimming
messages remain separate. No localStorage bus, server preference, new Signal K
path, navigation command or cross-device synchronization is introduced.

Source integration spans Freeboard ThemeService/settings and Skip's
`widget-freeboardsk.component.ts`. Both updated builds must be deployed together
for live use; older hosts simply leave Freeboard on its own theme. Deployment
requires separate user authorization.

## Cursor status strip

The map footer is a compact read-only component surface, using existing
--fb-component, --fb-text and --fb-outline mappings. Keep coordinate pairs and
formatted values intact when wrapping; preserve pointer pass-through and the
plotter extension status-bar lift. Review Bright/Day/Dusk/Night at narrow and
wide map sizes. No whole-map filters or additional redraw loop.

## Embedded visibility

A same-origin parent may send version1 freeboard:visibility with a boolean visible.
Validate both event.source===window.parent and event.origin; standalone ignores it.
Do not persist host visibility. Combine with native tab visibility, detach map
render target while retaining navigation geometry and loaded source data. Radar
stream lifetime follows that visibility through its existing disconnect path.
Readiness is versioned freeboard:visibility-ready; older hosts remain functional.
