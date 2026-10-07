import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { OpenBridgeControlDirective } from './openbridge/control.directive';
import '@oicl/openbridge-webcomponents/dist/icons/icon-waypoint-add-iec.js';
import { Component, inject, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SKResourceService } from 'src/app/modules';
import { Position } from 'src/app/types';

@Component({
  selector: 'wpt-button',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [OpenBridgeControlDirective, MatTooltipModule],
  template: `
    <obc-icon-button
      aria-label="Mark Vessel Position"
      [disabled]="!active()"
      (click)="dropWaypoint()"
      matTooltip="Mark Vessel Position"
      matTooltipPosition="above"
    >
      <obi-waypoint-add-iec></obi-waypoint-add-iec>
    </obc-icon-button>
  `,
  styles: []
})
export class WptButtonComponent {
  protected position = input<Position>([0, 0]);
  protected active = input<boolean>(false);

  private skres = inject(SKResourceService);

  constructor() {}

  protected dropWaypoint() {
    this.skres.newWaypointAt(this.position());
  }
}
