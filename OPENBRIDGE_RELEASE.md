# OpenBridge live release

Release: `/home/pi/freeboard-releases/20260929-161737-ais-openbridge-icons-live`

The approved migration is deployed as static Freeboard web files. Signal K, Skip,
helper plugins, user resources and package versions were not changed.

## Restore the previous webapp

```sh
python3 /home/pi/freeboard-releases/20260929-161737-ais-openbridge-icons-live/rollback.py
```

Then reload Freeboard with Ctrl+F5. The script restores the backed-up assets first
and entry page last, verifies every restored file, and retains old hashed chunks
for already open browsers. This procedure was rehearsed into a temporary directory.

The release contains the previous webapp archive, a pre-integration source archive,
a snapshot of deployed files, hashes, source patch/new files and validation logs.

## Later adjustments

Continue editing `/home/pi/freeboard-openbridge`. The maintained UI source lives
in `src/`; component locations are listed in
[the release guide](dev-tools/openbridge-release/README.md). Build and verify before
publishing another release with a fresh backup. No version numbers were changed
and no commits or pushes were made.

Chart/symbol brightness is adjustable under Settings → Display → Appearance.
Values are stored per theme on this browser/device. Night defaults: 40% chart,
60% symbols. UI controls remain undimmed.

The preceding update added the Theme toolbar menu and raised both toolbars by 4px.

Latest update: wind labels use 13px semibold Noto Sans and theme-aware text/halo
colors. AIS vessel names and waypoint labels remain 12px.
This rollback returns to the preceding map-label-size release.


## AIS user-config transition hotfix — 2026-09-29

When the authenticated server configuration enables AIS after initial stream
subscriptions, Freeboard now replaces its static vessel subscriptions and recovers
name/type data immediately. A forced live-browser transition recovered all three
reported targets from type -1 to passenger type 69.


## AIS startup hotfix — 2026-09-29

Freeboard now configures its worker before subscribing, so cached vessel identity
and type data cannot be discarded at startup. Late leaf updates for name, MMSI and
AIS type are merged as an additional recovery path. The live browser check resolves
the three reported passenger vessels and loads the blue passenger symbol.


## AIS safety release — 2026-09-29

Unknown/invalid AIS vessel types use a neutral symbol and explicit unknown label.
Restore the immediately preceding Freeboard web files with:

```sh
python3 /home/pi/freeboard-releases/20260929-144024-ais-safety-live/rollback.py
```

Companion Skip rollback: `python3 /home/pi/skip-releases/20260929-144024-ais-safety-live/rollback.py`.
