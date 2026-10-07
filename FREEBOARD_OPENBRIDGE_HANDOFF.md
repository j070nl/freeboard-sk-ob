## AIS recovery identity repair — LIVE, 2026-09-29 18:06 CEST

User reports grey MMSI-only vessels in existing window while new window recovers.
Reproduced: target expiry deletes static identity/type, but existing static stream
subscriptions need not replay unchanged identity when new position reports resume.
The previous expiry repair failed to cover this recovery path. Added a bounded
2000-entry cache containing only expired vessel identity (name, MMSI, class,
callsigns, registrations, buddy). Fresh target instances recover those fields;
expired positions, headings, speed and trails are not retained. Cache clears on
stream initialization; newly received static values still replace cached values.
Expiry and source timestamp rules from preceding repair remain unchanged.

Regression failed first with missing name/MMSI and class -1, then passed. 28 tests
pass across worker and actual OpenLayers feature renderer, including inactive to
passenger colour recovery on the same feature. App TypeScript, targeted ESLint,
focused diff check and production/template build pass (existing warnings).
No physical receiver/browser-session observation claimed. 293 published files
SHA256 verified over live HTTP; preview public updated as well. Reload once to
replace existing workers and recover identity already lost in old tabs.
No service restart, profile change, equipment command, commit or push.
Release/rollback: /home/pi/freeboard-releases/20260929-180555-ais-recovery-live.

## AIS position expiry repair — LIVE, 2026-09-29 17:57 CEST

User authorized immediate live repair; broader follow-up deferred. Freeboard now
ages AIS vessel positions using the original Signal K position timestamp (future
values clamped to receipt time; missing/invalid timestamps fall back to receipt).
Cached MMSI/root identity no longer refreshes position age; older position reports
cannot replace newer ones. Own-vessel receipt freshness and playback remain on
receipt time. Existing configurable 6-minute stale / 9-minute expiry defaults stay.
Worker cleanup runs before publishing lifecycle changes and continues on timer
ticks while tracked targets exist even without new stream data. Expired vessels
are removed from updated/stale sets before publication.

26 worker tests pass including cached 12-minute positions, static identity,
out-of-order positions and silent-stream expiry. Strict app TypeScript, targeted
ESLint, focused diff check and production/template build pass (existing build
warnings). Repository-wide diff check reports pre-existing unrelated CSS whitespace.
No visual styling changed; no browser screenshot or physical receiver test claimed.
Published 293 files, each SHA256 verified over live Signal K HTTP; preview public
4201/Skip4200 updated too. Refresh existing browser tabs to load the repaired worker.
No services restarted, profiles changed, hardware commands, commit or push.
Release/rollback: /home/pi/freeboard-releases/20260929-175705-ais-age-live.
Follow-up: review timestamp fallback, receiver-off live observation and upstream fix.

## All Freeboard AIS class icons OpenBridge — LIVE, 2026-09-29 16:17 CEST

User confirmed the AIS data/color repair works, then noted passenger/special and
other class icons still used old vessel silhouettes. Replaced 10 AIS SVG assets
(active, passenger, cargo, tanker, special, highspeed, other, buddy, unknown,
inactive) with the exact path geometry of Skip src/assets/svg/radar-ais.svg.
Freeboard keeps its 32px viewport, [17,16] anchor and existing symbol transform;
class fills and inactive white/magenta semantics retained. All class variants
now share the radar's white halo/dark outline. Own-vessel/focus icon was already
OpenBridge; separate flag annotation and moored circles retain their semantics.
Existing map dimming, target orientation, static-data handling and classification
are unchanged. This updates chart icons and details/list icons sharing these assets.

14 focused renderer/registry tests, app TypeScript, SVG XML parse and asset diff
check pass. Four-palette mock matrix of actual SVGs inspected. Separate live-data
preview screenshot inspected: blue passenger targets and cyan WILMA 7 use the
OpenBridge triangles. No screenshot baselines updated; user review pending.
Asset-only deployment reuses the preceding verified JS build with updated SVGs.
All 293 files verified over live HTTP. Preview4201/Skip4200 has the same assets.
Release/rollback: /home/pi/freeboard-releases/20260929-161737-ais-openbridge-icons-live.
No services restarted or user profiles edited; no commit/push.

## AIS radius/data-loss and map symbol correction — LIVE, 2026-09-29 16:06 CEST

Earlier startup/config-order explanations were insufficient to explain the user's
persistent magenta targets. Reproduced against the preceding live build with a
10 km radius: the two reported passenger targets lost name/type and only the
magenta active symbol was requested. The filter deleted static identity/type
before a target position existed, and could evaluate against an uninitialised
[0,0,0,0] own-position extent. Independently, the actual map renderer converted
unknown type -1 to class 10 via Math.abs, rendering magenta despite the neutral
registry default. Prior tests checked the registry rather than this renderer.

Fixed by retaining incomplete target records until positions allow evaluation,
initialising radius bounds from the received own position before filtering, and
using the existing valid-type guard in the actual vessel layer. Pending records
retain ordinary age cleanup. Confirmed out-of-range positioned targets remain
excluded. Regressions first failed on BOTH original behaviors, then passed.
The feature test checks the same OL feature changes unknown -> passenger ->
unknown; the worker test sends identity/type BEFORE own and target position.

Validation: 48 focused tests passed; final two-file rerun 24 passed including
out-of-radius exclusion. App TypeScript and targeted lint passed; production
build completed with existing budget/CommonJS warnings. Standalone worker tsc
also attempted: blocked by existing barrel imports pulling DOM-dependent app
code into the worker-only lib configuration; normal Angular build passed.
Actual Chromium screenshot using live Signal K data, 10 km radius and zoom 18
shows KONINGIN JULIANA and ALEXANDER-M blue and named. Canvas drawImage confirmed ais_passenger.svg was drawn. The later live
screenshot also includes a separate magenta target entering the viewport; the
two reported passenger vessels remain blue and named. This is a live-data screenshot in an
isolated browser profile, not a mock or inspection of the user's browser.

