import { Script, ScriptContext, PackageStructure, ParserOptions, Arguments } from '@beemo/core';
// import chalk from 'chalk';
import fs from 'fs-extra';
import glob from 'fast-glob';
import semver from 'semver';

export interface BumpPeerDepsOptions {
  release: 'major' | 'minor' | 'patch';
}

const RELEASE_TYPES: BumpPeerDepsOptions['release'][] = ['major', 'minor', 'patch'];

export default class BumpPeerDepsScript extends Script<BumpPeerDepsOptions> {
  parse(): ParserOptions<BumpPeerDepsOptions> {
    return {
      options: {
        release: {
          default: 'minor',
          description: 'Release type',
          type: 'string',
        },
      },
    };
  }

  execute(context: ScriptContext, args: Arguments<BumpPeerDepsOptions>) {
    const { release } = args.options;

    if (!RELEASE_TYPES.includes(release)) {
      throw new Error('Please pass one of major, minor, or patch to --release.');
    }

    // TODO
    // this.tool.log('Loading packages and incrementing versions');

    const versions: { [name: string]: string } = {};
    const packages: { [name: string]: PackageStructure } = {};
    const packagePaths: { [name: string]: string } = {};

    glob
      .sync('./packages/*/package.json', { cwd: this.tool.project.root.path() })
      .forEach((path) => {
        const data = fs.readJsonSync(path);

        versions[data.name] = semver.inc(data.version, release)!;
        packages[data.name] = data;
        packagePaths[data.name] = path;
      });

    return Promise.all(
      Object.entries(packages).map(([name, data]) => {
        if (data.peerDependencies) {
          Object.keys(data.peerDependencies).forEach((peerName) => {
            if (!versions[peerName]) {
              return;
            }

            const nextVersion = `^${versions[peerName]}`;

            // TODO
            // this.tool.log(
            //   `Bumping %s peer %s from %s to %s`,
            //   chalk.yellow(name),
            //   chalk.cyan(peerName),
            //   chalk.gray(data.peerDependencies![peerName]),
            //   chalk.green(nextVersion),
            // );

            data.peerDependencies![peerName] = nextVersion;
          });
        }

        return fs.writeJson(packagePaths[name], data, { spaces: 2 });
      }),
    );
  }
}
