import path from 'path';
import fs from 'fs-extra';
import optimal from 'optimal';
import Beemo, { configBlueprint } from '../src/Beemo';
import Context from '../src/contexts/Context';
import DriverContext from '../src/contexts/DriverContext';
import {
  mockTool,
  mockDriver,
  stubArgs,
  stubContext,
  stubConfigArgs,
  stubDriverArgs,
  stubDriverContext,
  stubScaffoldArgs,
  stubScriptArgs,
} from '../src/testUtils';
// @ts-ignore
import bootstrapIndex from '../../../tests';

jest.mock(
  '@boost/core/lib/Pipeline',
  () =>
    function PipelineMock() {
      // @ts-ignore
      this.pipe = jest.fn(() => this);
      // @ts-ignore
      this.run = jest.fn(() => this);
    },
);

jest.mock('../../../tests', () => jest.fn());

const root = path.join(__dirname, '../../../tests');

describe('Beemo', () => {
  let beemo: Beemo;

  beforeEach(() => {
    beemo = mockTool(['foo', 'bar']);
    beemo.moduleRoot = root;
    beemo.options.root = root;

    (bootstrapIndex as jest.Mock).mockReset();
  });

  it('sets argv', () => {
    expect(beemo.argv).toEqual(['foo', 'bar']);
  });

  describe('bootstrapConfigModule()', () => {
    let existsSpy: jest.SpyInstance;

    beforeEach(() => {
      existsSpy = jest.spyOn(fs, 'existsSync');
      beemo.config.module = '@local';
    });

    afterEach(() => {
      existsSpy.mockRestore();
    });

    it('does nothing if no index file', () => {
      existsSpy.mockImplementation(() => false);

      beemo.bootstrapConfigModule();

      expect(bootstrapIndex).not.toHaveBeenCalled();
    });

    it('calls bootstrap with tool if index exists', () => {
      existsSpy.mockImplementation(() => true);

      beemo.bootstrapConfigModule();

      expect(bootstrapIndex).toHaveBeenCalledWith(beemo);
    });
  });

  describe('createConfigFiles()', () => {
    beforeEach(() => {
      // @ts-ignore
      beemo.getPlugin = (type, name) => mockDriver(name, beemo);
      beemo.getPlugins = () => [
        mockDriver('foo', beemo),
        mockDriver('bar', beemo),
        mockDriver('baz', beemo),
      ];
    });

    it('emits `onRunConfig` event for a single driver', async () => {
      const spy = jest.fn();

      beemo.onRunConfig.listen(spy);

      await beemo.createConfigFiles(stubConfigArgs(), ['foo']);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
          drivers: expect.anything(),
        }),
        ['foo'],
      );
    });

    it('emits `onRunConfig` event for all drivers', async () => {
      const spy = jest.fn();

      beemo.onRunConfig.listen(spy);

      await beemo.createConfigFiles(stubConfigArgs(), []);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
          drivers: expect.anything(),
        }),
        ['foo', 'bar', 'baz'],
      );
    });

    it('passes context to pipeline', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.createConfigFiles(stubConfigArgs(), ['foo']);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
          drivers: expect.anything(),
        }),
      );
    });

    it('creates for multiple drivers', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.createConfigFiles(stubConfigArgs(), ['foo', 'bar', 'baz']);

      expect(spy).toHaveBeenCalled();
      expect((spy.mock.calls[0][0] as any).drivers.size).toBe(3);
    });

    it('creates for all drivers if list is empty', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.createConfigFiles(stubConfigArgs(), []);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
          drivers: new Set(beemo.getPlugins('driver')),
        }),
      );
      expect((spy.mock.calls[0][0] as any).drivers.size).toBe(3);
    });
  });

  describe('getConfigModuleRoot()', () => {
    beforeEach(() => {
      beemo.moduleRoot = '';
    });

    it('errors if no module name', () => {
      beemo.config.module = '';

      expect(() => {
        beemo.getConfigModuleRoot();
      }).toThrowErrorMatchingSnapshot();
    });

    it('errors if a fake and or missing node module', () => {
      beemo.config.module = 'beemo-this-should-never-exist';

      expect(() => {
        beemo.getConfigModuleRoot();
      }).toThrowErrorMatchingSnapshot();
    });

    it('returns cwd if using @local', () => {
      beemo.config.module = '@local';

      expect(beemo.getConfigModuleRoot()).toBe(process.cwd());
      expect(beemo.moduleRoot).toBe(process.cwd());
      expect(beemo.getConfigModuleRoot()).toBe(beemo.moduleRoot);
    });

    it('returns node module path', () => {
      const existsSpy = jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
      const rootPath = path.join(process.cwd(), 'node_modules/boost');

      beemo.config.module = 'boost';

      expect(beemo.getConfigModuleRoot()).toBe(rootPath);
      expect(beemo.moduleRoot).toBe(rootPath);
      expect(beemo.getConfigModuleRoot()).toBe(beemo.moduleRoot);

      existsSpy.mockRestore();
    });
  });

  describe('handleCleanupOnFailure()', () => {
    let context: DriverContext;
    let removeSpy: jest.SpyInstance;

    beforeEach(() => {
      context = stubDriverContext();
      removeSpy = jest.spyOn(fs, 'removeSync').mockImplementation(() => true);

      beemo.config.configure.cleanup = true;
      beemo.startPipeline(context);
    });

    afterEach(() => {
      removeSpy.mockRestore();
    });

    it('does nothing if exit code is 0', () => {
      beemo.onExit.emit([0]);

      expect(removeSpy).not.toHaveBeenCalled();
    });

    it('does nothing if no config paths', () => {
      beemo.onExit.emit([1]);

      expect(removeSpy).not.toHaveBeenCalled();
    });

    it('removes file for each config path', () => {
      context.configPaths = [{ driver: 'foo', path: 'foo' }, { driver: 'bar', path: 'bar' }];

      beemo.onExit.emit([1]);

      expect(removeSpy).toHaveBeenCalledWith('foo');
      expect(removeSpy).toHaveBeenCalledWith('bar');
    });
  });

  describe('executeDriver()', () => {
    beforeEach(() => {
      // @ts-ignore
      beemo.getPlugin = () => ({
        name: 'foo-bar',
        metadata: { title: 'Foo Bar' },
        getVersion: () => '0.0.0',
      });
    });

    it('emits `onRunDriver` event with context', async () => {
      const spy = jest.fn();

      beemo.onRunDriver.listen(spy);

      await beemo.executeDriver(stubDriverArgs(), 'foo-bar');

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
          driverName: 'foo-bar',
        }),
        'foo-bar',
        expect.objectContaining({ name: 'foo-bar' }),
      );
    });

    it('passes driver name and context to pipeline run', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.executeDriver(stubDriverArgs(), 'foo-bar');

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
          driverName: 'foo-bar',
        }),
      );

      expect(beemo.pipeline!.run).toHaveBeenCalledWith('foo-bar');
    });

    it('passes `parallelArgv` to context', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.executeDriver(stubDriverArgs(), 'foo', [['--foo'], ['bar']]);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          parallelArgv: [['--foo'], ['bar']],
        }),
      );
    });

    it('doesnt pipe cleanup routine if `configure.cleanup` is false', async () => {
      beemo.config.configure.cleanup = false;

      await beemo.executeDriver(stubDriverArgs(), 'foo-bar');

      expect(beemo.pipeline!.pipe).toHaveBeenCalledTimes(2);
    });

    it('pipes cleanup routine if `configure.cleanup` is true', async () => {
      beemo.config.configure.cleanup = true;

      await beemo.executeDriver(stubDriverArgs(), 'foo-bar');

      expect(beemo.pipeline!.pipe).toHaveBeenCalledTimes(3);
    });
  });

  describe('executeScript()', () => {
    it('errors if script name is not in kebab case', () => {
      expect(
        beemo.executeScript(stubScriptArgs(), 'Foo_Bar'),
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it('errors if script name starts with a dash', () => {
      expect(beemo.executeScript(stubScriptArgs(), '-foo')).rejects.toThrowErrorMatchingSnapshot();
    });

    it('errors if script name ends with a dash', () => {
      expect(beemo.executeScript(stubScriptArgs(), 'bar-')).rejects.toThrowErrorMatchingSnapshot();
    });

    it('emits `onRunScript` event with context', async () => {
      const spy = jest.fn();

      beemo.onRunScript.listen(spy);

      await beemo.executeScript(stubScriptArgs(), 'foo-bar');

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
          scriptName: 'foo-bar',
        }),
        'foo-bar',
      );
    });
  });

  describe('prepareContext()', () => {
    it('sets extra props', () => {
      // @ts-ignore Allow access
      expect(beemo.prepareContext(new Context(stubArgs()))).toEqual(
        expect.objectContaining({
          args: stubArgs(),
          argv: ['foo', 'bar'],
          moduleRoot: root,
          cwd: root,
        }),
      );
    });
  });

  describe('startPipeline()', () => {
    beforeEach(() => {
      delete process.beemo;
    });

    it('sets beemo instance on process global', () => {
      expect(process.beemo).toBeUndefined();

      const context = stubContext();
      context.args.foo = 123;
      context.args.bar = true;

      beemo.startPipeline(context);

      expect(process.beemo).toEqual({
        context,
        tool: beemo,
      });
    });

    it('registers an exit listener if cleanup is true', async () => {
      expect(beemo.onExit.getListeners().size).toBe(0);

      beemo.config.configure.cleanup = true;
      beemo.startPipeline(stubContext());

      expect(beemo.onExit.getListeners().size).toBe(1);
    });

    it('doesnt register exit listener if cleanup is false', async () => {
      expect(beemo.onExit.getListeners().size).toBe(0);

      beemo.config.configure.cleanup = false;
      beemo.startPipeline(stubContext());

      expect(beemo.onExit.getListeners().size).toBe(0);
    });
  });

  describe('scaffold()', () => {
    it('emits `onScaffold` event with context', async () => {
      const spy = jest.fn();

      beemo.onScaffold.listen(spy);

      await beemo.scaffold(stubScaffoldArgs(), 'gen', 'action');

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
        }),
        'gen',
        'action',
        '',
      );
    });

    it('passes context to pipeline', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.scaffold(stubScaffoldArgs(), 'gen', 'action');

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          generator: 'gen',
          action: 'action',
        }),
      );
    });
  });
});

describe('configBlueprint()', () => {
  it('errors if no module', () => {
    expect(() => {
      optimal({}, configBlueprint());
    }).toThrowErrorMatchingSnapshot();
  });

  it('doesnt error if module is defined with env var', () => {
    process.env.BEEMO_CONFIG_MODULE = 'test-boost';

    let opts: any = {};

    expect(() => {
      opts = optimal({}, configBlueprint());
    }).not.toThrowError();

    expect(opts.module).toBe('test-boost');

    process.env.BEEMO_CONFIG_MODULE = '';
  });
});
