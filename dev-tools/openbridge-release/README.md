# Local OpenBridge release

This directory documents the local Raspberry Pi deployment, not an upstream/npm
release. `publish.py` is the September 2026 approved migration publication recipe:
it expects the source-before archive and passing validation logs in /tmp.
It backs up installed static files and source changes, copies assets first and
index.html last, and checks every deployed hash. It does not change Signal K,
Skip, helper code, routes, waypoints, user settings or package versions.

Each release under /home/pi/freeboard-releases includes a standalone rollback.py.
Run that copy to restore its previous webapp. The optional output directory
argument exercises the restore into an empty temporary directory instead.
Extra hashed build chunks are retained so already open browser sessions can load
their dependencies; reload the page after publishing or restoring.

Editable migration areas:
- src/openbridge-panels.scss: panels and Material action colors.
- src/openbridge-theme.scss and app/lib/theme/map-appearance.service.ts: dimming.
- src/app/modules/alarms/components/anchor-watch.component.html: radius schematic.
- src/app/modules/map/ol/lib/themes.ts and sk-feature.component.ts: label contrast.
- src/assets/img/{vessels,waypoints,poi}: approved symbols.
- src/index.html: startup screen.

Brightness preferences are local per browser and theme, under the localStorage
key freeboard-map-brightness. Restoring the older app leaves that key unused.

The quick Theme toolbar control stores an optional local palette under
freeboard-theme-override. Follow Skip removes this override and resumes the latest
received host palette; standalone Use settings resumes the configured source.
Toolbar vertical alignment lives in src/app/app.component.css.
