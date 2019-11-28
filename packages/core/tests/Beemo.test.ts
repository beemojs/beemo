import fs from 'fs-extra';
import optimal from 'optimal';
import { Path } from '@boost/common';
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

// Can't use spyOn here because its not a real object.
/* eslint-disable jest/prefer-spy-on */
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
/* eslint-enable jest/prefer-spy-on */

jest.mock('fake-bootstrap-module', () => jest.fn(), { virtual: true });

describe('Beemo', () => {
  let beemo: Beemo;

  beforeEach(() => {
    beemo = mockTool(['foo', 'bar']);
    beemo.moduleRoot = new Path(beemo.options.root);
  });

  it('sets argv', () => {
    expect(beemo.argv).toEqual(['foo', 'bar']);
  });

  describe('bootstrapConfigModule()', () => {
    beforeEach(() => {
      beemo.config.module = 'fake-bootstrap-module';
    });

    it('calls bootstrap with tool if index exists', () => {
      // eslint-disable-next-line
      const bootstrap = require('fake-bootstrap-module');

      beemo.bootstrapConfigModule();

      expect(bootstrap).toHaveBeenCalledWith(beemo);
    });
  });

  describe('createConfigFiles()', () => {
    beforeEach(() => {
      jest.spyOn(beemo, 'getPlugin').mockImplementation((type, name) => mockDriver(name, beemo));

      jest
        .spyOn(beemo, 'getPlugins')
        .mockImplementation(() => [
          mockDriver('foo', beemo),
          mockDriver('bar', beemo),
          mockDriver('baz', beemo),
        ]);
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
      expect((spy.mock.calls[0][0] as $FixMe).drivers.size).toBe(3);
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
      expect((spy.mock.calls[0][0] as $FixMe).drivers.size).toBe(3);
    });
  });

  describe('getConfigModuleRoot()', () => {
    beforeEach(() => {
      delete beemo.moduleRoot;
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
      const cwdPath = new Path(process.cwd());

      beemo.config.module = '@local';

      expect(beemo.getConfigModuleRoot()).toEqual(cwdPath);
      expect(beemo.moduleRoot).toEqual(cwdPath);
      expect(beemo.getConfigModuleRoot()).toBe(beemo.moduleRoot);
    });

    it('returns node module path', () => {
      const modPath = Path.resolve('node_modules/@boost/core');

      beemo.config.module = '@boost/core';

      expect(beemo.getConfigModuleRoot()).toEqual(modPath);
      expect(beemo.moduleRoot).toEqual(modPath);
      expect(beemo.getConfigModuleRoot()).toBe(beemo.moduleRoot);
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
      context.configPaths = [
        { driver: 'foo', path: new Path('foo') },
        { driver: 'bar', path: new Path('bar') },
      ];

      beemo.onExit.emit([1]);

      expect(removeSpy).toHaveBeenCalledWith('foo');
      expect(removeSpy).toHaveBeenCalledWith('bar');
    });
  });

  describe('runDriver()', () => {
    beforeEach(() => {
      jest.spyOn(beemo, 'getPlugin').mockImplementation(() => {
        const driver = mockDriver('foo-bar', beemo, { title: 'Foo Bar' });
        driver.getVersion = () => '0.0.0';

        return driver;
      });
    });

    it('emits `onRunDriver` event with context', async () => {
      const spy = jest.fn();

      beemo.onRunDriver.listen(spy, 'foo-bar');

      await beemo.runDriver(stubDriverArgs(), 'foo-bar');

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
          driverName: 'foo-bar',
        }),
        expect.objectContaining({ name: 'foo-bar' }),
      );
    });

    it('passes driver name and context to pipeline run', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.runDriver(stubDriverArgs(), 'foo-bar');

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

      await beemo.runDriver(stubDriverArgs(), 'foo', [['--foo'], ['bar']]);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          parallelArgv: [['--foo'], ['bar']],
        }),
      );
    });

    it('doesnt pipe cleanup routine if `configure.cleanup` is false', async () => {
      beemo.config.configure.cleanup = false;

      await beemo.runDriver(stubDriverArgs(), 'foo-bar');

      expect(beemo.pipeline!.pipe).toHaveBeenCalledTimes(2);
    });

    it('pipes cleanup routine if `configure.cleanup` is true', async () => {
      beemo.config.configure.cleanup = true;

      await beemo.runDriver(stubDriverArgs(), 'foo-bar');

      expect(beemo.pipeline!.pipe).toHaveBeenCalledTimes(3);
    });
  });

  describe('runScript()', () => {
    it('errors if script name is not in kebab case', async () => {
      await expect(
        beemo.runScript(stubScriptArgs(), 'Foo_Bar'),
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it('errors if script name starts with a dash', async () => {
      await expect(
        beemo.runScript(stubScriptArgs(), '-foo'),
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it('errors if script name ends with a dash', async () => {
      await expect(
        beemo.runScript(stubScriptArgs(), 'bar-'),
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it('emits `onRunScript` event with context', async () => {
      const spy = jest.fn();

      beemo.onRunScript.listen(spy, 'foo-bar');

      await beemo.runScript(stubScriptArgs(), 'foo-bar');

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
          scriptName: 'foo-bar',
        }),
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

    it('registers an exit listener if cleanup is true', () => {
      expect(beemo.onExit.getListeners().size).toBe(0);

      beemo.config.configure.cleanup = true;
      beemo.startPipeline(stubContext());

      expect(beemo.onExit.getListeners().size).toBe(1);
    });

    it('doesnt register exit listener if cleanup is false', () => {
      expect(beemo.onExit.getListeners().size).toBe(0);

      beemo.config.configure.cleanup = false;
      beemo.startPipeline(stubContext());

      expect(beemo.onExit.getListeners().size).toBe(0);
    });

    it('silences output if `stdio` argument is `inherit`', () => {
      beemo.config.silent = false;

      const ctx = stubContext();
      ctx.args.stdio = 'inherit';

      beemo.startPipeline(ctx);

      expect(beemo.config.silent).toBe(true);
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

    let opts: { module?: string } = {};

    expect(() => {
      opts = optimal({}, configBlueprint());
    }).not.toThrow();

    expect(opts.module).toBe('test-boost');

    process.env.BEEMO_CONFIG_MODULE = '';
  });
});
