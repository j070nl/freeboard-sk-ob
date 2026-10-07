import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppFacade } from 'src/app/app.facade';
import { AutopilotComponent } from './autopilot.component';
import { AutopilotOptions, AutopilotService } from './autopilot.service';

type PilotData = ReturnType<AutopilotComponent['apData']>;
type NativeControl = HTMLElement & {
  updateComplete: Promise<boolean>;
  checked: boolean;
  disabled: boolean;
};
const pilot: PilotData = {
  default: 'test-pilot',
  state: 'standby',
  mode: 'heading',
  target: Math.PI / 2,
  enabled: false,
  availableActions: []
};
const options: AutopilotOptions = {
  modes: ['heading', 'wind'],
  states: [
    { name: 'standby', engaged: false },
    { name: 'auto', engaged: true }
  ],
  actions: []
};

async function setup(data = pilot, available = options) {
  const api = {
    fetchOptions: vi.fn().mockResolvedValue(available),
    engage: vi.fn().mockResolvedValue(undefined),
    disengage: vi.fn().mockResolvedValue(undefined),
    adjustTarget: vi.fn().mockResolvedValue(undefined),
    adjustDodge: vi.fn().mockResolvedValue(undefined),
    dodge: vi.fn().mockResolvedValue(undefined),
    mode: vi.fn().mockResolvedValue(undefined),
    state: vi.fn().mockResolvedValue(undefined)
  };
  const app = {
    featureFlags: signal({ autopilotApi: true }),
    debug: vi.fn(),
    showMessage: vi.fn(),
    showAlert: vi.fn()
  };
  TestBed.configureTestingModule({
    imports: [AutopilotComponent],
    providers: [
      { provide: AppFacade, useValue: app },
      { provide: AutopilotService, useValue: api }
    ]
  });
  const fixture = TestBed.createComponent(AutopilotComponent);
  fixture.componentRef.setInput('apData', data);
  await settle(fixture);
  const root = fixture.nativeElement as HTMLElement;
  return { fixture, api, app, root };
}
async function settle(fixture: ComponentFixture<AutopilotComponent>) {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  const root = fixture.nativeElement as HTMLElement;
  for (const element of root.querySelectorAll<NativeControl>(
    'obc-button, obc-icon-button, obc-toggle-switch'
  )) {
    await element.updateComplete;
  }
}
function clickControl(element: Element) {
  const control =
    element.shadowRoot?.querySelector<HTMLElement>('button, input');
  expect(control).toBeTruthy();
  control?.click();
}

afterEach(() => TestBed.resetTestingModule());

