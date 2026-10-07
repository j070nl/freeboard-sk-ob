> The approved visual changes have now been integrated into the production
> source. This directory retains the original comparison experiments for reference;
> their prototype canvas/DOM hooks are not shipped. Production editing and release
> instructions are in ../openbridge-release/README.md.

# Chart-only nighttime preview

Run `python3 dev-tools/night-preview/build-symbol-map.py` after building and serve
through the loopback read-only preview at port 4201. Open /night-preview/index.html.
This is a development example, not a production feature. Never deploy the
public/night-preview directory with the production webapp.

The same-origin frame receives the existing embedded theme protocol. Presets:
day 100%, dusk 60%, night 40%, with a 15–100% manual brightness slider.
CSS is injected only into the example frame: the legacy whole-app .app-night
filter is disabled there, and brightness applies to chart-specific OpenLayers
containers (ol-layer chart-*). Existing per-chart canvas adjustments remain.
UI stays outside both filters. AIS/routes on the shared feature canvas have the
independent symbol filter described below.

Scope: current raster/WMS/WMTS/TileJSON chart containers. Vector/MapLibre charts
need separate evaluation before production integration. This does not invent a
night cartographic palette or independently recolor raster chart labels.
Production code, settings and Signal K services remain unchanged.

## Symbol comparison and dimmer

The additional symbol slider targets the renderer's shared plain `ol-layer`
canvas. The tested current map has two `chart-*` containers plus one shared
feature canvas. Presets for that canvas: day 100%, dusk 85%, night 60%; manual
range 40–100%. Routes, feature labels, selections and warning symbols sharing
that canvas dim together. This is not a production per-feature brightness or
alarm-priority implementation. Other enabled overlays sharing this class may
also dim; radar/weather need separate layer isolation before production use.

The comparison shows three current built-in assets beside exact SVG markup from
installed @oicl/openbridge-webcomponents 2.0.0-next.162: own-ship-iec,
ais-target-activated-iec, waypoint-optional-iec. Additional selected/dangerous AIS
and active/next waypoint variants are shown. These are shape candidates, not a
claim of certified chart rendering or final type/status color mapping. The preview map now uses the adapted assets described below; the production map
is unchanged. SVGs are copied unmodified from each component's `icon`
template, using currentColor for the sample foreground. Current Freeboard assets
are referenced from /assets/img/vessels and /assets/img/waypoints.

The scale bar/line also follows the embedded palette. Scoped OpenLayers color
variables map foreground to --fb-text, alternating segments to
--fb-text-secondary/--fb-component and the text halo to --fb-component. This
removes fixed white segments/halos in Night without altering scale calculations,
units or the independently dimmed chart/symbol layers.

## Map symbol replacements (preview only)

Run `python3 dev-tools/night-preview/build-symbol-map.py` after building Freeboard.
The iframe now loads `/night-preview/map/index.html`. That subtree links the
production build and assets (including media/fonts), overriding only these files:

- `vessels/ais_active.svg`: official AIS activated triangle, existing magenta
  fill/black outline family; other AIS type/buddy/inactive files are untouched.
- `vessels/ais_self.svg`: official `own-ship-iec` bow shape for focused AIS.
- `vessels/self.png`: same shape rendered as a transparent 19×45 PNG for the
  own-vessel renderer. Its stale/blur/fixed variants are unchanged.
- `waypoints/waypoint.svg`: official optional waypoint circle in existing orange.
  Custom symbols, AtoNs and chart-embedded symbols remain unchanged. Built-in POIs
  are covered by the later POI migration below.

Paths come from @oicl/openbridge-webcomponents 2.0.0-next.162. Geometry is retained;
color, outline, scale and translation adapt it to existing Freeboard presentation.
This is not a statement of certified IEC chart rendering. Attribution/license:
OpenBridge web components, OICL (package AGPL-3.0-only; see installed LICENSE files).
The manifest in symbols/ records source names and transforms.

Existing image-pixel anchors are preserved: own/focused ship (9.5,22.5), normal
AIS (17,16), waypoint (12,24). The waypoint canvas is taller so the new circle is
centered exactly on the coordinate instead of at the pin tip. Renderer rotation,
scale, feature positions, state selection and navigation code are untouched.
External symbol-provider overrides still take precedence.

`self.png` is a browser rasterization of the corresponding ais_self.svg at native
19×45 with transparent background. Regenerate it when changing that SVG.
Never copy the isolated `map` subtree into the installed Signal K application.
The production assets remain unchanged. Compare panel uses original assets from
/assets and official monochrome source shapes; the map uses the adapted versions.

