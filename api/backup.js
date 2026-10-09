const BLOB_API = 'https://vercel.com/api/blob';
const BLOB_PATH = 'sp-tasks-backup.json';
const API_VERSION = '12';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function isConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN && process.env.SYNC_KEY);
}

function blobHeaders(extra) {
  return {
    Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
    'x-api-version': API_VERSION,
    ...extra,
  };
}

const INBOX_PROJECT_ID = 'INBOX_PROJECT';
const SYSTEM_TAG_IDS = new Set([
  'TODAY',
  'EM_URGENT',
  'EM_IMPORTANT',
  'KANBAN_IN_PROGRESS',
]);
const ID_LIST_KEYS = ['taskIds', 'backlogTaskIds', 'noteIds', 'subTaskIds', 'tagIds'];

function backupTimestamp(text) {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed.timestamp === 'number' ? parsed.timestamp : 0;
  } catch {
    return 0;
  }
}

function backupData(parsed) {
  if (parsed && parsed.data && typeof parsed.data === 'object') {
    return parsed.data;
  }
  return parsed && typeof parsed === 'object' ? parsed : {};
}

function entityIds(slice) {
  if (!slice || typeof slice !== 'object' || !Array.isArray(slice.ids)) {
    return [];
  }
  return slice.ids.filter((id) => typeof id === 'string');
}

function isEntityState(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    Array.isArray(value.ids) &&
    value.entities &&
    typeof value.entities === 'object' &&
    !Array.isArray(value.entities),
  );
}

/**
 * True when the backup contains user tasks, projects, tags, notes, archives,
 * or time-tracking entries. An empty stub or a stock inbox must not block a
 * device that still has its own tasks.
 */
function backupHasUserData(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return true;
  }
  const data = backupData(parsed);
  if (!data || typeof data !== 'object') {
    return true;
  }
  if (entityIds(data.task).length > 0) {
    return true;
  }
  for (const archiveKey of ['archiveYoung', 'archiveOld']) {
    const archive = data[archiveKey];
    if (archive && typeof archive === 'object' && entityIds(archive.task).length > 0) {
      return true;
    }
  }
  if (entityIds(data.project).some((id) => id !== INBOX_PROJECT_ID)) {
    return true;
  }
  if (entityIds(data.tag).some((id) => !SYSTEM_TAG_IDS.has(id))) {
    return true;
  }
  if (entityIds(data.note).length > 0) {
    return true;
  }
  const timeTracking = data.timeTracking;
  if (timeTracking && typeof timeTracking === 'object') {
    for (const bucket of ['project', 'tag']) {
      const entries = timeTracking[bucket];
      if (entries && typeof entries === 'object' && Object.keys(entries).length > 0) {
        return true;
      }
    }
  }
  return false;
}

function uniqueIds(baseList, extraList) {
  const out = [];
  const seen = new Set();
  for (const id of [...(baseList || []), ...(extraList || [])]) {
    if (typeof id !== 'string' || seen.has(id)) {
      continue;
    }
    seen.add(id);
    out.push(id);
  }
  return out;
}

function mergeById(older, newer) {
  const byId = new Map();
  const anonymous = [];
  const items = [
    ...(Array.isArray(older) ? older : []),
    ...(Array.isArray(newer) ? newer : []),
  ];
  for (const item of items) {
    if (item && typeof item === 'object' && typeof item.id === 'string') {
      byId.set(item.id, item);
    } else if (item) {
      anonymous.push(item);
    }
  }
  return [...byId.values(), ...anonymous];
}

function mergeEntityRecord(older, newer) {
  if (!older || typeof older !== 'object') {
    return newer;
  }
  if (!newer || typeof newer !== 'object') {
    return older;
  }
  const merged = { ...older, ...newer };
  for (const key of ID_LIST_KEYS) {
    if (Array.isArray(older[key]) || Array.isArray(newer[key])) {
      merged[key] = uniqueIds(newer[key], older[key]);
    }
  }
  if (older.timeSpentOnDay || newer.timeSpentOnDay) {
    const days = { ...(older.timeSpentOnDay || {}) };
    for (const [day, value] of Object.entries(newer.timeSpentOnDay || {})) {
      const prev = typeof days[day] === 'number' ? days[day] : 0;
      const next = typeof value === 'number' ? value : 0;
      days[day] = Math.max(prev, next);
    }
    merged.timeSpentOnDay = days;
  }
  if (typeof older.timeSpent === 'number' || typeof newer.timeSpent === 'number') {
    merged.timeSpent = Math.max(older.timeSpent || 0, newer.timeSpent || 0);
  }
  if (Array.isArray(older.attachments) || Array.isArray(newer.attachments)) {
    merged.attachments = mergeById(older.attachments, newer.attachments);
  }
  return merged;
}