Release/rollback: `/home/pi/freeboard-releases/20260929-160624-ais-radius-symbol-live`. All 293 files SHA256 matched over live HTTP. Preview4201
(and Skip4200 proxy) updated to the same artifact. Existing user profiles were
not changed. No service restart, hardware command, commit or push.

## AIS user-config transition hotfix LIVE — 2026-09-29 15:37 CEST

The preceding startup-order fix did not cover an authenticated profile whose
local startup config had Signal K vessels disabled and whose server config enabled
them after the stream subscriptions already existed. In that sequence the cached
static AIS replay was intentionally filtered out; later position deltas created
unknown targets without replaying their unchanged type.

The worker now detects the disabled-to-enabled transition after vessel
subscriptions are active, replaces only the static vessel subscriptions, and
therefore requests the identity/type snapshot again without duplicating continuous
navigation subscriptions. The real Chromium test deliberately forces this exact
sequence: all three reported targets first appear with type -1, then recover to
name plus type 69 after the config transition. The test passes against both the
preview artifact and the final live URL with no browser errors.

Validation: 5 focused files / 53 tests pass; strict TypeScript, targeted ESLint and
targeted diff check pass. Production artifact emitted successfully with existing
budget/CommonJS warnings. All 293 live files match SHA256 over HTTP. Signal K,
go2rtc and pypilot remain active. Release/rollback:
`/home/pi/freeboard-releases/20260929-153735-ais-config-transition-hotfix-live`.
No service restart, settings/profile mutation, Git commit or push. Reload the open
page once so its already-running worker is replaced.

## AIS static-data startup hotfix LIVE — 2026-09-29 15:11 CEST

The reported vessels remained unknown because the stream worker could receive the
server's cached static AIS snapshot before its vessel filters were configured.
Dynamic positions then created the targets, while unchanged name/type values were
not guaranteed to replay. `SKStreamFacade.subscribe()` now sends the current
settings before any subscription, and the worker also merges late name, MMSI and
AIS type leaf updates. Existing vessel classification, colors and dimming remain
unchanged.

Focused Freeboard validation passes: 5 files / 51 tests, strict TypeScript,
targeted ESLint and targeted diff check. A Chromium startup check against the
built artifact and again against live confirms `settings` precedes every
`subscribe`; MMSI 244058001, 244690490 and 244850783 resolve immediately as type
69 with their names, and the passenger symbol asset is loaded. All 293 release
files were fetched through the live Signal K URL and matched SHA256. Signal K,
go2rtc and pypilot remained active; no service restart, settings/profile mutation,
Git commit or push.

Release and rollback: `/home/pi/freeboard-releases/20260929-151158-ais-startup-hotfix-live`.
Refresh the open Skip/Freeboard page once to replace the already running iframe.

## AIS safety and presentation LIVE — 2026-09-29 14:40 CEST

User explicitly authorized publication. Published the validated Freeboard artifact
with the companion Skip artifact. Unknown/invalid vessel types now use the neutral
symbol, `Unknown vessel type`, and Unspecified filtering until valid static AIS
data arrives. Live Signal K inspection showed the reported overlapping targets are
two distinct passenger vessels, MMSI244690490 and244850783, only7.4m apart; the
first screenshot captured the interval before static name/type data arrived.

Freeboard release: `/home/pi/freeboard-releases/20260929-144024-ais-safety-live` (293 files). Companion Skip release:
`/home/pi/skip-releases/20260929-144024-ais-safety-live` (456 files). Every file was fetched through the live Signal K URL
and matched its SHA256 manifest. Rollback scripts and previous-public archives are
inside both release directories. No service restart, settings/profile mutation,
Git commit or push. Browser refresh required.

## Unknown AIS vessel types remain unknown — development only, 2026-09-29

Targets without a valid AIS ship-type code now use a dedicated neutral-grey
32 px vessel icon instead of Freeboard's magenta valid-class default. The vessel
properties view always says `Unknown vessel type` until a valid code arrives; a
valid unnamed code is shown as `AIS type N`. Missing, zero and invalid types join
the existing Unspecified filter group and never the Pleasure group. Moored unknown
targets use the same neutral meaning. Existing symbol-layer brightness applies,
so the new icon dims with every Freeboard palette and user symbol override.

Focused type/filter tests pass 10/10, strict TypeScript, targeted ESLint and the
targeted diff check pass. The production build passes at
`/tmp/freeboard-ais-unknown-build`; its bundled unknown SVG is byte-identical to
the source. No live deployment, settings/profile mutation, service restart,
commit or push.

## Freeboard retention LIVE — 2026-09-28

User approved the4200 behavior and observed much lower CPU during switching,
then explicitly authorized publication. Both tested builds published:
- Skip /home/pi/skip-releases/20260928-201850-freeboard-retention-live:453files.
- Freeboard /home/pi/freeboard-releases/20260928-201850-freeboard-retention-live:294files.
All files SHA256 verified on disk and via live HTTP; previous-public rollback
copies and source archives retained. Original Skip entry unchanged. No Signal K
restart, profile mutation or Git commit/push. SignalK/go2rtc/pypilot remain active.
This supersedes development-only notes below. Development4200/4201 remain available.

## Embedded visibility / retained charts — development only, 2026-09-28

User asked to keep Freeboard open across Skip dashboard switches. New
src/app/lib/embedded-visibility.service.ts validates same-origin parent
freeboard:visibility v1 boolean and advertises freeboard:visibility-ready v1.
Combines host visibility with native document.hidden. MapComponent disconnects
renderer target but preserves OL view/layers/sources/size; hidden resize callbacks
skip work. RadarComponent observes combined visibility through existing stream
start/stop semantics. Data subscriptions remain connected; no settings writes.

