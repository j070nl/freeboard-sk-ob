import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmbeddedVisibilityService } from './embedded-visibility.service';

function setup() {
  const parent = { postMessage: vi.fn() };
  const view = Object.assign(new EventTarget(), {
    parent,
    location: { origin: 'http://boat' }
  });
  const document = Object.assign(new EventTarget(), {
    defaultView: view,
    hidden: false
  });
  TestBed.configureTestingModule({
    providers: [{ provide: DOCUMENT, useValue: document }]
  });
  const service = TestBed.inject(EmbeddedVisibilityService);
  const listener = vi.fn();
  const stop = service.observe(listener);
  const send = (
    data: unknown,
    origin = 'http://boat',
    source: unknown = parent
  ) => {
    const event = new Event('message');
    Object.defineProperties(event, {
      data: { value: data },
      origin: { value: origin },
      source: { value: source }
    });
    view.dispatchEvent(event);
  };
  return { service, listener, stop, document, parent, send };
}
afterEach(() => TestBed.resetTestingModule());
describe('Embedded chart visibility', () => {
  it('accepts only a versioned boolean from the same-origin parent', () => {
    const { send, listener, parent } = setup();
    expect(parent.postMessage).toHaveBeenCalledWith(
      { type: 'freeboard:visibility-ready', version: 1 },
      'http://boat'
    );
    const hide = { type: 'freeboard:visibility', version: 1, visible: false };
    send(hide, 'http://other');
    send(hide, 'http://boat', {});
    send({ ...hide, visible: 'false' });
    send({ ...hide, version: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
    send(hide);
    expect(listener).toHaveBeenLastCalledWith(false);
    send(hide);
    expect(listener).toHaveBeenCalledTimes(2);
    send({ ...hide, visible: true });
    expect(listener).toHaveBeenLastCalledWith(true);
  });
  it('combines native tab visibility with host visibility and unregisters consumers', () => {
    const { send, document, listener, stop } = setup();
    document.hidden = true;
    document.dispatchEvent(new Event('visibilitychange'));
    expect(listener).toHaveBeenLastCalledWith(false);
    send({ type: 'freeboard:visibility', version: 1, visible: false });
    document.hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
    expect(listener).toHaveBeenLastCalledWith(false);
    stop();
    listener.mockClear();
    send({ type: 'freeboard:visibility', version: 1, visible: true });
    expect(listener).not.toHaveBeenCalled();
  });
});
