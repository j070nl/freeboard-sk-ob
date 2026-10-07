import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { OpenBridgeControlDirective } from 'src/app/lib/components/openbridge/control.directive';
import '@oicl/openbridge-webcomponents/dist/icons/icon-close-google.js';
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  output
} from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { InfoPanelFacade } from './info-panel.facade';

@Component({
  selector: 'info-panel',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="position: relative">
      <mat-nav-list style="text-align:right">
        <obc-icon-button aria-label="Close information panel" (click)="close()">
          <obi-close-google></obi-close-google>
        </obc-icon-button>
        <mat-divider></mat-divider>
      </mat-nav-list>
    </div>
    <div
      style="
            position: fixed;
            bottom: 0;
            top: 60px;
            width: 247px;
        "
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: ``,
  imports: [MatListModule, OpenBridgeControlDirective]
})
export class InfoPanelComponent {
  closed = output<void>();
  protected infoPanel = inject(InfoPanelFacade);

  close() {
    this.infoPanel.close();
    this.closed.emit();
  }
}
