import { OpenBridgeControlDirective } from '../openbridge/control.directive';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import '@oicl/openbridge-webcomponents/dist/components/button/button.js';
import { OpenBridgeCheckboxComponent } from '../openbridge/checkbox.component';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'ap-msgbox',
  imports: [OpenBridgeControlDirective, MatDialogModule, MatButtonModule],
  template: `
    <div class="_ap-msgbox">
      <div>
        <h1 mat-dialog-title>{{ data.title }}</h1>
      </div>
      <mat-dialog-content>
        @for (line of msglines; track line) {
          <div>
            <div>{{ line }}&nbsp;</div>
          </div>
        }
      </mat-dialog-content>
      <mat-dialog-actions align="center">
        <obc-button (click)="dialogRef.close(true)">
          {{ data.buttonText }}
        </obc-button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      ._ap-msgbox {
        font-family: inherit;
        min-width: 150px;
      }
    `
  ]
})
export class MsgBox implements OnInit {
  public msglines = [];

  protected dialogRef = inject(MatDialogRef<MsgBox>);
  protected data = inject<{
    title: string; // title text,
    message: string; // text to display,
    buttonText: string; // button text
  }>(MAT_DIALOG_DATA);

  constructor() {}

  ngOnInit() {
    this.data.buttonText = this.data.buttonText || 'OK';
    this.msglines = this.data.message.split('\n');
  }
}

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'ap-alertdialog',
  imports: [
    OpenBridgeControlDirective,
    MatDialogModule,
    MatIconModule,
    OpenBridgeCheckboxComponent,
    MatButtonModule
  ],
  template: `
    <div class="_ap-alert">
      <div>
        <h1 mat-dialog-title>
          <mat-icon style="color: var(--fb-warning);">warning</mat-icon>
          &nbsp;{{ data.title }}
        </h1>
      </div>
      <mat-dialog-content>
        <div style="display:flex;">
          <div style="padding-left: 10px;">
            @for (line of msglines; track line) {
              <div>
                <div>{{ line }}&nbsp;</div>
              </div>
            }
          </div>
        </div>
        @if (data.checkText) {
          <div style="padding: 10px 0 0 10px;">
            <fb-checkbox
              (change)="checked = $event.checked"
              [label]="data.checkText"
            ></fb-checkbox>
          </div>
        }
      </mat-dialog-content>
      <mat-dialog-actions align="center">
        <obc-button
          (click)="dialogRef.close(data.checkText ? { checked } : true)"
        >
          {{ data.buttonText }}
        </obc-button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      ._ap-alert {
        min-width: 150px;
      }
    `
  ]
})
export class AlertDialog implements OnInit {
  public msglines = [];
  public image = null;
  public checked = false;

  protected dialogRef = inject(MatDialogRef<AlertDialog>);
  protected data = inject<{
    title: string; // title text,
    message: string; // text to display,
    buttonText: string; // button text
    checkText?: string; // optional check box text; closes with { checked }
  }>(MAT_DIALOG_DATA);

  constructor() {}

  ngOnInit() {
    this.data.buttonText = this.data.buttonText || 'OK';
    this.msglines = this.data.message.split('\n');
  }
}

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'ap-confirmdialog',
  imports: [
    OpenBridgeControlDirective,
    MatDialogModule,
    MatIconModule,
    OpenBridgeCheckboxComponent,
    MatButtonModule
  ],
  template: `
    <div class="_ap-confirm">
      <div>
        <h1 mat-dialog-title>
          <mat-icon style="color:var(--fb-warning);">help</mat-icon>
          &nbsp;{{ data.title }}
        </h1>
      </div>
      <mat-dialog-content style="overflow:unset">
        <div style="display:flex;">
          <div style="padding-left: 10px;">
            @for (line of msglines; track line) {
              <div>
                <div>{{ line }}&nbsp;</div>
              </div>
            }
          </div>
        </div>
        <div style="display:flex;">
          @if (data.checkText) {
            <div style="padding-left: 10px;">
              <div style="font-weight: 500;">
                <fb-checkbox
                  (change)="checked = $event.checked"
                  [label]="data.checkText"
                ></fb-checkbox>
              </div>
            </div>
          }
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="center">
        <obc-button (click)="dialogRef.close({ ok: true, checked: checked })">
          {{ data.button1Text }}
        </obc-button>
        <obc-button (click)="dialogRef.close(null)">
          {{ data.button2Text }}
        </obc-button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      ._ap-confirm {
        font-family: inherit;
        min-width: 150px;
      }
    `
  ]
})
export class ConfirmDialog implements OnInit {
  public msglines = [];
  public checked = false;

  protected dialogRef = inject(MatDialogRef<ConfirmDialog>);
  protected data = inject<{
    title: string; // title text,
    message: string; // text to display,
    button1Text: string; // primary button text
    button2Text: string; //secondary button text
    checkText: string; // check box text
  }>(MAT_DIALOG_DATA);

