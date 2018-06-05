import { Tool } from 'boost';
import copy from 'copy';
import fs from 'fs-extra';
import SyncDotfilesRoutine from '../src/SyncDotfilesRoutine';
import { createContext, setupMockTool, prependRoot, getRoot } from '../../../tests/helpers';

jest.mock('copy');
jest.mock('fs-extra');
jest.mock('boost/lib/Tool');

describe('SyncDotfilesRoutine', () => {
  let routine;

  beforeEach(() => {
    routine = new SyncDotfilesRoutine('sync', 'Syncing dotfiles');
    routine.context = createContext();
    routine.tool = setupMockTool(new Tool());
    routine.debug = jest.fn();
    routine.debug.invariant = jest.fn();

    copy.mockImplementation((filePath, root, callback) => {
      callback(null, [{ path: './foo' }, { path: './bar' }, { path: './baz' }]);
    });

    fs.rename.mockImplementation(value => Promise.resolve(value));
  });

  describe('bootstrap()', () => {
    it('errors if filter is not a string', () => {
      routine.options.filter = 123;

      expect(() => {
        routine.bootstrap();
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe('execute()', () => {
    it('passes module root to tasks', () => {
      routine.serializeTasks = jest.fn();
      routine.execute(routine.context);

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

      expect(copy).toHaveBeenCalledWith(prependRoot('dotfiles/*'), getRoot(), expect.anything());
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
      copy.mockImplementation((filePath, root, callback) => callback(new Error('Oops')));

      try {
        await routine.copyFilesFromConfigModule(routine.context, './root');
      } catch (error) {
        expect(error).toEqual(new Error('Oops'));
      }
    });

    it('triggers `copy-dotfile` event', async () => {
      const spy = routine.tool.emit;

      await routine.copyFilesFromConfigModule(routine.context, './root');

      expect(spy).toHaveBeenCalledWith('copy-dotfile', ['./foo']);
      expect(spy).toHaveBeenCalledWith('copy-dotfile', ['./bar']);
      expect(spy).toHaveBeenCalledWith('copy-dotfile', ['./baz']);
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
      const spy = routine.tool.emit;

      await routine.renameFilesWithDot(routine.context, ['foo', './path/bar', '/path/baz']);

      expect(spy).toHaveBeenCalledWith('rename-dotfile', ['.foo']);
      expect(spy).toHaveBeenCalledWith('rename-dotfile', ['path/.bar']);
      expect(spy).toHaveBeenCalledWith('rename-dotfile', ['/path/.baz']);
    });
  });
});
