/***********************************
Autopilot Console component
    <autopilot-console>
***********************************/
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  signal,
  ChangeDetectionStrategy,
  input,
  Output,
  EventEmitter,
  effect,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AppFacade } from 'src/app/app.facade';
import { Convert } from 'src/app/lib/convert';
import { AutopilotService } from './autopilot.service';
import { OpenBridgeControlDirective } from 'src/app/lib/components/openbridge/control.directive';
import '@oicl/openbridge-webcomponents/dist/components/button/button.js';
import '@oicl/openbridge-webcomponents/dist/components/toggle-switch/toggle-switch.js';
import '@oicl/openbridge-webcomponents/dist/icons/icon-close-google.js';

@Component({
  selector: 'autopilot-console',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    MatTooltipModule,
    CommonModule,
    DragDropModule,
    MatIconModule,
    MatMenuModule,
    OpenBridgeControlDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./autopilot.component.css'],
  template: `
    <mat-menu #modemenu="matMenu">
      @for (i of modeOptions(); track i) {
        <button mat-menu-item (click)="setMode(i)">
          <span>{{ i }}</span>
          @if (i === apData().mode) {
            <mat-icon>check</mat-icon>
          } @else {
            <mat-icon>ok</mat-icon>
          }
        </button>
      }
    </mat-menu>
    <mat-menu #statemenu="matMenu">
      @for (i of stateOptions(); track i.name) {
        <button mat-menu-item (click)="setState(i.name)">
          <span>{{ i.name }}</span>
          @if (i.name === apData().state) {
            <mat-icon>check</mat-icon>
          } @else {
            <mat-icon>ok</mat-icon>
          }
        </button>
      }
    </mat-menu>
    <section
      class="autopilot-console"
      aria-label="Autopilot"
      cdkDrag
      (cdkDragReleased)="dragEventHandler($event, 'released')"
    >
      <header class="panel-header">
        <div class="drag-handle" cdkDragHandle>
          <span class="label">{{
            apData().default ? 'Target' : 'No Pilot'
          }}</span>
        </div>
        <obc-icon-button
          class="close-button"
          aria-label="Close autopilot"
          matTooltip="Close"
          (click)="handleClose()"
        >
          <obi-close-google></obi-close-google>
        </obc-icon-button>
      </header>
      <div class="readout">
        <div class="target">
          @if (apData().default || apData().state === 'off-line') {
            <span>{{ formatTargetValue(apData().target) }}</span>
          } @else {
            <span>--</span>
          }
          <span class="unit">&deg;</span>
        </div>
      </div>
      <div class="state-row">
        <div>
          <div class="label">Status</div>
          <div class="value">
            {{
              apData().default || apData().state === 'off-line'
                ? apData().state
                : '--'
            }}
          </div>
        </div>
        <div>
          <div class="label">Mode</div>
          <div class="value">
            {{
              apData().default || apData().state === 'off-line'
                ? apData().mode
                : '--'
            }}
          </div>
        </div>
      </div>
      <div class="controls">
        @if (stateOptions().length > 2) {
          <obc-button
            class="state-button"
            [fullWidth]="true"
            [class.active]="apData().enabled"
            [matMenuTriggerFor]="statemenu"
            [disabled]="noPilot()"
          >
            <span class="state-label">{{ formatLabel(apData().state) }}</span>
          </obc-button>
        } @else {
          <obc-toggle-switch
            label="Engage"
            [checked]="apData().enabled"
            [externalControl]="true"
            [disabled]="noPilot()"
            (change)="toggleEngaged()"
            [matTooltip]="apData().enabled ? 'Disengage' : 'Engage'"
          ></obc-toggle-switch>
        }
        @if (modeOptions().length !== 0) {
          <obc-button
            class="mode-button"
            [fullWidth]="true"
            [matMenuTriggerFor]="modemenu"
            [disabled]="noPilot() || modeOptions().length === 0"
            >Mode</obc-button
          >
        }
      </div>
      <div class="adjust">
        @for (delta of [-10, -1, 1, 10]; track delta) {
          <obc-button
            [fullWidth]="true"
            [disabled]="!apData().default || apData().state === 'off-line'"
            (click)="
              apData().mode === 'dodge'
                ? dodgeAdjust(delta)
                : targetAdjust(delta)
            "
          >
            @if (apData().mode === 'dodge') {
              {{ ['<<', '<', '>', '>>'][$index] }}
            } @else {
              {{ delta > 0 ? '+' + delta : delta }}
            }
          </obc-button>
        }
      </div>
      @if (dodgeAction()) {
        <div class="dodge-row">
          <obc-button
            [class.active]="apData().mode === 'dodge'"
            [attr.aria-pressed]="apData().mode === 'dodge'"
            [disabled]="noPilot()"
            (click)="toggleDodge()"
            >Dodge</obc-button
          >
        </div>
      }
    </section>
  `
})
export class AutopilotComponent {
  @Output() close: EventEmitter<void> = new EventEmitter();