Seven targeted receiver/radar/geometry tests pass, lint/build pass. Wrapper exit0;
esbuild prints deadlock after build success during forced process shutdown.
Browser real guest chart plus actual Skip nested GridStack fixture:5 switches,
1document load,87GETs unchanged,0hidden GETs, no JS errors. Synthetic and live
fixture scope/limits in Skip docs/widget-style/freeboard-retention.md.
Production NOT deployed. public served by loopback4201 via Python static server,
Skip4200 proxies Freeboard assets there. SK/API/WS remain3000. Existing live stays
20260928-185715-map-status-live. No helper, backend, profile, Git or live mutations.

## Map status footer LIVE — 2026-09-28

User authorized all pending UI changes. Published release
/home/pi/freeboard-releases/20260928-185715-map-status-live,294 files SHA256 verified
on disk and live HTTP. Backup previous-public/source snapshot included. No helper
changes, profile writes, service restart or Git push. Skip companion corners/logo/
readout/radar changes also live (185622-ui-refinements-live). Refresh browser.
This supersedes the prepared/not-deployed footer entry below.

## Map status footer — 2026-09-28, prepared, not deployed

The cursor Lat/Lon/zoom/bearing/distance/ETA strip now uses the existing
OpenBridge --fb-component/text/outline mappings, local Noto Sans, tabular
numbers and a restrained border. Fields wrap as complete units within the map
width. No navigation calculations, formatters, visibility conditions, status-bar
lift or event handlers changed. Pointer events pass through to the map.

Web production build passes; HTML formatting passes. Synthetic browser fixture
with production styles passes four palettes at 280/360/800px without overflow;
Day narrow and Dusk wide screenshots inspected. Fixture /tmp/freeboard-status-review.cjs,
images /tmp/freeboard-status-*.png. These are mock data, not live screenshots.
No publication, service restart, commit or push. Skip4200 still proxies live
Freeboard and therefore does not show this change yet. Await publication approval.

Live wind-layer browser check also passed: 13px labels, immediate Day/Night/Day colors, no page errors.

Wind-label release: `/home/pi/freeboard-releases/20260927-191516-wind-labels`; 294 static files published and hash-verified.

## Wind label appearance — 2026-09-27

Wind weather labels use 600 13px Noto Sans (previously 11px Roboto), with
light-palette dark text and dark-palette warm text/dark halo. Theme changes
invalidate the wind layer immediately. Speed formatting, units, glyphs,
orientation, label offsets and layer opacity are unchanged.
Seven focused tests pass; production build and browser Day → Night → Day
checks pass with deterministic intercepted weather GET responses (no server
writes). Browser canvas measurements confirm font and theme colors.

## Label size live release — 2026-09-27

Published 294 verified static files; release `/home/pi/freeboard-releases/20260927-190319-map-label-size`.
Three label tests pass; actual live waypoint rendering measured at 12px in Day/Night
with no browser errors. No AIS targets currently available, so vessel label
coverage is from the real component unit test. Background raster unchanged.

## Larger vessel and waypoint labels — 2026-09-27

User chose to retain the current background after confirming street/place names
are baked into its raster tiles. Only AIS vessel names and waypoint labels are
increased from OpenLayers' default 10px to 12px sans-serif. The shared label
renderer has an opt-in font property; the two selected subclasses set it. Other
feature label fonts, positions, halos and zoom visibility remain unchanged.
Tests cover both subclasses and unchanged default feature font/zoom behavior.

## Theme toolbar live release — 2026-09-26

Release: `/home/pi/freeboard-releases/20260926-201514-theme-toolbar`. 294 static files verified. 24 tests pass across
ThemeService, map brightness, settings and app bootstrap. Browser verifies exact
y=10 alignment of Menu/right top/zoom controls, manual local theme, subsequent
Skip messages, Follow Skip, reload persistence and mobile menu. No page errors.
Previous complete OpenBridge release is recoverable using this release's rollback.py.

## Theme toolbar control and alignment — 2026-09-26

User requested a quick theme control and raised toolbar alignment; explicitly
selected Freeboard-only switching with a Follow Skip option. ThemeService now
stores an optional local palette in freeboard-theme-override. Host messages
continue tracking the latest Skip palette while overridden; clearing the override
immediately follows that palette again. No theme-change request is sent to Skip.
Toolbar menu offers Bright/Day/Dusk/Night and Follow Skip (Use settings standalone).
Settings shows the local choice when active. Top and scrollable toolbar padding
are reduced by 4px; extension offsets are preserved.

Browser measured Menu, right top, Zoom in/out at y=10px; theme selection, host
changes while overridden, resume, refresh persistence and mobile menu pass.
The new persistence regression test also caught/repaired ThemeService's signal
initialization when the DOM already carries the desired palette.

## Live release — 2026-09-26

Published 294 verified static files to installed Freeboard. Release and rollback:
`/home/pi/freeboard-releases/20260926-200446-approved-openbridge`. See OPENBRIDGE_RELEASE.md for the exact restore command.
HTTP verification confirms entry, styles, main bundle and symbol assets match.
Final live browser smoke check passed with no page errors; evidence is saved
in live-browser-verification.json and screenshots in the release folder.

## Approved production integration — 2026-09-26

User explicitly authorized publishing all approved examples with rollback and
editable sources. The production source now contains: isolated chart/symbol
brightness (Day 100/100, Dusk 60/85, Night 40/60), per-theme browser preferences
and Display sliders, theme-aware scale, native OpenLayers label halos, approved
vessel/waypoint/POI assets, Anchor Watch SVG schematic, popup/info/radar spacing,
OpenBridge action colors and startup screen. Earlier autopilot/list/theme changes
are retained. No prototype canvas patches or DOM observers are shipped.

Chart raster layer containers and explicitly named fb-symbol-layer canvases dim;
weather and separate alarm canvases do not. AIS status styles in the AIS canvas
retain their shapes/colors and share its brightness. Vector/MapLibre chart
rendering was not part of the approved raster preview and is unchanged.
Legacy automatic/manual night dimming only affects chart/symbol canvases.

