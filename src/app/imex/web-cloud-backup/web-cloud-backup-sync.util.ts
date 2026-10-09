export type CloudSyncAction = 'pull' | 'push' | 'idle';

export interface CloudSyncDecisionInput {
  /** Null when the cloud file does not exist. */
  remoteTimestamp: number | null;
  remoteHasData: boolean;
  localHasData: boolean;
  /** Timestamp of the cloud file this browser last imported or uploaded. */
  syncedAt: number;
  /** True when this browser has local edits that are not in the cloud yet. */
  dirty: boolean;
  /**
   * True when this browser has task ids the cloud file does not.
   * Those tasks are uploaded and unioned instead of being replaced by a pull.
   */
  localHasTasksNotInRemote?: boolean;
}

export const taskIdsFromState = (data: unknown): string[] => {
  if (!data || typeof data !== 'object') {
    return [];
  }
  const task = (data as { task?: { ids?: unknown } }).task;
  if (!task || !Array.isArray(task.ids)) {
    return [];
  }
  return task.ids.filter((id): id is string => typeof id === 'string');
};

export const hasTaskIdsMissingFromRemote = (
  localData: unknown,
  remoteData: unknown,
): boolean => {
  const remoteIds = new Set(taskIdsFromState(remoteData));
  return taskIdsFromState(localData).some((id) => !remoteIds.has(id));
};

/**
 * Last-write-wins after this browser has adopted a cloud copy.
 * A browser that has never synced uploads first, even when the cloud file is
 * newer, so the server can union those tasks instead of dropping them.
 * After that, a newer cloud copy is pulled even when this browser has tasks.
 * Local edits upload only when the cloud file is missing, empty, or not newer.
 */
export const decideCloudSyncAction = (input: CloudSyncDecisionInput): CloudSyncAction => {
  const cloudIsNewer =
    input.remoteTimestamp !== null &&
    input.remoteHasData &&
    input.remoteTimestamp > input.syncedAt;

  // syncedAt 0 means this browser has never imported or uploaded a cloud copy.
  // Push so a device that already wrote the cloud file does not replace these tasks.
  if (input.localHasData && input.syncedAt === 0 && input.remoteHasData) {
    return 'push';
  }

  // A newer cloud copy must not replace tasks that only exist on this device.
  if (cloudIsNewer && input.localHasTasksNotInRemote) {
    return 'push';
  }

  if (cloudIsNewer) {
    return 'pull';
  }

  if (!input.localHasData) {
    return 'idle';
  }

  if (input.remoteTimestamp === null || !input.remoteHasData) {
    return 'push';
  }

  if (input.dirty || input.syncedAt > input.remoteTimestamp) {
    return 'push';
  }

  return 'idle';
};
