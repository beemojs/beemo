import fs from 'fs-extra';
import copy from 'copy';
import SyncDotfilesRoutine from '../src/SyncDotfilesRoutine';

jest.mock('copy');
jest.mock('fs-extra');

describe('SyncDotfilesRoutine', () => {
  let routine;

  beforeEach(() => {
    routine = new SyncDotfilesRoutine('sync', 'Syncing dotfiles');
    routine.context = {
      moduleRoot: './root',
    };
    routine.tool = {
      options: {
        root: './',
      },
      invariant() {},
      debug() {},
      emit() {},
      log() {},
    };
  });

  describe('execute()', () => {
    it('passes module root to tasks', () => {
      routine.serializeTasks = jest.fn();
      routine.execute();

      expect(routine.serializeTasks).toHaveBeenCalledWith('./root');
    });
  });

  describe('copyFilesFromConfigModule()', () => {
    beforeEach(() => {
      copy.mockImplementation((path, root, callback) => {
        callback(null, [{ path: './foo' }, { path: './bar' }, { path: './baz' }]);
      });
    });

    it('calls it with correct path arguments', async () => {
      await routine.copyFilesFromConfigModule('./root');

      expect(copy).toHaveBeenCalledWith('root/dotfiles/*', './', expect.anything());
    });

    it('returns file paths as strings', async () => {
      const paths = await routine.copyFilesFromConfigModule('./root');

      expect(paths).toEqual(['./foo', './bar', './baz']);
    });

    it('handles errors', async () => {
      copy.mockImplementation((path, root, callback) => callback(new Error('Oops')));

      try {
        await routine.copyFilesFromConfigModule('./root');
      } catch (error) {
        expect(error).toEqual(new Error('Oops'));
      }
    });

    it('triggers `create-dotfile` event', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      await routine.copyFilesFromConfigModule('./root');

      expect(spy).toHaveBeenCalledWith('create-dotfile', ['./foo']);
      expect(spy).toHaveBeenCalledWith('create-dotfile', ['./bar']);
      expect(spy).toHaveBeenCalledWith('create-dotfile', ['./baz']);
    });
  });

  describe('renameFilesWithDot()', () => {
    beforeEach(() => {
      fs.rename.mockImplementation(value => Promise.resolve(value));
    });

    it('renames each file path', async () => {
      const paths = await routine.renameFilesWithDot(['foo', './path/bar', '/path/baz']);

      expect(paths).toEqual(['.foo', 'path/.bar', '/path/.baz']);

      expect(fs.rename).toHaveBeenCalledWith('foo', '.foo');
      expect(fs.rename).toHaveBeenCalledWith('./path/bar', 'path/.bar');
      expect(fs.rename).toHaveBeenCalledWith('/path/baz', '/path/.baz');
    });

    it('triggers `rename-dotfile` event', async () => {
      const spy = jest.spyOn(routine.tool, 'emit');

      await routine.renameFilesWithDot(['foo', './path/bar', '/path/baz']);

      expect(spy).toHaveBeenCalledWith('rename-dotfile', ['.foo']);
      expect(spy).toHaveBeenCalledWith('rename-dotfile', ['path/.bar']);
      expect(spy).toHaveBeenCalledWith('rename-dotfile', ['/path/.baz']);
    });
  });
});
