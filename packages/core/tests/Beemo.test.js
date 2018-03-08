import path from 'path';
import Beemo from '../src/Beemo';

jest.mock('boost/lib/Console');

jest.mock(
  'boost/lib/Pipeline',
  () =>
    function PipelineMock() {
      this.pipe = jest.fn(() => this);
      this.run = jest.fn(() => this);
    },
);

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
      expect(
        beemo.createContext({
          foo: 'bar',
          // Cant overwrite
          args: ['baz'],
        }),
      ).toEqual({
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
      }).toThrowError(
        'Beemo requires a "beemo.module" property within your package.json. This property is the name of a module that houses your configuration files.',
      );
    });

    it('errors if a fake and or missing node module', () => {
      beemo.tool.config.module = 'beemo-this-should-never-exist';

      expect(() => {
        beemo.getConfigModuleRoot();
      }).toThrowError(
        'Module beemo-this-should-never-exist defined in "beemo.module" could not be found.',
      );
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

  describe('executeDriver()', () => {
    beforeEach(() => {
      beemo.tool.getPlugin = () => ({});
    });

    it('sets event namespace', async () => {
      const spy = jest.spyOn(beemo.tool, 'setEventNamespace');

      await beemo.executeDriver('foo-bar');

      expect(spy).toHaveBeenCalledWith('foo-bar');
    });

    it('triggers event with context', async () => {
      const spy = jest.spyOn(beemo.tool, 'emit');

      await beemo.executeDriver('foo-bar');

      expect(spy).toHaveBeenCalledWith('driver', [
        'foo-bar',
        expect.objectContaining({
          args: ['foo', 'bar'],
          driverName: 'foo-bar',
        }),
      ]);
    });

    it('passes driver name and context to pipeline run', async () => {
      const pipeline = await beemo.executeDriver('foo-bar');

      expect(pipeline.run).toHaveBeenCalledWith(
        'foo-bar',
        expect.objectContaining({
          args: ['foo', 'bar'],
          driverName: 'foo-bar',
        }),
      );
    });

    it('sets primary driver with context', async () => {
      const pipeline = await beemo.executeDriver('foo-bar');

      expect(pipeline.run).toHaveBeenCalledWith(
        'foo-bar',
        expect.objectContaining({
          args: ['foo', 'bar'],
          primaryDriver: expect.objectContaining({
            context: expect.objectContaining({
              configPaths: [],
              driverName: 'foo-bar',
              drivers: [],
            }),
          }),
        }),
      );
    });

    it('registers an exit listener', async () => {
      beemo.tool.on = jest.fn();

      await beemo.executeDriver('foo-bar');

      expect(beemo.tool.on).toHaveBeenCalledWith('exit', expect.any(Function));
    });
  });

  describe('executeScript()', () => {
    it('sets event namespace', async () => {
      const spy = jest.spyOn(beemo.tool, 'setEventNamespace');

      await beemo.executeScript('foo-bar');

      expect(spy).toHaveBeenCalledWith('foo-bar');
    });

    it('triggers event with context', async () => {
      const spy = jest.spyOn(beemo.tool, 'emit');

      await beemo.executeScript('foo-bar');

      expect(spy).toHaveBeenCalledWith('script', [
        'foo-bar',
        expect.objectContaining({
          args: ['foo', 'bar'],
          scriptName: 'foo-bar',
        }),
      ]);
    });

    it('passes script name and context to pipeline run', async () => {
      const pipeline = await beemo.executeScript('foo-bar');

      expect(pipeline.run).toHaveBeenCalledWith(
        'foo-bar',
        expect.objectContaining({
          args: ['foo', 'bar'],
          scriptName: 'foo-bar',
        }),
      );
    });
  });

  describe('startPipeline()', () => {
    it('starts the tool console', () => {
      beemo.tool.console.start = jest.fn();

      beemo.startPipeline();

      expect(beemo.tool.console.start).toHaveBeenCalled();
    });
  });

  describe('syncDotfiles()', () => {
    it('sets event namespace', async () => {
      const spy = jest.spyOn(beemo.tool, 'setEventNamespace');

      await beemo.syncDotfiles();

      expect(spy).toHaveBeenCalledWith('beemo');
    });

    it('triggers event with context', async () => {
      const spy = jest.spyOn(beemo.tool, 'emit');

      await beemo.syncDotfiles();

      expect(spy).toHaveBeenCalledWith('dotfiles', [
        expect.objectContaining({
          args: ['foo', 'bar'],
        }),
      ]);
    });

    it('passes context to pipeline run', async () => {
      const pipeline = await beemo.syncDotfiles();

      expect(pipeline.run).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          args: ['foo', 'bar'],
        }),
      );
    });
  });
});
