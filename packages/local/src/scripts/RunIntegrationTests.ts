import chalk from 'chalk';
import execa from 'execa';
import fs from 'fs-extra';
import {
  Arguments,
  PackageStructure,
  ParserOptions,
  Path,
  Script,
  ScriptContext,
} from '@beemo/core';

export interface RunIntegrationTestsOptions {
  type: 'fail' | 'pass';
}

class RunIntegrationTestsScript extends Script<RunIntegrationTestsOptions> {
  name = '@beemo/script-run-integration-tests';

  parse(): ParserOptions<RunIntegrationTestsOptions> {
    return {
      options: {
        type: {
          choices: ['cli', 'pass', 'fail'] as 'pass'[],
          default: 'pass',
          description: 'Type of integration to run',
          type: 'string',
        },
      },
    };
  }

  execute(context: ScriptContext, args: Arguments<RunIntegrationTestsOptions>) {
    const { type } = args.options;
    const pkg = fs.readJsonSync(context.cwd.append('package.json').path()) as PackageStructure;
    const name = pkg.name.split('/')[1];
    const script = pkg.scripts?.[`integration:${type}`];

    if (!script) {
      console.warn(`Script "integration:${type}" has not been defined for ${name}, skipping.`);

      return Promise.resolve();
    }

    console.log('Testing %s - %s', chalk.yellow(pkg.name), script);

    return Promise.all(
      script.split('&&').map((command, index) => {
        const [cmd, ...cmdArgs] = command.trim().split(' ');

        return (
          execa(cmd, cmdArgs, { cwd: context.cwd.path(), preferLocal: true })
            // Handles everything else
            .then((response) => this.handleResult(name, type, response, index))
            // Handles syntax errors
            .catch((error) => this.handleResult(name, type, error, index))
        );
      }),
    );
  }

  async handleResult(
    name: string,
    type: RunIntegrationTestsOptions['type'],
    response: execa.ExecaReturnValue,
    index: number,
  ) {
    const output = response.stdout || response.stderr;

    if (!process.env.CI) {
      const reportPath = new Path(process.cwd()).append('reports', name);

      await fs.ensureDir(reportPath.path());

      await fs.writeFile(
        reportPath.append(`${type}.${index + 1}.json`).path(),
        JSON.stringify(response, null, 2),
      );
    }

    if (type === 'fail' && !response.failed) {
      throw new Error(`${name} should of failed when running --type=fail.\n\n${output}`);
    } else if (type === 'pass' && response.failed) {
      throw new Error(`${name} should of passed when running --type=pass.\n\n${output}`);
    }

    return response;
  }
}

export default function runIntegrationTests() {
  return new RunIntegrationTestsScript();
}
