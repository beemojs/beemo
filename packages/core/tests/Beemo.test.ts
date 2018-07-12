import path from 'path';
import fs from 'fs-extra';
import Beemo from '../src/Beemo';
import bootstrapIndex from '../../..';
import { getFixturePath } from '../../../tests/helpers';
import Context from '../src/contexts/Context';

jest.mock('fs-extra');

jest.mock('boost/lib/Console');

jest.mock(
  'boost/lib/Pipeline',
  () =>
    function PipelineMock() {
      this.pipe = jest.fn(() => this);
      this.run = jest.fn(() => this);
    },
);

jest.mock('../../../index', () => jest.fn());

const root = path.join(__dirname, '../../tests');

describe('Beemo', () => {
  let beemo;

  beforeEach(() => {
    beemo = new Beemo(['foo', 'bar']);
    beemo.tool.options.moduleRoot = root;
    beemo.tool.options.root = root;

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

  describe('getConfigModuleRoot()', () => {
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

  describe('getWorkspacePaths()', () => {
    it('returns empty array for no workspaces', () => {
      beemo.tool.package = {};

      expect(beemo.getWorkspacePaths()).toEqual([]);
    });

    it('returns empty array for non-array workspaces', () => {
      beemo.tool.package = { workspaces: true };

      expect(beemo.getWorkspacePaths()).toEqual([]);
    });

    it('returns workspaces from package.json', () => {
      beemo.tool.package = { workspaces: ['packages/*'] };

      expect(beemo.getWorkspacePaths()).toEqual([path.join(root, 'packages/*')]);
    });

    it('returns nohoist workspaces from package.json', () => {
      beemo.tool.package = {
        workspaces: {
          nohoist: [],
          packages: ['packages/*'],
        },
      };

      expect(beemo.getWorkspacePaths()).toEqual([path.join(root, 'packages/*')]);
    });

    it('returns workspaces from lerna.json', () => {
      (fs.existsSync as jest.Mock).mockImplementation(() => true);
      (fs.readJsonSync as jest.Mock).mockImplementation(() => ({
        packages: ['packages/*'],
      }));

      beemo.tool.package = {};
      beemo.tool.options.workspaceRoot = getFixturePath('workspaces-lerna');

      expect(beemo.getWorkspacePaths()).toEqual([
        path.join(beemo.tool.options.workspaceRoot, 'packages/*'),
      ]);
    });

    it('doesnt load lerna.json if workspaces are defined in package.json', () => {
      (fs.readJsonSync as jest.Mock).mockImplementation(() => ({
        packages: ['packages2/*'],
      }));

      beemo.tool.package = { workspaces: ['packages1/*'] };
      beemo.tool.options.workspaceRoot = getFixturePath('workspaces-lerna');

      expect(fs.existsSync as jest.Mock).not.toHaveBeenCalled();
      expect(beemo.getWorkspacePaths()).toEqual([
        path.join(beemo.tool.options.workspaceRoot, 'packages1/*'),
      ]);
    });
  });

  describe('handleCleanupOnFailure()', () => {
    beforeEach(() => {
      (fs.removeSync as jest.Mock).mockReset();
    });

    it('does nothing if exit code is 0', () => {
      beemo.handleCleanupOnFailure(0, {});

      expect(fs.removeSync).not.toHaveBeenCalled();
    });

    it('does nothing if no config paths', () => {
      beemo.handleCleanupOnFailure(1, {});

      expect(fs.removeSync).not.toHaveBeenCalled();
    });

    it('removes file for each config path', () => {
      beemo.handleCleanupOnFailure(1, {
        configPaths: ['foo', 'bar'],
      });

      expect(fs.removeSync).toHaveBeenCalledWith('foo');
      expect(fs.removeSync).toHaveBeenCalledWith('bar');
    });
  });

  describe('executeDriver()', () => {
    beforeEach(() => {
      beemo.tool.getPlugin = () => ({ name: 'foo-bar' });
    });

    it('sets event namespace', async () => {
      const spy = jest.spyOn(beemo.tool, 'setEventNamespace');

      await beemo.executeDriver('foo-bar', {});

      expect(spy).toHaveBeenCalledWith('foo-bar');
    });

    it('triggers `init-driver` event with context', async () => {
      const spy = jest.spyOn(beemo.tool, 'emit');

      await beemo.executeDriver('foo-bar', {});

      expect(spy).toHaveBeenCalledWith('init-driver', [
        expect.objectContaining({ name: 'foo-bar' }),
        expect.objectContaining({
          argv: ['foo', 'bar'],
          driverName: 'foo-bar',
        }),
      ]);
    });

    it('passes driver name and context to pipeline run', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');
      const pipeline = await beemo.executeDriver('foo-bar', {});

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
          driverName: 'foo-bar',
        }),
      );

      expect(pipeline.run).toHaveBeenCalledWith('foo-bar');
    });

    it('sets primary driver with context', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.executeDriver('foo-bar', {});

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

    it('registers an exit listener if cleanup is true', async () => {
      beemo.tool.on = jest.fn();
      beemo.tool.config.config.cleanup = true;

      await beemo.executeDriver('foo-bar', {});

      expect(beemo.tool.on).toHaveBeenCalledWith('exit', expect.any(Function));
    });

    it('doesnt register exit listener if cleanup is false', async () => {
      beemo.tool.on = jest.fn();
      beemo.tool.config.config.cleanup = false;

      await beemo.executeDriver('foo-bar', {});

      expect(beemo.tool.on).not.toHaveBeenCalled();
    });
  });

  describe('executeScript()', () => {
    it('sets event namespace', async () => {
      const spy = jest.spyOn(beemo.tool, 'setEventNamespace');

      await beemo.executeScript('foo-bar', {});

      expect(spy).toHaveBeenCalledWith('foo-bar');
    });

    it('triggers `init-script` event with context', async () => {
      const spy = jest.spyOn(beemo.tool, 'emit');

      await beemo.executeScript('foo-bar', {});

      expect(spy).toHaveBeenCalledWith('init-script', [
        'foo-bar',
        expect.objectContaining({
          argv: ['foo', 'bar'],
          scriptName: 'foo-bar',
        }),
      ]);
    });

    it('passes script name and context to pipeline run', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');
      const pipeline = await beemo.executeScript('foo-bar', {});

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
          scriptName: 'foo-bar',
        }),
      );

      expect(pipeline.run).toHaveBeenCalledWith('foo-bar');
    });
  });

  describe('prepareContext()', () => {
    it('sets extra props', () => {
      expect(beemo.prepareContext(new Context({ _: [], $0: '' }))).toEqual(
        expect.objectContaining({
          args: { _: [] },
          argv: ['foo', 'bar'],
          moduleRoot: process.cwd(),
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

      beemo.startPipeline({
        args: { foo: 123, bar: true },
      });

      expect(process.beemo).toEqual({
        context: { args: { foo: 123, bar: true } },
        tool: beemo.tool,
      });
    });
  });

  describe('syncDotfiles()', () => {
    it('sets event namespace', async () => {
      const spy = jest.spyOn(beemo.tool, 'setEventNamespace');

      await beemo.syncDotfiles({});

      expect(spy).toHaveBeenCalledWith('beemo');
    });

    it('triggers `sync-dotfiles` event with context', async () => {
      const spy = jest.spyOn(beemo.tool, 'emit');

      await beemo.syncDotfiles({});

      expect(spy).toHaveBeenCalledWith('sync-dotfiles', [
        expect.objectContaining({
          argv: ['foo', 'bar'],
        }),
      ]);
    });

    it('passes context to pipeline', async () => {
      const spy = jest.spyOn(beemo, 'startPipeline');

      await beemo.syncDotfiles({});

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          argv: ['foo', 'bar'],
        }),
      );
    });

    it('passes filter to routine', async () => {
      const pipeline = await beemo.syncDotfiles({ filter: 'foo' });

      expect(pipeline.pipe).toHaveBeenCalledWith(
        expect.objectContaining({
          options: { filter: 'foo' },
        }),
      );
    });
  });
});
