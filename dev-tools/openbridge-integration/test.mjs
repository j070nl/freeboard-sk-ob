// Compact integration gate: custom behavior and its upstream intersections.
// All requests use the Angular test environment; no live boat server is used.
import { spawnSync } from 'node:child_process';
const specs = [
  'src/app/lib/theme/*.spec.ts',
  'src/app/lib/components/openbridge/controls.spec.ts',
  'src/app/lib/embedded-visibility.service.spec.ts',
  'src/app/modules/map/ol/lib/map-visibility.spec.ts',
  'src/app/modules/map/ol/lib/resources/ais-base.component.spec.ts',
  'src/app/modules/map/ol/lib/resources/layer-aisvessels.component.spec.ts',
  'src/app/modules/skstream/skstream.worker.spec.ts',
  'src/app/modules/skstream/skstream.facade.spec.ts',
  'src/app/modules/skresources/components/ais/aislist.spec.ts',
  'src/app/modules/settings/components/settings-dialog.spec.ts',
  'src/app/app.component.spec.ts',
  'src/app/app.component.trail-return.spec.ts',
  'src/app/modules/plotterext/plotterext.save-point-meta.spec.ts'
];
const result = spawnSync(process.execPath, [
  'scripts/test-ci.mjs', '--watch=false',
  ...specs.flatMap((spec) => ['--include', spec])
], { stdio: 'inherit' });
process.exit(result.status ?? 1);
