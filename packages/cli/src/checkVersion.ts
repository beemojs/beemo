/* eslint-disable no-console, unicorn/no-process-exit */

import chalk from 'chalk';
import semver from 'semver';
// @ts-ignore
import corePackage from '../../core/package.json';
// @ts-ignore
import cliPackage from '../package.json';

// No v prefix
const peerRange = `^${cliPackage.peerDependencies['@beemo/core'].slice(1)}`;
const coreVersion = corePackage.version;
const cliVersion = cliPackage.version;

// Verify that core satisfies the minimum peer version requirement.
if (!semver.satisfies(coreVersion, peerRange)) {
  console.error(chalk.red(`@beemo/core version out of date; must be ${peerRange}.`));
  process.exit(1);
}

// Verify the CLI is at the same major as core.
if (!semver.satisfies(cliVersion, peerRange)) {
  console.error(chalk.red(`@beemo/cli version out of date; must be ${peerRange}.`));
  process.exit(2);
}

export default coreVersion;