Editable areas and rollback procedure: dev-tools/openbridge-release/README.md.
Pre-integration source snapshot: /tmp/freeboard-source-before-approved-release.tar.gz.
Release publishing backs up all installed web files before writing, assets first,
index last, hash verification afterwards. The rollback script has been rehearsed
into a temporary directory: 367/367 files identical to the current live app.

Validation: first full suite 115 files/1260 tests passed; 7 settings tests failed
because their AppFacade stub lacked the formatter, subsequently fixed. Focused
rerun of settings, control adapters, map brightness and label contrast: 4 files,
15 tests passed with no unhandled errors. Includes slider initial-null regression
fix. Production build passes (existing bundle-size/CommonJS warnings). Browser
checks use blocked HTTP writes and cover actual theme/dimmer behavior, startup
removal, anchor SVG, radar sizing, waypoint actions, symbol picker and brightness
changes. No anker/autopilot/radar/navigation control commands are issued.

## Loading screen preview — 2026-09-26

Added an isolated app-root loading fallback: navigation mark, Freeboard title,
indeterminate loading indicator and expandable connection/reload help. Inline
styles/SVG work before Angular loads; no added startup delay. Persistent review
at /night-preview/loading.html (also linked from main preview). Neutral dark
boot fallback, token colors when available; review has Day/Dusk/Night controls.
Production src/index.html and live app untouched. See preview README.

## Anchor Watch and panel visual preview — 2026-09-26

User approved previous examples and requested visual polish, especially Anchor
Watch and its diagram. Added preview-only panel CSS and SVG decoration under
dev-tools/night-preview. Existing controls/services/data values are retained.
Anchor radius schematic follows raised/dropped bitmap state and theme colors;
info drawers, popups and radar receive spacing/surface improvements. No deployment.
Browser checked real Anchor Watch Day/Night and radar read-only; no page errors
or Anchor Watch horizontal overflow. Bridge note itself remains unverified because
the Notes list is empty in the test context. See preview README for scope/evidence.

## Label readability preview — 2026-09-26

Added a Labels current/enhanced toggle to `/night-preview/index.html`.
Night feature labels use light warm text with a dark halo; chart-tile text and
colored alert text are unchanged. Chart/symbol defaults remain 40%/60%; controls
are not dimmed. Preview-only canvas hook, no production source/deployment changes.
Real AIS browser comparison and color/state guards pass without page errors.
See dev-tools/night-preview/README.md and /tmp/label-preview-check.mjs.

# Freeboard OpenBridge handoff

Canonical current-state document, updated 2026-09-26.

## POI picker preview migration — 2026-09-26

User clarified that vessel symbols were already handled and requested only the
waypoint/POI picker part. Eighteen POI assets now override the isolated preview:
six official glyphs (anchor, petrol, ferry, berth, radio, info) and twelve existing
glyphs with subdued palettes. Hazard/diving flags, AtoNs and external overrides
remain unchanged. No further vessel edits. The picker and map use the same asset
paths and persisted IDs; canvas/anchor/scale remain 37×37, [1,37], 0.65.
Source: dev-tools/night-preview/build-poi-symbols.py; invoked automatically by
build-symbol-map.py. Manifest records exact mapping vs palette-only changes.
No production code, assets or deployment changes. Preview URL unchanged.
A scoped preview CSS fix also lets pointers pass through tooltip overlays while
the waypoint editor is open; successive choices were otherwise intercepted by
popover tooltip content. No handler or save behavior changed.

Validation: all 18 generated SVGs parse and retain 37×37 dimensions; isolated
served assets match source bytes. Chromium opened an existing waypoint editor,
verified official SVGs in the actual picker in Day/Night and selected all six
replacements without changing their IDs. Warning/diving assets are byte-identical
to production. No save, HTTP writes blocked, no page errors. Evidence:
/tmp/poi-preview-results.json and /tmp/poi-picker-{Dag,Nacht}.jpg.


## OpenBridge symbol assets on the preview map — 2026-09-26

User requested implementing the feasible symbol changes. The night preview now
loads a separate `public/night-preview/map/index.html` built by
`dev-tools/night-preview/build-symbol-map.py`. Production JS/assets/media are
linked into that tree and four asset paths are overridden there only:
- normal active AIS: official activated triangle, existing magenta color family;
- focused AIS: official own-ship-iec bow shape in ais_self.svg;
- actual own vessel: same SVG rasterized as transparent self.png (19×45);
- default waypoint: official optional circle, existing orange color family.

Pixel anchors stay (17,16), (9.5,22.5), and (12,24) respectively. Existing renderer
rotations/scales, data coordinates, custom symbol overrides and special status
variants are unchanged. Type-specific, buddy, inactive, fixed/stale ship, AtoN,
POI and chart-baked symbols are deliberately retained. Full scope/source names
are in dev-tools/night-preview/README.md and symbols/manifest.json.

The current comparison uses the directional own-ship symbol instead of the
previous nondirectional simplified ring. Night remains chart 40%, symbols 60%;
scale theming and unfiltered menus/buttons remain. Only isolated preview changed,
no production build or live publication. Existing preview URL remains valid.

Checks: SVG dimensions/pixel-anchor transforms, PNG size, Chromium loading real
map assets through the isolated path, fonts, Day/Night rendering and no page
errors. Evidence: /tmp/symbol-map-results.json and /tmp/symbol-map-{Dag,Nacht}.*.
Rebuild the isolated subtree with its Python script after future webapp builds.
Never deploy `night-preview` (already excluded by release scripts).

## Approved night preset — 2026-09-26

User approved the screenshot values: chart brightness 40%, symbol brightness
60%. Both the initial preview state and Night button now use these values.
Day/Dusk unchanged; menus/buttons remain undimmed. Preview only, not deployed.
This supersedes earlier 35/70% night examples below.