function mergeEntityState(older, newer) {
  if (!isEntityState(older)) {
    return isEntityState(newer) ? newer : (newer ?? older);
  }
  if (!isEntityState(newer)) {
    return older;
  }
  const ids = uniqueIds(newer.ids, older.ids);
  const entities = {};
  for (const id of ids) {
    entities[id] = mergeEntityRecord(older.entities[id], newer.entities[id]);
  }
  const merged = { ...older, ...newer, ids, entities };
  if (Array.isArray(older.todayOrder) || Array.isArray(newer.todayOrder)) {
    merged.todayOrder = uniqueIds(newer.todayOrder, older.todayOrder);
  }
  return merged;
}

function mergeTimeMaps(older, newer) {
  const out = { ...(older || {}) };
  for (const [id, dates] of Object.entries(newer || {})) {
    if (!dates || typeof dates !== 'object') {
      out[id] = dates;
      continue;
    }
    const prev = out[id] && typeof out[id] === 'object' ? { ...out[id] } : {};
    for (const [day, value] of Object.entries(dates)) {
      const next = typeof value === 'number' ? value : 0;
      const current = typeof prev[day] === 'number' ? prev[day] : 0;
      prev[day] = Math.max(current, next);
    }
    out[id] = prev;
  }
  return out;
}

function mergeTimeTracking(older, newer) {
  const base = older && typeof older === 'object' ? older : {};
  const extra = newer && typeof newer === 'object' ? newer : {};
  return {
    ...base,
    ...extra,
    project: mergeTimeMaps(base.project, extra.project),
    tag: mergeTimeMaps(base.tag, extra.tag),
  };
}

function mergeArchive(older, newer) {
  if (!older || typeof older !== 'object') {
    return newer;
  }
  if (!newer || typeof newer !== 'object') {
    return older;
  }
  return {
    ...older,
    ...newer,
    task: mergeEntityState(older.task, newer.task),
    timeTracking: mergeTimeTracking(older.timeTracking, newer.timeTracking),
  };
}

function mergePlanner(older, newer) {
  const base = older && typeof older === 'object' ? older : {};
  const extra = newer && typeof newer === 'object' ? newer : {};
  const days = { ...(base.days || {}) };
  for (const [day, ids] of Object.entries(extra.days || {})) {
    days[day] = uniqueIds(ids, days[day]);
  }
  return { ...base, ...extra, days };
}

function collectMenuIds(nodes, into = new Set()) {
  for (const node of nodes || []) {
    if (node && typeof node.id === 'string') {
      into.add(node.id);
    }
    if (node && Array.isArray(node.children)) {
      collectMenuIds(node.children, into);
    }
  }
  return into;
}

function mergeMenuTree(older, newer) {
  const base = newer && typeof newer === 'object' ? newer : {};
  const extra = older && typeof older === 'object' ? older : {};
  const projectTree = Array.isArray(base.projectTree) ? [...base.projectTree] : [];
  const tagTree = Array.isArray(base.tagTree) ? [...base.tagTree] : [];
  const projectIds = collectMenuIds(projectTree);
  const tagIds = collectMenuIds(tagTree);
  for (const node of extra.projectTree || []) {
    if (node && typeof node.id === 'string' && !projectIds.has(node.id)) {
      projectTree.push(node);
      projectIds.add(node.id);
    }
  }
  for (const node of extra.tagTree || []) {
    if (node && typeof node.id === 'string' && !tagIds.has(node.id)) {
      tagTree.push(node);
      tagIds.add(node.id);
    }
  }
  return { ...extra, ...base, projectTree, tagTree };
}

function mergeBoards(older, newer) {
  const olderBoards = older && Array.isArray(older.boardCfgs) ? older.boardCfgs : [];
  const newerBoards = newer && Array.isArray(newer.boardCfgs) ? newer.boardCfgs : [];
  return {
    ...(older || {}),
    ...(newer || {}),
    boardCfgs: mergeById(olderBoards, newerBoards),
  };
}

function mergeData(older, newer) {
  const base = older && typeof older === 'object' ? older : {};
  const extra = newer && typeof newer === 'object' ? newer : {};
  const out = { ...base };
  const keys = new Set([...Object.keys(base), ...Object.keys(extra)]);
  for (const key of keys) {
    const left = base[key];
    const right = extra[key];
    if (key === 'archiveYoung' || key === 'archiveOld') {
      out[key] = mergeArchive(left, right);
    } else if (key === 'planner') {
      out[key] = mergePlanner(left, right);
    } else if (key === 'timeTracking') {
      out[key] = mergeTimeTracking(left, right);
    } else if (key === 'reminders') {
      out[key] = mergeById(left, right);
    } else if (key === 'boards') {
      out[key] = mergeBoards(left, right);
    } else if (key === 'menuTree') {
      out[key] = mergeMenuTree(left, right);
    } else if (isEntityState(left) || isEntityState(right)) {
      out[key] = mergeEntityState(left, right);
    } else if (right !== undefined) {
      out[key] = right;
    } else {
      out[key] = left;
    }
  }
  return out;
}

