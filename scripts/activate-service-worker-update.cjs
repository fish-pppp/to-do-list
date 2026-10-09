const fs = require('node:fs');

const MARKER = 'reload clients after service worker update';

const ASSIGN_FROM =
  'hash !== this.latestHash && appVersion.isNavigationRequest(event.request)';
const ASSIGN_TO =
  'hash !== this.latestHash && (appVersion.isNavigationRequest(event.request) || event.request.destination === "document")';

const READY_FROM = 'await this.notifyClientsAboutVersionReady(manifest, hash);';
const READY_TO = `${READY_FROM}
        await reloadClientsPinnedToOlderBuild(this);`;

const INIT_FROM = `        } catch (err) {
          this.debugger.log(err, \`initialize: schedule init of \${hash}\`);
        }
      }));
    }`;
const INIT_TO = `        } catch (err) {
          this.debugger.log(err, \`initialize: schedule init of \${hash}\`);
        }
      }));
      this.idle.schedule("reload clients pinned to an older build", async () => {
        await reloadClientsPinnedToOlderBuild(this);
      });
    }`;

const HELPER = `  async function reloadClientsPinnedToOlderBuild(driver) {
    const windowClients = await driver.scope.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });
    await Promise.all(windowClients.map(async (windowClient) => {
      const mapped = driver.clientVersionMap.get(windowClient.id);
      if (mapped === void 0 || mapped === driver.latestHash) {
        return;
      }
      if (typeof windowClient.navigate !== "function") {
        return;
      }
      try {
        await windowClient.navigate(windowClient.url);
      } catch (navigateError) {
        driver.debugger.log(navigateError, "${MARKER}");
      }
    }));
  }

`;

function patchNgswWorker(source) {
  if (source.includes(MARKER)) {
    return source;
  }
  if (!source.includes(ASSIGN_FROM)) {
    throw new Error('ngsw assignVersion pattern missing');
  }
  if (!source.includes(READY_FROM)) {
    throw new Error('ngsw version-ready pattern missing');
  }
  if (!source.includes(INIT_FROM)) {
    throw new Error('ngsw initialize pattern missing');
  }
  const helperAnchor = '  // packages/service-worker/worker/src/driver.js\n';
  if (!source.includes(helperAnchor)) {
    throw new Error('ngsw driver anchor missing');
  }
  return source
    .replace(helperAnchor, HELPER + helperAnchor)
    .replace(ASSIGN_FROM, ASSIGN_TO)
    .replace(READY_FROM, READY_TO)
    .replace(INIT_FROM, INIT_TO);
}

function patchNgswWorkerFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const patched = patchNgswWorker(source);
  if (patched !== source) {
    fs.writeFileSync(filePath, patched);
  }
}

module.exports = { patchNgswWorker, patchNgswWorkerFile, MARKER };

if (require.main === module) {
  const filePath = process.argv[2] || 'dist/browser/ngsw-worker.js';
  patchNgswWorkerFile(filePath);
}
