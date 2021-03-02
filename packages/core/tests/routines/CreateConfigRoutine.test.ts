import fs from 'fs-extra';
import { Path } from '@boost/common';
import { copyFixtureToNodeModule, getFixturePath } from '@boost/test-utils';
import {
  STRATEGY_COPY,
  STRATEGY_CREATE,
  STRATEGY_NATIVE,
  STRATEGY_NONE,
  STRATEGY_REFERENCE,
} from '../../src/constants';
import ConfigContext from '../../src/contexts/ConfigContext';
import Driver from '../../src/Driver';
import CreateConfigRoutine from '../../src/routines/CreateConfigRoutine';
import {
  getRoot,
  mockDebugger,
  mockDriver,
  mockTool,
  prependRoot,
  stubConfigContext,
} from '../../src/test';
import Tool from '../../src/Tool';

describe('CreateConfigRoutine', () => {
  let writeSpy: jest.SpyInstance;
  let copySpy: jest.SpyInstance;
  let context: ConfigContext;
  let routine: CreateConfigRoutine<ConfigContext>;
  let driver: Driver;
  let tool: Tool;
  let fixtures: Function[];

  beforeEach(() => {
    tool = mockTool();
    context = stubConfigContext();

    driver = mockDriver('babel', tool, {
      configName: 'babel.config.js',
      configOption: '--config-file',
      title: 'Babel',
    });
    driver.configure({ args: ['--qux'] });

    routine = new CreateConfigRoutine('babel', 'Configure Babel', { driver, tool });
    // @ts-expect-error
    routine.debug = mockDebugger();

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    writeSpy = jest.spyOn(fs, 'writeFile').mockImplementation(() => Promise.resolve());

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    copySpy = jest.spyOn(fs, 'copy').mockImplementation(() => Promise.resolve());

    process.beemo = {
      context,
      tool,
    };

    fixtures = [];
  });

  afterEach(() => {
    // @ts-expect-error
    delete process.beemo;

    writeSpy.mockRestore();
    copySpy.mockRestore();

    fixtures.forEach((fixture) => fixture());
  });

  describe('constructor()', () => {
    it('errors if no driver defined', () => {
      expect(() => {
        routine = new CreateConfigRoutine('title', 'title');
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe('run()', () => {
    beforeEach(() => {
      driver.configure({ strategy: STRATEGY_NATIVE });
    });

    describe('create strategy', () => {
      it('creates config file if `configStrategy` metadata is create', async () => {
        driver.metadata.configStrategy = STRATEGY_CREATE;

        const envSpy = jest.spyOn(routine, 'setEnvVars');
        const providerSpy = jest.spyOn(routine, 'loadConfigFromProvider');
        const consumerSpy = jest.spyOn(routine, 'loadConfigFromConsumer');
        const mergeSpy = jest.spyOn(routine, 'mergeConfigs');
        const createSpy = jest.spyOn(routine, 'createConfigFile');

        const path = await routine.run(context, []);

        expect(envSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(providerSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(consumerSpy).toHaveBeenCalledWith(
          context,
          [{ babel: true, local: true }],
          expect.anything(),
        );
        expect(mergeSpy).toHaveBeenCalledWith(
          context,
          [{ babel: true, local: true }],
          expect.anything(),
        );
        expect(createSpy).toHaveBeenCalledWith(
          context,
          { babel: true, local: true },
          expect.anything(),
        );
        expect(path).toEqual(prependRoot('/babel.config.js'));
        expect(writeSpy).toHaveBeenCalledWith(
          prependRoot('/babel.config.js').path(),
          `module.exports = ${JSON.stringify({ babel: true, local: true }, null, 2)};`,
        );
      });

      it('creates config file if `strategy` option is create', async () => {
        driver.configure({ strategy: STRATEGY_CREATE });

        const envSpy = jest.spyOn(routine, 'setEnvVars');
        const providerSpy = jest.spyOn(routine, 'loadConfigFromProvider');
        const consumerSpy = jest.spyOn(routine, 'loadConfigFromConsumer');
        const mergeSpy = jest.spyOn(routine, 'mergeConfigs');
        const createSpy = jest.spyOn(routine, 'createConfigFile');

        const path = await routine.run(context, []);

        expect(envSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(providerSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(consumerSpy).toHaveBeenCalledWith(
          context,
          [{ babel: true, local: true }],
          expect.anything(),
        );
        expect(mergeSpy).toHaveBeenCalledWith(
          context,
          [{ babel: true, local: true }],
          expect.anything(),
        );
        expect(createSpy).toHaveBeenCalledWith(
          context,
          { babel: true, local: true },
          expect.anything(),
        );
        expect(path).toEqual(prependRoot('/babel.config.js'));
        expect(writeSpy).toHaveBeenCalledWith(
          prependRoot('/babel.config.js').path(),
          `module.exports = ${JSON.stringify({ babel: true, local: true }, null, 2)};`,
        );
      });

      it('merges provider and consumer configs', async () => {
        driver.configure({ strategy: STRATEGY_CREATE });

        context.workspaceRoot = new Path(getFixturePath('consumer-override'));
        tool.config.module = 'from-config-module';

        fixtures.push(copyFixtureToNodeModule('config-module', 'from-config-module'));

        const envSpy = jest.spyOn(routine, 'setEnvVars');
        const providerSpy = jest.spyOn(routine, 'loadConfigFromProvider');
        const consumerSpy = jest.spyOn(routine, 'loadConfigFromConsumer');
        const mergeSpy = jest.spyOn(routine, 'mergeConfigs');
        const createSpy = jest.spyOn(routine, 'createConfigFile');

        const path = await routine.run(context, []);

        expect(envSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(providerSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(consumerSpy).toHaveBeenCalledWith(
          context,
          [{ babel: true, lib: false }],
          expect.anything(),
        );
        expect(mergeSpy).toHaveBeenCalledWith(
          context,
          [
            { babel: true, lib: false },
            { babel: true, override: true },
          ],
          expect.anything(),
        );
        expect(createSpy).toHaveBeenCalledWith(
          context,
          { babel: true, lib: false, override: true },
          expect.anything(),
        );
        expect(path).toEqual(prependRoot('/babel.config.js'));
        expect(writeSpy).toHaveBeenCalledWith(
          prependRoot('/babel.config.js').path(),
          `module.exports = ${JSON.stringify(
            { babel: true, lib: false, override: true },
            null,
            2,
          )};`,
        );
      });
    });

    describe('copy strategy', () => {
      it('copies config file if `configStrategy` metadata is copy', async () => {
        driver.metadata.configStrategy = STRATEGY_COPY;

        const envSpy = jest.spyOn(routine, 'setEnvVars');
        const createSpy = jest.spyOn(routine, 'createConfigFile');
        const copyConfigSpy = jest.spyOn(routine, 'copyConfigFile');

        const path = await routine.run(context, []);

        expect(envSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(copyConfigSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(createSpy).not.toHaveBeenCalled();
        expect(path).toEqual(prependRoot('/babel.config.js'));
      });

      it('copies config file if `strategy` option is copy', async () => {
        driver.configure({ strategy: STRATEGY_COPY });

        const envSpy = jest.spyOn(routine, 'setEnvVars');
        const createSpy = jest.spyOn(routine, 'createConfigFile');
        const copyConfigSpy = jest.spyOn(routine, 'copyConfigFile');

        const path = await routine.run(context, []);

        expect(envSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(copyConfigSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(createSpy).not.toHaveBeenCalled();
        expect(path).toEqual(prependRoot('/babel.config.js'));
      });
    });

    describe('reference strategy', () => {
      it('references config file if `configStrategy` metadata is reference', async () => {
        driver.metadata.configStrategy = STRATEGY_REFERENCE;

        const envSpy = jest.spyOn(routine, 'setEnvVars');
        const createSpy = jest.spyOn(routine, 'createConfigFile');
        const refSpy = jest.spyOn(routine, 'referenceConfigFile');

        const path = await routine.run(context, []);

        expect(envSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(refSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(createSpy).not.toHaveBeenCalled();
        expect(path).toEqual(prependRoot('/babel.config.js'));
      });

      it('references config file if `strategy` option is reference', async () => {
        driver.configure({ strategy: STRATEGY_REFERENCE });

        const envSpy = jest.spyOn(routine, 'setEnvVars');
        const createSpy = jest.spyOn(routine, 'createConfigFile');
        const refSpy = jest.spyOn(routine, 'referenceConfigFile');

        const path = await routine.run(context, []);

        expect(envSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(refSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(createSpy).not.toHaveBeenCalled();
        expect(path).toEqual(prependRoot('/babel.config.js'));
      });
    });

    describe('native strategy', () => {
      it('falls back to `configStrategy` metadata when `strategy` option is native', async () => {
        driver.configure({ strategy: STRATEGY_NATIVE });
        driver.metadata.configStrategy = STRATEGY_COPY;

        const envSpy = jest.spyOn(routine, 'setEnvVars');
        const createSpy = jest.spyOn(routine, 'createConfigFile');
        const copyConfigSpy = jest.spyOn(routine, 'copyConfigFile');

        const path = await routine.run(context, []);

        expect(envSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(copyConfigSpy).toHaveBeenCalledWith(context, [], expect.anything());
        expect(createSpy).not.toHaveBeenCalled();
        expect(path).toEqual(prependRoot('/babel.config.js'));
      });
    });

    describe('none strategy', () => {
      it('does nothing since routine is skipped', async () => {
        driver.configure({ strategy: STRATEGY_NONE });

        const envSpy = jest.spyOn(routine, 'setEnvVars');

        await routine.run(context, []);

        expect(envSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('copyConfigFile()', () => {
    it('adds path to context', async () => {
      await routine.copyConfigFile(context);

      expect(context.configPaths).toEqual([
        { driver: 'babel', path: prependRoot('/babel.config.js') },
      ]);
    });

    it('copies file', async () => {
      const path = await routine.copyConfigFile(context);

      expect(copySpy).toHaveBeenCalledWith(
        prependRoot('/configs/babel.js').path(),
        prependRoot('/babel.config.js').path(),
        { overwrite: true },
      );
      expect(path).toEqual(prependRoot('/babel.config.js'));
    });

    it('sets config on driver', async () => {
      await routine.copyConfigFile(context);

      expect(driver.config).toEqual({ babel: true, local: true });
    });

    it('emits `onCopyConfigFile` event', async () => {
      const spy = jest.fn();

      driver.onCopyConfigFile.listen(spy);

      await routine.copyConfigFile(context);

      expect(spy).toHaveBeenCalledWith(context, prependRoot('/babel.config.js'), {
        babel: true,
        local: true,
      });
    });

    it('errors if no source file', async () => {
      routine.getConfigPath = () => null;

      await expect(routine.copyConfigFile(context)).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('createConfigFile()', () => {
    it('adds path to context', async () => {
      await routine.createConfigFile(context, { foo: 'bar' });

      expect(context.configPaths).toEqual([
        { driver: 'babel', path: prependRoot('/babel.config.js') },
      ]);
    });

    it('writes and formats file', async () => {
      const path = await routine.createConfigFile(context, { foo: 'bar' });

      expect(writeSpy).toHaveBeenCalledWith(
        prependRoot('/babel.config.js').path(),
        'module.exports = {\n  "foo": "bar"\n};',
      );
      expect(path).toEqual(prependRoot('/babel.config.js'));
    });

    it('sets config on driver', async () => {
      await routine.createConfigFile(context, { foo: 'bar' });

      expect(driver.config).toEqual({ foo: 'bar' });
    });

    it('emits `onCreateConfigFile` event', async () => {
      const spy = jest.fn();

      driver.onCreateConfigFile.listen(spy);

      await routine.createConfigFile(context, { foo: 'bar' });

      expect(spy).toHaveBeenCalledWith(context, prependRoot('/babel.config.js'), {
        foo: 'bar',
      });
    });
  });

  describe('createConfigFileFromTemplate()', () => {
    beforeEach(() => {
      driver.configure({
        strategy: 'template',
        template: new Path(__dirname, './__fixtures__/template.js').path(),
      });
    });

    it('errors if `template` option is empty', async () => {
      driver.configure({
        template: '',
      });

      await expect(routine.createConfigFileFromTemplate(context, [])).rejects.toThrow(
        'Driver `template` option is required when `strategy` is "template".',
      );
    });

    it('errors if `template` file path does not exist', async () => {
      driver.configure({
        template: 'unknown-template.js',
      });

      await expect(routine.createConfigFileFromTemplate(context, [])).rejects.toThrow(
        'Failed to load configuration strategy template from "unknown-template.js".',
      );
    });

    it('errors if `template` file does not export a function', async () => {
      driver.configure({
        template: new Path(__dirname, './__fixtures__/template-export-non-function.js').path(),
      });

      await expect(routine.createConfigFileFromTemplate(context, [])).rejects.toThrow(
        'Configuration strategy template must export a function, found number.',
      );
    });

    describe('default', () => {
      it('adds default path to context', async () => {
        await routine.createConfigFileFromTemplate(context, [{ foo: 'bar' }]);

        expect(context.configPaths).toEqual([
          { driver: 'babel', path: prependRoot('/babel.config.js') },
        ]);
      });

      it('when template config is an object, formats it as json/js', async () => {
        await routine.createConfigFileFromTemplate(context, [{ foo: 'bar' }]);

        expect(writeSpy).toHaveBeenCalledWith(
          prependRoot('/babel.config.js').path(),
          'module.exports = {\n  "foo": "bar"\n};',
        );
      });

      it('emits `onTemplateConfigFile` event', async () => {
        const spy = jest.fn();

        driver.onTemplateConfigFile.listen(spy);

        await routine.createConfigFileFromTemplate(context, [
          { foo: 'bar' },
          { foo: 'qux' },
          { bar: 123 },
        ]);

        expect(spy).toHaveBeenCalledWith(context, prependRoot('/babel.config.js'), {
          foo: 'qux',
          bar: 123,
        });
      });
    });

    describe('custom', () => {
      beforeEach(() => {
        driver.configure({
          template: new Path(__dirname, './__fixtures__/template-custom.js').path(),
        });
      });

      const yamlConfig = `
foo: bar
list:
  - 1
  - 2
  - 3`.trim();

      it('adds custom path to context', async () => {
        await routine.createConfigFileFromTemplate(context, [{ foo: 'bar' }]);

        expect(context.configPaths).toEqual([
          { driver: 'babel', path: prependRoot('/babel.yaml') },
        ]);
      });

      it('when template config is a string, writes it as-is', async () => {
        await routine.createConfigFileFromTemplate(context, [{ foo: 'bar' }]);

        expect(writeSpy).toHaveBeenCalledWith(prependRoot('/babel.yaml').path(), yamlConfig);
      });

      it('emits `onTemplateConfigFile` event', async () => {
        const spy = jest.fn();

        driver.onTemplateConfigFile.listen(spy);

        await routine.createConfigFileFromTemplate(context, [{ foo: 'bar' }]);

        expect(spy).toHaveBeenCalledWith(context, prependRoot('/babel.yaml'), yamlConfig);
      });
    });
  });

  describe('getConfigPath()', () => {
    describe('consumer', () => {
      it('returns `.configs/beemo/file.js`', () => {
        context.workspaceRoot = new Path(getFixturePath('consumer-override'));

        const path = routine.getConfigPath(context, true);

        expect(path).toEqual(context.workspaceRoot.append('.config/beemo/babel.js'));
      });

      it('returns `.configs/<brand>/file.js` when branded', () => {
        tool.configure({ projectName: 'bmo' });

        context.workspaceRoot = new Path(getFixturePath('consumer-branded'));

        const path = routine.getConfigPath(context, true);

        expect(path).toEqual(context.workspaceRoot.append('.config/bmo/babel.js'));
      });
    });

    describe('provider', () => {
      it('returns `configs/file.js`', () => {
        tool.config.module = 'from-config-module';

        fixtures.push(copyFixtureToNodeModule('config-module', 'from-config-module'));

        const path = routine.getConfigPath(context);

        expect(path).toEqual(
          new Path(process.cwd(), 'node_modules', 'from-config-module/configs/babel.js'),
        );
      });

      it('returns `lib/configs/file.js`', () => {
        tool.config.module = 'from-config-lib-module';

        fixtures.push(copyFixtureToNodeModule('config-lib-module', 'from-config-lib-module'));

        const path = routine.getConfigPath(context);

        expect(path).toEqual(
          new Path(process.cwd(), 'node_modules', 'from-config-lib-module/lib/configs/babel.js'),
        );
      });
    });

    describe('@local', () => {
      beforeEach(() => {
        tool.config.module = '@local';
      });

      it('returns `configs/file.js`', () => {
        context.workspaceRoot = new Path(getFixturePath('config-module'));

        const path = routine.getConfigPath(context);

        expect(path).toEqual(new Path(getFixturePath('config-module', 'configs/babel.js')));
      });

      it('returns `lib/configs/file.js`', () => {
        context.workspaceRoot = new Path(getFixturePath('config-lib-module'));

        fixtures.push(copyFixtureToNodeModule('config-lib-module', 'from-config-lib-module'));

        const path = routine.getConfigPath(context);

        expect(path).toEqual(new Path(getFixturePath('config-lib-module', 'lib/configs/babel.js')));
      });
    });
  });

  describe('mergeConfigs()', () => {
    it('merges multiple sources', async () => {
      const config = await routine.mergeConfigs(context, [
        { foo: 123, qux: true },
        { bar: 'abc' },
        { foo: 456 },
      ]);

      expect(config).toEqual({
        foo: 456,
        bar: 'abc',
        qux: true,
      });
    });

    it('calls `mergeConfig` on driver', async () => {
      const spy = jest.spyOn(driver, 'mergeConfig');

      await routine.mergeConfigs(context, [{ foo: 123, qux: true }, { bar: 'abc' }, { foo: 456 }]);

      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('emits `onMergeConfig` event with final config object', async () => {
      const spy = jest.fn();

      driver.onMergeConfig.listen(spy);

      const config = await routine.mergeConfigs(context, [
        { foo: 123, qux: true },
        { bar: 'abc' },
        { foo: 456 },
      ]);

      expect(spy).toHaveBeenCalledWith(context, config);
    });
  });

  describe('loadConfigAtPath()', () => {
    it('errors if a config file returns a function', () => {
      expect(() => {
        routine.loadConfigAtPath(new Path(__dirname, '__fixtures__/config-export-function.js'));
      }).toThrow(
        'Configuration file `config-export-function.js` returned a function. Only plain objects are supported.',
      );
    });
  });

  describe('loadConfigFromConsumer()', () => {
    beforeEach(() => {
      tool.config.module = 'from-consumer';

      fixtures.push(copyFixtureToNodeModule('config-module', 'from-config-module'));
    });

    it('loads config if it exists', async () => {
      context.workspaceRoot = new Path(getFixturePath('consumer-override'));

      const configs = await routine.loadConfigFromConsumer(context, []);

      expect(configs).toEqual([{ babel: true, override: true }]);
    });

    it('does nothing if config does not exist', async () => {
      context.workspaceRoot = new Path(getFixturePath('consumer-no-override'));

      const configs = await routine.loadConfigFromConsumer(context, []);

      expect(configs).toEqual([]);
    });

    it('emits `onLoadConsumerConfig` event', async () => {
      context.workspaceRoot = new Path(getFixturePath('consumer-override'));

      const spy = jest.fn();

      driver.onLoadConsumerConfig.listen(spy);

      await routine.loadConfigFromConsumer(context, []);

      expect(spy).toHaveBeenCalledWith(context, {
        babel: true,
        override: true,
      });
    });

    it('doesnt trigger `onLoadConsumerConfig` event if files does not exist', async () => {
      context.workspaceRoot = new Path(getFixturePath('consumer-no-override'));

      const spy = jest.fn();

      driver.onLoadConsumerConfig.listen(spy);

      await routine.loadConfigFromConsumer(context, []);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('loadConfigFromProvider()', () => {
    it('loads config if it exists', async () => {
      tool.config.module = 'from-config-module';

      fixtures.push(copyFixtureToNodeModule('config-module', 'from-config-module'));

      const configs = await routine.loadConfigFromProvider(context, []);

      expect(configs).toEqual([{ babel: true, lib: false }]);
    });

    it('does nothing if config does not exist', async () => {
      tool.config.module = 'unknown-module';

      const configs = await routine.loadConfigFromProvider(context, []);

      expect(configs).toEqual([]);
    });

    it('uses local path when using @local config', async () => {
      const configs = await routine.loadConfigFromProvider(context, []);

      expect(configs).toEqual([{ babel: true, local: true }]);
    });

    it('emits `onLoadProviderConfig` event', async () => {
      const spy = jest.fn();

      driver.onLoadProviderConfig.listen(spy);

      await routine.loadConfigFromProvider(context, []);

      expect(spy).toHaveBeenCalledWith(context, getRoot().append('/configs/babel.js'), {
        babel: true,
        local: true,
      });
    });

    it('doesnt trigger `onLoadProviderConfig` event if files does not exist', async () => {
      tool.config.module = 'unknown-module';

      const spy = jest.fn();

      driver.onLoadProviderConfig.listen(spy);

      await routine.loadConfigFromProvider(context, []);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('referenceConfigFile()', () => {
    it('adds path to context', async () => {
      await routine.referenceConfigFile(context);

      expect(context.configPaths).toEqual([
        { driver: 'babel', path: prependRoot('/babel.config.js') },
      ]);
    });

    it('references file', async () => {
      const path = await routine.referenceConfigFile(context);

      expect(writeSpy).toHaveBeenCalledWith(
        prependRoot('/babel.config.js').path(),
        "module.exports = require('./configs/babel.js');",
      );
      expect(path).toEqual(prependRoot('/babel.config.js'));
    });

    it('sets config on driver', async () => {
      await routine.referenceConfigFile(context);

      expect(driver.config).toEqual({ babel: true, local: true });
    });

    it('emits `onReferenceConfigFile` event', async () => {
      const spy = jest.fn();

      driver.onReferenceConfigFile.listen(spy);

      await routine.referenceConfigFile(context);

      expect(spy).toHaveBeenCalledWith(context, prependRoot('/babel.config.js'), {
        babel: true,
        local: true,
      });
    });

    it('errors if no source file', async () => {
      routine.getConfigPath = () => null;

      await expect(routine.referenceConfigFile(context)).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('setEnvVars()', () => {
    it('sets env vars', () => {
      expect(process.env.BEEMO_TEST_VAR).toBeUndefined();

      driver.configure({
        env: {
          NODE_ENV: 'test',
          BEEMO_TEST_VAR: 'true',
        },
      });

      routine.setEnvVars(context, []);

      expect(process.env.BEEMO_TEST_VAR).toBe('true');
    });
  });
});
