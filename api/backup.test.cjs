const { EventEmitter } = require('node:events');
const assert = require('node:assert/strict');
const test = require('node:test');

function mockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    ended: false,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    end(chunk) {
      this.ended = true;
      if (chunk !== undefined) {
        this.body = chunk;
      }
    },
  };
}

function mockReq(method, url, { headers = {}, body = '' } = {}) {
  const req = new EventEmitter();
  req.method = method;
  req.url = url;
  req.headers = headers;
  queueMicrotask(() => {
    if (body) {
      req.emit('data', Buffer.from(body));
    }
    req.emit('end');
  });
  return req;
}

function loadHandler(env) {
  delete require.cache[require.resolve('./backup.js')];
  const previous = {
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    SYNC_KEY: process.env.SYNC_KEY,
  };
  process.env.BLOB_READ_WRITE_TOKEN = env.BLOB_READ_WRITE_TOKEN;
  process.env.SYNC_KEY = env.SYNC_KEY;
  const handler = require('./backup.js');
  return {
    handler,
    restore() {
      delete require.cache[require.resolve('./backup.js')];
      if (previous.BLOB_READ_WRITE_TOKEN === undefined) {
        delete process.env.BLOB_READ_WRITE_TOKEN;
      } else {
        process.env.BLOB_READ_WRITE_TOKEN = previous.BLOB_READ_WRITE_TOKEN;
      }
      if (previous.SYNC_KEY === undefined) {
        delete process.env.SYNC_KEY;
      } else {
        process.env.SYNC_KEY = previous.SYNC_KEY;
      }
    },
  };
}

async function invoke(handler, req, res) {
  await handler(req, res);
  await new Promise((resolve) => setImmediate(resolve));
}

test('GET ?status=1 reports when Blob and SYNC_KEY are missing', async () => {
  const { handler, restore } = loadHandler({
    BLOB_READ_WRITE_TOKEN: '',
    SYNC_KEY: '',
  });
  try {
    const req = mockReq('GET', '/api/backup?status=1');
    const res = mockRes();
    await invoke(handler, req, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(JSON.parse(res.body), { configured: false });
  } finally {
    restore();
  }
});

test('GET ?status=1 reports configured when both env vars are set', async () => {
  const { handler, restore } = loadHandler({
    BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_store_token',
    SYNC_KEY: 'secret-key',
  });
  try {
    const req = mockReq('GET', '/api/backup?status=1');
    const res = mockRes();
    await invoke(handler, req, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(JSON.parse(res.body), { configured: true });
  } finally {
    restore();
  }
});

test('serves the backup without a client sync key and never returns SYNC_KEY', async () => {
  const { handler, restore } = loadHandler({
    BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_store_token',
    SYNC_KEY: 'secret-key',
  });
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ blobs: [] }),
  });
  try {
    const missing = mockRes();
    await invoke(handler, mockReq('GET', '/api/backup'), missing);
    assert.equal(missing.statusCode, 404);
    assert.equal(missing.body.includes('secret-key'), false);

    const ignoredHeader = mockRes();
    await invoke(
      handler,
      mockReq('GET', '/api/backup', { headers: { 'x-sp-sync-key': 'nope' } }),
      ignoredHeader,
    );
    assert.equal(ignoredHeader.statusCode, 404);
    assert.equal(ignoredHeader.body.includes('secret-key'), false);
  } finally {
    global.fetch = originalFetch;
    restore();
  }
});

test('PUT overwrites a fixed pathname and GET reads it back', async () => {
  const { handler, restore } = loadHandler({
    BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_store_token',
    SYNC_KEY: 'secret-key',
  });
  const originalFetch = global.fetch;
  const calls = [];
  const backup = JSON.stringify({ timestamp: 1, data: { task: { ids: ['a'] } } });

  global.fetch = async (url, init = {}) => {
    calls.push({
      url: String(url),
      method: init.method || 'GET',
      headers: init.headers,
      body: init.body,
    });
    const href = String(url);
    if (
      href.includes('pathname=sp-tasks-backup.json') &&
      (init.method || 'GET') === 'PUT'
    ) {
      return {
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            url: 'https://store.private.blob.vercel-storage.com/sp-tasks-backup.json',
            pathname: 'sp-tasks-backup.json',
          }),
      };
    }
    if (href.includes('prefix=sp-tasks-backup.json')) {
      return {
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            blobs: [
              {
                pathname: 'sp-tasks-backup.json',
                url: 'https://store.private.blob.vercel-storage.com/sp-tasks-backup.json',
              },
            ],
          }),
      };
    }
    if (href.includes('store.private.blob.vercel-storage.com')) {
      return {
        ok: true,
        status: 200,
        text: async () => backup,
      };
    }
    return { ok: false, status: 500, text: async () => 'unexpected' };
  };

  try {
    const putRes = mockRes();
    await invoke(
      handler,
      mockReq('PUT', '/api/backup', {
        body: backup,
      }),
      putRes,
    );
    assert.equal(putRes.statusCode, 200);
    assert.equal(JSON.parse(putRes.body).ok, true);

    const putCall = calls.find((call) => call.method === 'PUT');
    assert.ok(putCall);
    assert.match(putCall.url, /pathname=sp-tasks-backup\.json/);
    assert.equal(putCall.headers['x-allow-overwrite'], '1');
    assert.equal(putCall.headers['x-vercel-blob-access'], 'private');

    const getRes = mockRes();
    await invoke(handler, mockReq('GET', '/api/backup'), getRes);
    assert.equal(getRes.statusCode, 200);
    assert.equal(getRes.body, backup);
  } finally {
    global.fetch = originalFetch;
    restore();
  }
});

