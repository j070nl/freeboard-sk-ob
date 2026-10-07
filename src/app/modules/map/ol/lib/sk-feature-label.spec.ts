import { describe, expect, it } from 'vitest';
import { ChangeDetectorRef } from '@angular/core';
import { Fill, Style, Text } from 'ol/style';
import { FBFeatureLayerComponent } from './sk-feature.component';
import { MapComponent } from './map.component';
import { AISVesselsLayerComponent } from './resources/layer-aisvessels.component';
import { FreeboardWaypointLayerComponent } from './resources/layer-waypoints.component';
import { MapImageRegistry } from './map-image-registry.service';

describe('feature label contrast', () => {
  it.each([AISVesselsLayerComponent, FreeboardWaypointLayerComponent])(
    'enlarges vessel and waypoint labels without moving their anchor',
    (Layer) => {
      const layer = new Layer(
        {} as MapComponent,
        { detach: () => {} } as ChangeDetectorRef,
        {} as MapImageRegistry
      );
      const style = new Style({ text: new Text({ offsetY: 22 }) });
      layer.setTextLabel(style, 'Name');
      expect(style.getText().getFont()).toBe('12px sans-serif');
      expect(style.getText().getOffsetY()).toBe(22);
      expect(style.getText().getText()).toBe('Name');
    }
  );
  it('adds a contrasting halo and retains zoom visibility rules', () => {
    const layer = new FBFeatureLayerComponent(
      {} as MapComponent,
      { detach: () => {} } as ChangeDetectorRef
    );
    const style = new Style({
      text: new Text({ fill: new Fill({ color: '#333' }), offsetY: 18 })
    });
    layer.mapZoom = 12;
    layer.labelMinZoom = 10;
    expect(layer.setTextLabel(style, 'Vessel')).toBe(style);
    expect(style.getText().getText()).toBe('Vessel');
    expect(style.getText().getFont()).toBeUndefined();
    expect(style.getText().getStroke().getWidth()).toBe(3);
    expect(style.getText().getStroke().getColor()).not.toBe(
      style.getText().getFill().getColor()
    );
    expect(style.getText().getOffsetY()).toBe(18);
    layer.mapZoom = 9;
    layer.setTextLabel(style, 'Vessel');
    expect(style.getText().getText()).toBe('');
  });
});
