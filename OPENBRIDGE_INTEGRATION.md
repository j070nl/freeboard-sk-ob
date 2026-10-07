# Freeboard OpenBridge integration

This is the boat's customized Freeboard source. Upstream is SignalK/freeboard-sk;
our fork is https://github.com/j070nl/freeboard-sk-ob.

- Baseline custom source: d61be436 (includes previously untracked files).
- Integration branch: `openbridge/upstream-3.2.1`.
- Upstream tag: `v3.2.1`, commit 7620379c8e5ce5108a0a8a87988eb766ca9d9c71.
- Candidate version: `3.2.1-openbridge.1`. This is not an npm publication or a
  statement that the boat is running this version.

## Reproduce the compact checks

Use Node 24 and the committed lockfile in a separate checkout:

```sh
npm ci --no-audit --no-fund
npm run test:openbridge
npm run build:web
```

The focused gate covers custom themes/brightness/controls, embedded visibility,
AIS aging/recovery/classification, merged orientation logic, settings, panel
buttons, trail return and extension route-point metadata. HTTP/navigation calls
are mocked; these tests do not operate boat hardware. The build checks application
and template types. Full upstream suites and on-water validation are outside this
compact gate. The operator performs field testing.

Keep local OpenBridge dependencies and source; do not install a stock App Store
update over this frontend. Integrate the next upstream tag in a new branch and
repeat the focused checks, expanding only where the intersection changes.

## Deployment boundary

This branch is source preparation only. The current live frontend and server
helper are separate from this checkout. Do not symlink this checkout into Signal K.
A future frontend release must use reviewed artifacts and verified rollback inputs;
see `dev-tools/openbridge-release/README.md` and the central recovery documentation.
Do not push release tags casually: upstream workflows can publish packages.

## Verified on 2026-10-07

Node 24.21.0, npm 11.19.0. Clean lockfile installation succeeded. All **101 tests
in 15 selected files** passed; targeted ESLint and integration diff checks passed.
Production `build:web` succeeded with strict templates. Initial bundle: 4.76 MB
(4 MB advisory budget warning). Other warnings: CommonJS optimization and upstream
`cdkDragPlaceholder` import. No broad upstream suite, live-browser visual review,
physical equipment test or restore rehearsal claimed. Original runtime unchanged.