## Night preview scale colors — 2026-09-26

The scale bar now follows Day/Dusk/Night using scoped OpenLayers color variables
mapped to Freeboard/OpenBridge foreground, secondary foreground and surface.
Text halo and alternating segments no longer stay white at night. Only the
isolated dev-tools/night-preview HTML and public copy changed; scale math, units,
menus/buttons and production webapp unchanged. Browser evidence:
`/tmp/scale-preview-results.json` and `/tmp/scale-preview-*.png`.

## Separate symbol dimming and OpenBridge comparison — 2026-09-26

Extended the isolated `/night-preview/index.html` example at the user's request.
Independent symbol slider (40–100%) targets the shared plain `ol-layer` feature
canvas; chart-specific containers retain their separate slider. Presets are
Day 100/100%, Dusk 60/85%, Night 35/70% for chart/symbol respectively. UI menus
and toolbar ancestors remain unfiltered. Shared routes, labels and warning
symbols also dim; production work must isolate overlays and warning priorities.

“Symbolen vergelijken” shows current own ship, AIS and waypoint assets next to
exact SVG markup from installed OpenBridge Next.162, plus selected/dangerous AIS
and active/next waypoint variants. These are comparison candidates, not actual
map replacements. See dev-tools/night-preview/README.md for source names/scope.
Browser verified independent sliders, presets, menu/toolbar filters, 7 official
SVGs, 3 current assets and narrow viewport. `/tmp/symbol-preview-results.json`
and comparison/menu screenshots hold the evidence. No build/deploy or production
source changes. Refresh the existing preview URL to see the new controls.

## Chart-only night preview — 2026-09-26

User requested an example and explicitly requires menus/buttons not to dim.
Isolated interactive example: `dev-tools/night-preview/index.html`, copied to
`public/night-preview/index.html`, accessible through localhost:4201/night-preview/index.html.
Day/Dusk/Night presets use 100/60/35% chart brightness plus a 15–100% slider.
The iframe receives the existing theme protocol. Its local injected CSS disables
the old whole-app filter and targets only `.ol-layer[class*=" chart-"]`.
Menu/button palette changes are independent from chart dimming; AIS/routes are
also outside the dimmer. Production source and live webapp are unchanged.

Do not ship `public/night-preview` in later releases; /tmp deployment scripts
now explicitly exclude it. Recopy the source HTML after builds. Scope is current
raster chart containers; vector/MapLibre handling needs separate assessment.
Browser validation and screenshots are in /tmp/night-preview-*.

## AIS vessel panel live — 2026-09-26

AIS/Vessels now shares the resource-panel OpenBridge presentation. Header actions
and per-vessel focus, center, track, history and properties use native icon
buttons with accessible names and existing tooltip/disabled guards. Vessel names
truncate within the panel and also support Enter/Space for opening properties.
Virtual rows and CDK itemSize both use 104px. Ship-type/IMO/buddy filters wrap
within the header; ship-type choices have their own scrollable list. All AIS
component class code, services and map calculations remain unchanged.

User also asked about nighttime charts. Investigation only: `.app-night` in
`src/styles.scss` currently filters the whole app at brightness(0.3), while
OpenBridge's resolved/embedded palette is separate. Proposed future work is
chart-only dimming per Dusk/Night with manual adjustment, preserving independent
AIS/route/alert contrast and avoiding double dimming with the legacy filter.
No chart coloring or night-mode behavior was changed in this pass.

Validation: production build, ESLint and diff check passed; 8 focused tests passed
(actions, disabled guards, keyboard properties, base list behavior). Chromium
passed Bright/Day/Dusk/Night at 1280px and Day at 480px, including long names,
104px rows, 48px buttons, final vessel reachability and text/ship-type filtering.
Live smoke passed. All browser HTTP writes were blocked and fixtures stayed local.
294 production files published and verified, no restart/Skip update/staging/commit.
Release/rollback: `/home/pi/freeboard-releases/20260926-183147-ais-panel`.
Preview galleries restored and AIS screenshots added to `/resource-review/`.


## Toolbar icon polish live — 2026-09-26

Labs/Experiments now uses the same native OpenBridge icon button and focus/menu
adapter as the other toolbar actions. The menu and debug-capture callback are
unchanged. The upper-left official menu SVG has explicit dimensions and an
optical horizontal correction: its path bounds are x=4..21 within a 24px viewBox,
so shifting by half a pixel at 24px centers the artwork inside the button frame.
Production build, targeted ESLint and diff check passed. Chromium verified both
menus opening/closing and matching Labs styling in all four themes, in preview
and live. Menu artwork center offsets are exactly 0px in both axes. No debug
capture or other operational command was invoked; browser HTTP writes blocked.
294 static files published and hash-verified, no service restart or Skip update.
Release and rollback: `/home/pi/freeboard-releases/20260926-182324-toolbar-icons`.
Existing preview galleries restored after building. Reload Skip with Ctrl+F5.

## Resource side panels live — 2026-09-26

Continued the approved migration with Charts, Routes and Waypoints. Native
OpenBridge icon buttons retain every existing callback and disabled guard.
Component class bodies are byte-for-byte unchanged; services and navigation
calculations are untouched. Existing Material inputs, checkboxes and Bounds/In
view toggles retain the foundation's OpenBridge theme adapters in this pass.

A stylesheet shared only by these three components provides natural header/list
layout, consistent spacing, semantic surfaces/dividers and wrapping chart actions.
Routes use 160px virtual rows and waypoints 104px, with matching CDK itemSize.
The CDK content wrapper is constrained to panel width so long route descriptions
cannot push checkboxes outside the panel. Other resource panels are unaffected.

