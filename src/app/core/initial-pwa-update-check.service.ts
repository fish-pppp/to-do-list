import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IS_ELECTRON } from '../app.constants';
import { defer, EMPTY, from, Observable, of } from 'rxjs';
import { catchError, concatMap, filter, shareReplay, timeout } from 'rxjs/operators';
import { SwUpdate } from '@angular/service-worker';
import { isOnline } from '../util/is-online';
import { Log } from './log';

const INITIAL_PWA_UPDATE_CHECK_TIMEOUT_MS = 8000;

@Injectable({
  providedIn: 'root',
})
export class InitialPwaUpdateCheckService {
  private _swUpdate = inject(SwUpdate);
  private _destroyRef = inject(DestroyRef);
  private _reloadScheduled = false;

  // NOTE: check currently triggered by sync effect
  afterInitialUpdateCheck$: Observable<void> =
    !IS_ELECTRON && this._swUpdate.isEnabled && isOnline()
      ? defer(() => from(this._swUpdate.checkForUpdate())).pipe(
          timeout(INITIAL_PWA_UPDATE_CHECK_TIMEOUT_MS),
          catchError((err: unknown) => {
            Log.warn('InitialPwaUpdateCheckService: update check failed', err);
            return of(false);
          }),
          concatMap((isUpdateAvailable) => {
            Log.log(
              '___________isServiceWorkerUpdateAvailable____________',
              isUpdateAvailable,
            );
            if (isUpdateAvailable) {
              return from(this._activateAndReload()).pipe(concatMap(() => EMPTY));
            }
            return of(undefined);
          }),
          shareReplay(1),
        )
      : of(undefined);

  constructor() {
    if (IS_ELECTRON || !this._swUpdate.isEnabled) {
      return;
    }
    // A slow download can finish after the startup check times out. Activate
    // that build anyway so a phone does not stay on the previous cache.
    this._swUpdate.versionUpdates
      .pipe(
        filter((event) => event.type === 'VERSION_READY'),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        void this._activateAndReload();
      });
  }

  private async _activateAndReload(): Promise<void> {
    if (this._reloadScheduled) {
      return;
    }
    this._reloadScheduled = true;
    try {
      await this._swUpdate.activateUpdate();
    } catch (err: unknown) {
      Log.warn('InitialPwaUpdateCheckService: activateUpdate failed', err);
    }
    this._reloadPage();
  }

  private _reloadPage(): void {
    window.location.reload();
  }
}
