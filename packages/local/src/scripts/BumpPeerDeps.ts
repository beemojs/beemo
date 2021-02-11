import chalk from 'chalk';
import glob from 'fast-glob';
import fs from 'fs-extra';
import semver from 'semver';
import { Arguments, PackageStructure, ParserOptions, Script, ScriptContext } from '@beemo/core';

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

    console.log('Loading packages and incrementing versions');

    const versions: { [name: string]: string } = {};
    const packages: { [name: string]: PackageStructure } = {};
    const packagePaths: { [name: string]: string } = {};

    glob
      .sync('./packages/*/package.json', { cwd: this.tool.project.root.path() })
      .forEach((path) => {
        const data = fs.readJsonSync(path) as { name: string; version: string };

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

            console.log(
              `Bumping %s peer %s from %s to %s`,
              chalk.yellow(name),
              chalk.cyan(peerName),
              chalk.gray(data.peerDependencies![peerName]),
              chalk.green(nextVersion),
            );

            data.peerDependencies![peerName] = nextVersion;
          });
        }

        return fs.writeJson(packagePaths[name], data, { spaces: 2 });
      }),
    );
  }
}
