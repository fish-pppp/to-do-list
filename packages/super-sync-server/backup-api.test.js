const { EventEmitter } = require('events');
const test = require('node:test');
const assert = require('node:assert/strict');

function mockRes() {
  const res = {
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
  return res;
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
  delete require.cache[require.resolve('./api/backup.js')];
  const previous = {
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    SYNC_KEY: process.env.SYNC_KEY,
  };
  process.env.BLOB_READ_WRITE_TOKEN = env.BLOB_READ_WRITE_TOKEN;
  process.env.SYNC_KEY = env.SYNC_KEY;
  const handler = require('./api/backup.js');
  return {
    handler,
    restore() {
      delete require.cache[require.resolve('./api/backup.js')];
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

test('rejects missing or wrong sync key', async () => {
  const { handler, restore } = loadHandler({
    BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_store_token',
    SYNC_KEY: 'secret-key',
  });
  try {
    const missing = mockRes();
    await invoke(handler, mockReq('GET', '/api/backup'), missing);
    assert.equal(missing.statusCode, 401);

    const wrong = mockRes();
    await invoke(
      handler,
      mockReq('GET', '/api/backup', { headers: { 'x-sp-sync-key': 'nope' } }),
      wrong,
    );
    assert.equal(wrong.statusCode, 401);
  } finally {
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
    if (href.includes('pathname=sp-tasks-backup.json') && (init.method || 'GET') === 'PUT') {
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
        headers: { 'x-sp-sync-key': 'secret-key' },
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
    await invoke(
      handler,
      mockReq('GET', '/api/backup', { headers: { 'x-sp-sync-key': 'secret-key' } }),
      getRes,
    );
    assert.equal(getRes.statusCode, 200);
    assert.equal(getRes.body, backup);
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
    await invoke(
      handler,
      mockReq('GET', '/api/backup', { headers: { 'x-sp-sync-key': 'secret-key' } }),
      res,
    );
    assert.equal(res.statusCode, 404);
  } finally {
    global.fetch = originalFetch;
    restore();
  }
});
