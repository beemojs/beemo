import { Script, ScriptContext } from '@beemo/core';
import { PackageConfig } from '@boost/core';
import chalk from 'chalk';
import fs from 'fs-extra';
import execa from 'execa';

export interface Args {
  fail: boolean;
  pass: boolean;
}

export default class RunIntegrationTestsScript extends Script<Args> {
  args() {
    return {
      boolean: ['pass', 'fail'],
      default: {
        fail: false,
        pass: false,
      },
    };
  }

  blueprint() {
    return {};
  }

  execute(context: ScriptContext, args: Args) {
    // eslint-disable-next-line no-nested-ternary
    const key = args.pass ? 'pass' : args.fail ? 'fail' : '';

    if (!key) {
      throw new Error('Please pass one of --fail or --pass.');
    }

    const pkg: PackageConfig = fs.readJsonSync(context.cwd.append('package.json').path());
    const name = pkg.name.split('/')[1];
    const script = pkg.scripts && pkg.scripts[`integration:${key}`];

    if (!script) {
      return Promise.reject(
        new Error(`Script "integration:${key}" has not been defined for ${name}.`),
      );
    }

    this.tool.log('Testing %s - %s', chalk.yellow(pkg.name), script);

    return Promise.all(
      script.split('&&').map((command) => {
        const [cmd, ...cmdArgs] = command.trim().split(' ');

        return (
          execa(cmd, cmdArgs, { cwd: context.cwd.path(), preferLocal: true })
            // Handles everything else
            .then((response) => this.handleResult(name, args, response))
            // Handles syntax errors
            .catch((error) => this.handleResult(name, args, error))
        );
      }),
    );
  }

  handleResult(name: string, options: Args, response: execa.ExecaReturnValue) {
    const output = response.stdout || response.stderr;

    // console.log(name.toUpperCase());
    // console.log(response);

    if (options.fail && !response.failed) {
      throw new Error(`${name} should of failed when running --fail.\n\n${output}`);
    } else if (options.pass && response.failed) {
      throw new Error(`${name} should of passed when running --pass.\n\n${output}`);
    }

    return response;
  }
}
