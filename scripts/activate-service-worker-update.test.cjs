const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { patchNgswWorker, patchNgswWorkerFile, MARKER } = require('./activate-service-worker-update.cjs');

const SAMPLE = `  // packages/service-worker/worker/src/driver.js
          if (this.state === DriverReadyState.NORMAL && hash !== this.latestHash && appVersion.isNavigationRequest(event.request)) {
        await this.notifyClientsAboutVersionReady(manifest, hash);
        } catch (err) {
          this.debugger.log(err, \`initialize: schedule init of \${hash}\`);
        }
      }));
    }
`;

test('patch reloads clients that are still on an older build', () => {
  const patched = patchNgswWorker(SAMPLE);
  assert.match(patched, /async function reloadClientsPinnedToOlderBuild/);
  assert.match(patched, /event\.request\.destination === "document"/);
  assert.match(patched, /await reloadClientsPinnedToOlderBuild\(this\);/);
  assert.match(patched, /reload clients pinned to an older build/);
  assert.equal(patchNgswWorker(patched), patched);
  assert.ok(patched.includes(MARKER));
});

test('patch writes the worker file once', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ngsw-patch-'));
  const filePath = path.join(dir, 'ngsw-worker.js');
  fs.writeFileSync(filePath, SAMPLE);
  patchNgswWorkerFile(filePath);
  const once = fs.readFileSync(filePath, 'utf8');
  patchNgswWorkerFile(filePath);
  assert.equal(fs.readFileSync(filePath, 'utf8'), once);
});
