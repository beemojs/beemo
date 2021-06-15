import chalk from 'chalk';
import glob from 'fast-glob';
import fs from 'fs-extra';
import semver from 'semver';
import { Arguments, PackageStructure, ParserOptions, Script, ScriptContext } from '@beemo/core';

export interface BumpPeerDepsOptions {
	release: 'major' | 'minor' | 'patch';
}

const RELEASE_TYPES: BumpPeerDepsOptions['release'][] = ['major', 'minor', 'patch'];

class BumpPeerDepsScript extends Script<BumpPeerDepsOptions> {
	override readonly name = '@beemo/script-bump-peer-deps';

	override parse(): ParserOptions<BumpPeerDepsOptions> {
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

	async execute(context: ScriptContext, args: Arguments<BumpPeerDepsOptions>) {
		const { release } = args.options;

		if (!RELEASE_TYPES.includes(release)) {
			throw new Error('Please pass one of major, minor, or patch to --release.');
		}

		console.log('Loading packages and incrementing versions');

		const versions: Record<string, string> = {};
		const packages: Record<string, PackageStructure> = {};
		const packagePaths: Record<string, string> = {};

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

						// eslint-disable-next-line no-param-reassign
						data.peerDependencies![peerName] = nextVersion;
					});
				}

				return fs.writeJson(packagePaths[name], data, { spaces: 2 });
			}),
		);
	}
}

// eslint-disable-next-line import/no-default-export
export default function bumpPeerDeps() {
	return new BumpPeerDepsScript();
}