Validation: production build, targeted ESLint, strict OpenBridge TypeScript and
31 tests across five files passed. Browser checks use read-only HTTP and local
route fixtures; operational actions are not sent to the boat. Chromium passed 15 panel/theme/viewport combinations: all four themes at 1280px
and Day at 480px. Verified row widths/heights, 48px buttons, last route reachable,
filter/clear, chart menu and no page errors. Live smoke passed all three panels.

294 static Freeboard files were published and hash-verified. Release/rollback:
`/home/pi/freeboard-releases/20260926-172022-resource-panels`.
Reports and the prior live webapp backup are in that directory. No Skip update,
service restart, operational command, staging or commit. Preview gallery:
`http://localhost:4201/resource-review/`. Reload Skip with Ctrl+F5.

## Autopilot floating-panel refinements live — 2026-09-26

User confirmed the live foundation and requested OpenBridge shadow/radius,
additional Engage spacing and opening next to the right toolbar. The existing
live-publication workflow was continued for this bounded CSS-only change.

The official Next.162 App Menu uses an 8px radius and `--shadow-floating`; both
are now applied to the autopilot panel. The user's Storybook App Menu reference
was also opened in Chromium. Status/control columns give the Engage toggle more
room (measured label-to-switch gap 8.53px). Initial position is 8px left of the
right toolbar, with the original top offset. Dragging remains available and
closing/reopening restores the right-hand initial position.

Production build and diff check pass. Chromium verified all four themes at
1280×800 plus Day at 1920×1080 and 480×800, with no overflow or page errors;
mouse drag and reopen position passed. Panel stays 248px × about 275px. Existing
bundle/CommonJS warnings remain. Only autopilot CSS changed; command logic and
services were untouched, so existing command tests were not rerun for this pass.

294 Freeboard production files were published and checked by SHA256; live index
hash matched, and the same spacing/position/drag smoke passed on the live app.
Skip was not redeployed. No operational commands, restart, staging or commit.
Backup and release: `/home/pi/freeboard-releases/20260926-170400-autopilot-panel-polish`.
Recovery uses `freeboard/live-before.tar.gz`, copying assets then index.html as
in the previous release. Current screenshots are in the local `/autopilot-review/`
gallery. Operator should Ctrl+F5 to load the new Freeboard build inside Skip.

## Live publication authorized and completed — 2026-09-26

The user explicitly requested live deployment. The tested Freeboard and Skip web
builds are now published in the Signal K installation. This supersedes earlier
"not deployed" notes below. 294 Freeboard and 401 Skip files were verified by
SHA256 after publication. Assets were published before index.html; old hashed
assets were retained. Review/demo fixture files were excluded.

Live directories:
- `/home/pi/.signalk/node_modules/@signalk/freeboard-sk/public`
- `/home/pi/.signalk/node_modules/@halos-org/skip/public`

Backups, exact build snapshots, manifests, source snapshots, build logs and live
verification: `/home/pi/freeboard-releases/20260926-161638-openbridge-theme-sync`.
Each app has a complete `live-before.tar.gz`; README.md records recovery order.
Only static web files changed. No staging/commits, service restart, helper/plugin
or package-metadata change. Installed Freeboard package remains 3.1.1; the approved
web build reports 3.2.0-beta.4. Skip remains 1.5.0.

Live HTTP entry hashes and 14 Freeboard / 16 Skip linked JS/CSS assets matched the
release. Chromium loaded both live apps without page errors; Freeboard zoom
controls, autopilot opening/dragging/closing passed. All four inherited palettes
passed against the live receiver using a browser-intercepted mock host. This is
not an authenticated Skip dashboard test. The check blocked two startup chart
resource POST attempts and sent no autopilot command.

Operator next step: fully reload Skip (Ctrl+F5) and confirm embedded Freeboard
follows its theme inside the existing authenticated dashboard. Reload standalone
Freeboard to use the new chrome/autopilot. No further deployment is pending for
this source snapshot; await the user's next task.

## Project and milestone

- Repository: `/home/pi/freeboard-openbridge`; upstream `SignalK/freeboard-sk`.
- Branch: `jrg-openbridge`; Freeboard `3.2.0-beta.4`.
- Locked Angular `21.2.23`, Material `21.2.14`, OpenLayers `10.10.0`.
- **Milestone 1 complete.** Implementation and focused checks passed; user
  accepted the visual result with “ziet er goed uit”. The subsequent autopilot presentation scope was explicitly authorized; see below.
- Nothing staged, committed, pushed or deployed. No service restarted.
- No navigation calculations, AIS/radar/chart feature rendering, helper code,
  versions or maintainer-owned feature documents changed.

## Architecture and package decision

Angular standalone AppComponent owns the shell, floating controls, drawers and
menus. AppFacade owns shared configuration and server integration. Feature
modules own OpenLayers, resources, alarms, autopilot, radar and plotter extensions.
OpenLayers construction/rendering already uses outside-Angular boundaries.
`OPENBRIDGE_FREEBOARD_AUDIT.md` maps the actual files, baseline theme/storage,
surface roles, responsive constraints and performance boundaries.

Official core `@oicl/openbridge-webcomponents` is pinned exactly to
`2.0.0-next.162` as a build dependency, matching `/home/pi/skip-dev`. Direct Lit
custom elements avoid the Angular wrapper's Angular 20 peer constraint; Freeboard
remains on Angular 21. Next.167 was the registry Next inspected during the audit,
not the selected version. Only used modules/icons are imported. Official CSS loads
once; Noto Sans is local with its OFL license. Package licensing metadata is
recorded in the audit; no legal compatibility conclusion is claimed.

## Theme state and storage

`src/app/lib/theme/theme.service.ts` owns a resolved readonly theme signal and
`html[data-obc-theme="bright|day|dusk|night"]`. Shell and detached CDK overlays
inherit it. One OS preference listener is cleaned up on destruction; unchanged
themes avoid DOM writes even when visited from existing stream callbacks.

