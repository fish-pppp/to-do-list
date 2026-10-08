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
import { AllModelConfig } from '../../op-log/model/model-config';
import { CompleteBackup } from '../../op-log/core/types/sync.types';
import { decideCloudSyncAction } from './web-cloud-backup-sync.util';

const headerBag = (...pairs: [string, string][]): Record<string, string> => {
  const headers: Record<string, string> = {};
  for (const [key, value] of pairs) {
    headers[key] = value;
  }
  return headers;
};

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
    localStorage.removeItem(LS.CLOUD_SYNCED_AT);
    localStorage.removeItem(LS.CLOUD_DIRTY);
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
    snapshotService.getAllSyncModelDataFromStore.and.returnValue(
      taskSnapshot as unknown as ReturnType<
        StateSnapshotService['getAllSyncModelDataFromStore']
      >,
    );
    backupService.loadCompleteBackup.and.returnValue(
      Promise.resolve({
        timestamp: 1,
        data: taskSnapshot,
      } as unknown as CompleteBackup<AllModelConfig>),
    );
    backupService.importCompleteBackup.and.returnValue(Promise.resolve());
  });

  afterEach(() => {
    localStorage.removeItem(LS.CLOUD_SYNC_KEY);
    localStorage.removeItem(LS.CLOUD_SYNCED_AT);
    localStorage.removeItem(LS.CLOUD_DIRTY);
  });

  it('uploads the complete backup without a stored sync key', async () => {
    spyOn(window, 'fetch').and.callFake(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        if ((init?.method || 'GET') === 'GET') {
          return {
            ok: false,
            status: 404,
            text: async () => '',
            json: async () => ({ error: 'No backup yet' }),
          } as Response;
        }
        return {
          ok: true,
          status: 200,
          text: async () => '',
          json: async () => ({ ok: true }),
        } as Response;
      },
    );

    const ok = await service.uploadIfLocalHasData(true);

    expect(ok).toBeTrue();
    expect(localStorage.getItem(LS.CLOUD_SYNC_KEY)).toBeNull();
    const putCall = (window.fetch as jasmine.Spy).calls
      .allArgs()
      .find((args) => args[1] && args[1].method === 'PUT');
    expect(putCall).toBeTruthy();
    expect(putCall?.[1].headers['x-sp-sync-key']).toBeUndefined();
    expect(putCall?.[1].headers['x-sp-base-timestamp']).toBe('0');
  });

  it('auto-restores when local state is empty and a remote backup exists', async () => {
    snapshotService.getAllSyncModelDataFromStore.and.returnValue(
      emptySnapshot as unknown as ReturnType<
        StateSnapshotService['getAllSyncModelDataFromStore']
      >,
    );
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
      remote as unknown as CompleteBackup<AllModelConfig>,
      true,
      true,
      true,
    );
    expect(window.fetch).not.toHaveBeenCalledWith(
      '/api/backup',
      jasmine.objectContaining({ method: 'PUT' }),
    );
  });

  it('pulls a newer cloud backup even when this browser already has tasks', async () => {
    localStorage.setItem(LS.CLOUD_SYNCED_AT, '10');
    const remote = {
      timestamp: 50,
      lastUpdate: 50,
      crossModelVersion: 1,
      data: taskSnapshot,
    };
    spyOn(window, 'fetch').and.callFake(cloudFetch(remote));

    await service.init();

    expect(backupService.importCompleteBackup).toHaveBeenCalledWith(
      remote as unknown as CompleteBackup<AllModelConfig>,
      true,
      true,
      true,
    );
    expect(window.fetch).not.toHaveBeenCalledWith(
      '/api/backup',
      jasmine.objectContaining({ method: 'PUT' }),
    );
    expect(localStorage.getItem(LS.CLOUD_SYNCED_AT)).toBe('50');
    expect(localStorage.getItem(LS.CLOUD_DIRTY)).toBeNull();
  });

  it('does not upload local tasks over a cloud backup this browser already has', async () => {
    localStorage.setItem(LS.CLOUD_SYNCED_AT, '50');
    const remote = {
      timestamp: 50,
      lastUpdate: 50,
      crossModelVersion: 1,
      data: taskSnapshot,
    };
    spyOn(window, 'fetch').and.callFake(cloudFetch(remote));

    await service.init();

    expect(backupService.importCompleteBackup).not.toHaveBeenCalled();
    expect(window.fetch).not.toHaveBeenCalledWith(
      '/api/backup',
      jasmine.objectContaining({ method: 'PUT' }),
    );
  });

  it('uploads local edits when the cloud copy is not newer', async () => {
    localStorage.setItem(LS.CLOUD_SYNCED_AT, '50');
    localStorage.setItem(LS.CLOUD_DIRTY, '1');
    const remote = {
      timestamp: 50,
      lastUpdate: 50,
      crossModelVersion: 1,
      data: taskSnapshot,
    };
    spyOn(window, 'fetch').and.callFake(cloudFetch(remote));

    await service.init();

    expect(backupService.importCompleteBackup).not.toHaveBeenCalled();
    expect(window.fetch).toHaveBeenCalledWith(
      '/api/backup',
      jasmine.objectContaining({
        method: 'PUT',
        headers: jasmine.objectContaining(headerBag(['x-sp-base-timestamp', '50'])),
      }),
    );
    expect(localStorage.getItem(LS.CLOUD_DIRTY)).toBeNull();
  });

  it('pulls instead of uploading when the cloud copy became newer', async () => {
    localStorage.setItem(LS.CLOUD_SYNCED_AT, '10');
    localStorage.setItem(LS.CLOUD_DIRTY, '1');
    const remote = {
      timestamp: 80,
      lastUpdate: 80,
      crossModelVersion: 1,
      data: taskSnapshot,
    };
    spyOn(window, 'fetch').and.callFake(cloudFetch(remote));

    const ok = await service.uploadIfLocalHasData(false);

    expect(ok).toBeFalse();
    expect(backupService.importCompleteBackup).toHaveBeenCalled();
    expect(backupService.loadCompleteBackup).not.toHaveBeenCalled();
    expect(localStorage.getItem(LS.CLOUD_SYNCED_AT)).toBe('80');
  });
});

