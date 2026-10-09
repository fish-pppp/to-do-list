import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { BackupService } from '../../op-log/backup/backup.service';
import { StateSnapshotService } from '../../op-log/backup/state-snapshot.service';
import { hasMeaningfulStateData } from '../../op-log/validation/has-meaningful-state-data.util';
import { SnackService } from '../../core/snack/snack.service';
import { TranslateService } from '@ngx-translate/core';
import { LOCAL_ACTIONS } from '../../util/local-actions.token';
import { LS } from '../../core/persistence/storage-keys.const';
import { T } from '../../t.const';
import { Log } from '../../core/log';
import { debounceTime } from 'rxjs/operators';
import { confirmDialog } from '../../util/native-dialogs';
import { CompleteBackup } from '../../op-log/core/types/sync.types';
import { AllModelConfig } from '../../op-log/model/model-config';
import { IS_WEB_BROWSER } from '../../app.constants';
import {
  decideCloudSyncAction,
  hasTaskIdsMissingFromRemote,
} from './web-cloud-backup-sync.util';

const SAVE_DEBOUNCE_MS = 20_000;
const PULL_INTERVAL_MS = 30_000;
const STATUS_PATH = '/api/backup?status=1';
const BACKUP_PATH = '/api/backup';
const NUDGE_SESSION_KEY = 'sp-cloud-backup-nudge';

const cloudRequestHeaders = (baseTimestamp?: number): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (baseTimestamp !== undefined) {
    headers['Content-Type'] = 'application/json';
    headers['x-sp-base-timestamp'] = String(baseTimestamp);
  }
  return headers;
};

type RemoteBackup =
  | { kind: 'missing' }
  | { kind: 'not-configured' }
  | { kind: 'error' }
  | {
      kind: 'backup';
      backup: CompleteBackup<AllModelConfig>;
      timestamp: number;
      hasData: boolean;
    };

@Injectable({
  providedIn: 'root',
})
export class WebCloudBackupService {
  private _backupService = inject(BackupService);
  private _stateSnapshotService = inject(StateSnapshotService);
  private _snackService = inject(SnackService);
  private _translateService = inject(TranslateService);
  private _router = inject(Router);
  private _localActions$ = inject(LOCAL_ACTIONS);
  private _destroyRef = inject(DestroyRef);

  private _started = false;
  private _watching = false;
  private _configured = false;
  private _busy = false;
  private _pollTimer?: number;

  get isAvailable(): boolean {
    return IS_WEB_BROWSER;
  }

  async isConfigured(): Promise<boolean> {
    try {
      const response = await fetch(STATUS_PATH, { cache: 'no-store' });
      if (!response.ok) {
        return false;
      }
      const body = (await response.json()) as { configured?: boolean };
      this._configured = Boolean(body.configured);
      return this._configured;
    } catch {
      return false;
    }
  }

  async init(): Promise<void> {
    if (this._started || !this.isAvailable) {
      return;
    }
    this._started = true;
    await this._bootstrap();
  }

  async uploadIfLocalHasData(showSnack: boolean): Promise<boolean> {
    return this._reconcile({
      forcePush: showSnack,
      announcePush: showSnack,
      announceError: showSnack,
    });
  }

  async restoreFromCloud(force: boolean): Promise<boolean> {
    try {
      const response = await fetch(BACKUP_PATH, {
        cache: 'no-store',
      });
      if (response.status === 404) {
        this._snackService.open({ type: 'ERROR', msg: T.FILE_IMEX.CLOUD_EMPTY });
        return false;
      }
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const backup = (await response.json()) as CompleteBackup<AllModelConfig>;
      const snapshot = this._stateSnapshotService.getAllSyncModelDataFromStore();
      if (!force && hasMeaningfulStateData(snapshot)) {
        const confirmed = confirmDialog(
          this._translateService.instant(T.FILE_IMEX.CLOUD_CONFIRM_RESTORE),
        );
        if (!confirmed) {
          return false;
        }
      }

      this._busy = true;
      try {
        await this._backupService.importCompleteBackup(backup, true, true, true);
        this._rememberSync(backup);
      } finally {
        this._busy = false;
      }
      this._snackService.open({ type: 'SUCCESS', msg: T.FILE_IMEX.CLOUD_RESTORED });
      return true;
    } catch (error) {
      this._busy = false;
      Log.err('WebCloudBackup restore failed', error);
      this._snackService.open({ type: 'ERROR', msg: T.FILE_IMEX.CLOUD_RESTORE_FAILED });
      return false;
    }
  }

