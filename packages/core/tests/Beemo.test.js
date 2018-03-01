import path from 'path';
import Beemo from '../src/Beemo';

jest.mock('boost/lib/Console');
jest.mock('boost/lib/Pipeline');

describe('Beemo', () => {
  let beemo;

  beforeEach(() => {
    beemo = new Beemo(['foo', 'bar']);
  });

  it('sets argv', () => {
    expect(beemo.argv).toEqual(['foo', 'bar']);
  });

  describe('createContext()', () => {
    it('returns a base context object', () => {
      expect(beemo.createContext()).toEqual({
        args: ['foo', 'bar'],
        moduleRoot: process.cwd(),
        root: process.cwd(),
        yargs: {
          _: ['foo', 'bar'],
        },
      });
    });

    it('can pass extra context', () => {
      expect(beemo.createContext({
        foo: 'bar',
        // Cant overwrite
        args: ['baz'],
      })).toEqual({
        foo: 'bar',
        args: ['foo', 'bar'],
        moduleRoot: process.cwd(),
        root: process.cwd(),
        yargs: {
          _: ['foo', 'bar'],
        },
      });
    });
  });

  describe('getConfigModuleRoot()', () => {
    it('errors if no module name', () => {
      beemo.tool.config.module = '';

      expect(() => {
        beemo.getConfigModuleRoot();
      }).toThrowError('Beemo requires a "beemo.module" property within your package.json. This property is the name of a module that houses your configuration files.');
    });

    it('errors if a fake and or missing node module', () => {
      beemo.tool.config.module = 'beemo-this-should-never-exist';

      expect(() => {
        beemo.getConfigModuleRoot();
      }).toThrowError('Module beemo-this-should-never-exist defined in "beemo.module" could not be found.');
    });

    it('returns cwd if using @local', () => {
      beemo.tool.config.module = '@local';

      expect(beemo.getConfigModuleRoot()).toBe(process.cwd());
    });

    it('returns node module path', () => {
      beemo.tool.config.module = 'boost';

      expect(beemo.getConfigModuleRoot()).toBe(path.join(process.cwd(), 'node_modules/boost'));
    });
  });

  describe('startPipeline()', () => {
    it('starts the tool console', () => {
      beemo.tool.console.start = jest.fn();
      console.log(beemo.startPipeline());

      expect(beemo.tool.console.start).toHaveBeenCalled();
    });
  });
});
