# Standalone Freeboard OpenBridge

Package: `@j070nl/freeboard-openbridge`, version `3.2.1-openbridge.2`.
Own branch: `openbridge/standalone` in `j070nl/freeboard-sk-ob`.
Canonical URL: `/@j070nl/freeboard-openbridge/`.

The plugin deliberately retains ID `freeboard-sk`, its existing API endpoints and
configuration, and frontend application/profile ID `freeboard`. Only one package
with that helper ID may be active. Remove the upstream package from discovery when
installing this one. Old `/@signalk/freeboard-sk/` links redirect with HTTP 307 to
our canonical URL, preserving paths and query strings; SKIP requires no rebuild.
Browser storage remains on the same origin and uses the same keys.

Runtime dependencies are bundled by `npm pack --ignore-scripts` after a reviewed
`npm run build:all`. Keep the exact release archive: it is sufficient to restore
the package files/dependencies without npm registry access. Cached hashed assets
may be retained in a deployment archive for already-open clients; new index and
PWA manifest point to the new version. There is no parallel old app/helper.

Validation for this migration: 21 helper tests (including legacy URL behavior),
18 selected UI tests, helper/web build, targeted ESLint, and loading the packed
helper using its bundled dependencies. Earlier 101 custom/intersection tests remain
baseline evidence. No npm publication, hardware commands or field testing implied.

Install/rollback on this Pi uses the checked `migrate.py` in the release directory
recorded in central SYSTEM_STATE.md/RECOVERY.md. It verifies the original package
and root metadata, stops Signal K briefly, moves the old package outside discovery,
installs this package, changes only its npm entries, then starts Signal K. A full
old-package archive and npm metadata provide immediate rollback. Older frontend-
only rollback recipes must not target the removed upstream package directory.
