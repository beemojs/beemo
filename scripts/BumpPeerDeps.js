const { Script } = require('@beemo/core');
const chalk = require('chalk');
const fs = require('fs-extra');
const glob = require('fast-glob');
const semver = require('semver');

const RELEASE_TYPES = ['major', 'minor', 'patch'];

module.exports = class BumpPeerDepsScript extends Script {
  args() {
    return {
      default: {
        release: 'minor',
      },
      string: ['release'],
    };
  }

  blueprint() {
    return {};
  }

  execute(context, options) {
    const { release } = options;

    if (!RELEASE_TYPES.includes(release)) {
      throw new Error('Please pass one of major, minor, or patch to --release.');
    }

    const versions = {};
    const packages = {};
    const packagePaths = {};

    console.log('Loading packages and incrementing versions');

    glob.sync('./packages/*/package.json', { cwd: this.tool.options.root }).forEach(path => {
      const data = fs.readJsonSync(String(path));

      versions[data.name] = semver.inc(data.version, release);
      packages[data.name] = data;
      packagePaths[data.name] = String(path);
    });

    return Promise.all(
      Object.entries(packages).map(([name, data]) => {
        if (data.peerDependencies) {
          Object.keys(data.peerDependencies).forEach(peerName => {
            if (!versions[peerName]) {
              return;
            }

            const nextVersion = `^${versions[peerName]}`;

            console.log(
              `Bumping %s peer %s from %s to %s`,
              chalk.yellow(name),
              chalk.cyan(peerName),
              chalk.gray(data.peerDependencies[peerName]),
              chalk.green(nextVersion),
            );

            // eslint-disable-next-line no-param-reassign
            data.peerDependencies[peerName] = nextVersion;
          });
        }

        return fs.writeJson(packagePaths[name], data, { spaces: 2 });
      }),
    );
  }
};
