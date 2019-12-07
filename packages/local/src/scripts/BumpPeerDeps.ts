import { Script } from '@beemo/core';
import { PackageConfig } from '@boost/core';
import chalk from 'chalk';
import fs from 'fs-extra';
import glob from 'fast-glob';
import semver from 'semver';

export interface Args {
  release: 'major' | 'minor' | 'patch';
}

const RELEASE_TYPES: Args['release'][] = ['major', 'minor', 'patch'];

export default class BumpPeerDepsScript extends Script<Args> {
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

  execute(context, args: Args) {
    const { release } = args;

    if (!RELEASE_TYPES.includes(release)) {
      throw new Error('Please pass one of major, minor, or patch to --release.');
    }

    const versions: { [name: string]: string } = {};
    const packages: { [name: string]: PackageConfig } = {};
    const packagePaths: { [name: string]: string } = {};

    this.tool.log('Loading packages and incrementing versions');

    glob.sync('./packages/*/package.json', { cwd: this.tool.options.root }).forEach(path => {
      const data = fs.readJsonSync(path);

      versions[data.name] = semver.inc(data.version, release);
      packages[data.name] = data;
      packagePaths[data.name] = path;
    });

    return Promise.all(
      Object.entries(packages).map(([name, data]) => {
        if (data.peerDependencies) {
          Object.keys(data.peerDependencies).forEach(peerName => {
            if (!versions[peerName]) {
              return;
            }

            const nextVersion = `^${versions[peerName]}`;

            this.tool.log(
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
}
