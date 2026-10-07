import { TestBed } from '@angular/core/testing';
import { afterEach, expect, it, vi } from 'vitest';
import { EmbeddedVisibilityService } from '../../../../lib/embedded-visibility.service';
import { MapComponent } from './map.component';

afterEach(() => TestBed.resetTestingModule());
it('detaches rendering without losing view, size or navigation geometry', async () => {
  let visibility: (visible: boolean) => void;
  const stop = vi.fn();
  await TestBed.configureTestingModule({
    declarations: [MapComponent],
    providers: [
      {
        provide: EmbeddedVisibilityService,
        useValue: {
          visible: true,
          observe(callback: (visible: boolean) => void) {
            visibility = callback;
            callback(true);
            return stop;
          }
        }
      }
    ]
  }).compileComponents();
  const fixture = TestBed.createComponent(MapComponent);
  fixture.detectChanges();
  const component = fixture.componentInstance;
  const map = component.getMap();
  const target = map.getTarget();
  map.setSize([600, 400]);
  map.getView().setCenter([100, 200]);
  map.getView().setZoom(10);
  const geometry = component.getMapViewTopCenter();
  visibility(false);
  expect(map.getTarget()).toBeUndefined();
  expect(map.getSize()).toEqual([600, 400]);
  expect(component.getMapViewTopCenter()).toEqual(geometry);
  expect(map.getView().getZoom()).toBe(10);
  visibility(true);
  expect(map.getTarget()).toBe(target);
  expect(map.getView().getCenter()).toEqual([100, 200]);
  fixture.destroy();
  expect(stop).toHaveBeenCalledOnce();
});
