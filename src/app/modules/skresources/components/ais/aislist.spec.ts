import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AISListComponent } from './aislist';
import { AppFacade } from 'src/app/app.facade';
import { SKResourceService } from '../../resources.service';
import { TrackHistoryService } from 'src/app/modules/skstream/track-history.service';
import { FBVessels } from 'src/app/types';
import { SKVessel } from '../../resource-classes';

describe('AIS OpenBridge controls', () => {
  const config = {
    selections: { aisFilterByShipType: false },
    vessels: { aisShowTrack: false },
    map: { zoomLevel: 10 }
  };
  const uiConfig = signal({ mapMove: false });
  const toggleTrack = vi.fn();
  const toggleHistory = vi.fn();
  const hasHistory = vi.fn(() => true);

  beforeEach(() => {
    vi.clearAllMocks();
    config.vessels.aisShowTrack = false;
    uiConfig.set({ mapMove: false });
    hasHistory.mockReturnValue(true);
    TestBed.configureTestingModule({
      imports: [AISListComponent, MatIconTestingModule],
      providers: [
        { provide: SKResourceService, useValue: {} },
        {
          provide: AppFacade,
          useValue: {
            config,
            uiConfig,
            sIsFetching: signal(false),
            featureFlags: signal({ buddyList: true }),
            isVesselTrackShown: () => false,
            toggleVesselTrack: toggleTrack
          }
        },
        {
          provide: TrackHistoryService,
          useValue: {
            available: signal(true),
            refreshRecorded: vi.fn(),
            isShown: () => false,
            hasHistory,
            toggle: toggleHistory
          }
        }
      ]
    });
  });

  async function render() {
    const fixture = TestBed.createComponent(AISListComponent);
    vi.spyOn(fixture.componentInstance, 'initItems').mockResolvedValue();
    const list = fixture.componentInstance as unknown as {
      filteredList: WritableSignal<FBVessels>;
    };
    const vessel = new SKVessel();
    vessel.name = 'Test vessel';
    vessel.position = [4, 52];
    list.filteredList.set([['vessels.test', vessel, true]]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const click = (label: string) => {
      const button = Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
          'obc-icon-button'
        )
      ).find(
        (element) =>
          element.ariaLabel === label ||
          element.getAttribute('aria-label') === label
      );
      expect(button, label).toBeDefined();
      button!.click();
    };
    return { fixture, click };
  }

  it('preserves focus, center, track and history actions', async () => {
    const { fixture, click } = await render();
    const focus = vi.fn();
    const pan = vi.fn();
    fixture.componentInstance.focusVessel.subscribe(focus);
    fixture.componentInstance.pan.subscribe(pan);
    click('Focus vessel');
    click('Center Vessel');
    click('Show vessel track');
    click('Show track history');
    expect(focus).toHaveBeenCalledWith('vessels.test');
    expect(pan).toHaveBeenCalledWith({ center: [4, 52], zoomLevel: 10 });
    expect(toggleTrack).toHaveBeenCalledWith('vessels.test');
    expect(toggleHistory).toHaveBeenCalledWith('vessels.test');
  });

  it('blocks unavailable center, track and history actions', async () => {
    config.vessels.aisShowTrack = true;
    uiConfig.set({ mapMove: true });
    hasHistory.mockReturnValue(false);
    const { fixture, click } = await render();
    const pan = vi.fn();
    fixture.componentInstance.pan.subscribe(pan);
    click('Center Vessel');
    click('Show vessel track');
    click('Show track history');
    expect(pan).not.toHaveBeenCalled();
    expect(toggleTrack).not.toHaveBeenCalled();
    expect(toggleHistory).not.toHaveBeenCalled();
  });

  it('opens vessel properties with the keyboard', async () => {
    const { fixture } = await render();
    const properties = vi.fn();
    fixture.componentInstance.properties.subscribe(properties);
    const name = fixture.nativeElement.querySelector(
      '.vessel-name'
    ) as HTMLElement;
    name.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );
    expect(properties).toHaveBeenCalledWith('vessels.test');
  });
});
