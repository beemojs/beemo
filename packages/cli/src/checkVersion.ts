/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 */

/* eslint-disable no-console, unicorn/no-process-exit */

import chalk from 'chalk';
import semver from 'semver';
// @ts-ignore
import corePackage from '../../core/package.json';
// @ts-ignore
import cliPackage from '../package.json';

const peerVersion = cliPackage.peerDependencies['@beemo/core'].slice(1); // No v prefix
const coreVersion = corePackage.version; // No v prefix

// Verify that core satisfies the minimum peer version requirement.
if (peerVersion.charAt(0) !== '0' && !semver.satisfies(coreVersion, `^${peerVersion}`)) {
  console.error(chalk.red(`@beemo/core version out of date; must be ^${peerVersion}.`));
  process.exit(1);
}

// Verify the CLI is at the same major as core.
const coreMajor = semver.major(coreVersion);
const coreMinor = semver.minor(coreVersion);
const coreMinReqVersion = coreMajor === 0 ? `^${coreMajor}.${coreMinor}.0` : `^${coreMajor}.0.0`;

if (!semver.satisfies(cliPackage.version, coreMinReqVersion)) {
  console.error(chalk.red(`@beemo/cli version out of date; must be ^${coreMinReqVersion}.`));
  process.exit(2);
}

export default coreVersion;