function mergeBackupTexts(existingText, incomingText) {
  const existing = JSON.parse(existingText);
  const incoming = JSON.parse(incomingText);
  const existingTs = backupTimestamp(existingText);
  const incomingTs = backupTimestamp(incomingText);
  const incomingIsNewer = incomingTs >= existingTs;
  const newer = incomingIsNewer ? incoming : existing;
  const older = incomingIsNewer ? existing : incoming;
  const now = Date.now();
  const timestamp = Math.max(now, existingTs, incomingTs);
  return {
    timestamp,
    lastUpdate: timestamp,
    crossModelVersion: newer.crossModelVersion || older.crossModelVersion || 1,
    data: mergeData(backupData(older), backupData(newer)),
  };
}

async function rejectIfCloudIsNewer(req, res, body) {
  const raw = req.headers['x-sp-base-timestamp'];
  const header = Array.isArray(raw) ? raw[0] : raw;
  if (header === undefined || header === '') {
    return false;
  }
  const base = Number(header);
  if (!Number.isFinite(base)) {
    json(res, 400, { error: 'Invalid base timestamp' });
    return true;
  }
  const existing = await getBackup();
  if (!existing) {
    return false;
  }
  // A placeholder file (timestamp > 0, no tasks) must not 409 every device
  // that has never synced. Those browsers send base 0.
  if (!backupHasUserData(existing)) {
    return false;
  }
  const current = backupTimestamp(existing);
  if (current > base) {
    if (backupHasUserData(body)) {
      const merged = mergeBackupTexts(existing, body);
      await putBackup(JSON.stringify(merged));
      json(res, 409, { error: 'Cloud backup is newer', timestamp: merged.timestamp });
      return true;
    }
    json(res, 409, { error: 'Cloud backup is newer', timestamp: current });
    return true;
  }
  return false;
}

async function putBackup(body) {
  const url = `${BLOB_API}/?${new URLSearchParams({ pathname: BLOB_PATH })}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: blobHeaders({
      'x-vercel-blob-access': 'private',
      'x-add-random-suffix': '0',
      'x-allow-overwrite': '1',
      'x-content-type': 'application/json',
    }),
    body,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Blob upload failed (${response.status}): ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : {};
}

async function getBackup() {
  const listUrl = `${BLOB_API}?${new URLSearchParams({
    prefix: BLOB_PATH,
    limit: '10',
  })}`;
  const listRes = await fetch(listUrl, { headers: blobHeaders() });
  const listText = await listRes.text();
  if (!listRes.ok) {
    throw new Error(`Blob list failed (${listRes.status}): ${listText.slice(0, 300)}`);
  }

  let listed;
  try {
    listed = listText ? JSON.parse(listText) : {};
  } catch {
    throw new Error('Blob list returned invalid JSON');
  }

  const blobs = Array.isArray(listed.blobs) ? listed.blobs : [];
  const match =
    blobs.find((blob) => blob && blob.pathname === BLOB_PATH) || blobs[0] || null;
  if (!match) {
    return null;
  }

  const fileUrl = match.url || match.downloadUrl;
  if (!fileUrl) {
    return null;
  }

  const fileRes = await fetch(fileUrl, { headers: blobHeaders() });
  if (fileRes.status === 404) {
    return null;
  }
  const text = await fileRes.text();
  if (!fileRes.ok) {
    throw new Error(`Blob download failed (${fileRes.status}): ${text.slice(0, 300)}`);
  }
  return text;
}

async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url && req.url.includes('status=1')) {
    json(res, 200, { configured: isConfigured() });
    return;
  }

  if (!isConfigured()) {
    json(res, 503, {
      error:
        'Cloud backup is not configured. In Vercel: create a Blob store for this project and set SYNC_KEY.',
    });
    return;
  }

  try {
    if (req.method === 'GET') {
      const backup = await getBackup();
      if (!backup) {
        json(res, 404, { error: 'No backup yet' });
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(backup);
      return;
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = await readBody(req);
      if (!body) {
        json(res, 400, { error: 'Empty backup body' });
        return;
      }
      JSON.parse(body);
      if (await rejectIfCloudIsNewer(req, res, body)) {
        return;
      }
      await putBackup(body);
      json(res, 200, { ok: true, savedAt: Date.now() });
      return;
    }

    json(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : 'Backup failed' });
  }
}

module.exports = handler;
module.exports.putBackup = putBackup;
module.exports.getBackup = getBackup;
module.exports.backupHasUserData = backupHasUserData;
module.exports.mergeBackupTexts = mergeBackupTexts;
