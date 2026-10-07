import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { OpenBridgeControlDirective } from 'src/app/lib/components/openbridge/control.directive';
import '@oicl/openbridge-webcomponents/dist/components/button/button.js';
import '@oicl/openbridge-webcomponents/dist/components/toggle-switch/toggle-switch.js';
/***********************************
  Alert List
  <alert-list>
***********************************/
import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  input,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { AppFacade } from 'src/app/app.facade';
import { getAlertIcon } from '../../icons';
import { AlertData } from './alert.component';
import { NotificationManager } from '../notification-manager';

@Component({
  selector: 'alert-list',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    MatTooltipModule,
    CommonModule,
    MatButtonModule,
    OpenBridgeControlDirective,
    MatIconModule,
    MatMenuModule,

    FormsModule,
    CdkDrag
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./alert-list.component.css'],
  template: `
    <mat-menu #alarmsmenu="matMenu">
      <button mat-menu-item (click)="raiseAlarm('mob')">
        <mat-icon class="ob" svgIcon="alarm-mob"></mat-icon>
        &nbsp;Overboard!
      </button>
    </mat-menu>
    <div>
      <div class="alert-list-main mat-app-background" cdkDrag>
        <div class="title" cdkDragHandle>
          @if (app.featureFlags().notificationApi) {
            <div>
              <obc-button
                matTooltip="Raise Alarm"
                [matMenuTriggerFor]="alarmsmenu"
                [showLeadingIcon]="true"
              >
                <mat-icon slot="leading-icon">warning</mat-icon>
                Raise
              </obc-button>
            </div>
          }
          <div
            style="flex: 1 1 auto;
            font-size: 14pt;
            line-height: 2.5em;
            text-align: center;
            cursor: grab;"
          >
            Alert List
          </div>
          <div style="display:flex">
            <obc-icon-button
              matTooltip="Silence All"
              (click)="silenceAll()"
              aria-label="Silence All"
            >
              <mat-icon class="ob" svgIcon="sound-off-fill"></mat-icon>
            </obc-icon-button>
            &nbsp; &nbsp;
            <div>
              <obc-toggle-switch
                label="Sound"
                matTooltip="Sound on /off"
                [checked]="!this.app.config.display.muteSound"
                (change)="togglePlaySound()"
              >
              </obc-toggle-switch>
            </div>
            &nbsp;
            <obc-icon-button
              (click)="handleClose()"
              aria-label="Close alert list"
            >
              <mat-icon>close</mat-icon>
            </obc-icon-button>
          </div>
        </div>

        <div class="content">
          <div class="alert-list-container">
            <div class="alert-list">
              @for (item of alerts(); track item[0]) {
                <div class="alert-box">
                  <div
                    style="width:40px;"
                    (click)="notiMgr.showAlertInfo(item[1].path)"
                  >
                    <mat-icon
                      [class]="item[1].icon.class"
                      [svgIcon]="item[1].icon.svgIcon"
                      >{{ item[1].icon.name }}</mat-icon
                    >
                  </div>
                  <div
                    class="alert-text"
                    (click)="notiMgr.showAlertInfo(item[1].path)"
                    [ngClass]="{
                      'blink-text':
                        item[1].canAcknowledge && !item[1].acknowledged,
                      'red-text': ['emergency', 'alarm'].includes(
                        item[1].priority
                      ),
                      'amber-text': item[1].priority === 'alert'
                    }"
                  >
                    {{ item[1].message }}
                  </div>
                  <div style="min-width:96px; display:flex; flex-wrap:wrap;">
                    @if (
                      app.featureFlags().notificationApi &&
                      item[1].sound &&
                      item[1].canSilence
                    ) {
                      <obc-icon-button
                        [matTooltip]="item[1].silenced ? 'Silenced' : 'Silence'"
                        matTooltipPosition="below"
                        [disabled]="item[1].acknowledged || item[1].silenced"
                        (click)="muteAlert(item[1].path)"
                        [ariaLabel]="item[1].silenced ? 'Silenced' : 'Silence'"
                      >
                        <mat-icon
                          [class]="item[1].acknowledged ? '' : 'ob'"
                          [svgIcon]="
                            item[1].silenced
                              ? 'sound-off-fill'
                              : 'sound-high-fill'
                          "
                        ></mat-icon>
                      </obc-icon-button>
                      &nbsp;
                    }
                    @if (
                      app.featureFlags().notificationApi &&
                      item[1].canAcknowledge
                    ) {
                      @if (!item[1].acknowledged) {
                        <obc-icon-button
                          matTooltip="Acknowledge"
                          matTooltipPosition="below"
                          [disabled]="item[1].acknowledged"
                          (click)="ackAlert(item[1].path)"
                          aria-label="Acknowledge"
                        >
                          <mat-icon>check</mat-icon>
                        </obc-icon-button>
                      } @else {
                        @if (item[1].canCancel) {
                          <obc-icon-button
                            matTooltip="Clear / Cancel"
                            matTooltipPosition="below"
                            [disabled]="!item[1].acknowledged"
                            (click)="clearAlert(item[1].path)"
                            aria-label="Clear / Cancel"
                          >
                            <mat-icon>close</mat-icon>
                          </obc-icon-button>
                        }
                      }
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AlertListComponent {
  alerts = input([]);

  @Output() closed: EventEmitter<void> = new EventEmitter();

  protected app = inject(AppFacade);
  protected notiMgr = inject(NotificationManager);

  constructor() {}

  protected handleClose() {
    this.closed.emit();
  }

  protected togglePlaySound() {
    this.app.config.display.muteSound = !this.app.config.display.muteSound;
    this.app.saveConfig();
  }

  protected ackAlert(path: string) {
    this.notiMgr.acknowledge(path);
  }

  protected muteAlert(path: string) {
    this.notiMgr.silence(path);
  }

  protected clearAlert(path: string) {
    this.notiMgr.clear(path);
  }

  protected silenceAll() {
    this.notiMgr.silenceAll();
  }

  /**
   * @description Raise standard alarm
   * @param alarmType Signal K standard alarm
   */
  protected raiseAlarm(alarmType: string) {
    const msg = alarmType === 'mob' ? 'Person Overboard!' : undefined;
    this.notiMgr.raiseServerAlarm(alarmType, msg);
  }

  /**
   * @description Set the alert icon
   * @returns svgIcon value
   */
  protected setIcon(alert: AlertData): string {
    return getAlertIcon(alert).svgIcon;
  }
}
