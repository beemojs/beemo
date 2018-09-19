import fs from 'fs-extra';
import SyncDotfilesRoutine from '../src/SyncDotfilesRoutine';
import {
  createContext,
  prependRoot,
  getRoot,
  createTestDebugger,
  createTestTool,
} from '../../../tests/helpers';

jest.mock('fs-extra');

describe('SyncDotfilesRoutine', () => {
  let routine: SyncDotfilesRoutine;

  beforeEach(() => {
    routine = new SyncDotfilesRoutine('sync', 'Syncing dotfiles');
    routine.context = createContext();
    routine.tool = createTestTool();
    routine.debug = createTestDebugger();

    (fs.copy as jest.Mock).mockImplementation((src, dest, options) =>
      Promise.resolve(['./foo', './bar', './baz'].filter(options.filter)),
    );
    (fs.rename as jest.Mock).mockImplementation(value => Promise.resolve(value));
  });

  describe('bootstrap()', () => {
    it('errors if filter is not a string', () => {
      // @ts-ignore
      routine.options.filter = 123;

      expect(() => {
        routine.bootstrap();
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe('execute()', () => {
    it('passes module root to tasks', async () => {
      routine.serializeTasks = jest.fn();

      await routine.execute(routine.context);

      expect(routine.serializeTasks).toHaveBeenCalledWith(getRoot());
    });

    it('executes pipeline in order', async () => {
      const copySpy = jest.spyOn(routine, 'copyFilesFromConfigModule');
      const renameSpy = jest.spyOn(routine, 'renameFilesWithDot');

      const paths = await routine.execute(routine.context);

      expect(copySpy).toHaveBeenCalledWith(routine.context, getRoot(), expect.anything());
      expect(renameSpy).toHaveBeenCalledWith(
        routine.context,
        ['./foo', './bar', './baz'],
        expect.anything(),
      );
      expect(paths).toEqual(['.foo', '.bar', '.baz']);
    });
  });

  describe('copyFilesFromConfigModule()', () => {
    it('calls it with correct path arguments', async () => {
      await routine.copyFilesFromConfigModule(routine.context, getRoot());

      expect(fs.copy).toHaveBeenCalledWith(prependRoot('dotfiles/*'), getRoot(), expect.anything());
    });

    it('returns file paths as strings', async () => {
      const paths = await routine.copyFilesFromConfigModule(routine.context, './root');

      expect(paths).toEqual(['./foo', './bar', './baz']);
    });

    it('filters files using config', async () => {
      routine.options.filter = 'a(r|z)';

      const paths = await routine.copyFilesFromConfigModule(routine.context, './root');

      expect(paths).toEqual(['./bar', './baz']);
    });

    it('handles errors', async () => {
      (fs.copy as jest.Mock).mockImplementation(() => Promise.reject(new Error('Oops')));

      try {
        await routine.copyFilesFromConfigModule(routine.context, './root');
      } catch (error) {
        expect(error).toEqual(new Error('Oops'));
      }
    });

    it('triggers `copy-dotfile` event', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      await routine.copyFilesFromConfigModule(routine.context, './root');

      expect(spy).toHaveBeenCalledWith('beemo.copy-dotfile', ['./foo']);
      expect(spy).toHaveBeenCalledWith('beemo.copy-dotfile', ['./bar']);
      expect(spy).toHaveBeenCalledWith('beemo.copy-dotfile', ['./baz']);
    });
  });

  describe('renameFilesWithDot()', () => {
    it('renames each file path', async () => {
      const paths = await routine.renameFilesWithDot(routine.context, [
        'foo',
        './path/bar',
        '/path/baz',
      ]);

      expect(paths).toEqual(['.foo', 'path/.bar', '/path/.baz']);

      expect(fs.rename).toHaveBeenCalledWith('foo', '.foo');
      expect(fs.rename).toHaveBeenCalledWith('./path/bar', 'path/.bar');
      expect(fs.rename).toHaveBeenCalledWith('/path/baz', '/path/.baz');
    });

    it('triggers `rename-dotfile` event', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      await routine.renameFilesWithDot(routine.context, ['foo', './path/bar', '/path/baz']);

      expect(spy).toHaveBeenCalledWith('beemo.rename-dotfile', ['.foo']);
      expect(spy).toHaveBeenCalledWith('beemo.rename-dotfile', ['path/.bar']);
      expect(spy).toHaveBeenCalledWith('beemo.rename-dotfile', ['/path/.baz']);
    });
  });
});