The existing `display.darkMode.source` preference accepts the four theme names,
0 (automatic OS) and 1 (automatic Signal K). Legacy -1/manual On becomes Dusk.
OS resolves to Day/Dusk; Signal K mode resolves to Day/Dusk/Night. Existing
configuration cleaning, local storage and authenticated app-data persistence are
reused. No parallel storage key, cross-app sync or new Signal K path was added.
The legacy enabled flag remains derived for existing consumers.

The existing automatic/forced `.app-night` filter still affects the whole shell,
including the chart. Chart inversion remains separate. Choosing Night changes
the UI palette; it does not automatically recolor chart pixels.

## Semantic foundation and migrated chrome

`src/openbridge-theme.scss` maps page/component/section/context/viewport,
text/icons, states, outlines, scrollbars and spacing to verified official tokens.
Material supported token overrides bridge the remaining controls. Both Chromium
and Firefox scrollbar rules are provided. Primary touch targets remain 48px.
`<fb-map data-fb-surface="dynamic-viewport">` identifies the boundary; its
cartography does not consume a generic application background/filter.

Native OpenBridge controls now cover:

- Existing floating toolbar icon buttons, zoom buttons and mark-position button;
  placement and handlers are retained, with no top-bar redesign.
- Settings theme selector, checkboxes, sliders and ordinary single-value selects.
  The Display group orders Source/Data, Behavior, Appearance, Layout/Visibility.
- Shared dialog action buttons and confirmation checkbox, information-panel close,
  standard alert actions and alert-list buttons/sound toggle.
- Redundant outer cards removed from login and alert list; meaningful groups remain.

Typed OnPush Angular forms adapters live in `src/app/lib/components/openbridge`.
They retain number/string/null identities and update forms before save callbacks.
Next.162 dropdown/slider accessible names are forwarded to native shadow controls.
A shared directive bridges CDK host focus to those controls and prevents disabled
activation; Chromium needs deferred forwarding after host focus settles.

Material/CDK still owns menus and overlay positioning/focus, tabs, text fields,
multi-selects and the provider selector with disabled options. Resource drawer
content and domain instruments are not a complete native migration. The About
external link remains an anchor with its existing `rel="noopener"` behavior;
Next.162's native button does not forward a rel property. These exceptions must
not be described as a fully native OpenBridge application.

Map component changes are limited to imports/schema metadata and the two zoom
control elements. Mark-position handling, chart layers, routes, waypoints,
coordinates, AIS/radar and navigation calculations are unchanged. No new stream
subscriptions or map rebuild path were introduced.

## Changed file groups

- `package.json`, lockfile, `angular.json`: exact package and styles order.
- `src/app-theme.scss`, new semantic stylesheet and `src/assets/fonts`: foundation.
- New `lib/theme`, app config/types, shell and settings facade: state/persistence.
- New `lib/components/openbridge`: typed forms/focus integration and focused tests.
- Shell, settings template, common dialogs, waypoint button, info panel,
  alert components and map zoom markup: chrome integration.
- Existing app/config/settings specs extended; `tsconfig.openbridge.json` enables
  strict checking of all new integration code without changing legacy TS policy.
- This handoff, architecture audit and reusable guidelines.

## Verification

All commands below passed after the latest implementation changes:

- `npx tsc -p tsconfig.openbridge.json --noEmit`: strict new foundation/adapters.
- `npx tsc -p tsconfig.app.json --noEmit`: application types under repo settings.
- `npm run build:web`: production build and Angular template compilation.
- Focused `npm run test:ci`: **6 files, 42 tests passed**, covering theme resolution,
  OS listener/root state, config migration/persistence, native forms integration,
  settings saves and shell regression behavior. No whole-suite run on the Pi.
- Targeted ESLint on all changed/new TypeScript; touched TS/HTML Prettier check;
  `git diff --check`.

Browser: headless Chromium with the real local read-only preview. Four themes at
1280×800 and 1920×1080, each with map/toolbars, menu, settings, About dialog,
Charts drawer and alert list (48 screenshots), plus 480×800 settings.
All eight theme/size cases pass menu Enter activation, Escape focus restoration,
dialog focus containment, 48px toolbar targets and themed scrollbar inspection.
No page errors; narrow settings have no horizontal overflow. Separate live-switch
checks retain the same OpenLayers viewport node and reload the persisted Night
selection. This is not a full performance benchmark or a guarantee about every
legacy feature panel.

Artifacts/logs (local, not committed):

- `/tmp/freeboard-openbridge-review/index.html` and `results.json`.
- `public/openbridge-review/index.html`: ignored copy served by local preview.
- `/tmp/freeboard-openbridge-build.log`, `-tests.log`, `-lint.log`.
- `/tmp/freeboard-openbridge-browser-review.json`: persistence/viewport checks.
- `/tmp/freeboard-openbridge-baseline-build.log`: isolated original-build comparison.

## Known issues and review limits

- Initial raw bundle grows from **3.76 MB to 4.70 MB**, crossing the configured
  4 MB warning, below the 5 MB error threshold. Estimated transfer grows from
  about 742 kB to 793 kB. Official CSS/components are the main new payload;
  no budget was raised. Existing CommonJS warnings also occur in the baseline.
- Official Next is prerelease. Recheck adapters/tokens when upgrading.
- Active alarm acknowledgement/silencing and connected-vessel commands were not
  exercised. Alert-list screenshots show an empty list. Authenticated server
  preference writes were not exercised; the existing persistence path is retained.
- Firefox rules exist but were not browser-tested. Chromium touch-target checks
  do not replace a physical touchscreen or night-at-sea review.
- The chart remains bright under the Night application palette unless the existing
  dimming/chart treatment is separately enabled. That separation is intentional.
- User accepted the visual result. The test limitations above remain applicable.

## Local preview and environment

