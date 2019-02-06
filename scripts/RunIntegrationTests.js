const { Script } = require('@beemo/core');
const chalk = require('chalk');
const fs = require('fs-extra');
const execa = require('execa');
const path = require('path');

module.exports = class RunIntegrationTestsScript extends Script {
  args() {
    return {
      boolean: ['pass', 'fail'],
      default: {
        fail: false,
        pass: false,
      },
    };
  }

  execute(context, options) {
    // eslint-disable-next-line no-nested-ternary
    const key = options.pass ? 'pass' : options.fail ? 'fail' : '';

    if (!key) {
      throw new Error('Please pass one of --fail or --pass.');
    }

    const pkg = fs.readJsonSync(path.join(context.root, 'package.json'));
    const name = pkg.name.split('/')[1];
    const script = pkg.scripts && pkg.scripts[`integration:${key}`];

    if (!script) {
      return Promise.reject(
        new Error(`Script "integration:${key}" has not been defined for ${name}.`),
      );
    }

    this.tool.log('Testing %s', chalk.yellow(pkg.name));

    return Promise.all(
      script.split('&&').map(command =>
        execa
          .shell(command.trim(), { cwd: context.root })
          // Handles everything else
          .then(response => this.handleResult(name, options, response))
          // Handles syntax errors
          .catch(error => this.handleResult(name, options, error)),
      ),
    );
  }

  handleResult(name, options, response) {
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
};