test('PUT with an older base timestamp unions tasks and asks the client to reload', async () => {
  const { handler, restore } = loadHandler({
    BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_store_token',
    SYNC_KEY: 'secret-key',
  });
  const originalFetch = global.fetch;
  const calls = [];
  const stored = JSON.stringify({
    timestamp: 50,
    data: {
      task: { ids: ['cloud'], entities: { cloud: { id: 'cloud', title: 'Cloud' } } },
      project: {
        ids: ['INBOX_PROJECT'],
        entities: { INBOX_PROJECT: { id: 'INBOX_PROJECT', taskIds: ['cloud'] } },
      },
    },
  });
  const stale = JSON.stringify({
    timestamp: 10,
    data: {
      task: { ids: ['local'], entities: { local: { id: 'local', title: 'Local' } } },
      project: {
        ids: ['INBOX_PROJECT'],
        entities: { INBOX_PROJECT: { id: 'INBOX_PROJECT', taskIds: ['local'] } },
      },
    },
  });

  global.fetch = async (url, init = {}) => {
    calls.push({
      url: String(url),
      method: init.method || 'GET',
      body: init.body,
    });
    const href = String(url);
    if (
      href.includes('pathname=sp-tasks-backup.json') &&
      (init.method || 'GET') === 'PUT'
    ) {
      return { ok: true, status: 200, text: async () => '{}' };
    }
    if (href.includes('prefix=sp-tasks-backup.json')) {
      return {
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            blobs: [
              {
                pathname: 'sp-tasks-backup.json',
                url: 'https://store.private.blob.vercel-storage.com/sp-tasks-backup.json',
              },
            ],
          }),
      };
    }
    if (href.includes('store.private.blob.vercel-storage.com')) {
      return { ok: true, status: 200, text: async () => stored };
    }
    return { ok: false, status: 500, text: async () => 'unexpected' };
  };

  try {
    const res = mockRes();
    await invoke(
      handler,
      mockReq('PUT', '/api/backup', {
        headers: { 'x-sp-base-timestamp': '0' },
        body: stale,
      }),
      res,
    );
    assert.equal(res.statusCode, 409);
    const conflict = JSON.parse(res.body);
    assert.ok(conflict.timestamp > 50);
    assert.deepEqual(conflict.backup.data.task.ids, ['cloud', 'local']);
    const putCall = calls.find((call) => call.method === 'PUT');
    assert.ok(putCall);
    const merged = JSON.parse(putCall.body);
    assert.deepEqual(merged.data.task.ids, ['cloud', 'local']);
    assert.deepEqual(merged.data.project.entities.INBOX_PROJECT.taskIds, [
      'cloud',
      'local',
    ]);
  } finally {
    global.fetch = originalFetch;
    restore();
  }
});