  private async _bootstrap(): Promise<void> {
    const configured = await this.isConfigured();
    if (!configured) {
      this._nudgeOnce({
        ico: 'cloud_off',
        msg: T.FILE_IMEX.CLOUD_NOT_CONFIGURED,
      });
      return;
    }

    this._startWatching();
    await this._reconcile({
      forcePush: false,
      announcePush: false,
      announceError: true,
    });
  }

  private _nudgeOnce({ ico, msg }: { ico: string; msg: string }): void {
    try {
      if (sessionStorage.getItem(NUDGE_SESSION_KEY)) {
        return;
      }
      sessionStorage.setItem(NUDGE_SESSION_KEY, '1');
    } catch {
      // Private mode can block sessionStorage; still show the hint.
    }

    this._snackService.open({
      type: 'CUSTOM',
      ico,
      msg,
      actionStr: T.FILE_IMEX.CLOUD_OPEN_SETTINGS,
      actionFn: () => void this._router.navigate(['/config']),
      config: { duration: 10000 },
    });
  }

  private _startWatching(): void {
    if (this._watching) {
      return;
    }
    this._watching = true;

    this._localActions$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
      if (this._busy) {
        return;
      }
      localStorage.setItem(LS.CLOUD_DIRTY, '1');
    });

    this._localActions$
      .pipe(debounceTime(SAVE_DEBOUNCE_MS), takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        if (!this._isDirty()) {
          return;
        }
        void this._reconcile({
          forcePush: false,
          announcePush: false,
          announceError: false,
        });
      });

    this._pollTimer = window.setInterval(() => {
      void this._reconcile({
        forcePush: false,
        announcePush: false,
        announceError: false,
      });
    }, PULL_INTERVAL_MS);
    this._destroyRef.onDestroy(() => {
      if (this._pollTimer !== undefined) {
        window.clearInterval(this._pollTimer);
      }
    });
  }

  private async _reconcile(opts: {
    forcePush: boolean;
    announcePush: boolean;
    announceError: boolean;
  }): Promise<boolean> {
    if (this._busy) {
      return false;
    }

    this._busy = true;
    try {
      const remote = await this._fetchRemote();
      if (remote.kind === 'not-configured') {
        if (opts.announceError) {
          this._snackService.open({
            type: 'ERROR',
            msg: T.FILE_IMEX.CLOUD_NOT_CONFIGURED,
          });
        }
        return false;
      }
      if (remote.kind === 'error') {
        if (opts.announceError) {
          this._snackService.open({ type: 'ERROR', msg: T.FILE_IMEX.CLOUD_SAVE_FAILED });
        }
        return false;
      }

      const snapshot = this._stateSnapshotService.getAllSyncModelDataFromStore();
      const localHasData = hasMeaningfulStateData(snapshot);
      const remoteData =
        remote.kind === 'backup'
          ? 'data' in remote.backup
            ? remote.backup.data
            : remote.backup
          : null;
      const decision = decideCloudSyncAction({
        remoteTimestamp: remote.kind === 'backup' ? remote.timestamp : null,
        remoteHasData: remote.kind === 'backup' && remote.hasData,
        localHasData,
        syncedAt: this._syncedAt(),
        dirty: this._isDirty(),
        localHasTasksNotInRemote:
          remote.kind === 'backup' && hasTaskIdsMissingFromRemote(snapshot, remoteData),
      });

      if (decision === 'pull' && remote.kind === 'backup') {
        await this._importRemote(remote.backup);
        return false;
      }

      const shouldPush = decision === 'push' || (opts.forcePush && localHasData);
      if (!shouldPush) {
        if (opts.forcePush && !localHasData) {
          this._snackService.open({
            type: 'ERROR',
            msg: T.FILE_IMEX.CLOUD_NOTHING_TO_SAVE,
          });
          return false;
        }
        return !opts.forcePush;
      }

      return await this._putLocal(opts.announcePush);
    } catch (error) {
      Log.err('WebCloudBackup sync failed', error);
      if (opts.announceError) {
        this._snackService.open({ type: 'ERROR', msg: T.FILE_IMEX.CLOUD_SAVE_FAILED });
      }
      return false;
    } finally {
      this._busy = false;
    }
  }

  private async _putLocal(announce: boolean): Promise<boolean> {
    const snapshot = this._stateSnapshotService.getAllSyncModelDataFromStore();
    if (!hasMeaningfulStateData(snapshot)) {
      if (announce) {
        this._snackService.open({
          type: 'ERROR',
          msg: T.FILE_IMEX.CLOUD_NOTHING_TO_SAVE,
        });
      }
      return false;
    }

    const backup = await this._backupService.loadCompleteBackup(true);
    const response = await fetch(BACKUP_PATH, {
      method: 'PUT',
      headers: cloudRequestHeaders(this._syncedAt()),
      body: JSON.stringify(backup),
    });
    if (response.status === 409) {
      const merged = await this._backupFromConflict(response);
      if (merged) {
        await this._importRemote(merged);
        return false;
      }
      const newer = await this._fetchRemote();
      if (newer.kind === 'backup' && newer.hasData) {
        await this._importRemote(newer.backup);
      }
      return false;
    }
    if (response.status === 503) {
      this._snackService.open({ type: 'ERROR', msg: T.FILE_IMEX.CLOUD_NOT_CONFIGURED });
      return false;
    }
    if (!response.ok) {
      throw new Error(await response.text());
    }
    this._rememberSync(backup);
    if (announce) {
      this._snackService.open({ type: 'SUCCESS', msg: T.FILE_IMEX.CLOUD_SAVED });
    }
    return true;
  }

  private async _backupFromConflict(
    response: Response,
  ): Promise<CompleteBackup<AllModelConfig> | null> {
    try {
      const payload = (await response.json()) as { backup?: unknown };
      const backup = payload.backup;
      if (
        !backup ||
        typeof backup !== 'object' ||
        typeof (backup as { timestamp?: unknown }).timestamp !== 'number'
      ) {
        return null;
      }
      return backup as CompleteBackup<AllModelConfig>;
    } catch {
      return null;
    }
  }

  private async _importRemote(backup: CompleteBackup<AllModelConfig>): Promise<void> {
    await this._backupService.importCompleteBackup(backup, true, true, true);
    this._rememberSync(backup);
    this._snackService.open({ type: 'SUCCESS', msg: T.FILE_IMEX.CLOUD_RESTORED });
  }

  private async _fetchRemote(): Promise<RemoteBackup> {
    const response = await fetch(BACKUP_PATH, {
      cache: 'no-store',
    });
    if (response.status === 404) {
      return { kind: 'missing' };
    }
    if (response.status === 503) {
      return { kind: 'not-configured' };
    }
    if (!response.ok) {
      return { kind: 'error' };
    }

    const backup = (await response.json()) as CompleteBackup<AllModelConfig>;
    if (typeof backup.timestamp !== 'number') {
      return { kind: 'error' };
    }
    const remoteData = 'data' in backup ? backup.data : backup;
    return {
      kind: 'backup',
      backup,
      timestamp: backup.timestamp,
      hasData: hasMeaningfulStateData(remoteData),
    };
  }

  private _syncedAt(): number {
    const raw = localStorage.getItem(LS.CLOUD_SYNCED_AT);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private _isDirty(): boolean {
    return localStorage.getItem(LS.CLOUD_DIRTY) === '1';
  }

  private _rememberSync(backup: CompleteBackup<AllModelConfig>): void {
    const timestamp =
      typeof backup.timestamp === 'number' ? backup.timestamp : Date.now();
    localStorage.setItem(LS.CLOUD_SYNCED_AT, String(timestamp));
    localStorage.removeItem(LS.CLOUD_DIRTY);
  }
}