Preview runs only at `http://127.0.0.1:4201`; gallery:
`http://127.0.0.1:4201/openbridge-review/index.html`.
It serves this checkout's ignored build and proxies local Signal K reads without
forwarding credentials; HTTP writes are blocked. No deployment or server restart.
Automatic review rejected an earlier all-interfaces preview because it would expose
local Signal K data. Loopback-only preview was approved and is the active version.

Shell sandbox setup fails before execution with a bubblewrap mountinfo error;
reviewed escalation is used. `rg` is absent, so searches use grep/find. DeepWiki
was attempted but failed; the actual code is the architecture source of truth.

## Next task and roadmap

Milestone 1 is accepted. Keep all work unstaged and uncommitted and wait for the
user to agree the next scope with the architecture conversation.

**Stop before milestone 2.** A sensible later milestone is a separately
agreed presentation pass over remaining resource/context controls, followed by
scoped map/AIS/radar integration. Domain changes, autopilot/widgets and cross-app
theme synchronization each require their own approved scope. The guidelines
record possible synchronization mechanisms without implementing one.

## Follow-up fix: zoom control hit testing

The user reported that Zoom in did not work in the preview. Real pointer testing
reproduced a migration layout regression: block-level native buttons stacked,
placing Zoom in beneath the north-arrow image, which intercepted clicks.
The zoom container now uses a horizontal flex row with semantic spacing and
48px height. The obsolete whitespace spacer was removed. Zoom handlers and
map/domain logic are unchanged.

The rebuilt preview passes real Zoom in/out clicks at 1280×800, 1920×1080 and
480×800: +1 then -1 zoom, aligned non-overlapping 48px targets. Production
build/template compilation, template formatting and diff checks pass. Browser
regression results are in `/tmp/freeboard-zoom-regression.json`; corrected
screenshots refresh the existing gallery. The earlier screenshot-only review
missed this pointer interception, so the follow-up explicitly checks actual clicks.

## Approved follow-up: compact autopilot presentation

The user approved the standalone compact design, requested retained dragging,
and then explicitly authorized implementation. This scope supersedes the earlier
stop before milestone 2 for the autopilot presentation only; theme sync, domain
rendering and other later work remain unapproved.

Implemented in `src/app/modules/autopilot/autopilot.component.ts` and `.css`:
248px-wide semantic OpenBridge panel, no physical-device background, no pilot-name
or title row, 12px side margins, aligned status/control columns, and equal-sized
correction buttons with at least 48px touch targets. The two-state layout is about
275px high; optional provider controls and long status names may add height.
The header around Target/No Pilot is the CDK drag handle. Close and command controls
are outside that handle. The original initial position and stacking order remain.

All existing component class methods/computed conditions and the entire autopilot
service are unchanged. Original target degree formatting/precision is deliberately
retained under the user's exact-behavior constraint. Native controls call the same
handlers once. The engage toggle uses external control so reported pilot state,
not a speculative visual update, remains authoritative. Provider mode/state menus,
conditional Dodge support, disabled conditions, command values and error handling
remain. No Dodge control is added for providers that do not advertise it.

Verification:
- New `autopilot.component.spec.ts`: **11 passing tests** using mocked services,
  including all four adjustment values, engage/disengage, server-driven state,
  missing/offline pilot, provider menus, conditional Dodge, close and 403 handling.
- App TypeScript, production Angular build/templates, targeted ESLint, touched-file
  Prettier and `git diff --check` pass. Existing bundle/CommonJS warnings remain.
- Real integrated panel opens, moves by mouse and closes in Chromium.
- All four themes at 1280×800 and 1920×1080 have no panel overflow/page errors.
- Touch dragging at 480×800 moves the panel correctly. No live autopilot commands
  were sent during browser verification; command behavior was tested with mocks.

Live preview: `http://127.0.0.1:4201/` (open Autopilot).
Integrated screenshots: `http://127.0.0.1:4201/autopilot-review/index.html`.
The earlier standalone mockup remains at `/autopilot-example/index.html`.
Logs/artifacts: `/tmp/freeboard-autopilot-tests.log`, `-build.log`,
`/tmp/freeboard-autopilot-review/results.json` and its screenshot directory.
No staging, commits, deployment or service restarts. Await the user's next scope.

## Authorized follow-up: Freeboard inside Skip follows its theme

The user selected option 1: only the embedded Freeboard instance follows Skip;
standalone Freeboard stays independent. Implemented in the Freeboard ThemeService
and settings indication, and `/home/pi/skip-dev/src/app/widgets/widget-freeboardsk/`
(sender plus new focused tests). The versioned same-origin handshake and lifecycle
are documented in OPENBRIDGE_FREEBOARD_GUIDELINES.md. No persisted Freeboard
preference is overwritten; old night dimming remains separate.

Verification: Freeboard's 14 focused theme/settings tests and Skip's 3 focused
sender tests pass. Strict Freeboard foundation/app types and Skip strict app types,
targeted lint and diff checks pass. Freeboard production build passes. Skip sender
tests use `/tmp/skip-theme-sync.spec.json` to exclude pre-existing unrelated test
compilation failures; full Skip suite is not claimed.

A browser integration test uses a clearly labeled mock host with actual Freeboard
and passes all four palettes, retained OpenLayers viewport, inherited-settings
indicator, iframe reload, standalone-tab independence and persisted standalone
Bright after reload. No page errors. This is not an authenticated live Skip
session. The actual Skip sender is covered by its Angular component tests.

Review fixture: `http://127.0.0.1:4201/theme-sync-preview.html`.
Logs: `/tmp/freeboard-theme-sync-tests.log`, `-build.log`, `-browser.log`,
`/tmp/skip-theme-sync-tests.log` and `-build.log`.
Changes remain unstaged/uncommitted in both checkouts. No deployment or restart:
the currently served production Skip/Freeboard are not yet updated with this
contract. Do not claim live production synchronization until both are published
under separate authorization.

Both production builds completed successfully for the embedded-theme follow-up.
Existing size/CommonJS warnings remain; no live files were published.