## POI picker and map assets

`build-symbol-map.py` also runs `build-poi-symbols.py`. Eighteen built-in POI
files are overridden only in the isolated map assets directory. MatIconRegistry
(picker) and MapImageRegistry (map) resolve the same filenames and resource IDs.
The original 37×37 canvas, [1,37] anchor and 0.65 map scale remain unchanged.

Six official glyph replacements, inside a common subdued marker frame:
anchorage → anchor-iec; fuel → energy-petrol; ferry → ship-carferry;
dock → harbour-berthing; radio-call-point → com-radio;
notice-to-mariners → info. Official SVG bodies are preserved, including their
path rules and any nested shapes. These are adapted POI markers, not a claim
that OpenBridge defines this particular chart marker frame.

Twelve other POIs retain their existing glyph geometry but replace saturated
orange/green/magenta/blue backgrounds with subdued slate/green/violet/blue tones.
They are not labeled as official replacement glyphs. Hazard and dive-site files
remain byte-identical, as do AtoNs and third-party symbol-provider overrides.
The earlier vessel/waypoint changes are retained without new alterations.

Browser validation opens the actual waypoint editor, tests the six selected IDs,
and cancels without saving; HTTP writes are blocked. Verify after refreshing the
preview: waypoint list → properties → Edit. Day/Night screenshots and the network
report live at /tmp/poi-picker-* and /tmp/poi-preview-results.json.

A preview-only CSS rule makes tooltip overlays pointer-transparent while the
waypoint dialog is open. The browser's popover-backed tooltip otherwise covered
an adjacent symbol during successive choices. Text/tooltips remain visible; no
picker handlers or persistence code changed. Mouse and touch selection are
checked without saving the waypoint.

### Label comparison

The Labels button switches between current rendering and lighter neutral labels
with a dark halo in Night/Dusk (dark text with a light halo in Day). This affects
canvas feature labels, including AIS names; text baked into chart tiles is unchanged.
The preview-only `label-preview.js` loads before Angular in the isolated map and
wraps canvas fillText for ordinary feature layers. It preserves other text colors
and restores canvas state. Production implementation should use OpenLayers Text
styles rather than this experimental canvas hook. Label overlap is unchanged.

Browser validation: real AIS labels render, the comparison toggles both ways,
red text bypasses the enhancement, canvas fill/line width are restored, and no
page errors occur. HTTP writes are blocked. Screenshots: /tmp/labels-enhanced.jpg
and /tmp/labels-original.jpg; test: /tmp/label-preview-check.mjs.

### Panel styling preview

`panel-preview.css` and `panel-preview.js` load only in the isolated map.
Anchor Watch keeps its existing Angular controls, disabled rules, numeric values
and handlers. Its old bitmap is replaced visually with a transparent SVG radius
schematic; the raised/dropped illustration follows the original background asset
state. This is a schematic, not a geographic chart or live vessel trail. The empty
Status caption becomes Alarm radius. No new alarm state is inferred.

Popup surfaces use theme tokens, 8px corners and the floating shadow. Information
drawers are 300px wide (capped to viewport), with aligned note/waypoint actions
and wrapped tables. Radar retains all controls with space for device and slider.
All of these are visual prototypes; no production templates/services were edited.

Chromium checked Anchor Watch in Day/Night, no horizontal overflow, and the radar
panel without control actions or HTTP writes. Existing waypoint details provide
a second drawer layout check. The Notes list was empty during validation, so the
specific bridge note from the user's screenshot has not been checked end to end.
Scripts/screenshots: /tmp/panel-preview-check.mjs, /tmp/anchor-panel-*.jpg,
/tmp/radar-panel.jpg, /tmp/waypoint-panel-preview-check.mjs.

Action buttons in popups, info drawers and Anchor Watch now use --fb-text and
--fb-disabled through Material text-button tokens, including state layers and
inherited icon colors. This removes the residual pink Material accent in the
preview without changing warning/status symbols or action handlers.

### Startup screen

loading-screen.html replaces the app-root fallback only in the isolated map.
It uses inline styles and an inline navigation illustration so it is readable
before Angular, fonts or stylesheet downloads complete. Neutral dark fallback
avoids a white flash; available theme tokens are inherited. The persistent
/night-preview/loading.html review offers three illustrative palette choices.
Real startup has no added delay or invented progress percentage. Angular removes
the fallback normally. Reduced-motion preference stops the spinner; recovery
help is available via a native details disclosure. Production src/index.html
and PWA startup images are unchanged. Browser check: /tmp/loading-preview-check.mjs.