test('PUT replaces an empty newer stub so the first device can upload', async () => {
  const { handler, restore } = loadHandler({
    BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_store_token',
    SYNC_KEY: 'secret-key',
  });
  const originalFetch = global.fetch;
  const calls = [];
  const stored = JSON.stringify({
    timestamp: 1,
    lastUpdate: 1,
    crossModelVersion: 1,
    data: { task: { ids: [] } },
  });
  const incoming = JSON.stringify({
    timestamp: 20,
    data: {
      task: {
        ids: ['from-phone'],
        entities: { 'from-phone': { id: 'from-phone' } },
      },
    },
  });

  global.fetch = async (url, init = {}) => {
    calls.push({
      url: String(url),
      method: init.method || 'GET',
      body: init.body,
    });
    const href = String(url);
    if (
      href.includes('pathname=sp-tasks-backup.json') &&
      (init.method || 'GET') === 'PUT'
    ) {
      return { ok: true, status: 200, text: async () => '{}' };
    }
    if (href.includes('prefix=sp-tasks-backup.json')) {
      return {
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            blobs: [
              {
                pathname: 'sp-tasks-backup.json',
                url: 'https://store.private.blob.vercel-storage.com/sp-tasks-backup.json',
              },
            ],
          }),
      };
    }
    if (href.includes('store.private.blob.vercel-storage.com')) {
      return { ok: true, status: 200, text: async () => stored };
    }
    return { ok: false, status: 500, text: async () => 'unexpected' };
  };

  try {
    const res = mockRes();
    await invoke(
      handler,
      mockReq('PUT', '/api/backup', {
        headers: { 'x-sp-base-timestamp': '0' },
        body: incoming,
      }),
      res,
    );
    assert.equal(res.statusCode, 200);
    const putCall = calls.find((call) => call.method === 'PUT');
    assert.equal(putCall.body, incoming);
  } finally {
    global.fetch = originalFetch;
    restore();
  }
});

test('PUT does not resurrect a deleted task when the client already has the cloud copy', async () => {
  const { handler, restore } = loadHandler({
    BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_store_token',
    SYNC_KEY: 'secret-key',
  });
  const originalFetch = global.fetch;
  const calls = [];
  const stored = JSON.stringify({
    timestamp: 50,
    data: {
      task: {
        ids: ['keep', 'gone'],
        entities: { keep: { id: 'keep' }, gone: { id: 'gone' } },
      },
    },
  });
  const next = JSON.stringify({
    timestamp: 60,
    data: { task: { ids: ['keep'], entities: { keep: { id: 'keep' } } } },
  });

  global.fetch = async (url, init = {}) => {
    calls.push({
      url: String(url),
      method: init.method || 'GET',
      body: init.body,
    });
    const href = String(url);
    if (
      href.includes('pathname=sp-tasks-backup.json') &&
      (init.method || 'GET') === 'PUT'
    ) {
      return { ok: true, status: 200, text: async () => '{}' };
    }
    if (href.includes('prefix=sp-tasks-backup.json')) {
      return {
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            blobs: [
              {
                pathname: 'sp-tasks-backup.json',
                url: 'https://store.private.blob.vercel-storage.com/sp-tasks-backup.json',
              },
            ],
          }),
      };
    }
    if (href.includes('store.private.blob.vercel-storage.com')) {
      return { ok: true, status: 200, text: async () => stored };
    }
    return { ok: false, status: 500, text: async () => 'unexpected' };
  };

  try {
    const res = mockRes();
    await invoke(
      handler,
      mockReq('PUT', '/api/backup', {
        headers: { 'x-sp-base-timestamp': '50' },
        body: next,
      }),
      res,
    );
    assert.equal(res.statusCode, 200);
    const putCall = calls.find((call) => call.method === 'PUT');
    assert.equal(putCall.body, next);
  } finally {
    global.fetch = originalFetch;
    restore();
  }
});

test('PUT with the current base timestamp is allowed to overwrite', async () => {
  const { handler, restore } = loadHandler({
    BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_store_token',
    SYNC_KEY: 'secret-key',
  });
  const originalFetch = global.fetch;
  const calls = [];
  const stored = JSON.stringify({ timestamp: 50, data: { task: { ids: ['cloud'] } } });
  const next = JSON.stringify({ timestamp: 60, data: { task: { ids: ['edited'] } } });

  global.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method || 'GET' });
    const href = String(url);
    if (
      href.includes('pathname=sp-tasks-backup.json') &&
      (init.method || 'GET') === 'PUT'
    ) {
      return { ok: true, status: 200, text: async () => '{}' };
    }
    if (href.includes('prefix=sp-tasks-backup.json')) {
      return {
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            blobs: [
              {
                pathname: 'sp-tasks-backup.json',
                url: 'https://store.private.blob.vercel-storage.com/sp-tasks-backup.json',
              },
            ],
          }),
      };
    }
    if (href.includes('store.private.blob.vercel-storage.com')) {
      return { ok: true, status: 200, text: async () => stored };
    }
    return { ok: false, status: 500, text: async () => 'unexpected' };
  };

  try {
    const res = mockRes();
    await invoke(
      handler,
      mockReq('PUT', '/api/backup', {
        headers: { 'x-sp-base-timestamp': '50' },
        body: next,
      }),
      res,
    );
    assert.equal(res.statusCode, 200);
    assert.equal(
      calls.some((call) => call.method === 'PUT'),
      true,
    );
  } finally {
    global.fetch = originalFetch;
    restore();
  }
});