describe('Autopilot OpenBridge presentation preserves commands', () => {
  it('keeps target formatting, hides the pilot name and does not add Dodge', async () => {
    const { root, api } = await setup();
    expect(root.querySelector('.target')?.textContent).toContain('90.0');
    expect(root.textContent).not.toContain('test-pilot');
    expect(root.querySelector('.dodge-row')).toBeNull();
    expect(api.fetchOptions).toHaveBeenCalledOnce();
  });

  it('sends each target increment exactly once without modifying reported data', async () => {
    const { root, api, fixture } = await setup();
    for (const control of root.querySelectorAll('.adjust obc-button')) {
      clickControl(control);
    }
    expect(api.adjustTarget.mock.calls).toEqual([[-10], [-1], [1], [10]]);
    expect(api.adjustDodge).not.toHaveBeenCalled();
    expect(fixture.componentInstance.apData().target).toBe(Math.PI / 2);
  });

  it('engages and disengages from reported state and waits for the server state', async () => {
    const { fixture, root, api } = await setup();
    const toggle = root.querySelector<NativeControl>('obc-toggle-switch');
    clickControl(toggle);
    await settle(fixture);
    expect(api.engage).toHaveBeenCalledOnce();
    expect(toggle.checked).toBe(false);
    fixture.componentRef.setInput('apData', {
      ...pilot,
      enabled: true,
      state: 'auto'
    });
    await settle(fixture);
    clickControl(toggle);
    expect(api.disengage).toHaveBeenCalledOnce();
  });

  it.each([
    { ...pilot, default: undefined },
    { ...pilot, state: 'off-line' }
  ])(
    'prevents commands when the pilot is absent or offline: %j',
    async (data) => {
      const { root, api } = await setup(data);
      for (const control of root.querySelectorAll<NativeControl>(
        '.adjust obc-button, .mode-button, obc-toggle-switch'
      )) {
        expect(control.disabled).toBe(true);
        clickControl(control);
      }
      expect(api.adjustTarget).not.toHaveBeenCalled();
      expect(api.engage).not.toHaveBeenCalled();
    }
  );

  it('retains the provider mode menu', async () => {
    const { fixture, root, api } = await setup();
    clickControl(root.querySelector('.mode-button'));
    await settle(fixture);
    const item = [
      ...document.querySelectorAll<HTMLButtonElement>('[mat-menu-item]')
    ].find((e) => e.textContent.includes('wind'));
    expect(item).toBeTruthy();
    item.click();
    expect(api.mode).toHaveBeenCalledExactlyOnceWith('wind');
  });

  it('retains a state menu instead of the toggle for providers with more than two states', async () => {
    const { fixture, root, api } = await setup(pilot, {
      ...options,
      states: [...options.states, { name: 'tracking', engaged: true }]
    });
    expect(root.querySelector('obc-toggle-switch')).toBeNull();
    clickControl(root.querySelector('.state-button'));
    await settle(fixture);
    const item = [
      ...document.querySelectorAll<HTMLButtonElement>('[mat-menu-item]')
    ].find((e) => e.textContent.includes('tracking'));
    expect(item).toBeTruthy();
    item.click();
    expect(api.state).toHaveBeenCalledExactlyOnceWith('tracking');
  });

  it('retains provider-dependent Dodge actions and direction commands', async () => {
    const { fixture, root, api } = await setup({
      ...pilot,
      availableActions: ['dodge']
    });
    clickControl(root.querySelector('.dodge-row obc-button'));
    expect(api.dodge).toHaveBeenLastCalledWith(true);
    fixture.componentRef.setInput('apData', {
      ...pilot,
      availableActions: ['dodge'],
      mode: 'dodge'
    });
    await settle(fixture);
    for (const control of root.querySelectorAll('.adjust obc-button'))
      clickControl(control);
    expect(api.adjustDodge.mock.calls).toEqual([[-10], [-1], [1], [10]]);
    expect(api.adjustTarget).not.toHaveBeenCalled();
    clickControl(root.querySelector('.dodge-row obc-button'));
    expect(api.dodge).toHaveBeenLastCalledWith(false);
  });

  it('hides Mode when no provider modes are available', async () => {
    const { root } = await setup(pilot, { ...options, modes: [] });
    expect(root.querySelector('.mode-button')).toBeNull();
  });

  it('keeps the header as the drag handle and closing separate from commands', async () => {
    const { fixture, root, api } = await setup();
    const handles = fixture.debugElement.queryAll(By.directive(CdkDragHandle));
    expect(handles).toHaveLength(1);
    expect(
      (handles[0].nativeElement as HTMLElement).querySelector('obc-icon-button')
    ).toBeNull();
    const closed = vi.fn();
    fixture.componentInstance.close.subscribe(closed);
    clickControl(root.querySelector('.close-button'));
    expect(closed).toHaveBeenCalledOnce();
    expect(api.engage).not.toHaveBeenCalled();
  });

  it('keeps the existing unauthorised error message', async () => {
    const { fixture, root, api, app } = await setup();
    api.adjustTarget.mockRejectedValue({ status: 403 });
    clickControl(root.querySelector('.adjust obc-button'));
    await settle(fixture);
    expect(app.showAlert).toHaveBeenCalledWith(
      'Error (403):',
      'Unauthorised: Please login.'
    );
  });
});
