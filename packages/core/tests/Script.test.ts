import execa from 'execa';
import Script from '../src/Script';
import { mockScript } from '../src/testing';

jest.mock('execa');

describe('Script', () => {
  let script: Script;

  beforeEach(() => {
    script = mockScript('test');
  });

  describe('parse()', () => {
    it('returns an empty object', () => {
      expect(script.parse()).toEqual({ options: {} });
    });
  });

  describe('executeCommand()', () => {
    it('calls execa internally', async () => {
      await script.executeCommand('yarn', ['install', '--frozen-lockfile'], { cwd: '.' });

      expect(execa).toHaveBeenCalledWith('yarn', ['install', '--frozen-lockfile'], { cwd: '.' });
    });
  });
});
