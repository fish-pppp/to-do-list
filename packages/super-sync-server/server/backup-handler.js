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

function backupTimestamp(text) {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed.timestamp === 'number' ? parsed.timestamp : 0;
  } catch {
    return 0;
  }
}

async function rejectIfCloudIsNewer(req, res) {
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
  const current = backupTimestamp(existing);
  if (current > base) {
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
      if (await rejectIfCloudIsNewer(req, res)) {
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