  protected modeOptions = signal<string[]>([]);
  protected stateOptions = signal<Array<{ name: string; engaged: boolean }>>(
    []
  );
  private currentPilot: string;

  apData = input<{
    default?: string;
    mode?: string;
    state?: string;
    target?: number;
    enabled?: boolean;
    availableActions?: string[];
  }>({});

  protected noPilot = computed(() => {
    return (
      !this.app.featureFlags().autopilotApi ||
      !this.apData().default ||
      !this.apData().state ||
      this.apData().state === 'off-line'
    );
  });

  protected dodgeAction = computed(() => {
    return this.apData().availableActions?.includes('dodge');
  });

  constructor(
    protected app: AppFacade,
    protected autopilot: AutopilotService
  ) {
    effect(() => {
      if (this.apData().default !== this.currentPilot) {
        this.app.debug(
          'changed default pilot:',
          this.currentPilot,
          this.apData().default
        );
        this.currentPilot = this.apData().default;
        this.fetchAPOptions();
      }
    });
  }

  handleClose() {
    this.close.emit();
  }

  /** fetch AP options from server */
  private async fetchAPOptions() {
    try {
      const options = await this.autopilot.fetchOptions();
      if (options.modes && Array.isArray(options.modes)) {
        this.modeOptions.set(options.modes);
      }
      if (options.states && Array.isArray(options.states)) {
        this.stateOptions.set(options.states);
      }
    } catch {
      this.modeOptions.set([]);
      this.stateOptions.set([]);
      this.app.showMessage('No autopilot providers found!');
    }
  }

  /** engage / disengage the pilot */
  protected async toggleEngaged() {
    try {
      if (this.apData().enabled) {
        await this.autopilot.disengage();
      } else {
        await this.autopilot.engage();
      }
    } catch (error) {
      let msg = `Error setting Autopilot state!\n`;
      if (error.status === 403) {
        msg += 'Unauthorised: Please login.';
        this.app.showAlert(`Error (${error.status}):`, msg);
      } else {
        this.app.showMessage(
          error.error?.message ?? 'Device returned an error!'
        );
      }
    }
  }

  /** adjust device target
   * @param value Number (in degrees)
   */
  protected async targetAdjust(value: number) {
    try {
      await this.autopilot.adjustTarget(value);
    } catch (error) {
      if (error.status === 403) {
        const msg = 'Unauthorised: Please login.';
        this.app.showAlert(`Error (${error.status}):`, msg);
      } else {
        this.app.showMessage(
          error.error?.message ?? 'Device returned an error!'
        );
      }
    }
  }

  /** toggle dodge mode on/off */
  protected async toggleDodge() {
    try {
      await this.autopilot.dodge(this.apData().mode !== 'dodge');
      this.app.debug(`Set dodge mode.`);
    } catch (error) {
      if (error.status === 403) {
        const msg = 'Unauthorised: Please login.';
        this.app.showAlert(`Error (${error.status}):`, msg);
      } else {
        this.app.showMessage(
          error.error?.message ?? 'Device returned an error!'
        );
      }
    }
  }

  /** send dodge direction value */
  protected async dodgeAdjust(value: number) {
    try {
      await this.autopilot.adjustDodge(value);
    } catch (error) {
      if (error.status === 403) {
        const msg = 'Unauthorised: Please login.';
        this.app.showAlert(`Error (${error.status}):`, msg);
      } else {
        this.app.showMessage(
          error.error?.message ?? 'Device returned an error!'
        );
      }
    }
  }

  /** send mode command
   * @param mode Mode to set on the device
   */
  protected async setMode(mode: string) {
    try {
      await this.autopilot.mode(mode);
    } catch (error) {
      let msg = `Error setting Autopilot mode!\n`;
      if (error.status === 403) {
        msg += 'Unauthorised: Please login.';
        this.app.showAlert(`Error (${error.status}):`, msg);
      } else {
        this.app.showMessage(
          error.error?.message ?? 'Device returned an error!'
        );
      }
    }
  }

  /** send mode command
   * @param state Mode to set on the device
   */
  protected async setState(state: string) {
    try {
      await this.autopilot.state(state);
    } catch (error) {
      let msg = `Error setting Autopilot state!\n`;
      if (error.status === 403) {
        msg += 'Unauthorised: Please login.';
        this.app.showAlert(`Error (${error.status}):`, msg);
      } else {
        this.app.showMessage(
          error.error?.message ?? 'Device returned an error!'
        );
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragEventHandler(e: any, type: string) {
    this.app.debug(
      'e:',
      e,
      'type:',
      type,
      e.event.srcElement.clientLeft,
      e.event.srcElement.clientTop
    );
  }

  formatLabel(value: string) {
    return value ? value.toUpperCase() : '...';
  }

  formatTargetValue(value: number) {
    if (typeof value === 'number') {
      return Convert.radiansToDegrees(value)?.toFixed(1);
    } else return '--';
  }
}
