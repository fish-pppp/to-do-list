import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { WebCloudBackupService } from './web-cloud-backup.service';
import { BackupService } from '../../op-log/backup/backup.service';
import { StateSnapshotService } from '../../op-log/backup/state-snapshot.service';
import { SnackService } from '../../core/snack/snack.service';
import { LOCAL_ACTIONS } from '../../util/local-actions.token';
import { LS } from '../../core/persistence/storage-keys.const';
import { INBOX_PROJECT } from '../../features/project/project.const';

describe('WebCloudBackupService', () => {
  let service: WebCloudBackupService;
  let backupService: jasmine.SpyObj<BackupService>;
  let snapshotService: jasmine.SpyObj<StateSnapshotService>;
  let snackService: jasmine.SpyObj<SnackService>;

  const emptySnapshot = {
    task: { ids: [] },
    project: { ids: [INBOX_PROJECT.id] },
    tag: { ids: [] },
    note: { ids: [] },
  };
  const taskSnapshot = {
    task: { ids: ['t1'] },
    project: { ids: [INBOX_PROJECT.id] },
    tag: { ids: [] },
    note: { ids: [] },
  };

  beforeEach(() => {
    localStorage.removeItem(LS.CLOUD_SYNC_KEY);
    sessionStorage.clear();

    backupService = jasmine.createSpyObj('BackupService', [
      'loadCompleteBackup',
      'importCompleteBackup',
    ]);
    snapshotService = jasmine.createSpyObj('StateSnapshotService', [
      'getAllSyncModelDataFromStore',
    ]);
    snackService = jasmine.createSpyObj('SnackService', ['open']);

    TestBed.configureTestingModule({
      providers: [
        WebCloudBackupService,
        { provide: BackupService, useValue: backupService },
        { provide: StateSnapshotService, useValue: snapshotService },
        { provide: SnackService, useValue: snackService },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: LOCAL_ACTIONS, useValue: new Subject() },
      ],
    });

    service = TestBed.inject(WebCloudBackupService);
    snapshotService.getAllSyncModelDataFromStore.and.returnValue(taskSnapshot as any);
    backupService.loadCompleteBackup.and.returnValue(
      Promise.resolve({ timestamp: 1, data: taskSnapshot } as any),
    );
    backupService.importCompleteBackup.and.returnValue(Promise.resolve());
  });

  afterEach(() => {
    localStorage.removeItem(LS.CLOUD_SYNC_KEY);
  });

  it('refuses to upload without a saved sync key', async () => {
    const ok = await service.uploadIfLocalHasData(true);
    expect(ok).toBeFalse();
    expect(snackService.open).toHaveBeenCalled();
  });

  it('uploads the complete backup with the sync key header', async () => {
    service.setSyncKey('abc');
    spyOn(window, 'fetch').and.resolveTo({
      ok: true,
      status: 200,
      text: async () => '',
      json: async () => ({ ok: true }),
    } as Response);

    const ok = await service.uploadIfLocalHasData(true);

    expect(ok).toBeTrue();
    expect(window.fetch).toHaveBeenCalledWith(
      '/api/backup',
      jasmine.objectContaining({
        method: 'PUT',
        headers: jasmine.objectContaining({ 'x-sp-sync-key': 'abc' }),
      }),
    );
  });

  it('auto-restores when local state is empty and a remote backup exists', async () => {
    service.setSyncKey('abc');
    snapshotService.getAllSyncModelDataFromStore.and.returnValue(emptySnapshot as any);
    const remote = {
      timestamp: 1,
      lastUpdate: 1,
      crossModelVersion: 1,
      data: taskSnapshot,
    };
    spyOn(window, 'fetch').and.callFake(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('status=1')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ configured: true }),
        } as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => remote,
      } as Response;
    });

    await service.init();

    expect(backupService.importCompleteBackup).toHaveBeenCalledWith(
      remote as any,
      true,
      true,
      true,
    );
  });
});
