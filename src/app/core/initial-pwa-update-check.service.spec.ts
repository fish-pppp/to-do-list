import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { InitialPwaUpdateCheckService } from './initial-pwa-update-check.service';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { EMPTY, firstValueFrom, Subject } from 'rxjs';
import { Log } from './log';

const INITIAL_PWA_UPDATE_CHECK_TIMEOUT_MS = 8000;

describe('InitialPwaUpdateCheckService', () => {
  let originalOnLineDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalOnLineDescriptor = Object.getOwnPropertyDescriptor(navigator, 'onLine');
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      configurable: true,
    });
  });

  afterEach(() => {
    restoreNavigatorOnLine(originalOnLineDescriptor);
    TestBed.resetTestingModule();
  });

  it('should defer the update check until subscribed', () => {
    const { service, swUpdate } = setup(Promise.resolve(false));

    expect(swUpdate.checkForUpdate).not.toHaveBeenCalled();

    const sub = service.afterInitialUpdateCheck$.subscribe();

    expect(swUpdate.checkForUpdate).toHaveBeenCalledTimes(1);
    sub.unsubscribe();
  });

  it('should emit when no update is available', async () => {
    const { service } = setup(Promise.resolve(false));

    const result = await firstValueFrom(service.afterInitialUpdateCheck$);

    expect(result).toBeUndefined();
  });

  it('should share the initial update check result', async () => {
    const { service, swUpdate } = setup(Promise.resolve(false));

    await firstValueFrom(service.afterInitialUpdateCheck$);
    await firstValueFrom(service.afterInitialUpdateCheck$);

    expect(swUpdate.checkForUpdate).toHaveBeenCalledTimes(1);
  });

  it('should emit when the update check rejects', async () => {
    spyOn(Log, 'warn');
    const { service } = setup(Promise.reject(new Error('network failed')));

    const result = await firstValueFrom(service.afterInitialUpdateCheck$);

    expect(result).toBeUndefined();
    expect(Log.warn).toHaveBeenCalled();
  });

  it('should emit when the update check stalls', fakeAsync(() => {
    spyOn(Log, 'warn');
    const { service } = setup(new Promise<boolean>(() => undefined));
    let didEmit = false;

    service.afterInitialUpdateCheck$.subscribe(() => {
      didEmit = true;
    });
    tick(INITIAL_PWA_UPDATE_CHECK_TIMEOUT_MS);
    flushMicrotasks();

    expect(didEmit).toBeTrue();
    expect(Log.warn).toHaveBeenCalled();
  }));

  it('should skip the update check when service worker updates are disabled', async () => {
    const { service, swUpdate } = setup(Promise.resolve(false), false);

    const result = await firstValueFrom(service.afterInitialUpdateCheck$);

    expect(result).toBeUndefined();
    expect(swUpdate.checkForUpdate).not.toHaveBeenCalled();
  });

  it('activates and reloads when a new build is ready', async () => {
    const { service, swUpdate, reloadPage } = setup(Promise.resolve(true));

    await new Promise<void>((resolve, reject) => {
      service.afterInitialUpdateCheck$.subscribe({
        complete: () => resolve(),
        error: reject,
      });
    });

    expect(swUpdate.activateUpdate).toHaveBeenCalled();
    expect(reloadPage).toHaveBeenCalled();
  });

  it('reloads when the new build finishes after startup', async () => {
    const versions = new Subject<VersionEvent>();
    const { swUpdate, reloadPage } = setup(Promise.resolve(false), true, versions);

    versions.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'old' },
      latestVersion: { hash: 'new' },
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(swUpdate.activateUpdate).toHaveBeenCalled();
    expect(reloadPage).toHaveBeenCalledTimes(1);
  });
});

const setup = (
  checkForUpdateResult: Promise<boolean>,
  isEnabled: boolean = true,
  versionUpdates: Subject<VersionEvent> | null = null,
): {
  service: InitialPwaUpdateCheckService;
  swUpdate: jasmine.SpyObj<SwUpdate>;
  reloadPage: jasmine.Spy;
} => {
  const swUpdate = jasmine.createSpyObj<SwUpdate>('SwUpdate', [
    'checkForUpdate',
    'activateUpdate',
  ]);
  Object.defineProperty(swUpdate, 'isEnabled', {
    value: isEnabled,
    configurable: true,
  });
  Object.defineProperty(swUpdate, 'versionUpdates', {
    value: versionUpdates ?? EMPTY,
  });
  swUpdate.checkForUpdate.and.returnValue(checkForUpdateResult);
  swUpdate.activateUpdate.and.returnValue(Promise.resolve(true));

  TestBed.configureTestingModule({
    providers: [InitialPwaUpdateCheckService, { provide: SwUpdate, useValue: swUpdate }],
  });

  const service = TestBed.inject(InitialPwaUpdateCheckService);
  const reloadPage = jasmine.createSpy('reloadPage');
  (service as unknown as { _reloadPage: () => void })._reloadPage = reloadPage;

  return {
    service,
    swUpdate,
    reloadPage,
  };
};

const restoreNavigatorOnLine = (descriptor: PropertyDescriptor | undefined): void => {
  if (descriptor) {
    Object.defineProperty(navigator, 'onLine', descriptor);
  } else {
    delete (navigator as { onLine?: boolean }).onLine;
  }
};
