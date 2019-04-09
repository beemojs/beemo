import execa from 'execa';
import Script from '../src/Script';
import { mockScript, stubScriptContext } from '../src/testUtils';

jest.mock('execa');

describe('Script', () => {
  let script: Script;

  beforeEach(() => {
    script = mockScript('test');
  });

  describe('args()', () => {
    it('returns an empty object', () => {
      expect(script.args()).toEqual({});
    });
  });

  describe('execute()', () => {
    it('executes tasks serially by default', async () => {
      const spy = jest.spyOn(script, 'executeTasks');

      await script.execute(stubScriptContext(), {});

      expect(spy).toHaveBeenCalledWith('serial');
    });
  });

  describe('executeCommand()', () => {
    it('calls execa internally', async () => {
      await script.executeCommand('yarn', ['install', '--froze-lockfile'], { cwd: '.' });

      expect(execa).toHaveBeenCalledWith('yarn', ['install', '--froze-lockfile'], { cwd: '.' });
    });
  });

  describe('executeTasks()', () => {
    it('returns tasks and process type', async () => {
      script.task('foo', () => 123);

      const result = await script.executeTasks('parallel');

      expect(result).toEqual({
        tasks: script.tasks,
        type: 'parallel',
      });
    });
  });

  describe('task()', () => {
    it('errors if not a function', () => {
      expect(() => {
        // @ts-ignore Allow non-function
        script.task('foo', 'bar');
      }).toThrowErrorMatchingSnapshot();
    });

    it('maps `Task` objects', () => {
      expect(script.tasks).toHaveLength(0);

      script.task('foo', () => 123);
      script.task('bar', () => 123);

      expect(script.tasks).toHaveLength(2);
      expect(script.tasks[0].constructor.name).toBe('Task');
      expect(script.tasks[1].constructor.name).toBe('Task');
    });
  });
});
