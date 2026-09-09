import { inject, Injectable } from '@angular/core';
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

const SAVE_DEBOUNCE_MS = 20_000;
const STATUS_PATH = '/api/backup?status=1';
const BACKUP_PATH = '/api/backup';
const NUDGE_SESSION_KEY = 'sp-cloud-backup-nudge';

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

  private _started = false;
  private _watching = false;
  private _configured = false;
  private _busy = false;

  get isAvailable(): boolean {
    return IS_WEB_BROWSER;
  }

  getSyncKey(): string {
    return localStorage.getItem(LS.CLOUD_SYNC_KEY) || '';
  }

  setSyncKey(key: string): void {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(LS.CLOUD_SYNC_KEY, trimmed);
    } else {
      localStorage.removeItem(LS.CLOUD_SYNC_KEY);
    }
    if (trimmed && this._started && !this._watching) {
      void this._bootstrap();
    }
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
    if (this._busy) {
      return false;
    }
    if (!this.getSyncKey()) {
      if (showSnack) {
        this._snackService.open({ type: 'ERROR', msg: T.FILE_IMEX.CLOUD_NEED_KEY });
      }
      return false;
    }

    const snapshot = this._stateSnapshotService.getAllSyncModelDataFromStore();
    if (!hasMeaningfulStateData(snapshot)) {
      if (showSnack) {
        this._snackService.open({ type: 'ERROR', msg: T.FILE_IMEX.CLOUD_NOTHING_TO_SAVE });
      }
      return false;
    }

    try {
      const backup = await this._backupService.loadCompleteBackup(true);
      const response = await fetch(BACKUP_PATH, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-sp-sync-key': this.getSyncKey(),
        },
        body: JSON.stringify(backup),
      });
      if (response.status === 401) {
        this._snackService.open({ type: 'ERROR', msg: T.FILE_IMEX.CLOUD_BAD_KEY });
        return false;
      }
      if (response.status === 503) {
        this._snackService.open({ type: 'ERROR', msg: T.FILE_IMEX.CLOUD_NOT_CONFIGURED });
        return false;
      }
      if (!response.ok) {
        throw new Error(await response.text());
      }
      if (showSnack) {
        this._snackService.open({ type: 'SUCCESS', msg: T.FILE_IMEX.CLOUD_SAVED });
      }
      return true;
    } catch (error) {
      Log.err('WebCloudBackup upload failed', error);
      if (showSnack) {
        this._snackService.open({ type: 'ERROR', msg: T.FILE_IMEX.CLOUD_SAVE_FAILED });
      }
      return false;
    }
  }

  async restoreFromCloud(force: boolean): Promise<boolean> {
    if (!this.getSyncKey()) {
      this._snackService.open({ type: 'ERROR', msg: T.FILE_IMEX.CLOUD_NEED_KEY });
      return false;
    }

    try {
      const response = await fetch(BACKUP_PATH, {
        headers: { 'x-sp-sync-key': this.getSyncKey() },
        cache: 'no-store',
      });
      if (response.status === 404) {
        this._snackService.open({ type: 'ERROR', msg: T.FILE_IMEX.CLOUD_EMPTY });
        return false;
      }
      if (response.status === 401) {
        this._snackService.open({ type: 'ERROR', msg: T.FILE_IMEX.CLOUD_BAD_KEY });
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

    if (!this.getSyncKey()) {
      this._nudgeOnce({
        ico: 'vpn_key',
        msg: T.FILE_IMEX.CLOUD_NEED_KEY,
      });
      return;
    }

    if (this._watching) {
      return;
    }
    this._watching = true;

    await this._restoreIfLocalEmpty();
    await this.uploadIfLocalHasData(false);

    this._localActions$.pipe(debounceTime(SAVE_DEBOUNCE_MS)).subscribe(() => {
      void this.uploadIfLocalHasData(false);
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

  private async _restoreIfLocalEmpty(): Promise<void> {
    const snapshot = this._stateSnapshotService.getAllSyncModelDataFromStore();
    if (hasMeaningfulStateData(snapshot)) {
      return;
    }

    try {
      const response = await fetch(BACKUP_PATH, {
        headers: { 'x-sp-sync-key': this.getSyncKey() },
        cache: 'no-store',
      });
      if (!response.ok) {
        return;
      }
      const backup = (await response.json()) as CompleteBackup<AllModelConfig>;
      const remoteData = 'data' in backup ? backup.data : backup;
      if (!hasMeaningfulStateData(remoteData)) {
        return;
      }
      await this._backupService.importCompleteBackup(backup, true, true, true);
      this._snackService.open({ type: 'SUCCESS', msg: T.FILE_IMEX.CLOUD_RESTORED });
    } catch (error) {
      Log.err('WebCloudBackup auto-restore skipped', error);
    }
  }
}