const cloudFetch =
  (remote: {
    timestamp: number;
    lastUpdate: number;
    crossModelVersion: number;
    data: unknown;
  }) =>
  async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    const method = init?.method || 'GET';
    if (url.includes('status=1')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ configured: true }),
        text: async () => '',
      } as Response;
    }
    if (method === 'PUT') {
      return {
        ok: true,
        status: 200,
        json: async () => ({ ok: true }),
        text: async () => '',
      } as Response;
    }
    return {
      ok: true,
      status: 200,
      json: async () => remote,
      text: async () => '',
    } as Response;
  };

describe('decideCloudSyncAction', () => {
  it('pulls when the cloud timestamp is newer, even if local data exists', () => {
    expect(
      decideCloudSyncAction({
        remoteTimestamp: 20,
        remoteHasData: true,
        localHasData: true,
        syncedAt: 10,
        dirty: true,
      }),
    ).toBe('pull');
  });

  it('pushes local edits only when the cloud copy is not newer', () => {
    expect(
      decideCloudSyncAction({
        remoteTimestamp: 10,
        remoteHasData: true,
        localHasData: true,
        syncedAt: 10,
        dirty: true,
      }),
    ).toBe('push');
  });

  it('stays idle when this browser already matches the cloud file', () => {
    expect(
      decideCloudSyncAction({
        remoteTimestamp: 10,
        remoteHasData: true,
        localHasData: true,
        syncedAt: 10,
        dirty: false,
      }),
    ).toBe('idle');
  });
});
