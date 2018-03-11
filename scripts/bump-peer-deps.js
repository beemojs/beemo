const { Script } = require('@beemo/core');
const fs = require('fs-extra');
const glob = require('glob');
const semver = require('semver');

const RELEASE_TYPES = ['major', 'minor', 'patch'];

module.exports = class BumpPeerDepsScript extends Script {
  parse() {
    return {
      default: {
        release: 'minor',
      },
      string: ['release'],
    };
  }

  run(options, tool) {
    const { release } = options;

    if (!RELEASE_TYPES.includes(release)) {
      throw new Error('Please pass one of major, minor, or patch to --release.');
    }

    const versions = {};
    const packages = {};
    const packagePaths = {};

    glob.sync('./packages/*/package.json', { cwd: tool.options.root }).forEach(path => {
      const data = fs.readJsonSync(path);

      versions[data.name] = semver.inc(data.version, release);
      packages[data.name] = data;
      packagePaths[data.name] = path;
    });

    return Promise.all(
      Object.keys(packages).forEach(name => {
        const data = packages[name];

        if (data.peerDependencies) {
          Object.keys(data.peerDependencies).forEach(peerName => {
            if (versions[peerName]) {
              // eslint-disable-next-line no-param-reassign
              data.peerDependencies[peerName] = versions[peerName];
            }
          });
        }

        return fs.writeJson(packagePaths[name], data, { spaces: 2 });
      })
    );
  }
};
