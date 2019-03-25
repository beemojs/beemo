import path from 'path';
import fs from 'fs-extra';
import optimal from 'optimal';
import Beemo from '../src/Beemo';
import Context from '../src/contexts/Context';
import DriverContext from '../src/contexts/DriverContext';
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
  const oldExistsSync = fs.existsSync;
  const oldReadJsonSync = fs.readJsonSync;
  const oldRemoveSync = fs.removeSync;
  let beemo: Beemo;
  let onSpy: jest.Mock;

  beforeEach(() => {
    beemo = new Beemo(['foo', 'bar'], '', mockTool());
    beemo.moduleRoot = root;
    beemo.tool.options.root = root;

    // Stop `exit` event from firing
    onSpy = jest.fn();
    beemo.tool.on = onSpy;

    fs.existsSync = jest.fn();
    fs.readJsonSync = jest.fn();
    fs.removeSync = jest.fn();
  });

  afterEach(() => {
    fs.existsSync = oldExistsSync;
    fs.readJsonSync = oldReadJsonSync;
    fs.removeSync = oldRemoveSync;
  });

  it('sets argv', () => {
    expect(beemo.argv).toEqual(['foo', 'bar']);
  });

  describe('bootstrapConfigModule()', () => {
    beforeEach(() => {
      (bootstrapIndex as jest.Mock).mockReset();
      beemo.tool.config.module = '@local';
    });

    it('does nothing if no index file', () => {
      (fs.existsSync as jest.Mock).mockImplementation(() => false);

      beemo.bootstrapConfigModule();

      expect(bootstrapIndex).not.toHaveBeenCalled();
    });

    it('calls bootstrap with tool if index exists', () => {
      (fs.existsSync as jest.Mock).mockImplementation(() => true);

      beemo.bootstrapConfigModule();

      expect(bootstrapIndex).toHaveBeenCalledWith(beemo.tool);
    });
  });

  describe('createConfigFiles()', () => {
    beforeEach(() => {
      // @ts-ignore
      beemo.tool.getPlugin = (type, name) => createTestDriver(name);
      beemo.tool.getPlugins = () => [
        createTestDriver('foo'),
        createTestDriver('bar'),
        createTestDriver('baz'),
      ];
    });

    it('triggers `init-driver` event with context for the first driver (primary)', async () => {
      const spy = jest.spyOn(beemo.tool, 'emit');

      await beemo.createConfigFiles(MOCK_CONFIG_ARGS, ['foo']);

      expect(spy).toHaveBeenCalledWith('foo.init-driver', [
        expect.objectContaining({
          argv: ['foo', 'bar'],
          drivers: expect.anything(),
        }),
        expect.objectContaining({ name: 'foo' }),
      ]);
    });

    it('passes context to pipeline', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.createConfigFiles(MOCK_CONFIG_ARGS, ['foo']);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
          drivers: expect.anything(),
        }),
      );
    });

    it('creates for multiple drivers', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.createConfigFiles(MOCK_CONFIG_ARGS, ['foo', 'bar', 'baz']);

      expect(spy).toHaveBeenCalled();
      expect((spy.mock.calls[0][0] as any).drivers.size).toBe(3);
    });

    it('creates for all drivers if list is empty', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.createConfigFiles(MOCK_CONFIG_ARGS, []);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
          drivers: new Set(beemo.tool.getPlugins('driver')),
        }),
      );
      expect((spy.mock.calls[0][0] as any).drivers.size).toBe(3);
    });
  });

  describe('getConfigBlueprint()', () => {
    it('errors if no module', () => {
      expect(() => {
        optimal({}, beemo.getConfigBlueprint());
      }).toThrowErrorMatchingSnapshot();
    });

    it('doesnt error if module is defined with env var', () => {
      process.env.BEEMO_CONFIG_MODULE = 'test-boost';

      let opts: any = {};

      expect(() => {
        opts = optimal({}, beemo.getConfigBlueprint());
      }).not.toThrowError();

      expect(opts.module).toBe('test-boost');

      process.env.BEEMO_CONFIG_MODULE = '';
    });
  });

  describe('getConfigModuleRoot()', () => {
    beforeEach(() => {
      beemo.moduleRoot = '';
    });

    it('errors if no module name', () => {
      beemo.tool.config.module = '';

      expect(() => {
        beemo.getConfigModuleRoot();
      }).toThrowErrorMatchingSnapshot();
    });

    it('errors if a fake and or missing node module', () => {
      beemo.tool.config.module = 'beemo-this-should-never-exist';

      expect(() => {
        beemo.getConfigModuleRoot();
      }).toThrowErrorMatchingSnapshot();
    });

    it('returns cwd if using @local', () => {
      beemo.tool.config.module = '@local';

      expect(beemo.getConfigModuleRoot()).toBe(process.cwd());
      expect(beemo.moduleRoot).toBe(process.cwd());
      expect(beemo.getConfigModuleRoot()).toBe(beemo.moduleRoot);
    });

    it('returns node module path', () => {
      (fs.existsSync as jest.Mock).mockImplementation(() => true);

      beemo.tool.config.module = 'boost';

      const rootPath = path.join(process.cwd(), 'node_modules/boost');

      expect(beemo.getConfigModuleRoot()).toBe(rootPath);
      expect(beemo.moduleRoot).toBe(rootPath);
      expect(beemo.getConfigModuleRoot()).toBe(beemo.moduleRoot);
    });
  });

  describe('handleCleanupOnFailure()', () => {
    let context: DriverContext;

    beforeEach(() => {
      context = createDriverContext();

      (fs.removeSync as jest.Mock).mockReset();
    });

    it('does nothing if exit code is 0', () => {
      beemo.handleCleanupOnFailure(0, context);

      expect(fs.removeSync).not.toHaveBeenCalled();
    });

    it('does nothing if no config paths', () => {
      beemo.handleCleanupOnFailure(1, context);

      expect(fs.removeSync).not.toHaveBeenCalled();
    });

    it('removes file for each config path', () => {
      context.configPaths = [{ driver: 'foo', path: 'foo' }, { driver: 'bar', path: 'bar' }];

      beemo.handleCleanupOnFailure(1, context);

      expect(fs.removeSync).toHaveBeenCalledWith('foo');
      expect(fs.removeSync).toHaveBeenCalledWith('bar');
    });
  });

  describe('executeDriver()', () => {
    beforeEach(() => {
      // @ts-ignore
      beemo.tool.getPlugin = () => ({
        name: 'foo-bar',
        metadata: { title: 'Foo Bar' },
        getVersion: () => '0.0.0',
      });
    });

    it('triggers `init-driver` event with context', async () => {
      const spy = jest.spyOn(beemo.tool, 'emit');

      await beemo.executeDriver(MOCK_DRIVER_ARGS, 'foo-bar');

      expect(spy).toHaveBeenCalledWith('foo-bar.init-driver', [
        expect.objectContaining({
          argv: ['foo', 'bar'],
          driverName: 'foo-bar',
        }),
        expect.objectContaining({ name: 'foo-bar' }),
      ]);
    });

    it('passes driver name and context to pipeline run', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.executeDriver(MOCK_DRIVER_ARGS, 'foo-bar');

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
          driverName: 'foo-bar',
        }),
      );

      expect(beemo.pipeline!.run).toHaveBeenCalledWith('foo-bar');
    });

    it('passes parallelArgv to context', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.executeDriver(MOCK_DRIVER_ARGS, 'foo', [['--foo'], ['bar']]);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          parallelArgv: [['--foo'], ['bar']],
        }),
      );
    });

    it('doesnt pipe cleanup routine if `configure.cleanup` is false', async () => {
      beemo.tool.config.configure.cleanup = false;

      await beemo.executeDriver(MOCK_DRIVER_ARGS, 'foo-bar');

      expect(beemo.pipeline!.pipe).toHaveBeenCalledTimes(2);
    });

    it('pipes cleanup routine if `configure.cleanup` is true', async () => {
      beemo.tool.config.configure.cleanup = true;

      await beemo.executeDriver(MOCK_DRIVER_ARGS, 'foo-bar');

      expect(beemo.pipeline!.pipe).toHaveBeenCalledTimes(3);
    });
  });

  describe('executeScript()', () => {
    it('errors if script name is not in kebab case', () => {
      expect(
        beemo.executeScript(MOCK_DRIVER_ARGS, 'Foo_Bar'),
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it('errors if script name starts with a dash', () => {
      expect(beemo.executeScript(MOCK_DRIVER_ARGS, '-foo')).rejects.toThrowErrorMatchingSnapshot();
    });

    it('errors if script name ends with a dash', () => {
      expect(beemo.executeScript(MOCK_DRIVER_ARGS, 'bar-')).rejects.toThrowErrorMatchingSnapshot();
    });

    it('triggers `init-script` event with context', async () => {
      const spy = jest.spyOn(beemo.tool, 'emit');

      await beemo.executeScript(MOCK_DRIVER_ARGS, 'foo-bar');

      expect(spy).toHaveBeenCalledWith('foo-bar.init-script', [
        expect.objectContaining({
          argv: ['foo', 'bar'],
          scriptName: 'foo-bar',
        }),
        'foo-bar',
      ]);
    });
  });

  describe('prepareContext()', () => {
    it('sets extra props', () => {
      expect(beemo.prepareContext(new Context(MOCK_ARGS))).toEqual(
        expect.objectContaining({
          args: MOCK_ARGS,
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

      const context = createContext();
      context.args.foo = 123;
      context.args.bar = true;

      beemo.startPipeline(context);

      expect(process.beemo).toEqual({
        context,
        tool: beemo.tool,
      });
    });

    it('registers an exit listener if cleanup is true', async () => {
      beemo.tool.config.configure.cleanup = true;

      beemo.startPipeline(createContext());

      expect(onSpy).toHaveBeenCalledWith('exit', expect.any(Function));
    });

    it('doesnt register exit listener if cleanup is false', async () => {
      beemo.tool.config.configure.cleanup = false;

      beemo.startPipeline(createContext());

      expect(onSpy).not.toHaveBeenCalled();
    });
  });

  describe('scaffold()', () => {
    it('triggers `scaffold` event with context', async () => {
      const spy = jest.spyOn(beemo.tool, 'emit');

      await beemo.scaffold(MOCK_SCAFFOLD_ARGS, 'gen', 'action');

      expect(spy).toHaveBeenCalledWith('beemo.scaffold', [
        expect.objectContaining({
          argv: ['foo', 'bar'],
        }),
        'gen',
        'action',
        '',
      ]);
    });

    it('passes context to pipeline', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.scaffold(MOCK_SCAFFOLD_ARGS, 'gen', 'action');

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          generator: 'gen',
          action: 'action',
        }),
      );
    });
  });
});
