import { Tool } from 'boost';
import fs from 'fs-extra';
import copy from 'copy';
import SyncDotfilesRoutine from '../src/SyncDotfilesRoutine';
import { createContext, setupMockTool, prependRoot } from '../../../tests/helpers';

jest.mock('copy');
jest.mock('fs-extra');
jest.mock('boost/lib/Tool');

describe('SyncDotfilesRoutine', () => {
  let routine;

  beforeEach(() => {
    routine = new SyncDotfilesRoutine('sync', 'Syncing dotfiles');
    routine.context = createContext()
    routine.tool = setupMockTool(new Tool());

    copy.mockImplementation((filePath, root, callback) => {
      callback(null, [{ path: './foo' }, { path: './bar' }, { path: './baz' }]);
    });

    fs.rename.mockImplementation(value => Promise.resolve(value));
  });

  describe('execute()', () => {
    it('passes module root to tasks', () => {
      routine.serializeTasks = jest.fn();
      routine.execute();

      expect(routine.serializeTasks).toHaveBeenCalledWith(process.cwd());
    });

    it('executes pipeline in order', async () => {
      const copySpy = jest.spyOn(routine, 'copyFilesFromConfigModule');
      const renameSpy = jest.spyOn(routine, 'renameFilesWithDot');

      const paths = await routine.execute();

      expect(copySpy).toHaveBeenCalledWith(process.cwd(), routine.context);
      expect(renameSpy).toHaveBeenCalledWith(['./foo', './bar', './baz'], routine.context);
      expect(paths).toEqual(['.foo', '.bar', '.baz']);
    });
  });

  describe('copyFilesFromConfigModule()', () => {
    it('calls it with correct path arguments', async () => {
      await routine.copyFilesFromConfigModule(process.cwd());

      expect(copy).toHaveBeenCalledWith(prependRoot('dotfiles/*'), process.cwd(), expect.anything());
    });

    it('returns file paths as strings', async () => {
      const paths = await routine.copyFilesFromConfigModule('./root');

      expect(paths).toEqual(['./foo', './bar', './baz']);
    });

    it('handles errors', async () => {
      copy.mockImplementation((filePath, root, callback) => callback(new Error('Oops')));

      try {
        await routine.copyFilesFromConfigModule('./root');
      } catch (error) {
        expect(error).toEqual(new Error('Oops'));
      }
    });

    it('triggers `create-dotfile` event', async () => {
      const spy = routine.tool.emit;

      await routine.copyFilesFromConfigModule('./root');

      expect(spy).toHaveBeenCalledWith('create-dotfile', ['./foo']);
      expect(spy).toHaveBeenCalledWith('create-dotfile', ['./bar']);
      expect(spy).toHaveBeenCalledWith('create-dotfile', ['./baz']);
    });
  });

  describe('renameFilesWithDot()', () => {
    it('renames each file path', async () => {
      const paths = await routine.renameFilesWithDot(['foo', './path/bar', '/path/baz']);

      expect(paths).toEqual(['.foo', 'path/.bar', '/path/.baz']);

      expect(fs.rename).toHaveBeenCalledWith('foo', '.foo');
      expect(fs.rename).toHaveBeenCalledWith('./path/bar', 'path/.bar');
      expect(fs.rename).toHaveBeenCalledWith('/path/baz', '/path/.baz');
    });

    it('triggers `rename-dotfile` event', async () => {
      const spy = routine.tool.emit;

      await routine.renameFilesWithDot(['foo', './path/bar', '/path/baz']);

      expect(spy).toHaveBeenCalledWith('rename-dotfile', ['.foo']);
      expect(spy).toHaveBeenCalledWith('rename-dotfile', ['path/.bar']);
      expect(spy).toHaveBeenCalledWith('rename-dotfile', ['/path/.baz']);
    });
  });
});
