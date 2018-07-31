import { Tool } from 'boost';
import ConfigLoader from 'boost/lib/ConfigLoader';
import fs from 'fs-extra';
import CreateConfigRoutine from '../../src/configure/CreateConfigRoutine';
import BabelDriver from '../../../driver-babel/src/BabelDriver';
import {
  createDriverContext,
  setupMockTool,
  prependRoot,
  createTestDebugger,
} from '../../../../tests/helpers';
import Driver from '../../src/Driver';
import { STRATEGY_COPY, STRATEGY_REFERENCE } from '../../src/constants';

jest.mock('fs-extra');
jest.mock('boost/lib/Tool');
jest.mock('boost/lib/ConfigLoader');

describe('CreateConfigRoutine', () => {
  let routine: CreateConfigRoutine;
  let driver: Driver<any>;
  let tool: Tool<any>;

  beforeEach(() => {
    tool = setupMockTool(new Tool({}));

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
  });

  afterEach(() => {
    // @ts-ignore
    ConfigLoader.mockReset();
  });

  describe('execute()', () => {
    it('executes pipeline and returns final config path', async () => {
      const loadSpy = jest.spyOn(routine, 'loadConfigFromFilesystem');
      const extractSpy = jest.spyOn(routine, 'extractConfigFromPackage');
      const mergeSpy = jest.spyOn(routine, 'mergeConfigs');
      const createSpy = jest.spyOn(routine, 'createConfigFile');

      routine.tool.config.babel = { bar: 'abc' };

      const path = await routine.execute();

      expect(loadSpy).toHaveBeenCalledWith(routine.context, undefined, expect.anything());
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
      expect(path).toBe(prependRoot('/.babelrc'));
      expect(fs.writeFile).toHaveBeenCalledWith(
        prependRoot('/.babelrc'),
        JSON.stringify({ foo: 123, bar: 'abc' }, null, 2),
      );
    });

    it('copies config file if `configStrategy` metadata is copy', async () => {
      const createSpy = jest.spyOn(routine, 'createConfigFile');
      const copySpy = jest.spyOn(routine, 'copyConfigFile');

      driver.metadata.configStrategy = STRATEGY_COPY;

      const path = await routine.execute();

      expect(copySpy).toHaveBeenCalledWith(routine.context, undefined, expect.anything());
      expect(createSpy).not.toHaveBeenCalled();
      expect(path).toBe(prependRoot('/.babelrc'));
    });

    it('copies config file if `copy` option is true', async () => {
      const createSpy = jest.spyOn(routine, 'createConfigFile');
      const copySpy = jest.spyOn(routine, 'copyConfigFile');

      driver.options.copy = true;

      const path = await routine.execute();

      expect(copySpy).toHaveBeenCalledWith(routine.context, undefined, expect.anything());
      expect(createSpy).not.toHaveBeenCalled();
      expect(path).toBe(prependRoot('/.babelrc'));
    });

    it('references config file if `configStrategy` metadata is reference', async () => {
      const createSpy = jest.spyOn(routine, 'createConfigFile');
      const refSpy = jest.spyOn(routine, 'referenceConfigFile');

      driver.metadata.configStrategy = STRATEGY_REFERENCE;

      const path = await routine.execute();

      expect(refSpy).toHaveBeenCalledWith(routine.context, undefined, expect.anything());
      expect(createSpy).not.toHaveBeenCalled();
      expect(path).toBe(prependRoot('/.babelrc'));
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

      expect(routine.context.configPaths).toEqual([prependRoot('/.babelrc')]);
    });

    it('copies file', async () => {
      const path = await routine.copyConfigFile(routine.context);

      expect(fs.copy).toHaveBeenCalledWith(
        prependRoot('/configs/babel.js'),
        prependRoot('/.babelrc'),
        { overwrite: true },
      );
      expect(path).toBe(prependRoot('/.babelrc'));
    });

    it('sets config on driver', async () => {
      await routine.copyConfigFile(routine.context);

      expect(driver.config).toEqual({ foo: 123 });
    });

    it('triggers `copy-config-file` event', async () => {
      await routine.copyConfigFile(routine.context);

      expect(routine.tool.emit).toHaveBeenCalledWith('copy-config-file', [
        prependRoot('/.babelrc'),
        { foo: 123 },
      ]);
    });

    it('errors if no source file', () => {
      routine.getSourceConfigPath = () => '';

      expect(() => {
        routine.copyConfigFile(routine.context);
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe('createConfigFile()', () => {
    it('adds path to context', async () => {
      await routine.createConfigFile(routine.context, { foo: 'bar' });

      expect(routine.context.configPaths).toEqual([prependRoot('/.babelrc')]);
    });

    it('writes and formats file', async () => {
      const path = await routine.createConfigFile(routine.context, { foo: 'bar' });

      expect(fs.writeFile).toHaveBeenCalledWith(prependRoot('/.babelrc'), '{\n  "foo": "bar"\n}');
      expect(path).toBe(prependRoot('/.babelrc'));
    });

    it('sets config on driver', async () => {
      await routine.createConfigFile(routine.context, { foo: 'bar' });

      expect(driver.config).toEqual({ foo: 'bar' });
    });

    it('triggers `create-config-file` event', async () => {
      await routine.createConfigFile(routine.context, { foo: 'bar' });

      expect(routine.tool.emit).toHaveBeenCalledWith('create-config-file', [
        prependRoot('/.babelrc'),
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
      routine.tool.config.babel = { foo: 'bar' };

      await routine.extractConfigFromPackage(routine.context, []);

      expect(routine.tool.emit).toHaveBeenCalledWith('load-package-config', [{ foo: 'bar' }]);
    });

    it('doesnt trigger `load-package-config` if no config', async () => {
      await routine.extractConfigFromPackage(routine.context, []);

      expect(routine.tool.emit).not.toHaveBeenCalled();
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
      const config = await routine.mergeConfigs(routine.context, [
        { foo: 123, qux: true },
        { bar: 'abc' },
        { foo: 456 },
      ]);

      expect(routine.tool.emit).toHaveBeenCalledWith('merge-config', [config]);
    });
  });

  describe('loadConfigFromFilesystem()', () => {
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
      const configs = await routine.loadConfigFromFilesystem(routine.context);

      expect(configs).toEqual([{ filePath: prependRoot('/configs/babel.js') }]);
    });

    it('does nothing if config does not exist', async () => {
      (fs.existsSync as jest.Mock).mockImplementation(() => false);

      const configs = await routine.loadConfigFromFilesystem(routine.context);

      expect(configs).toEqual([]);
    });

    it('uses local path when using @local config', async () => {
      const configs = await routine.loadConfigFromFilesystem(routine.context);

      expect(configs).toEqual([{ filePath: prependRoot('/configs/babel.js') }]);
    });

    it('uses module path when using custom config', async () => {
      routine.tool.config.module = 'foo-bar';

      const configs = await routine.loadConfigFromFilesystem(routine.context);

      expect(configs).toEqual([{ filePath: '/node_modules/foo-bar/configs/babel.js' }]);
    });

    it('triggers `load-module-config` event', async () => {
      await routine.loadConfigFromFilesystem(routine.context);

      expect(routine.tool.emit).toHaveBeenCalledWith('load-module-config', [
        prependRoot('/configs/babel.js'),
        { filePath: prependRoot('/configs/babel.js') },
      ]);
    });

    it('doesnt trigger `load-module-config` event if files does not exist', async () => {
      (fs.existsSync as jest.Mock).mockImplementation(() => false);

      await routine.loadConfigFromFilesystem(routine.context);

      expect(routine.tool.emit).not.toHaveBeenCalled();
    });

    it('parses file with args (merge with driver and command options)', async () => {
      routine.context.args.baseArg = true;
      driver.options.args.push('--driverArg');

      await routine.loadConfigFromFilesystem(routine.context);

      expect(parseSpy).toHaveBeenCalledWith(prependRoot('/configs/babel.js'), [
        expect.objectContaining({
          _: ['baz'],
          a: true,
          foo: 'bar',
          qux: true,
          baseArg: true,
          driverArg: true,
        }),
        tool,
      ]);
    });
  });

  describe('referenceConfigFile()', () => {
    it('adds path to context', async () => {
      await routine.referenceConfigFile(routine.context);

      expect(routine.context.configPaths).toEqual([prependRoot('/.babelrc')]);
    });

    it('references file', async () => {
      const path = await routine.referenceConfigFile(routine.context);

      expect(fs.writeFile).toHaveBeenCalledWith(
        prependRoot('/.babelrc'),
        "module.exports = require('./configs/babel.js');",
      );
      expect(path).toBe(prependRoot('/.babelrc'));
    });

    it('sets config on driver', async () => {
      await routine.referenceConfigFile(routine.context);

      expect(driver.config).toEqual({ foo: 123 });
    });

    it('triggers `reference-config-file` event', async () => {
      await routine.referenceConfigFile(routine.context);

      expect(routine.tool.emit).toHaveBeenCalledWith('reference-config-file', [
        prependRoot('/.babelrc'),
        { foo: 123 },
      ]);
    });

    it('errors if no source file', () => {
      routine.getSourceConfigPath = () => '';

      expect(() => {
        routine.referenceConfigFile(routine.context);
      }).toThrowErrorMatchingSnapshot();
    });
  });
});
