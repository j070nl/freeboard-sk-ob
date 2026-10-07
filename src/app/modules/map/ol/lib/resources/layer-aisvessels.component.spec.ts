// Enter the circular map/app graph through its production root before the leaf.
// Keep test module isolation enabled; otherwise load order masks this cycle.
import 'src/app/app.component';
import { describe, expect, it } from 'vitest';
import { ChangeDetectorRef } from '@angular/core';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';
import { AISVesselsLayerComponent } from './layer-aisvessels.component';
import { MapComponent } from '../map.component';
import { MapImageRegistry } from '../map-image-registry.service';
import { SKVessel } from 'src/app/modules/skresources/resource-classes';

describe('AIS map feature classification', () => {
  it('draws unknown neutral, then changes the same feature to passenger blue', () => {
    const layer = new AISVesselsLayerComponent(
      {} as MapComponent,
      { detach: () => {} } as ChangeDetectorRef,
      new MapImageRegistry()
    );
    layer.source = new VectorSource();
    layer.targetContext = 'vessels';
    const target = new SKVessel();
    target.id = 'vessels.test';
    target.position = [4.629, 52.215];
    target.lastUpdated = new Date();
    layer.targets = new Map([[target.id, target]]);
    layer.addTargetWithId(target.id);
    const feature = layer.source.getFeatureById('ais-' + target.id);
    const icon = () => (feature.getStyle() as Style).getImage() as Icon;
    expect(icon().getSrc()).toContain('ais_unknown.svg');
    target.type = { id: 69, name: 'Passenger' };
    target.name = 'KONINGIN JULIANA';
    layer.onUpdateTargets([target.id]);
    expect(layer.source.getFeatureById('ais-' + target.id)).toBe(feature);
    expect(icon().getSrc()).toContain('ais_passenger.svg');
    expect(feature.get('name')).toBe('KONINGIN JULIANA');
    layer.inactiveTime = 360000;
    target.lastUpdated = new Date(Date.now() - 420000);
    layer.onUpdateTargets([target.id]);
    expect(icon().getSrc()).toContain('ais_inactive.svg');
    target.lastUpdated = new Date();
    layer.onUpdateTargets([target.id]);
    expect(icon().getSrc()).toContain('ais_passenger.svg');
    target.type = { id: -1, name: '' };
    layer.onUpdateTargets([target.id]);
    expect(icon().getSrc()).toContain('ais_unknown.svg');
  });
});
