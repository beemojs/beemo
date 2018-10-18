import ConfigLoader from '@boost/core/lib/ConfigLoader';
import fs from 'fs-extra';
import CreateConfigRoutine from '../../src/configure/CreateConfigRoutine';
import BabelDriver from '../../../driver-babel/src/BabelDriver';
import Driver from '../../src/Driver';
import { STRATEGY_COPY, STRATEGY_REFERENCE } from '../../src/constants';
import { BeemoTool } from '../../src/types';
import {
  createDriverContext,
  prependRoot,
  createTestDebugger,
  createTestTool,
} from '../../../../tests/helpers';

jest.mock('fs-extra');
jest.mock('@boost/core/lib/ConfigLoader');

describe('CreateConfigRoutine', () => {
  let routine: CreateConfigRoutine;
  let driver: Driver;
  let tool: BeemoTool;

  beforeEach(() => {
    tool = createTestTool();

    driver = new BabelDriver({ args: ['--qux'] });
    driver.name = 'babel';
    driver.tool = tool;
    driver.bootstrap();

    routine = new CreateConfigRoutine('babel', 'Configure Babel', { driver });
    routine.context = createDriverContext();
    routine.tool = tool;
    routine.tool.config.module = '@local';
    routine.debug = createTestDebugger();

    (fs.existsSync as jest.Mock).mockImplementation(() => true);
    (fs.writeFile as jest.Mock).mockImplementation(() => Promise.resolve());
    (fs.copy as jest.Mock).mockImplementation(() => Promise.resolve());

    // @ts-ignore
    ConfigLoader.mockImplementation(() => ({
      parseFile: () => ({ foo: 123 }),
    }));

    process.beemo = {
      context: routine.context,
      tool,
    };
  });

  afterEach(() => {
    // @ts-ignore
    ConfigLoader.mockReset();

    delete process.beemo;
  });

  describe('execute()', () => {
    it('executes pipeline and returns final config path', async () => {
      const envSpy = jest.spyOn(routine, 'setEnvVars');
      const loadSpy = jest.spyOn(routine, 'loadConfigFromSources');
      const extractSpy = jest.spyOn(routine, 'extractConfigFromPackage');
      const mergeSpy = jest.spyOn(routine, 'mergeConfigs');
      const createSpy = jest.spyOn(routine, 'createConfigFile');

      routine.tool.config.babel = { bar: 'abc' };

      const path = await routine.execute();

      expect(envSpy).toHaveBeenCalledWith(routine.context, [], expect.anything());
      expect(loadSpy).toHaveBeenCalledWith(routine.context, [], expect.anything());
      expect(extractSpy).toHaveBeenCalledWith(routine.context, [{ foo: 123 }], expect.anything());
      expect(mergeSpy).toHaveBeenCalledWith(
        routine.context,
        [{ foo: 123 }, { bar: 'abc' }],
        expect.anything(),
      );
      expect(createSpy).toHaveBeenCalledWith(
        routine.context,
        { foo: 123, bar: 'abc' },
        expect.anything(),
      );
      expect(path).toBe(prependRoot('/babel.config.js'));
      expect(fs.writeFile).toHaveBeenCalledWith(
        prependRoot('/babel.config.js'),
        `module.exports = ${JSON.stringify({ foo: 123, bar: 'abc' }, null, 2)};`,
      );
    });

    it('copies config file if `configStrategy` metadata is copy', async () => {
      const envSpy = jest.spyOn(routine, 'setEnvVars');
      const createSpy = jest.spyOn(routine, 'createConfigFile');
      const copySpy = jest.spyOn(routine, 'copyConfigFile');

      driver.metadata.configStrategy = STRATEGY_COPY;

      const path = await routine.execute();

      expect(envSpy).toHaveBeenCalledWith(routine.context, [], expect.anything());
      expect(copySpy).toHaveBeenCalledWith(routine.context, [], expect.anything());
      expect(createSpy).not.toHaveBeenCalled();
      expect(path).toBe(prependRoot('/babel.config.js'));
    });

    it('copies config file if `strategy` option is copy', async () => {
      const envSpy = jest.spyOn(routine, 'setEnvVars');
      const createSpy = jest.spyOn(routine, 'createConfigFile');
      const copySpy = jest.spyOn(routine, 'copyConfigFile');

      driver.options.strategy = STRATEGY_COPY;

      const path = await routine.execute();

      expect(envSpy).toHaveBeenCalledWith(routine.context, [], expect.anything());
      expect(copySpy).toHaveBeenCalledWith(routine.context, [], expect.anything());
      expect(createSpy).not.toHaveBeenCalled();
      expect(path).toBe(prependRoot('/babel.config.js'));
    });

    it('references config file if `configStrategy` metadata is reference', async () => {
      const envSpy = jest.spyOn(routine, 'setEnvVars');
      const createSpy = jest.spyOn(routine, 'createConfigFile');
      const refSpy = jest.spyOn(routine, 'referenceConfigFile');

      driver.metadata.configStrategy = STRATEGY_REFERENCE;

      const path = await routine.execute();

      expect(envSpy).toHaveBeenCalledWith(routine.context, [], expect.anything());
      expect(refSpy).toHaveBeenCalledWith(routine.context, [], expect.anything());
      expect(createSpy).not.toHaveBeenCalled();
      expect(path).toBe(prependRoot('/babel.config.js'));
    });

    it('references config file if `strategy` option is reference', async () => {
      const envSpy = jest.spyOn(routine, 'setEnvVars');
      const createSpy = jest.spyOn(routine, 'createConfigFile');
      const refSpy = jest.spyOn(routine, 'referenceConfigFile');

      driver.options.strategy = STRATEGY_REFERENCE;

      const path = await routine.execute();

      expect(envSpy).toHaveBeenCalledWith(routine.context, [], expect.anything());
      expect(refSpy).toHaveBeenCalledWith(routine.context, [], expect.anything());
      expect(createSpy).not.toHaveBeenCalled();
      expect(path).toBe(prependRoot('/babel.config.js'));
    });
  });

  describe('bootstrap()', () => {
    it('errors if no driver defined', () => {
      delete routine.options.driver;

      expect(() => {
        routine.bootstrap();
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe('copyConfigFile()', () => {
    it('adds path to context', async () => {
      await routine.copyConfigFile(routine.context);

      expect(routine.context.configPaths).toEqual([
        { driver: 'babel', path: prependRoot('/babel.config.js') },
      ]);
    });

    it('copies file', async () => {
      const path = await routine.copyConfigFile(routine.context);

      expect(fs.copy).toHaveBeenCalledWith(
        prependRoot('/configs/babel.js'),
        prependRoot('/babel.config.js'),
        { overwrite: true },
      );
      expect(path).toBe(prependRoot('/babel.config.js'));
    });

    it('sets config on driver', async () => {
      await routine.copyConfigFile(routine.context);

      expect(driver.config).toEqual({ foo: 123 });
    });

    it('triggers `copy-config-file` event', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      await routine.copyConfigFile(routine.context);

      expect(spy).toHaveBeenCalledWith('babel.copy-config-file', [
        prependRoot('/babel.config.js'),
        { foo: 123 },
      ]);
    });

    it('errors if no source file', () => {
      routine.getConfigPath = () => '';

      expect(routine.copyConfigFile(routine.context)).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('createConfigFile()', () => {
    it('adds path to context', async () => {
      await routine.createConfigFile(routine.context, { foo: 'bar' });

      expect(routine.context.configPaths).toEqual([
        { driver: 'babel', path: prependRoot('/babel.config.js') },
      ]);
    });

    it('writes and formats file', async () => {
      const path = await routine.createConfigFile(routine.context, { foo: 'bar' });

      expect(fs.writeFile).toHaveBeenCalledWith(
        prependRoot('/babel.config.js'),
        'module.exports = {\n  "foo": "bar"\n};',
      );
      expect(path).toBe(prependRoot('/babel.config.js'));
    });

    it('sets config on driver', async () => {
      await routine.createConfigFile(routine.context, { foo: 'bar' });

      expect(driver.config).toEqual({ foo: 'bar' });
    });

    it('triggers `create-config-file` event', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      await routine.createConfigFile(routine.context, { foo: 'bar' });

      expect(spy).toHaveBeenCalledWith('babel.create-config-file', [
        prependRoot('/babel.config.js'),
        { foo: 'bar' },
      ]);
    });
  });

  describe('extractConfigFromPackage()', () => {
    it('does nothing if config does not exist', async () => {
      const configs = await routine.extractConfigFromPackage(routine.context, []);

      expect(configs).toEqual([]);
    });

    it('extracts config by name', async () => {
      routine.tool.config.babel = { foo: 'bar' };

      const configs = await routine.extractConfigFromPackage(routine.context, []);

      expect(configs).toEqual([{ foo: 'bar' }]);
    });

    it('triggers `load-package-config` event', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      routine.tool.config.babel = { foo: 'bar' };

      await routine.extractConfigFromPackage(routine.context, []);

      expect(spy).toHaveBeenCalledWith('babel.load-package-config', [{ foo: 'bar' }]);
    });

    it('doesnt trigger `load-package-config` if no config', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      await routine.extractConfigFromPackage(routine.context, []);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('mergeConfigs()', () => {
    it('merges multiple sources', async () => {
      const config = await routine.mergeConfigs(routine.context, [
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

      await routine.mergeConfigs(routine.context, [
        { foo: 123, qux: true },
        { bar: 'abc' },
        { foo: 456 },
      ]);

      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('triggers `merge-config` event with final config object', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      const config = await routine.mergeConfigs(routine.context, [
        { foo: 123, qux: true },
        { bar: 'abc' },
        { foo: 456 },
      ]);

      expect(spy).toHaveBeenCalledWith('babel.merge-config', [config]);
    });
  });

  describe('loadConfigFromSources()', () => {
    let parseSpy: jest.Mock;

    beforeEach(() => {
      parseSpy = jest.fn();

      // @ts-ignore
      ConfigLoader.mockImplementation(() => ({
        resolveModuleConfigPath: (name: string, moduleName: string) =>
          `/node_modules/${moduleName}/configs/${name}.js`,
        parseFile: parseSpy.mockImplementation(filePath => ({ filePath })),
      }));
    });

    afterEach(() => {
      // @ts-ignore
      ConfigLoader.mockReset();
    });

    it('loads config if it exists', async () => {
      const configs = await routine.loadConfigFromSources(routine.context, []);

      expect(configs).toEqual([{ filePath: prependRoot('/configs/babel.js') }]);
    });

    it('does nothing if config does not exist', async () => {
      (fs.existsSync as jest.Mock).mockImplementation(() => false);

      const configs = await routine.loadConfigFromSources(routine.context, []);

      expect(configs).toEqual([]);
    });

    it('uses local path when using @local config', async () => {
      const configs = await routine.loadConfigFromSources(routine.context, []);

      expect(configs).toEqual([{ filePath: prependRoot('/configs/babel.js') }]);
    });

    it('uses module path when using custom config', async () => {
      routine.tool.config.module = 'foo-bar';

      const configs = await routine.loadConfigFromSources(routine.context, []);

      expect(configs).toEqual([
        { filePath: '/node_modules/foo-bar/configs/babel.js' },
        { filePath: prependRoot('/configs/babel.js') },
      ]);
    });

    it('triggers `load-module-config` event', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      await routine.loadConfigFromSources(routine.context, []);

      expect(spy).toHaveBeenCalledWith('babel.load-module-config', [
        prependRoot('/configs/babel.js'),
        { filePath: prependRoot('/configs/babel.js') },
      ]);
    });

    it('doesnt trigger `load-module-config` event if files does not exist', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      (fs.existsSync as jest.Mock).mockImplementation(() => false);

      await routine.loadConfigFromSources(routine.context, []);

      expect(spy).not.toHaveBeenCalled();
    });

    it('parses file', async () => {
      await routine.loadConfigFromSources(routine.context, []);

      expect(parseSpy).toHaveBeenCalledWith(prependRoot('/configs/babel.js'), [], {
        errorOnFunction: true,
      });
    });
  });

  describe('referenceConfigFile()', () => {
    it('adds path to context', async () => {
      await routine.referenceConfigFile(routine.context);

      expect(routine.context.configPaths).toEqual([
        { driver: 'babel', path: prependRoot('/babel.config.js') },
      ]);
    });

    it('references file', async () => {
      const path = await routine.referenceConfigFile(routine.context);

      expect(fs.writeFile).toHaveBeenCalledWith(
        prependRoot('/babel.config.js'),
        "module.exports = require('./configs/babel.js');",
      );
      expect(path).toBe(prependRoot('/babel.config.js'));
    });

    it('sets config on driver', async () => {
      await routine.referenceConfigFile(routine.context);

      expect(driver.config).toEqual({ foo: 123 });
    });

    it('triggers `reference-config-file` event', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      await routine.referenceConfigFile(routine.context);

      expect(spy).toHaveBeenCalledWith('babel.reference-config-file', [
        prependRoot('/babel.config.js'),
        { foo: 123 },
      ]);
    });

    it('errors if no source file', () => {
      routine.getConfigPath = () => '';

      expect(() => {
        routine.referenceConfigFile(routine.context);
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe('setEnvVars()', () => {
    it('sets env vars', () => {
      expect(process.env.BEEMO_TEST_VAR).toBeUndefined();

      driver.options.env.BEEMO_TEST_VAR = 'true';

      routine.setEnvVars(routine.context, []);

      expect(process.env.BEEMO_TEST_VAR).toBe('true');
    });
  });
});