test('empty stubs are not user data, archived tasks are', () => {
  const { backupHasUserData, mergeBackupTexts } = require('./backup.js');
  assert.equal(
    backupHasUserData(
      JSON.stringify({
        timestamp: 1,
        data: { task: { ids: [] } },
      }),
    ),
    false,
  );
  assert.equal(
    backupHasUserData(
      JSON.stringify({
        data: {
          task: { ids: [], entities: {} },
          project: { ids: ['INBOX_PROJECT'], entities: {} },
          tag: { ids: ['TODAY'], entities: {} },
          archiveYoung: { task: { ids: ['archived'], entities: {} } },
        },
      }),
    ),
    true,
  );

  const merged = mergeBackupTexts(
    JSON.stringify({
      timestamp: 5,
      crossModelVersion: 4.5,
      data: {
        planner: { days: { '2026-10-09': ['cloud'] } },
        archiveYoung: {
          task: { ids: ['old'], entities: { old: { id: 'old', title: 'Old' } } },
        },
      },
    }),
    JSON.stringify({
      timestamp: 9,
      crossModelVersion: 4.5,
      data: {
        planner: { days: { '2026-10-09': ['phone'] } },
        archiveYoung: {
          task: { ids: ['new'], entities: { new: { id: 'new', title: 'New' } } },
        },
      },
    }),
  );
  assert.deepEqual(merged.data.planner.days['2026-10-09'], ['phone', 'cloud']);
  assert.deepEqual(merged.data.archiveYoung.task.ids, ['new', 'old']);
});

test('PUT retries the merge when the blob etag has changed', async () => {
  const { handler, restore } = loadHandler({
    BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_store_token',
    SYNC_KEY: 'secret-key',
  });
  const originalFetch = global.fetch;
  let stored = JSON.stringify({
    timestamp: 50,
    data: {
      task: { ids: ['cloud'], entities: { cloud: { id: 'cloud' } } },
    },
  });
  let etag = '"v1"';
  let puts = 0;
  const incoming = JSON.stringify({
    timestamp: 10,
    data: {
      task: { ids: ['phone'], entities: { phone: { id: 'phone' } } },
    },
  });

  global.fetch = async (url, init = {}) => {
    const href = String(url);
    const method = init.method || 'GET';
    if (href.includes('pathname=sp-tasks-backup.json') && method === 'PUT') {
      puts += 1;
      const ifMatch = init.headers && init.headers['x-if-match'];
      if (puts === 1) {
        assert.equal(ifMatch, '"v1"');
        etag = '"v2"';
        stored = JSON.stringify({
          timestamp: 70,
          data: {
            task: { ids: ['other'], entities: { other: { id: 'other' } } },
          },
        });
        return { ok: false, status: 412, text: async () => 'precondition failed' };
      }
      assert.equal(ifMatch, '"v2"');
      stored = init.body;
      etag = '"v3"';
      return { ok: true, status: 200, text: async () => '{}' };
    }
    if (href.includes('prefix=sp-tasks-backup.json')) {
      return {
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            blobs: [
              {
                pathname: 'sp-tasks-backup.json',
                url: 'https://store.private.blob.vercel-storage.com/sp-tasks-backup.json',
                etag,
              },
            ],
          }),
      };
    }
    if (href.includes('store.private.blob.vercel-storage.com')) {
      return {
        ok: true,
        status: 200,
        headers: { get: (name) => (name.toLowerCase() === 'etag' ? etag : null) },
        text: async () => stored,
      };
    }
    return { ok: false, status: 500, text: async () => 'unexpected' };
  };

  try {
    const res = mockRes();
    await invoke(
      handler,
      mockReq('PUT', '/api/backup', {
        headers: { 'x-sp-base-timestamp': '0' },
        body: incoming,
      }),
      res,
    );
    assert.equal(res.statusCode, 409);
    const conflict = JSON.parse(res.body);
    assert.deepEqual(conflict.backup.data.task.ids.sort(), ['other', 'phone']);
    assert.equal(puts, 2);
  } finally {
    global.fetch = originalFetch;
    restore();
  }
});

test('GET returns 404 when no backup exists yet', async () => {
  const { handler, restore } = loadHandler({
    BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_store_token',
    SYNC_KEY: 'secret-key',
  });
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ blobs: [] }),
  });

  try {
    const res = mockRes();
    await invoke(handler, mockReq('GET', '/api/backup'), res);
    assert.equal(res.statusCode, 404);
  } finally {
    global.fetch = originalFetch;
    restore();
  }
});
