import fs from 'fs-extra';
import CreateConfigRoutine from '../../src/configure/CreateConfigRoutine';
import BabelDriver from '../../../driver-babel/src/BabelDriver';

jest.mock('fs-extra');

describe('CreateConfigRoutine', () => {
  let routine;
  let driver;

  beforeEach(() => {
    driver = new BabelDriver({ args: ['--bar'] });
    driver.name = 'babel';

    routine = new CreateConfigRoutine('babel', 'Configure Babel', { driver });
    routine.context = {
      args: ['--foo'],
      configPaths: [],
      root: '/',
    };
    routine.tool = {
      config: {
        module: '@local',
      },
      debug() {},
      emit() {},
      invariant() {},
      on() {},
    };

    driver.tool = routine.tool;
    driver.bootstrap();
  });

  beforeEach(() => {
    fs.existsSync.mockImplementation(() => true);
    fs.writeFile.mockImplementation(() => Promise.resolve());
  });

  describe('execute()', () => {
    it('executes pipeline and returns final config path', async () => {
      // Step 1
      routine.tool.configLoader = {
        parseFile: () => ({ foo: 123 }),
      };

      // Step 2
      routine.tool.config.babel = { bar: 'abc' };

      const path = await routine.execute();

      expect(path).toBe('/.babelrc');
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/.babelrc',
        JSON.stringify({ foo: 123, bar: 'abc' }, null, 2),
      );
    });
  });

  describe('bootstrap()', () => {
    it('errors if no driver defined', () => {
      delete routine.config.driver;

      expect(() => {
        routine.bootstrap();
      }).toThrowError(
        'Invalid CreateConfigRoutine option "driver". Field is required and must be defined.',
      );
    });
  });

  describe('createConfigFile()', () => {
    it('adds path to context', async () => {
      await routine.createConfigFile({ foo: 'bar' });

      expect(routine.context.configPaths).toEqual(['/.babelrc']);
    });

    it('writes and formats file', async () => {
      const path = await routine.createConfigFile({ foo: 'bar' });

      expect(fs.writeFile).toHaveBeenCalledWith('/.babelrc', '{\n  "foo": "bar"\n}');
      expect(path).toBe('/.babelrc');
    });

    it('triggers `create-config-file` event', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      await routine.createConfigFile({ foo: 'bar' });

      expect(spy).toHaveBeenCalledWith('create-config-file', ['/.babelrc', { foo: 'bar' }]);
    });
  });

  describe('extractConfigFromPackage()', () => {
    it('does nothing if config does not exist', async () => {
      const configs = await routine.extractConfigFromPackage([]);

      expect(configs).toEqual([]);
    });

    it('extracts config by name', async () => {
      routine.tool.config.babel = { foo: 'bar' };

      const configs = await routine.extractConfigFromPackage([]);

      expect(configs).toEqual([{ foo: 'bar' }]);
    });

    it('triggers `load-package-config` event', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      routine.tool.config.babel = { foo: 'bar' };

      await routine.extractConfigFromPackage([]);

      expect(spy).toHaveBeenCalledWith('load-package-config', [{ foo: 'bar' }]);
    });

    it('doesnt trigger `load-package-config` if no config', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      await routine.extractConfigFromPackage([]);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('mergeConfigs()', () => {
    it('merges multiple sources', async () => {
      const config = await routine.mergeConfigs([
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

      await routine.mergeConfigs([{ foo: 123, qux: true }, { bar: 'abc' }, { foo: 456 }]);

      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('triggers `merge-config` event with final config object', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      const config = await routine.mergeConfigs([
        { foo: 123, qux: true },
        { bar: 'abc' },
        { foo: 456 },
      ]);

      expect(spy).toHaveBeenCalledWith('merge-config', [config]);
    });
  });

  describe('getArgsToPass()', () => {
    it('merges driver and context args', () => {
      expect(routine.getArgsToPass()).toEqual({
        _: [],
        foo: true,
        bar: true,
      });
    });
  });

  describe('loadConfigFromFilesystem()', () => {
    beforeEach(() => {
      routine.tool.configLoader = {
        resolveModuleConfigPath: jest.fn(
          (name, moduleName) => `/node_modules/${moduleName}/configs/${name}.js`,
        ),
        parseFile: jest.fn(filePath => ({ filePath })),
      };
    });

    it('loads config if it exists', async () => {
      const configs = await routine.loadConfigFromFilesystem([]);

      expect(configs).toEqual([{ filePath: '/configs/babel.js' }]);
    });

    it('does nothing if config does not exist', async () => {
      fs.existsSync.mockImplementation(() => false);

      const configs = await routine.loadConfigFromFilesystem([]);

      expect(configs).toEqual([]);
    });

    it('uses local path when using @local config', async () => {
      const configs = await routine.loadConfigFromFilesystem([]);

      expect(configs).toEqual([{ filePath: '/configs/babel.js' }]);
    });

    it('uses module path when using custom config', async () => {
      routine.tool.config.module = 'foo-bar';

      const configs = await routine.loadConfigFromFilesystem([]);

      expect(configs).toEqual([{ filePath: '/node_modules/foo-bar/configs/babel.js' }]);
    });

    it('triggers `load-module-config` event', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      await routine.loadConfigFromFilesystem([]);

      expect(spy).toHaveBeenCalledWith('load-module-config', [
        '/configs/babel.js',
        { filePath: '/configs/babel.js' },
      ]);
    });

    it('doesnt trigger `load-module-config` event if files does not exist', async () => {
      fs.existsSync.mockImplementation(() => false);

      const spy = jest.spyOn(routine.tool, 'emit');

      await routine.loadConfigFromFilesystem([]);

      expect(spy).not.toHaveBeenCalled();
    });

    it('parses file with yargs options', async () => {
      await routine.loadConfigFromFilesystem([]);

      expect(routine.tool.configLoader.parseFile).toHaveBeenCalledWith('/configs/babel.js', {
        _: [],
        foo: true,
        bar: true,
      });
    });
  });
});
