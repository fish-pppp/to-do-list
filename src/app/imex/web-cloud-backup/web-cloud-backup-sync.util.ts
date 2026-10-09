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
}

/**
 * Last-write-wins for the single cloud backup file.
 * A newer cloud copy is pulled even when this browser already has tasks.
 * Local data is uploaded only when the cloud file is missing or older.
 */
export const decideCloudSyncAction = (input: CloudSyncDecisionInput): CloudSyncAction => {
  const cloudIsNewer =
    input.remoteTimestamp !== null &&
    input.remoteHasData &&
    input.remoteTimestamp > input.syncedAt;

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
