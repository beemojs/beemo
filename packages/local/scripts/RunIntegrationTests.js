const chalk = require('chalk');
const execa = require('execa');
const fs = require('fs-extra');
const { Script } = require('@beemo/core');

class RunIntegrationTestsScript extends Script {
  constructor() {
    super();
    this.name = '@beemo/script-run-integration-tests';
  }

  parse() {
    return {
      options: {
        type: {
          choices: ['pass', 'fail'],
          default: 'pass',
          description: 'Type of integration to run',
          type: 'string',
        },
      },
    };
  }

  execute(context, args) {
    const { type } = args.options;
    const pkg = fs.readJsonSync(context.cwd.append('package.json').path());
    const name = pkg.name.split('/')[1];
    const script = pkg.scripts?.[`integration:${type}`];

    if (!script) {
      return Promise.reject(
        new Error(`Script "integration:${type}" has not been defined for ${name}.`),
      );
    }

    console.log('Testing %s - %s', chalk.yellow(pkg.name), script);

    return Promise.all(
      script.split('&&').map((command) => {
        const [cmd, ...cmdArgs] = command.trim().split(' ');

        return (
          execa(cmd, cmdArgs, { cwd: context.cwd.path(), preferLocal: true })
            // Handles everything else
            .then((response) => this.handleResult(name, type, response))
            // Handles syntax errors
            .catch((error) => this.handleResult(name, type, error))
        );
      }),
    );
  }

  handleResult(name, type, response) {
    const output = response.stdout || response.stderr;

    // console.log(name.toUpperCase());
    // console.log(response);

    if (type === 'fail' && !response.failed) {
      throw new Error(`${name} should of failed when running --type=fail.\n\n${output}`);
    } else if (type === 'pass' && response.failed) {
      throw new Error(`${name} should of passed when running --type=pass.\n\n${output}`);
    }

    return response;
  }
}

module.exports = function runIntegrationTests() {
  return new RunIntegrationTestsScript();
};
