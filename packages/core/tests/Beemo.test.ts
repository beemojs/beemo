import path from 'path';
import fs from 'fs-extra';
import optimal from 'optimal';
import Beemo from '../src/Beemo';
import Context from '../src/contexts/Context';
import DriverContext from '../src/contexts/DriverContext';
// @ts-ignore
import bootstrapIndex from '../../../tests';
import {
  getFixturePath,
  createDriverContext,
  createContext,
  createTestDriver,
  createTestTool,
} from '../../../tests/helpers';

jest.mock('fs-extra');

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
  let onSpy: jest.Mock;
  const args = { _: [], $0: '' };

  beforeEach(() => {
    beemo = new Beemo(['foo', 'bar'], '', createTestTool());
    beemo.moduleRoot = root;
    beemo.tool.options.root = root;

    // Stop `exit` event from firing
    onSpy = jest.fn();
    beemo.tool.on = onSpy;

    (fs.existsSync as jest.Mock).mockReset();
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
    });

    it('triggers `init-driver` event with context', async () => {
      const spy = jest.spyOn(beemo.tool, 'emit');

      await beemo.createConfigFiles(args, 'foo');

      expect(spy).toHaveBeenCalledWith('foo.init-driver', [
        expect.objectContaining({ name: 'foo' }),
        expect.objectContaining({
          argv: ['foo', 'bar'],
          driverName: 'foo',
        }),
      ]);
    });

    it('passes context to pipeline', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.createConfigFiles(args, 'foo');

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          primaryDriver: expect.objectContaining({
            name: 'foo',
          }),
        }),
      );
    });

    it('passes multiple drivers', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.createConfigFiles(args, 'foo', ['bar', 'baz']);

      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][0].drivers.size).toBe(3);
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

    it('errors if workspace path not found', () => {
      (fs.existsSync as jest.Mock).mockImplementation(() => false);

      beemo.workspacePaths = [path.join(process.cwd(), 'packages')];
      beemo.tool.config.module = '@local/foo';

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

  describe('getWorkspacePaths()', () => {
    it('returns empty array for no workspaces', () => {
      beemo.tool.package = { name: '' };

      expect(beemo.getWorkspacePaths()).toEqual([]);
    });

    it('returns empty array for non-array workspaces', () => {
      beemo.tool.package = { name: '', workspaces: true };

      expect(beemo.getWorkspacePaths()).toEqual([]);
    });

    it('returns workspaces from package.json', () => {
      beemo.tool.package = { name: '', workspaces: ['packages/*'] };

      const paths = [path.join(root, 'packages/*')];

      expect(beemo.getWorkspacePaths()).toEqual(paths);
      expect(beemo.workspacePaths).toEqual(paths);
    });

    it('returns nohoist workspaces from package.json', () => {
      beemo.tool.package = {
        name: '',
        workspaces: {
          nohoist: [],
          packages: ['packages/*'],
        },
      };

      const paths = [path.join(root, 'packages/*')];

      expect(beemo.getWorkspacePaths()).toEqual(paths);
      expect(beemo.workspacePaths).toEqual(paths);
    });

    it('returns workspaces from lerna.json', () => {
      (fs.existsSync as jest.Mock).mockImplementation(() => true);
      (fs.readJsonSync as jest.Mock).mockImplementation(() => ({
        packages: ['packages/*'],
      }));

      beemo.tool.package = { name: '' };
      beemo.tool.options.workspaceRoot = getFixturePath('workspaces-lerna');

      const paths = [path.join(beemo.tool.options.workspaceRoot, 'packages/*')];

      expect(beemo.getWorkspacePaths()).toEqual(paths);
      expect(beemo.workspacePaths).toEqual(paths);
    });

    it('doesnt load lerna.json if workspaces are defined in package.json', () => {
      (fs.readJsonSync as jest.Mock).mockImplementation(() => ({
        packages: ['packages2/*'],
      }));

      beemo.tool.package = { name: '', workspaces: ['packages1/*'] };
      beemo.tool.options.workspaceRoot = getFixturePath('workspaces-lerna');

      expect(fs.existsSync as jest.Mock).not.toHaveBeenCalled();
      expect(beemo.getWorkspacePaths()).toEqual([
        path.join(beemo.tool.options.workspaceRoot, 'packages1/*'),
      ]);
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
      beemo.tool.getPlugin = () => ({ name: 'foo-bar' });
    });

    it('triggers `init-driver` event with context', async () => {
      const spy = jest.spyOn(beemo.tool, 'emit');

      await beemo.executeDriver(args, 'foo-bar');

      expect(spy).toHaveBeenCalledWith('foo-bar.init-driver', [
        expect.objectContaining({ name: 'foo-bar' }),
        expect.objectContaining({
          argv: ['foo', 'bar'],
          driverName: 'foo-bar',
        }),
      ]);
    });

    it('passes driver name and context to pipeline run', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');
      const pipeline = await beemo.executeDriver(args, 'foo-bar');

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
          driverName: 'foo-bar',
        }),
      );

      expect((pipeline as any).run).toHaveBeenCalledWith('foo-bar');
    });

    it('sets primary driver with context', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.executeDriver(args, 'foo-bar');

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
          primaryDriver: expect.objectContaining({
            context: expect.objectContaining({
              driverName: 'foo-bar',
            }),
          }),
        }),
      );
    });

    it('passes parallelArgv to context', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.executeDriver(args, 'foo', [['--foo'], ['bar']]);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          parallelArgv: [['--foo'], ['bar']],
        }),
      );
    });
  });

  describe('executeScript()', () => {
    it('triggers `init-script` event with context', async () => {
      const spy = jest.spyOn(beemo.tool, 'emit');

      await beemo.executeScript(args, 'foo-bar');

      expect(spy).toHaveBeenCalledWith('foo-bar.init-script', [
        'foo-bar',
        expect.objectContaining({
          argv: ['foo', 'bar'],
          scriptName: 'foo-bar',
        }),
      ]);
    });

    it('passes script name and context to pipeline run', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');
      const pipeline = await beemo.executeScript(args, 'foo-bar');

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
          scriptName: 'foo-bar',
        }),
      );

      expect((pipeline as any).run).toHaveBeenCalledWith('foo-bar');
    });
  });

  describe('prepareContext()', () => {
    it('sets extra props', () => {
      expect(beemo.prepareContext(new Context(args))).toEqual(
        expect.objectContaining({
          args,
          argv: ['foo', 'bar'],
          moduleRoot: root,
          root,
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

      await beemo.scaffold(args, 'gen', 'action');

      expect(spy).toHaveBeenCalledWith('beemo.scaffold', [
        expect.objectContaining({
          argv: ['foo', 'bar'],
        }),
        'gen',
        'action',
      ]);
    });

    it('passes context to pipeline', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.scaffold(args, 'gen', 'action');

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          generator: 'gen',
          action: 'action',
        }),
      );
    });
  });
});