  constructor() {}

  ngOnInit() {
    this.data.button1Text = this.data.button1Text || 'Yes';
    this.data.button2Text = this.data.button2Text || 'No';
    this.msglines = this.data.message.split('\n');
  }
}

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'ap-about-dialog',
  imports: [
    OpenBridgeControlDirective,
    MatDialogModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div>
      <h1 mat-dialog-title><mat-icon>info</mat-icon>&nbsp;About</h1>
      <mat-dialog-content>
        <div class="about-row">
          <div class="item"><img [src]="data.logo" /></div>
          <div class="item">
            <span style="font-weight:bold;">{{ data.name }}</span
            >&nbsp;&nbsp;<br />
            <span class="description">
              {{ data.description }}
            </span>
            <br />
            <span>Version: {{ data.version }}</span>
            <br /><br />
          </div>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="center">
        @if (data.url) {
          <a mat-button [href]="data.url" target="_web" rel="noopener"
            >Visit Website</a
          >
          &nbsp;
        }
        <obc-button (click)="dialogRef.close(false)"> Close </obc-button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .about-row {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-content: stretch;
        font-family: inherit;
      }
      .about-row .item {
        padding-left: 10px;
      }
      .about-row img {
        width: 42px;
      }
      .about-row .description {
        font-size: 12pt;
      }
    `
  ]
})
export class AboutDialog {
  protected dialogRef = inject(MatDialogRef<AboutDialog>);
  protected data = inject<{
    name: string; // app name
    version: string; // app version
    description: string;
    logo: string; // path to logo image
    url: string; // website
  }>(MAT_DIALOG_DATA);

  constructor() {}
}

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'ap-login-dialog',
  imports: [
    OpenBridgeControlDirective,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  styles: [],
  template: `
    <h2 mat-dialog-title><mat-icon>account_circle</mat-icon> Sign-In</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>

      <mat-form-field>
        <mat-label>User name</mat-label>
        <input
          matInput
          type="text"
          value=""
          #username
          (keyup)="keyUp($event, username, password)"
          style="width:110px;"
          (focus)="handleFocus($event)"
        /> </mat-form-field
      ><br />
      <mat-form-field>
        <mat-label>Password</mat-label>
        <input
          matInput
          type="password"
          value=""
          #password
          (keyup)="keyUp($event, username, password)"
          style="width:110px;"
          (focus)="handleFocus($event)"
        />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <obc-button
        default
        [disabled]="username.value.length === 0"
        (click)="login(username.value, password.value)"
      >
        {{ data.button1Text }}
      </obc-button>
      &nbsp;&nbsp;
      <obc-button default (click)="cancel()">
        {{ data.button2Text }}
      </obc-button>
    </mat-dialog-actions>
  `
})
export class LoginDialog implements OnInit {
  @ViewChild('username', { static: false }) username;

  protected imgSource = 'assets/img/success.png';
  private result = {
    cancel: false,
    user: null,
    pwd: null
  };

  protected dialogRef = inject(MatDialogRef<LoginDialog>);
  protected data = inject<{
    message: string; // text to display,
    button1Text: string; // primary button text
    button2Text: string; // secondary button text
  }>(MAT_DIALOG_DATA);

  constructor() {}

  ngOnInit() {
    this.data.message = this.data.message || '';
    this.data.button1Text = this.data.button1Text || 'Log in';
    this.data.button2Text = this.data.button2Text || 'Cancel';
  }

  ngAfterViewInit() {
    setTimeout(() => this.username.nativeElement.focus(), 500);
  }

  keyUp(e, u, p) {
    if (e.key === 'Enter') {
      this.login(u.value, p.value);
    }
  }

  handleFocus(e) {
    e.currentTarget.select(0, e.currentTarget.value.length);
  }

  // ** cancelled login
  cancel() {
    this.result.cancel = true;
    this.dialogRef.close(this.result);
  }

  //** submit log in
  login(user = '', password = '') {
    this.result.cancel = false;
    this.result.user = user;
    this.result.pwd = password;
    this.dialogRef.close(this.result);
  }
}

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'message-bar',
  imports: [MatIconModule],
  template: `
    <div class="message-bar">
      <mat-icon>message</mat-icon>&nbsp;&nbsp;
      {{ data.message }}
    </div>
    @if (data.sound) {
      <audio src="./assets/sound/ding.mp3" [autoplay]="true"></audio>
    }
  `,
  styles: [
    `
      .message-bar {
        font-family: inherit;
      }
    `
  ]
})
export class MessageBarComponent {
  protected data = inject<{
    message: string; // text to display,
    sound: boolean; // play sound
  }>(MAT_SNACK_BAR_DATA);

  constructor() {}
}
